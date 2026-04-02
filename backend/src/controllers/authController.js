import crypto from "crypto";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { v2 as cloudinary } from "cloudinary";
// Register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ DO NOT HASH HERE
    // Let User model pre("save") hash automatically
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      message: error.message || "Registration failed. Please try again.",
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Google Login/Signup
export const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, photoURL } = req.body;

    console.log("Google login request received:", { email, name, googleId });

    if (!email || !googleId) {
      return res.status(400).json({
        message: "Google login failed. Missing required data.",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user for Google login...");

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: googleId + process.env.JWT_SECRET,
        googleId,
        profilePicture: photoURL || "",
        isEmailVerified: true,
        role: "student",
      });

      console.log("New user created:", user._id);
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (photoURL && !user.profilePicture) {
        user.profilePicture = photoURL;
      }

      user.isEmailVerified = true;
      await user.save();

      console.log("Google account linked/updated successfully");
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || "",
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Forgot password request for:", email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ No user found with email:", email);
      return res.json({
        message: "If an account exists with this email, you'll receive password reset instructions.",
      });
    }

    console.log("✅ User found:", user.email);

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await PasswordReset.deleteMany({ email });

    await PasswordReset.create({
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000),
    });

    console.log("✅ Reset token saved in DB");

    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message: "If an account exists with this email, you'll receive password reset instructions.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};

// Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetEntry = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetEntry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Failed to verify token" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetEntry = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetEntry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ email: resetEntry.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Let model hash automatically
    user.password = password;
    await user.save();

    // Delete used reset token
    await PasswordReset.deleteOne({ _id: resetEntry._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// GET user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Optional: only allow psychiatrist role if needed
    if (req.body.role && ["student", "psychiatrist"].includes(req.body.role)) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// UPLOAD profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profile_pictures", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
};