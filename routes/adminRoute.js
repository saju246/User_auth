const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controller/adminController');
const { body, validationResult } = require('express-validator');

// Middleware to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/admin/admindashboard');
    } else {
        next();
    }
};

// Middleware to render the admin dashboard
adminRouter.get("/admindashboard", adminController.renderAdminDashboard, (req, res) => {});

// Route to handle adding a new user with validation
adminRouter.post(
    '/addUser',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        // Add more validation rules as needed
    ],
    (req, res, next) => {
        // Validate user input
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are validation errors, render the form with error messages
            return res.render('addUser', { title: 'Add New User', errors: errors.array() });
        }

        // If validation is successful, proceed to the controller
        next();
    },
    adminController.addUser
);

// Handle the admin login form submission
adminRouter.post("/adminlogin", adminController.adminLogin);

// Logout route for admin
adminRouter.get('/logout', adminController.logout);

// Create routes for delete and block actions
adminRouter.get("/delete/:id", adminController.deleteUser);

// Route to render the add user form
adminRouter.get('/addUser', checkLoggedIn, (req, res) => {
    res.render('addUser', { title: 'Add New User' });
});

// Route to handle adding a new user
adminRouter.post('/addUser', adminController.addUser);

// Add a route for search
adminRouter.get("/search", adminController.searchUsers);

// Create a route to handle user editing
adminRouter.get("/edit/:id", adminController.editUser);

// Create a route to handle user updates
adminRouter.post("/update/:id", adminController.updateUser);

adminRouter.get('/',adminController.adminLoginget)

module.exports = adminRouter;
