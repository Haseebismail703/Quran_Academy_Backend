import User from "../model/authModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv'
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";
configDotenv()
// user signup api

const signupUser = async (req, res) => {
    try {
        const { firstName, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        let generatedPassword;
        let isPasswordUnique = false;

        // Ensure the generated password is unique
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
        const newUser = new User({ firstName, email, password: hashedPassword });
        await newUser.save();

        // Prepare minimal user data to include in the JWT payload
        const user_data = {
            email: newUser.email,
            id: newUser._id,
            firstName: newUser.firstName,
            role: newUser.role || 'user'
        };

        // Generate JWT token
        const token = jwt.sign(user_data, process.env.JWT_Secret);

        // Set the JWT token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // To prevent client-side access to the cookie
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

        res.status(200).json({ message: "User registered, password sent to email", token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// signin api 
let signinUser = async (req, res) => {
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

        // Check if user role is user
        if (user.role !== 'user') {
            return res.status(403).send({ status: 403, message: "Invalid email or password" });
        }

        // Prepare minimal user data to include in the JWT payload
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
        // Handle any errors
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
// update user and change password 
let updateUser = async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;
        const { userId } = req.params;
        // Fetch user by ID
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // check FirstName and last name 
        if (user.firstName === firstName && user.lastName === lastName) {
            return res.status(400).json({ message: "First name and last name are already Exist" });
        }

        // Validate current password
        if (!currentPassword) {
            return res.status(400).json({ message: "Current password is required" });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Ensure new password is provided and different from current password
        if (newPassword && newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be the same as the current password" });
        }

        // Update user fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        // Hash and update new password only if provided
        if (newPassword) {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
        }

        await user.save();

        res.status(200).json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Update Profile Error:", error);
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
export { signupUser, signinUser, adminLogin, updateUser, logOut };
