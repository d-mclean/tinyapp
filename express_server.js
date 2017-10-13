/* 20171010 DM - LHL w2d2

  Project: TinyApp

*/
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// var urlDatabase = {
//   "user3RandomID": {
//     "b2xVn2": "http://www.lighthouselabs.ca"},
//   "user3RandomID": {
//     "9sm5xK": "http://www.google.com"}
// };


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');

// Decided to look at the short url as a primary key/index for the urlDB.
var urlDatabase = {
  "b2xVn2": {
    "user3RandomID" : "http://www.lighthouselabs.ca"
            },
  "9sm5xK": {
    "user3RandomID" :"http://www.google.com"
            }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
 "user3RandomID": {
    id: "user3RandomID",
    email: "test@test.com",
    password: bcrypt.hashSync("test", 10)
  }
};
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

  // Only display URLs owned by the logged in user.
  let urlUserDatabase = urlsForUser(req.cookies['user_id']);

  let templateVars = { urls: urlUserDatabase,//urlDatabase,
                        user: objUser };

  //console.log(templateVars)
  //console.log(urlDatabase);

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };

  let templateVars = { urls: urlDatabase,
                        user: objUser };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    // Redirect user to login if they haven't.
    res.redirect('http://localhost:8080/login');
  }
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
  res.clearCookie('email');

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.get("/urls/:id", (req, res) => {
  let objUser = {
    id: req.cookies['user_id'],
    email: req.cookies['email']
    //,    password: req.body.password
  };

  let linkID;

  // Get the owner of the specific URL.
  for (linkID in urlDatabase[req.params.id]){
    // Ensure the current user is logged in and authorized to edit the url.
    if (linkID == req.cookies['user_id']) {
      console.log("Authorized access")
      // console.log(urlDatabase[req.params.id])
      // urlDatabase[req.params.id] = req.params.longURL;
      // console.log(urlDatabase[req.params.id])
    } else {
      console.log(linkID)
    }

  }

  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        userID: linkID,
                        user: objUser};

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  let strNewId = generateRandomString();
  let strUserId = req.cookies['user_id'];
  let newURL = {};

  // Create a new URL to add to the DB, ensuring owner is used as the index of the record.
  newURL[strUserId] = req.body.longURL;

  // Add new record to db, generating a new id as needed.
  urlDatabase[strNewId] = newURL;

  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('http://localhost:8080/urls/' + strNewId)
});

app.post("/login", (req, res) => {
  let boolValidEmail = false;
  let strUser_id;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // Ensure email address isn't already in db.
  for (let user in users){
    if (users[user].email == req.body.email) {

      // Check the entered password against the hash in the db.
      if(bcrypt.compareSync(req.body.password, users[user].password)) {
        boolValidEmail = true;
        strUser_id = users[user].id;
      }
    }
  }

  if (boolValidEmail){
    res.cookie('user_id', strUser_id);
    res.cookie('email', req.body.email);
    res.cookie('password', hashedPassword);

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

    // Hash the user password before storing it in the cookie.
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    // Set cookie for the new user.
    res.cookie('user_id', strNewId);
    res.cookie('email', req.body.email);
    res.cookie('password', hashedPassword);

    let objUser = {
      id: strNewId,
      email: req.body.email,
      password: hashedPassword
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
  // Get the owner of the specific URL.
  for (let owner in urlDatabase[req.body.shortURL]){
    // Ensure the current user is logged in and authorized to edit the url.
    if (owner == req.cookies['user_id']) {
      // Update the longURL in the db.
      urlDatabase[req.body.shortURL][owner] = req.body.longURL;
    } else {
      // REDIRECT USER TO LOGIN PAGE OR DISPLAY ERROR??????
      console.log(owner)
    }

  }

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');

});

app.post("/urls/:id/delete", (req, res) => {
  // Ensure the current user is the owner of the URL.
  for (let owner in urlDatabase[req.params.id]){
    if(req.cookies['user_id'] === owner){
      //Delete record from db.
      delete urlDatabase[req.params.id];
    }
  }

  // Redirect user back to the main index afterwards.
  res.redirect('http://localhost:8080/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let l;
  console.log(longURL);
  console.log(typeof longURL)
  console.log(longURL[0])

  for (var key in longURL){
    l = longURL[key]
  }
  console.log(l)
  // Redirect the user to the long version of the URL.
  //res.redirect(longURL);
  res.redirect(l);
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

// Create subset of full db filtered by the given user id.
function urlsForUser(id){
  //user3RandomID

  let templateVars = {};
  //console.log(urlDatabase)
  for (let key in urlDatabase){
      //console.log("key: " +urlDatabase[key]+" id:" +id)
      for (let k in urlDatabase[key]) {
        //console.log("K:" + k)
        if (k === id){
          templateVars[key] = urlDatabase[key];
        }
      }
  }

  return templateVars;
}