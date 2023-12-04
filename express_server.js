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

// const urlsForUser = function (id) {
//   const userURLs = {};
//   for (const shortURL in urlDatabase) {
//     if (urlDatabase[shortURL].userID === id) {
//       userURLs[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return userURLs;
// };

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
  req.session.id = id;
  res.redirect("/urls");
});

//1.urls_index (get request)
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: usersDatabase[req.session.id],
  };
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
    console.log("URLDATABASE", urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  } else {
    //if (!user_ID)
    console.log("error");
    const errorMessage = "You must be logged in to shorten URLs";
    res.render("urls_index", templateVars);
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
  // Check if the user is not logged in
  if (!loggedInUser) {
    res.status(403).send("Please Log in first");
    return res.redirect("/login");
  } else {
    // if (user_ID)
    return res.render("urls_new", templateVars);
  }
});

//urls_show (get request)
app.get("/u/:id", (req, res) => {
  const templateVars = { user: usersDatabase[req.session["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  const shortURL = req.params.id;
  const userID = req.session.id;
  let loggedInUser = req.session.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Page not found");
  }
  if (!loggedInUser) {
    return res.status(403).send("Not authorized to view, please log in");
  }
  if (userID !== loggedInUser) {
    return res.status(403).send("This is a Private Link");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user_ID = req.session.user_ID;
  if (!user_ID) {
    return res.status(403).send("Please log in if you want to see this URL.");
  }
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_ID) {
    return res.status(404).send("URL NOT Found/ Need permission to see this.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[user_ID],
  };
  res.render("urls_show", templateVars);
});

//update longURL was provided from id(post request)
app.post("/urls/:id", (req, res) => {
  const idToUpdate = req.params.id;
  const newLongUrl = req.body.longURL;
  const user_ID = req.session.user_ID;
  if (!user_ID) {
    return res.status(403).send("Please log in if you want to see this URL.");
  }
  if (!urlDatabase[idToUpdate] || urlDatabase[idToUpdate].userID !== user_ID) {
    return res.status(404).send("URL NOT Found/ Need permission to see this.");
  }
  urlDatabase[idToUpdate].longURL = newLongUrl;
  res.redirect("/urls");
});
//delete from database
app.post("/urls/:id/delete", (req, res) => {
  const user_ID = req.session.user_ID;
  const idToDelete = req.params.id;
  if (!urlDatabase[idToDelete]) {
    return res.status(404).send("URL not found.");
  }
  if (!user_ID) {
    return res.status(403).send("You must be logged in to delete this URL.");
  }
  if (urlDatabase[idToDelete].userID !== user_ID) {
    return res
      .status(403)
      .send("You don't have permission to delete this URL.");
  }
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//last version November 30, 23:40 status
//however at the last commit, this command was running shown below
// ./node_modules/.bin/nodemon -L express_server.js
// 2023-12-01 01:10, multiple terminals of Vscode caused port8080 conflict
// because multiple terminals (./node_modules/.bin/nodemon -L express_server.js) are using same port 8080
