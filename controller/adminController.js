const users = require('../models/user');
const adminRouter = require('../routes/adminRoute');

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Inside adminLogin function");

    try {
        // Find the user by username
        const user = await users.findOne({ email });

        if (!user) {
            console.log("No user found");
            message="Invalid"
            return res.render("adminlogin", { message: "Invalid credentials" });
        }

        // Check if the user is an admin
        if (!user.isAdmin) {
            console.log('not an admin');
            return res.render("adminlogin", { message: "Access denied. You are not an admin." });
        }

        // Check if the password is correct
        const isPasswordValid = await user.authenticate(password);

        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.render("adminlogin", { message: "Invalid password" });
        }

        // If authentication is successful and the user is an admin, set the session data
        req.session.isAdmin = true;
        req.session.userId = user._id;

        // Redirect to the admin dashboard
        console.log("Successful login");


        res.redirect("/admin/admindashboard");


    } catch (err) {
        console.error(err);
        // Handle errors as needed
    }
};

exports.renderAdminDashboard = async (req, res) => {
    try {
        // Query the database to get all users
        const user = await users.find().exec();

        // Render the admin dashboard view with the user data
        if(req.session.userId)
        res.render('admindashboard', { title: 'Admin Dashboard', user });
        else
        res.redirect('/admin')
    } catch (err) {
        console.error(err);
        // Handle any errors here
    }
};
// Delete user function
exports.deleteUser = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the route parameter

    try {
        // Use the findByIdAndDelete method to delete the user
        const deletedUser = await users.findByIdAndDelete(userId);

        if (!deletedUser) {
            // User not found
            return res.redirect('/admin/admindashboard');
        }

        // Invalidate the session if the deleted user is the currently logged-in user
        if (req.session.userId && req.session.userId === userId) {
            req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                }
            });
             // Flash a message indicating the user was deleted
            req.flash('deletionMessage', 'userDeleted');
        }

        // User successfully deleted
        console.log("deleted successful");
        res.redirect('/admin/admindashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/admindashboard');
    }
};





// Logout controller for admin
exports.logout = (req, res) => {
    req.session.userId=null;
    console.log(req.session);
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/admin')
    });
};

// Handle the search request
exports.searchUsers = async (req, res) => {
    const { keyword } = req.query;

    try {
        // Use a regular expression to search for users with matching email or name
        const usersMatchingKeyword = await users.find({
            $or: [
                { email: { $regex: new RegExp(keyword, "i") } },
                { name: { $regex: new RegExp(keyword, "i") } }
            ]
        });

        res.render("search", { user: usersMatchingKeyword });
    } catch (err) {
        console.error(err);
        res.redirect("/admin/admindashboard");
    }
};



// Edit user function
exports.editUser = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the route parameter

    try {
        // Find the user by ID
        const user = await users.findById(userId);

        if (!user) {
            // User not found
            return res.redirect('/admin/admindashboard');
        }

        // Render an edit form with the user's current information
        res.render('editUser', { user });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/admindashboard');
    }
};
// Update user function
exports.updateUser = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the route parameter
    const { email, name } = req.body; // Get updated user information from the form

    try {
        // Find the user by ID and update their information
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            { email, name }, // Update the fields you need
            { new: true }
        );

        if (!updatedUser) {
            // User not found
            return res.redirect('/admin/admindashboard');
        }

        // Redirect to the admin dashboard or a user profile page
        res.redirect('/admin/admindashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/admindashboard');
    }
};


// Controller method to handle adding a new user
exports.addUser = async (req, res) => {
    const { email, name, password } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await users.findOne({ email });
  
      if (existingUser) {
        return res.render('addUser', { title: 'Add New User', message: 'User already exists with this email.' });
      }
  
      // Create a new user
      const newUser = new users({ email, name, password });
  
      // Save the new user to the database
      await newUser.save();
  
      // Redirect to the admin dashboard or show a success message
      res.redirect('/admin/admindashboard');
    } catch (err) {
      console.error(err);
      // Handle errors as needed
      res.redirect('/admin/admindashboard'); // Redirect to admin dashboard in case of an error
    }
  };

exports.adminLoginget = async (req,res) =>{
    return res.render('adminlogin')
}
// ...


