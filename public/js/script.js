// Signup form validation
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    e.preventDefault();
    alert('पासवर्ड मेल नहीं खा रहा है! कृपया दोबारा जाँचें।');
    document.getElementById('password').focus();
  }
});

// Login form validation
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    e.preventDefault();
    alert('कृपया ईमेल और पासवर्ड दर्ज करें');
  }
});

// Navbar mobile toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
});


// Signup Form Handling
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    document.getElementById('message').textContent = data.message || data.error;
    
    if (response.ok) {
      setTimeout(() => window.location.href = '/login', 1500);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Login Form Handling
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    username: document.getElementById('loginUsername').value,
    password: document.getElementById('loginPassword').value
  };

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    const messageEl = document.getElementById('loginMessage');
    messageEl.textContent = data.message || data.error;
    
    if (response.ok) {
      messageEl.style.color = 'green';
      setTimeout(() => {
        // Redirect to dashboard or home page
        window.location.href = '/dashboard.html';
      }, 1500);
    } else {
      messageEl.style.color = '#d9534f';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});





// Reset Password Page
app.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.render('reset-password', {
        error: 'अमान्य या समाप्त टोकन',
        token: null
      });
    }
    
    res.render('reset-password', {
      error: null,
      token: req.params.token
    });
  } catch (err) {
    console.error(err);
    res.render('reset-password', {
      error: 'त्रुटि हुई',
      token: null
    });
  }
});

// Reset Password Process
app.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({ 
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.render('reset-password', {
        error: 'अमान्य या समाप्त टोकन',
        token: null
      });
    }
    
    // Update password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    
    await user.save();
    
    res.redirect('/login?reset=success');
  } catch (err) {
    console.error(err);
    res.render('reset-password', {
      error: 'त्रुटि हुई',
      token: req.params.token
    });
  }
});