const jwt = require('jsonwebtoken')
const ms = require('ms')

const ACCESS_EXPIRES_IN = '900s' // Access Token 15 min
const REFRESH_EXPIRES_IN = '240m' // Refresh Token 4 hr

// Access Token
exports.signAccessToken = payload => {
	if (!process.env.ACCESS_SECRET) throw new Error('ACCESS_SECRET not set')
	return jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

exports.verifyAccessToken = token => {
	if (!process.env.ACCESS_SECRET) throw new Error('ACCESS_SECRET not set')
	return jwt.verify(token, process.env.ACCESS_SECRET)
}

// Refresh Token (明文回傳給客戶端，DB 存 hash)
exports.signRefreshTokenPlain = payload => {
	if (!process.env.REFRESH_SECRET) throw new Error('REFRESH_SECRET not set')
	return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
}

exports.verifyRefreshToken = token => {
	if (!process.env.REFRESH_SECRET) throw new Error('REFRESH_SECRET not set')
	return jwt.verify(token, process.env.REFRESH_SECRET)
}

// 計算 refresh token 到期日期（Date 物件）
exports.refreshExpiresAt = () => {
	const d = new Date()
	d.setMinutes(d.getMinutes() + +ms(REFRESH_EXPIRES_IN))
	return d
}
