require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// सत्र मिडलवेयर
app.use(session({
  secret: process.env.SESSION_SECRET || 'apna-secret-key-123',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 घंटे
  }
}));

// मिडलवेयर
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// स्टेटिक फाइलें
app.use(express.static(path.join(__dirname, 'public')));

// EJS व्यू इंजन
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// सभी टेम्पलेट्स में user उपलब्ध कराने के लिए
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// अस्थायी डेटाबेस
const users = [];

// रूट्स -------------------------------------------------

// होम पेज
app.get('/', (req, res) => {
  res.render('home', { currentPage: 'home' });
});

// साइनअप पेज (GET)
app.get('/signup', (req, res) => {
  const error = req.query.error;
  res.render('signup', { 
    currentPage: 'signup',
    error: error === 'exists' ? 'ईमेल पहले से मौजूद है' : null
  });
});

// साइनअप प्रोसेस (POST)
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // ईमेल चेक करें
  const userExists = users.some(user => user.email === email);
  if (userExists) {
    return res.redirect('/signup?error=exists');
  }
  
  // नया यूजर बनाएं
  const newUser = { 
    id: Date.now().toString(), 
    name, 
    email, 
    password 
  };
  
  users.push(newUser);
  
  // लॉगइन पेज पर रीडायरेक्ट
  res.redirect('/login?signup=success');
});

// लॉगइन पेज (GET)
app.get('/login', (req, res) => {
  const signupSuccess = req.query.signup === 'success';
  const error = req.query.error === 'invalid' ? 'गलत ईमेल या पासवर्ड' : null;
  
  res.render('login', { 
    currentPage: 'login', 
    signupSuccess,
    error
  });
});

// लॉगइन प्रोसेस (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // यूजर खोजें
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // सत्र में यूजर सेव करें
    req.session.user = user;
    res.redirect('/main');
  } else {
    res.redirect('/login?error=invalid');
  }
});

// मुख्य पेज (प्रोटेक्टेड)
app.get('/main', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('main', { 
    currentPage: 'main',
    user: req.session.user 
  });
});

// लॉगआउट
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
});

// सर्वर स्टार्ट
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`सर्वर चल रहा है: http://localhost:${PORT}`);
});