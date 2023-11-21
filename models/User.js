
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    email:String, // Store hashed passwords
    isAdmin: { type: Boolean, default: false },
});

// Add a method to the schema to verify the provided password
userSchema.methods.authenticate = function (password) {
    // Compare the provided password with the hashed password in the database
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
