const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//helpers
const { getUserByEmail, generateRandomString } = require("./helpers");

//cookie
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
//
const usersDatabase = {
  user1: {
    id: "user1",
    email: "user1@example.com",
    password: "111",
  },
  user2: {
    id: "user2",
    email: "user2@example.com",
    password: "222",
  },
};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//create function to filter URLs for specific user
const urlsForUser = (id, database) => {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};

//main page without routes
app.get("/", (req, res) => {
  const userID = req.session.id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// register (get request)
app.get("/register", (req, res) => {
  const templateVars = { user_id: null, user: null };
  res.render("register", templateVars);
});

//register (Post request)
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and password are required!");
  }
  for (const values of Object.values(usersDatabase)) {
    if (
      values.email.toLocaleLowerCase() === req.body.email.toLocaleLowerCase()
    ) {
      res.status(400).send("User already exists!");
    }
  }
  let hash = bcrypt.hashSync(req.body.password, 10);
  let id = generateRandomString();
  const newUser = {
    id: id,
    email: req.body.email,
    password: hash,
  };
  usersDatabase[id] = newUser;
  console.log(`>>> new user ${req.body.email} registered`);
  console.log(usersDatabase);
  req.session.id = id;
  res.redirect("/urls");
});

//1.urls_index (get request)
app.get("/urls", (req, res) => {
  const userID = req.session.id;
  const user = urlsForUser(userID, urlDatabase);

  if (!userID) {
    //check if the user is not logged in
    // res.status(403).send("<html><body>Please log in or register to view your URLs</body></html>");
    return res.redirect("/login");
  } else {
    // Use the urlsForUser function to filter URLs for the logged-in user
    const templateVars = {
      urls: urlDatabase,
      user: usersDatabase[req.session.id],
    };
    return res.render("urls_index", templateVars);
  }
});
//urls_index (post request): Check if the user is not logged in
app.post("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: usersDatabase[req.session.id],
  };
  if (req.session.id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.id,
    };
    // console.log("URLDATABASE", urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  } else {
    //if (!user_ID)
    const errorMessage = "Must be logged in to shorten URLs";
    res.status(401).render("urls_error", {
      user: usersDatabase[req.session.userID],
      errorMessage,
    });
  }
});

//login (get request)
app.get("/login", (req, res) => {
  const userID = req.session.id;
  if (userID) {
    //check if the user is already logged in
    res.redirect("/urls");
  } else {
    const templateVars = { user: usersDatabase[req.session.id] };
    console.log(templateVars);
    res.render("login", templateVars);
  }
});

//login (post request)
app.post("/login", (req, res) => {
  const user_email = req.body.username;
  // const user_password = req.body.password;
  const { email, password } = req.body;
  const potencialUser = getUserByEmail(user_email, usersDatabase);
  if (!potencialUser) {
    return res
      .status(400)
      .send(
        "Oops! We couldn't locate that user. Please check the username and try again."
      );
  }
  if (!bcrypt.compareSync(req.body.password, potencialUser.password)) {
    return res
      .status(400)
      .send(
        "Uh-oh! The password you entered is not quite right. Please double-check and try again."
      );
  }
  req.session.id = potencialUser.id;
  return res.redirect("/urls");
});

//logout : delete cookie and logout successful!
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//urls_new (get request)
app.get("/urls/new", (req, res) => {
  const templateVars = { user: usersDatabase[req.session.id] };
  let loggedInUser = req.session.id;
  // Check if the user is not logged in tries to see
  if (!loggedInUser) {
    // res.status(403).send("Uh-oh! You need to Log in first, please.");
    return res.redirect("/login");
  } else {
    // if (user_ID)
    return res.render("urls_new", templateVars);
  }
});

//urls_show (get request)
//show list of urls if it is belonging to user logged-in
app.get("/u/:id", (req, res) => {
  let loggedInUser = req.session.id;
  // login case
  if (loggedInUser) {
    const templateVars = { user: usersDatabase[req.session["user_id"]] };
    const longURL = urlDatabase[req.params.id]["longURL"];
    const shortURL = req.params.id;
    const userID = req.session.id;

    console.log(shortURL); //debuggingpoint
    if (!urlDatabase[shortURL]) {
      return res.status(404).send("Page not found");
    }
    if (userID !== loggedInUser) {
      return res.status(403).send("Private lipagenk");
    }
    res.redirect(longURL);
  } else {
    // non login case
    res.status(403).send("If you want see, please log in");
  }
});

//(get request):display information about the specified URL on the client side.
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase[req.params.id]); // debuggingpoint
  console.log(req.params.id);
  const templateVars = {
    id: req.params.id,
    user_id: req.session.user_id,
    longURL: urlDatabase[req.params.id]["longURL"],
    user: usersDatabase[req.session.id],
  };
  res.render("urls_show", templateVars);
});

//delete button from Database
app.post("/urls/:id/delete", (req, res) => {
  // why need templateVars here ?
  const templateVars = { user: usersDatabase[req.session["user_id"]] };
  const id = req.params.id;
  delete urlDatabase[id];
  let loggedInUser = req.session.id;
  console.log(loggedInUser); //debuggingpoint
  if (!loggedInUser) {
    return res.status(403).send("You must be logged in first.");
  } else {
    console.log("after delete -> res.render(urls_new...");
    return res.redirect("/urls"); // new code
  }
});

//edit button from Database (update lognURL using Edit)
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ./node_modules/.bin/nodemon -L express_server.js
// 2023-12-01 01:10, multiple terminals of Vscode caused port8080 conflict
