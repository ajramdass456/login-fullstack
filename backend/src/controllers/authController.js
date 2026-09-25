import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient.js'

//Helper function for cookies
const baseCookieOptions = {
  	httpOnly: true, // Prevents client-side JS from reading the cookie
  	secure: process.env.NODE_ENV === 'production', // True forces HTTPS
  	sameSite: 'strict', // Protects against CSRF attacks
};

const loginCookieOptions = {
  ...baseCookieOptions,
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

export const registerUser = async (req, res) => {
	try {
		const { username, password } = req.body; //extracts the info from request
		if (!username || !password) { //handles null input
    		return res.status(400).json({ error: "Username and password are required."
    		});
		}
		const newUser = await User.create({ username, password });
		await newUser.reload();
		res.status(201).json({ message: "User registered successfully", user: newUser });
	} 
	catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') { //data uniqueness
			return res.status(409).json({ 
				error: "Username is already taken." 
			});
		}
		if (error.name === 'SequelizeValidationError') { //data validation
			const messages = error.errors.map(err => err.message);
			return res.status(400).json({ 
				error: "Validation failed", 
				details: messages 
			});
		}
		console.error("Registration error:", error); //for debugging
		return res.status(500).json({ 
			error: "An unexpected server error occurred." 
		});
	}
};

export const loginUser = async (req, res) => {
	try{
		const { username, password, rememberMe } = req.body; //extracts the info from request
		if (!username || !password) {
			return res.status(400).json({ error: "Username and password are required." 
			});
		}
		const user = await User.findOne({
			where: {username: username}
		});
		if (!user){
			return res.status(401).json({error: "Invalid username/password."
			});
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json(
				{ error: "Invalid username/password."
			});
		}
		//Tokens
		const accessToken = jwt.sign(
			{userId: user.id, username: user.username}, // Token data
        	process.env.JWT_SECRET,                // Token key
        	{ expiresIn: '15m' }                   // Token Expiration 
    	);
		const refreshToken = jwt.sign(
			{userId: user.id}, 
        	process.env.JWT_REFRESH_SECRET,                
        	{ expiresIn: rememberMe? '30d': '1d' }                   
    	);
		//Redis storage
		const redisTTL = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
		await redisClient.setEx(`refresh:${user.id}`, redisTTL, refreshToken);
		
		const refreshCookieOptions = { ...baseCookieOptions };
			if (rememberMe) {
				refreshCookieOptions.maxAge = redisTTL * 1000; // 30 days hard save
		}

		res.cookie('refreshToken', refreshToken, refreshCookieOptions);
		return res.status(200).json({ 
			message: "Login successful.",
			token: accessToken 
    	});
	}
	catch (error){
		console.error("Login error:", error); //for debugging
		return res.status(500).json({ 
			error: "An unexpected server error occurred." 
		});
	}
}

export const refreshAccessToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
			if (!refreshToken) {
				return res.status(401).json({ error: "Access denied. No refresh token provided." });
			}
		
		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		// --- NEW: VERIFY AGAINST REDIS STATE ---

		const savedToken = await redisClient.get(`refresh:${decoded.userId}`);
		if (!savedToken || savedToken !== refreshToken) {
			return res.status(403).json({ error: "Session has been invalidated or expired." });
		}
		const user = await User.findByPk(decoded.userId);
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		const newAccessToken = jwt.sign(
			{ userId: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '15m' }
			);

		return res.status(200).json({ accessToken: newAccessToken });
	} 
	catch (error) {
			console.error("Refresh error:", error);
			return res.status(403).json({ error: "Invalid or expired refresh token." });
		}
};

export const logoutUser = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			try {
				const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
				await redisClient.del(`refresh:${decoded.userId}`);
			} 
			catch (err) {
			}
		}
		res.clearCookie('refreshToken', baseCookieOptions);
		return res.status(200).json({ message: "Logged out successfully." });
	}
	catch (error) {
		console.error("Logout error:", error); 
		return res.status(500).json({ error: "An unexpected server error occurred." });
	} 
};