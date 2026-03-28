import crypto from 'crypto';
import User from "../models/User.js";
import PasswordReset from '../models/PasswordReset.js';
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

// Register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });

  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      message: error.message || "Registration failed. Please try again."
    });
  }
};

// ✅ Login (UPDATED WITH BLOCK CHECK)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin"
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
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If an account exists with this email, you'll receive password reset instructions."
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await PasswordReset.deleteMany({ email });

    await PasswordReset.create({
      email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000)
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message: "If an account exists with this email, you'll receive password reset instructions."
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const verifyResetToken = async (req, res) => {
  try {

    const { token } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const resetEntry = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetEntry) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ valid: true });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
};

export const resetPassword = async (req, res) => {
  try {

    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const resetEntry = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() }
    });

    if (!resetEntry) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: resetEntry.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    await PasswordReset.deleteOne({ _id: resetEntry._id });

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};