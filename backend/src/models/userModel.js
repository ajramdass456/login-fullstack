import {DataTypes} from 'sequelize';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const hashPassword = async (user) => {
	if(user.changed('password')){
		const saltRounds = 10;
		user.password = await bcrypt.hash(user.password, saltRounds);
	}
};

const User = db.define('User',{
	//Sequelize automatically creates id:INT PRIMARY 
	username: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING(60),
		allowNull: false
	}
},
{
	tableName: 'users',
	defaultScope: {
		attributes: {exclude:['password']}
	},
	scopes: {
		withPassword: {attributes: {}}
	},
	hooks: {
  		beforeCreate: hashPassword,
  		beforeUpdate: hashPassword
	}	
});

export default User;
