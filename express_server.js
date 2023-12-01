const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use((req, res, next) => {
  const userID = req.cookies["user_id"];
  res.locals.user = users[userID];
  next();
});

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  //check if the user is not logged in
  if (!res.locals.user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: res.locals.user,
      urls: urlDatabase,
    };
    res.render("urls_index", templateVars);
  }
});

//2.urls_new
app.get("/urls/new", (req, res) => {
  // Check if the user is not logged in
  if (!res.locals.user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: res.locals.user,
    };
    res.render("urls_new", templateVars);
  }
});

//3.urls_show
app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = {
    user: res.locals.user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
  return;
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const shortURL = req.params.id;
  // Check if the shortURL exists in the database
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL]; // Use req.params.id if you prefer
    res.redirect(longURL);
  } else {
    // Short URL not found, send a relevant HTML error message
    res
      .status(404)
      .send("<html><body><h1>Short URL Not Found</h1></body></html>");
  }
});

// register (get request)
app.get("/register", (req, res) => {
  if (res.locals.user) {
    //check if the user is already logged in
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

// login (get request)
app.get("/login", (req, res) => {
  if (res.locals.user) {
    //if conditon means, check if the user is already logged in
    res.redirect("/urls");
  } else {
    res.render("login");
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
  const { email, password } = req.body;
  // Check if email or password is missing
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }
  // Helper Function : Check if email already exists
  const getUserByEmail = Object.values(users).find(
    (user) => user.email === email
  );
  if (getUserByEmail) {
    res.status(400).send("Email already registered");
    return;
  }

  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password,
  };

  users[userID] = newUser;
  res.cookie("user_id", userID);
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
