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


// Tell app to use the its templating engine.
app.set("view engine", "ejs");

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});