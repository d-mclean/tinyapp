/* 20171010 DM - LHL w2d2

  Project: TinyApp

*/
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

/*
////////////////
templateVars = { urls: urlDatabase };
//console.log(templateVars);
for (var key in templateVars) {
  var obj = templateVars[key];
  for (var prop in obj){
    console.log(prop + " - " + obj[prop]);
  }
}
/////////////////////
*/

// Tell app to use the its templating engine.
app.set("view engine", "ejs");

//app.set("views", "views/partials");

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                        username: req.cookies['username'] };
  //console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies['username']};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let strNewId = generateRandomString();
  // Add new record to db, generating a new id as needed.
  urlDatabase[strNewId] = req.body.longURL;

  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('http://localhost:8080/urls/' + strNewId)
});

app.post("/login", (req, res) => {
  //console.log(res.cookie);
  res.cookie('username', req.body.username);

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.post("/logout", (req, res) => {
  //console.log(res.cookie);
  res.clearCookie('username');

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.post("/urls/:id", (req, res) => {

  //console.log(urlDatabase[req.body.shortURL]);
  // Update the longURL in the db.
  urlDatabase[req.body.shortURL] = req.body.longURL;

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');

});

app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.params.id);
  // Delete record from db.
  delete urlDatabase[req.params.id];

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

  // Redirect the user to the long version of the URL.
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Generate a random six character string.
function generateRandomString() {
  let strId = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    strId += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return strId;
}