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