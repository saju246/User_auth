const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
// Middleware to set cache control headers
const setCacheControl = (req, res, next) => {
    res.set('Cache-Control', 'no-store'); // This disables caching
    next();
};

router.get('/', setCacheControl, (req, res) => {
    res.render('home');
});

router.get('/register', setCacheControl, (req, res) => {
    const emailError = req.flash('emailError')[0] || null;
    res.render('register', { emailError });
});

router.get('/login', setCacheControl, authController.loadLogin);
router.post('/login', setCacheControl, authController.login);

router.post('/register', setCacheControl, authController.register);

router.get('/dashboard', setCacheControl, authController.authenticate, authController.loadDashboard);
router.post('/dashboard', setCacheControl, authController.authenticate, (req, res) => {
    // Handle any post request related to the dashboard here
});

router.post('/logout', setCacheControl, authController.logout);

module.exports = router;
