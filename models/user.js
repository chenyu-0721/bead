'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			this.hasMany(models.RefreshToken, { foreignKey: 'userId' })
		}
	}
	User.init(
		{
			email: { type: DataTypes.STRING, allowNull: false, unique: true },
			passwordHash: { type: DataTypes.STRING, allowNull: false },
			name: DataTypes.STRING,
		},
		{ sequelize, modelName: 'User' },
	)
	return User
}
