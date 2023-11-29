const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use((req, res, next) => {
  res.locals.username = req.cookies["username"];
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
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//2.urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});
//3.urls_show
app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = {
    username: req.cookies["username"],
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
  console.log(req.body.username);
  const username = req.body.username;
  // Set a cookie named 'username' with the value submitted in the request body
  res.cookie("username", username);
  // Redirect the browser back to the /urls page
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  //clear the 'username' cookie to log the user out
  res.clearCookie("username");
  //Redirect the user back to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
