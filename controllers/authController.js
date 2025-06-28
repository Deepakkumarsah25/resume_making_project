exports.signup = (req, res) => {
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return res.status(400).send('सभी फ़ील्ड भरना अनिवार्य है');
  }
  
  // Save user to database (simulated)
  console.log('नया उपयोगकर्ता: ', { name, email, phone });
  
  // Redirect to login page with success message
  res.redirect('/login?signup=success');
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  // Add your login authentication logic here
  console.log('लॉगिन प्रयास: ', { email });
  
  // After successful login
  res.send(`
    <div style="text-align: center; padding: 50px;">
      <h1>लॉग इन सफल! �</h1>
      <p>आप सफलतापूर्वक लॉग इन हो गए हैं</p>
      <a href="/" style="display: inline-block; margin-top: 20px; 
        padding: 10px 20px; background: #2575fc; color: white; 
        text-decoration: none; border-radius: 5px;">
        होम पर जाएं
      </a>
    </div>
  `);
};

// controllers/authController.js
const signup = (req, res) => {
    res.status(201).json({ message: "Signup successful!" });
};

const login = (req, res) => {
    res.status(200).json({ message: "Login successful!" });
};

module.exports = {
    signup,
    login
};