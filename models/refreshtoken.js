'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	class RefreshToken extends Model {
		static associate(models) {
			this.belongsTo(models.User, { foreignKey: 'userId' })
		}
		get isExpired() {
			return this.expiresAt && this.expiresAt < new Date()
		}
		get isActive() {
			return !this.revokedAt && !this.isExpired
		}
	}
	RefreshToken.init(
		{
			userId: { type: DataTypes.INTEGER, allowNull: false },
			tokenHash: { type: DataTypes.STRING, allowNull: false },
			familyId: { type: DataTypes.STRING, allowNull: false },
			userAgent: DataTypes.STRING,
			ip: DataTypes.STRING,
			expiresAt: { type: DataTypes.DATE, allowNull: false },
			revokedAt: DataTypes.DATE,
			replacedByToken: DataTypes.STRING,
		},
		{ sequelize, modelName: 'RefreshToken' },
	)
	return RefreshToken
}
