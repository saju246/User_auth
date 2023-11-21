const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');

const app = express();

// Middleware to set Cache-Control header
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Set up view engine and body-parser middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'secret', // Replace with a strong, random string
    resave: false,
    saveUninitialized: false,
}));



// Add connect-flash middleware
app.use(flash());


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');

    // Use the userRoute for handling routes
    app.use('/', require('./routes/userRoute'));
    app.use('/admin', require('./routes/adminRoute'));

    // Additional routes and middleware can be added here

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
    });

    // Start the server
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
