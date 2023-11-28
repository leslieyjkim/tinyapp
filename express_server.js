const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs"); //Set ejs as the view engine. (npm install ejs)

let urlDatabase = {
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
  return;
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); //
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
