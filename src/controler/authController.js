import User from "../model/authModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv'
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "../confiq/cloudinary.js";
configDotenv()
// user signup api

const signupUser = async (req, res) => {
    // console.log(req.body)
    try {
        const { firstName, lastName, email, role } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        // check Name already registered
        const existingUserName = await User.findOne({ firstName });
        if (existingUserName) {
            return res.status(400).json({ message: "Name already registered" });
        }

        let generatedPassword;
        let isPasswordUnique = false;

        //  generated password is unique
        while (!isPasswordUnique) { 
            generatedPassword = crypto.randomBytes(4).toString("hex");
            const passwordExists = await User.findOne({ password: generatedPassword });
            if (!passwordExists) {
                isPasswordUnique = true;
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Create user
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
        await newUser.save();

        const user_data = {
            email: newUser.email,
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
        };

        // Generate JWT token
        const token = jwt.sign(user_data, process.env.JWT_Secret);

        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        // Send email
        const subject = `🎉 Welcome to [Online Quran Academy] - Your Account Details Inside!`;

        const message = `
        Hi ${firstName},

        Welcome aboard! We're excited to have you as part of our platform. 🎉

        Here are your login details:

        🔑 **Password**: ${generatedPassword}

       You can now log in using your email: **${email}**
       We recommend changing your password after logging in for enhanced security.

       If you have any questions, feel free to reach out to our support team.

       Best regards,  
       Team [Online Quran Academy]
`;
        await sendEmail(email, subject, message);

        res.status(200).json({ message: "password sent to youre email", token, user_data });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: error.message });
    }
};
// signin api 
let signinUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        
        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

      
        const user_data = {
            email: user.email,
            id: user._id,
            firstName: user.firstName,
            role: user.role
        };

        // Generate JWT token
        const token = jwt.sign(user_data, process.env.JWT_Secret);

        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}
// admin login api 
let adminLogin = async (req, res) => {
    const { email, password } = req.body;


    try {
        // Find user by email and exclude password from returned document
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send({ status: 400, message: "Invalid credentials" });
        }

        // Check if user role is admin
        if (user.role !== 'admin') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: user.email,
            id: user._id,
            role: user.role,
            // profileurl: user.profileurl,
            firstName: user.firstName
            // Include role in JWT payload
            // Add more fields as needed
        };

        // Generate JWT token
        const token = jwt.sign(user_data, 'Haseeb');
        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        // Return success response with user data (without password) and token
        return res.status(200).send({ status: 200, message: "Login successful", user_data, token });

    } catch (error) {
        // Handle any errors
        res.status(500).send({ status: 500, message: "Internal server error", error: error.message });
    }
}
// update user 
const updateUser = async (req, res) => {
    // console.log('Update user:', req.file); // Check if file is being received

    try {
        const { firstName, lastName ,gender} = req.body; // Removed password-related fields
        const { userId } = req.params;
        const file = req.file;

        // Find user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check for duplicate name only if both fields are being updated
        if (
            firstName &&
            lastName &&
            user.firstName === firstName 
        ) {
            return res
                .status(400)
                .json({ message: 'First name  already exist' });
        }

        // Update only the provided fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if(gender) user.gender = gender
        // Upload image if provided
        if (file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'user_profiles',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                // Pipe the file buffer into the upload stream
                uploadStream.end(file.buffer); // Using the file buffer instead of file.path
            });

            // Set the uploaded image URL to the user's profile
            user.profileUrl = uploadResult.secure_url;
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// update password
const updatePassword = async (req, res) => {
    console.log(req.params, req.body)
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Check if the current password and new password are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Both current password and new password are required',
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Log current password and stored password
        console.log('Current Password:', currentPassword); // Log the current password from the request
        console.log('Stored Password:', user.password); // Log the stored password from the database

        // Check if current password matches the stored password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Check if new password is different from the current one
        if (newPassword === currentPassword) {
            return res.status(400).json({
                message: 'New password cannot be the same as current password',
            });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10); // 10 salt rounds
        user.password = hashedNewPassword;

        // Save the updated user data
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password Update Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// get profile using id 
let getProfile = async (req, res) => {
    const { userId } = req.params
    try {
        let user = await User.findById(userId)
        return res.status(200).json(user);
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



// logout api
let logOut = async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// update teacher status and first name 
let updateStatusAndFirstName = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, firstName } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's status and first name
        user.status = status || user.status;
        user.firstName = firstName || user.firstName;

        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export { signupUser, signinUser, adminLogin, updateUser, logOut, updateStatusAndFirstName, updatePassword, getProfile };
