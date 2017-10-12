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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
 "user3RandomID": {
    id: "user3RandomID",
    email: "test@test.com",
    password: "test"
  }
}

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
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };

  let templateVars = { urls: urlDatabase,
                        user: objUser };

  //console.log(templateVars)
  // console.log(objUser.user_id)

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/register", (req, res) => {
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };

  let templateVars = { urls: urlDatabase,
                        user: objUser };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };
  let templateVars = { urls: urlDatabase,
                        user: objUser };
  res.render("urls_login", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('password');

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.get("/urls/:id", (req, res) => {
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };

  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        user: objUser};
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
  let boolValidEmail = false;
  let strUser_id;

  // Ensure email address isn't already in db.
  for (let user in users){
    if (users[user].email == req.body.email) {
      if(users[user].password == req.body.password) {
        boolValidEmail = true;
        strUser_id = users[user].id;
      }
    }
  }

  if (boolValidEmail){
    res.cookie('user_id', strUser_id);
    res.cookie('email', req.body.email);
    res.cookie('password', req.body.password);

    // Redirect user back to the main index afterwards.
    res.redirect('http://localhost:8080/urls');
  } else {
    // Invalid email/password so return 403.
    res.statusCode = 403;
    res.end("Invalid email/password combination!");
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('email');
  res.clearCookie('password');

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.post("/register", (req, res) => {
  // If this boolean is false, don't register user.
  let boolRegister = true;
  let strMsg = "Invalid email or password!";

  // Ensure email address isn't already in db.
  for (let user in users){
    if (users[user].email == req.body.email){
      boolRegister = false;
      strMsg = "Email already exists!";
    }
  }

  // Ensure user has entered valid values for email/password.
  if (req.body.email !== '' && req.body.password !== '' && boolRegister) {
    // Add new record to db, generating a new id as needed.
    let strNewId = generateRandomString();

    // Set cookie for the new user.
    res.cookie('user_id', strNewId);
    res.cookie('email', req.body.email);
    res.cookie('password', req.body.password);

    let objUser = {
      id: strNewId,
      email: req.body.email,
      password: req.body.password
    };

    // Add user to database.
    users[strNewId] = objUser;

    // Redirect user back to the main index afterwards.
    res.redirect('http://localhost:8080/urls');
  } else {
    // Send back a 404 status code.
    res.statusCode = 404;
    res.end(strMsg);
  }
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