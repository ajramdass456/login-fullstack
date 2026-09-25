import User from '../models/userModel.js'
import { Op } from 'sequelize';

export const getUserbyId = async (req, res) => {
	try{
		const user = await User.findByPk(req.params.id, {
			attributes: {exclude: ['password', 'isAdmin']}
		});
		if (!user) 
			return res.status(400).json({message: "User not found"});
		res.status(200).json(user)
	}
	catch(error) {
		console.error("Get profile error:", error); //for debugging
		res.status(500).json({ 
			error: "An unexpected server error occurred." 
		});
	}
};

// Keyset cursor pagination 
export const getAllUsers = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 50;
		const lastIdSeen = parseInt(req.query.lastIdSeen) || 0; // The cursor

		const users = await User.findAll({
			limit: limit,
			where: {
			id: { [Op.gt]: lastIdSeen } //postgres jumps to this PK
		},
			order: [['id', 'ASC']], //orders to ascending order
			attributes: ['id', 'username', 'createdAt'] //non-sensitive data
    });
	res.status(200).json(users); 
	} 
	catch(error) {
		console.error("Get pagination error:", error); //for debugging
		res.status(500).json({ 
			error: "An unexpected server error occurred." 
		});
	}
};

