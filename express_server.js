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

//1.urls_index
app.get("/urls", (req, res) => {
  const user_ID = req.session.user_ID;
  //check if the user is not logged in
  if (!user_ID) {
    res
      .status(403)
      .send(
        "<html><body>Please log in or register to view your URLs</body></html>"
      );
  } else {
    // Use the urlsForUser function to filter URLs for the logged-in user
    const userURLs = urlsForUser(user_ID);
    const templateVars = { urls: userURLs, user: usersDatabase[user_ID] };
    res.render("urls_index", templateVars);
  }
});
//2.urls_new
app.get("/urls/new", (req, res) => {
  const user_ID = req.session.user_ID;
  // Check if the user is not logged in
  if (user_ID) {
    const templateVars = { user: usersDatabase[user_ID] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
//3.urls_show
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
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(404).send("Id does not exist");
  } else {
    res.redirect(longURL);
  }
});

// login (get request)
app.get("/login", (req, res) => {
  const user_ID = req.session.user_ID;
  if (user_ID) {
    //if conditon means, check if the user is already logged in
    res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: usersDatabase[user_ID] };
    console.log(templateVars);
    res.render("login", templateVars);
  }
});
// login (post)
app.post("/login", (req, res) => {
  const user_email = req.body.email;
  const user_password = req.body.password;
  const user = getUserByEmail(user_email, usersDatabase);
  if (!user) {
    res
      .status(403)
      .send(
        "Oops! We couldn't locate that user. Please check the username and try again."
      );
    return;
  }
  if (!bcrypt.compareSync(user_password, user.password)) {
    res
      .status(403)
      .send(
        "Uh-oh! The password you entered is not quite right. Please double-check and try again."
      );
    return;
  }
  req.session.user_ID = user.id;
  res.redirect("/urls");
});
//
app.post("/urls", (req, res) => {
  // Check if the user is not logged in
  const user_ID = req.session.user_ID;
  if (!user_ID) {
    res.status(401).send("You must be logged in to shorten URLs");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user_ID,
  };
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
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
//: delete cookie and logout successful!
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//last version November 30, 23:40 status
//however at the last commit, this command was running shown below
// ./node_modules/.bin/nodemon -L express_server.js
// 2023-12-01 01:10, multiple terminals of Vscode caused port8080 conflict
// because multiple terminals (./node_modules/.bin/nodemon -L express_server.js) are using same port 8080
