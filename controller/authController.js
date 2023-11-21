const User = require('../models/user');
const bcrypt = require('bcrypt');

// Registration controller
exports.register = async (req, res) => {
    const { name, password, email } = req.body;

   
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const emailError = `Email is already registered <a href="/login">Login with ${email}</a>`;
            return res.render('register', { emailError, email });
        }

        // Create a new user with the hashed password
        const newUser = new User({ email, name, password: hashedPassword });
        await newUser.save();

        // Log in the user after registration
        // req.session.userId = newUser._id;
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.redirect("/register");
    }
  
};

// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.authenticate(password))) {
            const error = `Invalid email or password.`;
            return res.render("login", { error });
        }

        // If the email and password are correct, log in the user
        req.session.userId = user._id;
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.redirect("/login");
    }
};

// Logout controller
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login'); // Redirect to the home page after logout
    });
};

// Middleware to check if the user is authenticated
exports.authenticate = (req, res, next) => {
    const userId = req.session.userId;

    if (!userId) {
        req.flash('error', 'You must be logged in to access this page.');
        res.redirect('/login');
    } else {
        next(); // Proceed to the next middleware/controller
    }
};

// Load login view
exports.loadLogin = (req, res) => {
    const error = req.flash('error')[0] || null;
    if(req.session.userId){
        res.redirect('/dashboard');
    }else{
        res.render('login', { error });
        
    }
};

// Load dashboard view
exports.loadDashboard = async (req, res) => {
    const userId = req.session.userId;

    // if (!userId) {
    //     req.flash('error', 'You must be logged in to access this page.');
    //     res.redirect('/login');
    //     return;
    // }

    try {
        const user = await User.findById(userId);

        if (!user) {
            req.flash('error', 'User not found.');
            res.redirect('/login');
            return;
        }
        if(req.session.userId){

            res.render('dashboard', { user });
        }else{
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};


// ... (other controllers or functions can be added here)

module.exports = exports;
