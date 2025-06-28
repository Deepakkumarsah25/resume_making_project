require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User'); // If filename is capitalized

const app = express();

// Connect to MongoDB
connectDB();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'apna-secret-key-123',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes -------------------------------------------------

// Home page
app.get('/', (req, res) => {
  res.render('home', { currentPage: 'home' });
});

// Signup page (GET)
app.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/main');
  
  const error = req.query.error;
  res.render('signup', { 
    currentPage: 'signup',
    error: error === 'exists' ? 'ईमेल पहले से मौजूद है' : 
            error === 'username' ? 'उपयोगकर्ता नाम पहले से उपयोग में है' : null
  });
});

// Signup process (POST)
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.redirect('/signup?error=exists');
    }
    
    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.redirect('/signup?error=username');
    }
    
    // Create new user
    const newUser = new User({ 
      username,
      email, 
      password
    });
    
    // Save to database
    await newUser.save();
    
    // Redirect to login with success message
    res.redirect('/login?signup=success');
    
  } catch (err) {
    console.error(err);
    res.redirect('/signup?error=unknown');
  }
});

// Login page (GET)
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/main');
  
  const signupSuccess = req.query.signup === 'success';
  const error = req.query.error === 'invalid' ? 'गलत ईमेल या पासवर्ड' : null;
  
  res.render('login', { 
    currentPage: 'login', 
    signupSuccess,
    error
  });
});

// Login process (POST)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.redirect('/login?error=invalid');
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.redirect('/login?error=invalid');
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    // Redirect to main page after login
    res.redirect('/main');
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=unknown');
  }
});

// Main page (protected)
app.get('/main', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('main', { 
    currentPage: 'main',
    user: req.session.user 
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
});

// Forgot Password Page
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { 
    currentPage: 'forgot-password',
    message: null,
    error: null
  });
});

// Forgot Password Process
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('forgot-password', {
        currentPage: 'forgot-password',
        message: null,
        error: 'ईमेल पता नहीं मिला'
      });
    }
    
    // Generate reset token
    const resetToken = Math.random().toString(36).slice(2, 10).toUpperCase();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    res.render('forgot-password', {
      currentPage: 'forgot-password',
      message: `पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया है। टोकन: ${resetToken}`,
      error: null
    });
    
  } catch (err) {
    console.error(err);
    res.render('forgot-password', {
      currentPage: 'forgot-password',
      message: null,
      error: 'त्रुटि हुई, कृपया बाद में प्रयास करें'
    });
  }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`सर्वर चल रहा है: http://localhost:${PORT}`);
});