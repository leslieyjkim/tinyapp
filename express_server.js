const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function () {};

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs"); //Set ejs as the view engine. (npm install ejs)

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id], //여길 수정했어. b2xVn2을 쓰기 위해 urlDatabase의 키밸류인 아이디 가져오려.
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
