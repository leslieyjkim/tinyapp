const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const userID = req.cookies["user_id"];
  res.locals.user = users[userID];
  next();
});

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const generateRandomString = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};
// const generateRandomString = Math.random().toString(36).substring(2, 8);

const getUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

// let urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
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
const urlsForUser = function (id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//1.urls_index
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  //check if the user is not logged in
  if (!user_id) {
    res
      .status(403)
      .send(
        "<html><body>Please log in or register to view your URLs</body></html>"
      );
  } else {
    // Use the urlsForUser function to filter URLs for the logged-in user
    const userURLs = urlsForUser(user_id);
    const templateVars = { urls: userURLs, user: users[user_id] };
    res.render("urls_index", templateVars);
  }
});

//2.urls_new
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  // Check if the user is not logged in
  if (user_id) {
    const templateVars = { user: users[user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//3.urls_show
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.status(403).send("Please log in if you want to see this URL.");
  }
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    return res.status(404).send("URL NOT Found/ Need permission to see this.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[user_id],
  };
  res.render("urls_show", templateVars);
});

// app.get("/u/:id", (req, res) => {
//   const longURL = urlDatabase[req.params.id];
//   const shortURL = req.params.id;
//   // Check if the shortURL exists in the database
//   if (urlDatabase[shortURL]) {
//     const longURL = urlDatabase[shortURL];
//     res.redirect(longURL);
//   } else {
//     // Short URL not found
//     res
//       .status(404)
//       .send("<html><body><h1>Short URL Not Found</h1></body></html>");
//   }
// });

// register (get request)
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    //check if the user is already logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id],
    };
    res.render("user_registration", templateVars);
  }
});

// login (get request)
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    //if conditon means, check if the user is already logged in
    res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: users[user_id] };
    res.render("user_login", templateVars);
  }
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  // Check if the user is not logged in
  if (!res.locals.user) {
    res.status(401).send("You must be logged in to shorten URLs");
  } else {
    let longURL = req.body.longURL;
    let randID = generateRandomString();
    urlDatabase[randID] = longURL;
    console.log(urlDatabase);
    res.redirect(`/urls/${randID}`);
  }
});

//update the existing id
app.post("/urls/:id", (req, res) => {
  const idToUpdate = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[idToUpdate]) {
    urlDatabase[idToUpdate] = newLongURL;
    return res.redirect("/urls");
  }
  res.status(404).send("URL not found");
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;

  if (urlDatabase[idToDelete]) {
    delete urlDatabase[idToDelete];
    return res.redirect("/urls");
  }
  res.status(404).send("URL not found");
});

//register
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const { email, password } = req.body;
  const user_email = req.body.email;
  const user_password = req.body.password;
  const hashedPassword = bcrypt.hashSync(user_password, 10);
  // Check if email or password is missing
  if (!user_email || !user_password) {
    return res.status(400).send("Email and password are required");
  }

  // By using Helper Function : Check if email already exists

  if (getUserByEmail(user_email, users)) {
    return res
      .status(400)
      .send("Email already registered, please try different email.");
  }

  const newUser = {
    id: user_id,
    email: user_email,
    password: hashedPassword,
  };
  users[user_id] = newUser;
  console.log(users);
  req.session.user_id = user_id;
  res.redirect("/urls");
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).send("Email and password are required");
    return;
  }
  // Helper Function : Check if user with email exists
  const user = Object.values(users).find((user) => user.email === email);

  if (user && user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//last version November 30, 23:40 status
//however at the last commit, this command was running shown below
// ./node_modules/.bin/nodemon -L express_server.js

// 2023-12-01 01:10, multiple terminals of Vscode caused port8080 conflict
// because multiple terminals (./node_modules/.bin/nodemon -L express_server.js) are using same port 8080
