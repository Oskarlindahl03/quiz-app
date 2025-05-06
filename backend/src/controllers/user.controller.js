const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

// Create new user
exports.createUser = async (req, res) => {
  try {
    const parsed = userSchema.parse(req.body);
    const { username, email, password } = parsed;
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash });
    const saved = await newUser.save();
    res.status(201).json({ id: saved._id, username: saved.username, email: saved.email });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: true, message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username email createdAt');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email createdAt');
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('username email createdAt');
    if (!updated) return res.status(404).json({ error: true, message: 'User not found' });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: true, message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: true, message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
}; 