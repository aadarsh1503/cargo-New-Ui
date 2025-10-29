const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Import crypto
const { sendPasswordResetEmail } = require('../../utils/mailer');


const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
        const admin = rows[0];

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: admin.id,
            username: admin.username
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) {
                    console.error("JWT signing error:", err);
                    // It's better to send a 500 error here
                    return res.status(500).json({ message: "Could not generate token." });
                }
                

                res.json({
                    success: true,
              
                    adminToken: token         
                });
            }
        );

    } catch (error) {
        console.error("Server error during login:", error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

const registerAdmin = async (req, res) => {
    // The 'username' from the frontend is actually the email
    const { username, password } = req.body;

    // ... your existing validation ...
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide a username and password.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        const [existingAdmins] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- THIS IS THE FIX ---
        // We now insert the same 'username' value into both the 'username' and 'email' columns.
        const [result] = await pool.query(
            'INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)',
            [username, username, password_hash] // Pass 'username' twice
        );
        // --- END OF FIX ---

        res.status(201).json({ 
            message: 'Admin account created successfully. You can now log in.',
            adminId: result.insertId 
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email address is required.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
        const admin = rows[0];

        // IMPORTANT: Always send a success-like response to prevent email enumeration.
        if (!admin) {
            console.log(`Password reset attempt for non-existent email: ${email}`);
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expiration (e.g., 1 hour from now)
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save hashed token and expiry to the database
        await pool.query(
            'UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [hashedToken, tokenExpiry, admin.id]
        );

        // Send the email (with the un-hashed token)
        await sendPasswordResetEmail(admin.email, resetToken);

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
};

// NEW: RESET PASSWORD FUNCTION
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    
    try {
        // Hash the token from the URL to match the one in the DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by hashed token and check if it's not expired
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE reset_token = ? AND reset_token_expires > NOW()',
            [hashedToken]
        );

        const admin = rows[0];

        if (!admin) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Update password and clear the reset token fields
        await pool.query(
            'UPDATE admins SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [password_hash, admin.id]
        );
        
        res.status(200).json({ message: 'Password has been updated successfully.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'An error occurred on the server.' });
    }
};


module.exports = { 
    loginAdmin, 
    registerAdmin,
    forgotPassword, // Add this
    resetPassword   // Add this
};