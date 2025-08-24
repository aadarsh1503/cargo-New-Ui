const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
    // We only need username and password now
    const { username, password } = req.body;

    // REMOVED: The check for the secret invitation code is gone.
    // if (!signupSecret || signupSecret !== process.env.ADMIN_SIGNUP_SECRET) {
    //     return res.status(403).json({ message: 'Forbidden: Invalid invitation code.' });
    // }

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide a username and password.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        // Check if admin already exists
        const [existingAdmins] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new admin into the database
        const [result] = await pool.query(
            'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
            [username, password_hash]
        );

        res.status(201).json({ 
            message: 'Admin account created successfully. You can now log in.',
            adminId: result.insertId 
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        // Handle potential duplicate entry error more gracefully
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

module.exports = { loginAdmin,registerAdmin  };