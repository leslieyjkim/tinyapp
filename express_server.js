const express = require("express");
const app = express();
const PORT = 8080;
const objhash = require("object-hash"); // for email hashing with deterministic way whereas bcryptjs is session dependant.
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const {
  getUserByEmail,
  generateRandomString,
  getUserUrls,
} = require("./helpers");

const { usersDatabase, urlDatabase } = require("./database");

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
//

const goLoginError = function (_res) {
  return _res.render("urls_error", {
    loginstatus: null,
    errorMessage: "login required",
  });
};
const goDoesNotHaveURL = function (_res) {
  return _res.render("urls_error", {
    loginstatus: null,
    errorMessage: "User does not have the given url.",
  });
};

//main page without routes
app.get("/", (req, res) => {
  // hashedemail is login status
  const userHashedEmail = req.session.hashedemail;
  if (userHashedEmail) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (req.session.hashedemail) {
    // render urls_index.ejs with login status and user's url mapping info
    let urlMappingInfo = getUserUrls(req.session.hashedemail, urlDatabase); //{id: {longURL:str}}
    res.render("urls_index", {
      loginstatus: usersDatabase[req.session.hashedemail], // for _header.ejs
      urls: urlMappingInfo, // for urls_index.ejs
    });
  } else {
    goLoginError(res);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.hashedemail) {
    res.render("urls_new", {
      loginstatus: usersDatabase[req.session.hashedemail],
    }); // urls_new.ejs will post with longURL
  } else {
    goLoginError(res);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.hashedemail) {
    if (req.params.id in urlDatabase[req.session.hashedemail]) {
      res.render("urls_show", {
        loginstatus: usersDatabase[req.session.hashedemail], // for header
        longURL: urlDatabase[req.session.hashedemail][req.params.id],
        id: req.params.id,
      });
    } else {
      // no id ( = short URL) in the urlDB's user part
      goDoesNotHaveURL(res);
    }
  } else {
    goLoginError(res);
  }
});

app.get("/u/:id", (req, res) => {
  if (req.session.hashedemail) {
    if (req.params.id in urlDatabase[req.session.hashedemail]) {
      res.redirect(urlDatabase[req.session.hashedemail][req.params.id]);
    } else {
      goDoesNotHaveURL(res);
    }
  } else {
    goLoginError(res);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.hashedemail) {
    let _givenLongURL = req.body.longURL;
    let _id = generateRandomString();
    if (req.session.hashedemail in urlDatabase) {
      urlDatabase[req.session.hashedemail][_id] = _givenLongURL;
    } else {
      urlDatabase[req.session.hashedemail] = {};
      urlDatabase[req.session.hashedemail][_id] = _givenLongURL;
    }

    res.redirect("/urls/" + _id);
  } else {
    goLoginError(res);
  }
});
app.post("/urls/:id", (req, res) => {
  if (req.session.hashedemail) {
    if (req.body.longURL) {
      urlDatabase[req.session.hashedemail][req.params.id] = req.body.longURL;
    }
    if (req.params.id in urlDatabase[req.session.hashedemail]) {
      let _newLongURL = urlDatabase[req.session.hashedemail][req.params.id];

      if (req.session.hashedemail in urlDatabase) {
        urlDatabase[req.session.hashedemail][req.params.id] = _newLongURL; // update existing id with new long url
      } else {
        urlDatabase[req.session.hashedemail] = {};
        urlDatabase[req.session.hashedemail][req.params.id] = _newLongURL; // update existing id with new long url
      }

      res.redirect("/urls");
    } else {
      goDoesNotHaveURL(res);
    }
  } else {
    goLoginError(res);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.hashedemail) {
    if (req.params.id in urlDatabase[req.session.hashedemail]) {
      delete urlDatabase[req.session.hashedemail][req.params.id];
      res.redirect("/urls");
    } else {
      goDoesNotHaveURL(res);
    }
  } else {
    goLoginError(res);
  }
});

app.get("/login", (req, res) => {
  if (req.session.hashedemail) {
    res.redirect("/urls");
  } else {
    res.render("login", {
      loginstatus: null,
    }); // for header to show not login status
  }
});
app.get("/register", (req, res) => {
  if (req.session.hashedemail) {
    res.redirect("/urls");
  } else {
    res.render("register", { loginstatus: null });
  }
});
app.post("/login", (req, res) => {
  const userUnhashedEmail = req.body.username;
  const [userEmailFound, hashedemail] = getUserByEmail(
    userUnhashedEmail,
    usersDatabase
  );
  if (!userEmailFound) {
    res.render("urls_error", {
      loginstatus: null,
      errorMessage: "given email not found",
    });
  }
  if (objhash(req.body.password) === usersDatabase[hashedemail]["password"]) {
    req.session.hashedemail = hashedemail; // cookie
    req.session.loginstatus = usersDatabase[hashedemail]; // cookie for header
    res.redirect("/urls");
  } else {
    res.render("urls_error", {
      loginstatus: null,
      errorMessage: "given password not matched",
    });
  }
});
app.post("/register", (req, res) => {
  // post is triggered from register.ejs's POST
  if (!req.body.email || !req.body.password) {
    return res.render("urls_error", {
      errorMessage: "email and password are required",
    });
  }
  if (
    // userDB has already ?
    objhash(req.body.email.toLocaleLowerCase()) in usersDatabase
  ) {
    res.render("urls_error", {
      loginstatus: null,
      errorMessage: "email already exists",
    });
  }

  // no error, append new user info to userDB
  let hashedPassword = objhash(req.body.password);
  let hashedEmail = objhash(req.body.email.toLocaleLowerCase());
  const newUser = {
    email: req.body.email.toLocaleLowerCase(),
    password: hashedPassword,
  };
  usersDatabase[hashedEmail] = newUser; // {hashedemail:{email:, password:}
  req.session.loginstatus = newUser; // cookie for header
  req.session.hashedemail = hashedEmail; //cookie
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
app.listen(PORT, () => {});
