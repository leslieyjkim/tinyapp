const express = require("express");
const app = express();
const PORT = 8080;
const objhash = require("object-hash");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const { getUserByEmail } = require("./helpers");

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

//main page without routes
app.get("/", (req, res) => {
  const userHashedEmail = req.session.hashedemail;
  if (userHashedEmail) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urldatabase", (req, res) => {
  res.json(urlDatabase);
});
app.get("/userdatabase", (req, res) => {
  res.json(usersDatabase);
});

// --- register, login, logout ----
app.get("/register", (req, res) => {
  // hashedemail is key to confirm login status
  // 1. login case ->  show urls
  // 2. non-login case -> register post
  const _hashedemail = req.session.hashedemail;
  if (_hashedemail) {
    req.session.hashedemail = _hashedemail; //handover login status
    res.redirect("/urls");
  } else {
    res.render("register", { loginstatus: null });
    // show login/register at top instead of logout
  }
});

app.post("/register", (req, res) => {
  // post is triggered from register.ejs's POST
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email and password are required!");
    //TODO proper html page and button go to register GET page
  }

  if (
    // userDB has already ?
    objhash(req.body.email.toLocaleLowerCase()) in usersDatabase
  ) {
    res.status(400).send("User already exists!");
    //TODO: render proper html page and it has button to go to register GET page
  }

  // no error, append new user info to userDB
  let hashedPassword = objhash(req.body.password);
  let hashedEmail = objhash(req.body.email.toLocaleLowerCase());
  const newUser = {
    email: req.body.email.toLocaleLowerCase(),
    password: hashedPassword,
  };
  usersDatabase[hashedEmail] = newUser; // {hashedemail:{email:, password:}
  req.session.loginstatus = newUser;
  req.session.hashedemail = hashedEmail;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const _hashedemail = req.session.hashedemail;
  if (_hashedemail) {
    // hashedemail is populated because user logged in
    res.render("urls_index", {
      loginstatus: usersDatabase[_hashedemail],
      urls: urlDatabase[_hashedemail],
    });
  } else {
    // user = null show login/register at header
    res.render("login", { loginstatus: null });
  }
});

app.post("/login", (req, res) => {
  console.log(usersDatabase);
  const userEmail = req.body.username;
  const [userEmailFound, _hashedEmail] = getUserByEmail(
    userEmail,
    usersDatabase
  );
  if (!userEmailFound) {
    return res
      .status(400)
      .send(
        "Oops! We couldn't locate that user. Please check the username and try again."
      ); //TODO: regular html page for no user found error
  }
  if (objhash(req.body.password) !== userEmailFound.password) {
    return res
      .status(400)
      .send(
        "Uh-oh! The password you entered is not correct. Please double-check and try again."
      ); //TODO: regular html page password error
  }
  req.session.loginstatus = userEmailFound;
  req.session.hashedemail = _hashedEmail; // req.session.<key> = <value> -> handover cookie info to redirect site
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//1.urls_index (get request)
app.get("/urls", (req, res) => {
  const hashedemail = req.session.hashedemail;
  if (!hashedemail) {
    return res.redirect("/login");
  } else {
    return res.render("urls_index", {
      urls: urlDatabase[hashedemail],
      loginstatus: usersDatabase[hashedemail],
    });
  }
});
//urls_index (post request): Check if the user is not logged in

// bring to submit button page
app.get("/urls/new", (req, res) => {
  let _hashedemail = req.session.hashedemail;
  // Check if the user is not logged in tries to see
  if (!_hashedemail) {
    return res.redirect("/login");
  } else {
    return res.render("urls_new", { loginstatus: req.session.loginstatus });
  }
});

app.post("/urls/new", (req, res) => {
  const _userHashedEmail = req.session.hashedemail;
  if (_userHashedEmail) {
    const shortURL = objhash(req.body.longURL);
    if (!urlDatabase[_userHashedEmail]) {
      urlDatabase[_userHashedEmail] = {};
    }
    urlDatabase[_userHashedEmail][shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errorMessage = "Must be logged in to shorten URLs";
    res.status(401).render("urls_error", {
      loginstatus: usersDatabase[_userHashedEmail],
      errorMessage,
    });
  }
});

//urls_show (get request)
//show list of urls if it is belonging to user logged-in
app.get("/u/:shorturl", (req, res) => {
  let _hashedemail = req.session.hashedemail;
  let _shortURL = req.params.shorturl; // /u/:shorturl -> parsing shorturl !!
  if (_hashedemail) {
    // login user
    if (!urlDatabase[_hashedemail][_shortURL]) {
      // user's url database does not have the specific short URL
      return res.status(404).send("Page not found");
      // TODO proper html and redirect button
    }
    res.redirect(urlDatabase[_hashedemail][_shortURL]);
  } else {
    // non login case
    res.status(403).send("If you want see, please log in");
    //TODO proper html and redirect button
  }
});

//(get request):display information about the specified URL on the client side.
app.get("/urls/:shorturl", (req, res) => {
  if (req.session.hashedemail) {
    res.render("urls_show", {
      loginstatus: req.session.loginstatus,
      shortURL: req.params.shorturl,
      longURL: urlDatabase[req.session.hashedemail][req.params.shorturl],
    });
  } else {
    res.status(403).send("If you want see, please log in");
  }
});

//delete button from Database
app.get("/urls/delete/:shorturl", (req, res) => {
  if (req.session.hashedemail) {
    delete urlDatabase[req.session.hashedemail][req.params.shorturl];
    return res.redirect("/urls");
  } else {
    return res.status(403).send("You must be logged in first.");
    //TODO: proper html and redirect button
  }
});

app.post("/urls/edit/:shorturl", (req, res) => {
  if (req.session.hashedemail) {
    if (req.body.longURL) {
      if (!urlDatabase[req.session.hashedemail][objhash(req.body.longURL)]) {
        urlDatabase[req.session.hashedemail][req.params.shorturl] =
          req.body.longURL;
      } else {
        delete urlDatabase[req.session.hashedemail][req.params.shorturl];
      }
    }

    res.redirect("/urls");
  } else {
    return res.status(403).send("You must be logged in first.");
    //TODO: proper html and redirect button
  }
});

//edit button from Database (update lognURL using Edit)
app.get("/urls/edit/:shorturl", (req, res) => {
  if (req.session.hashedemail) {
    const shorturl = req.params.shorturl;
    res.redirect("/urls/" + shorturl);
  } else {
    return res.status(403).send("You must be logged in first.");
    //TODO: proper html and redirect button
  }
});

app.listen(PORT, () => {});
