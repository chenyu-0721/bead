const { verifyAccessToken } = require('../utils/jwt')

module.exports = function auth(req, res, next) {
	const authHeader = req.headers.authorization || ''
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
	if (!token) return res.status(401).json({ error: 'No access token' })

	try {
		const payload = verifyAccessToken(token)
		req.user = { id: payload.sub, email: payload.email }
		next()
	} catch {
		return res.status(401).json({ error: 'Access token invalid/expired' })
	}
}
