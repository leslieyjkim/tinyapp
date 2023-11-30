const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs"); // Set the view engine to EJS
app.set("views", __dirname + "/views"); // Set the views directory
app.use((req, res, next) => {
  // res.locals.username = req.cookies["username"];
  //Update the middleware that sets from above [res.locals.username] to belowset [res.locals.user] instead.
  const userID = req.cookies["user_id"];
  res.locals.user = users[userID];
  next();
}); // Pass the username to all views

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

//create a global object to store users
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
  const templateVars = {
    // username: req.cookies["username"], //update this part to below
    user: res.locals.user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//2.urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: res.locals.user,
  };
  res.render("urls_new", templateVars);
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
  res.redirect(longURL);
});

// register (get request)
app.get("/register", (req, res) => {
  res.render("register");
});

// login (get request)
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // longURL = user input
  // id = output of random generator
  // id : longURL -> store to DB, DB[id] = longURL
  let longURL = req.body.longURL;
  let randID = generateRandomString();
  urlDatabase[randID] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randID}`);
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
//login
app.post("/login", (req, res) => {
  console.log(req.body.user);
  const user = req.body.user;
  // Set a cookie named 'user' with the value submitted in the request body
  res.cookie("user", user);
  res.redirect("/urls");
});

//logout
app.get("/logout", (req, res) => {
  //clear the 'user' cookie to log the user out
  res.clearCookie("user_id");
  res.redirect("/login"); //Intuitive Interactions
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
    password, // Note: In a real application, this should be hashed and not stored in plain text
  };

  users[userID] = newUser; // Add the new user to the global users object
  res.cookie("user_id", userID); // Set user_id cookie containing the new user's ID
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

  // Check if the user exists and the password matches (simplified example)
  if (user && user.password === password) {
    res.cookie("user_id", user.id); // Set user_id cookie containing the user's ID
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password"); // Handle invalid login credentials
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
