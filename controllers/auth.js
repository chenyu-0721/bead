const { User, RefreshToken } = require('../models')
const { hashPassword, comparePassword, hashToken, newFamilyId } = require('../utils/crypto')
const {
	signAccessToken,
	signRefreshTokenPlain,
	verifyRefreshToken,
	refreshExpiresAt,
} = require('../utils/jwt')

// 設定安全 Cookie
const setRefreshCookie = (res, token) => {
	res.cookie('refreshToken', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/auth/refresh',
		expires: refreshExpiresAt(),
	})
}

// 清空 Cookie
const clearRefreshCookie = res => {
	res.cookie('refreshToken', '', {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/auth/refresh',
		expires: new Date(0),
	})
}

exports.register = async (req, res) => {
	const { email, password, name } = req.body
	const exists = await User.findOne({ where: { email } })
	if (exists) return res.status(409).json({ error: 'Email already in use' })

	const passwordHash = await hashPassword(password)
	const user = await User.create({ email, passwordHash, name })
	res.json({ id: user.id, email: user.email, name: user.name })
}

exports.login = async (req, res) => {
	const { email, password } = req.body
	const ua = req.get('user-agent') || ''
	const ip = req.ip

	const user = await User.findOne({ where: { email } })
	if (!user) return res.status(401).json({ error: 'Invalid credentials' })

	const ok = await comparePassword(password, user.passwordHash)
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

	const accessToken = signAccessToken({ sub: user.id, email: user.email })

	const familyId = newFamilyId()
	const refreshPlain = signRefreshTokenPlain({ sub: user.id, fid: familyId })
	const tokenHash = hashToken(refreshPlain)

	await RefreshToken.create({
		userId: user.id,
		tokenHash,
		familyId,
		userAgent: ua,
		ip,
		expiresAt: refreshExpiresAt(),
	})

	setRefreshCookie(res, refreshPlain)
	res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name } })
}

exports.refresh = async (req, res) => {
	const refreshPlain = req.cookies?.refreshToken
	if (!refreshPlain) return res.status(401).json({ error: 'No refresh token' })

	let payload
	try {
		payload = verifyRefreshToken(refreshPlain)
	} catch {
		return res.status(401).json({ error: 'Refresh token invalid/expired' })
	}

	const tokenHash = hashToken(refreshPlain)
	const record = await RefreshToken.findOne({ where: { tokenHash, userId: payload.sub } })

	if (!record || !record.isActive) {
		await RefreshToken.update(
			{ revokedAt: new Date() },
			{ where: { userId: payload.sub, familyId: payload.fid, revokedAt: null } },
		)
		clearRefreshCookie(res)
		return res.status(401).json({ error: 'Refresh token revoked/invalid' })
	}

	const accessToken = signAccessToken({ sub: payload.sub })
	const newRefreshPlain = signRefreshTokenPlain({ sub: payload.sub, fid: record.familyId })
	const newHash = hashToken(newRefreshPlain)

	await record.update({
		revokedAt: new Date(),
		replacedByToken: newHash,
	})

	await RefreshToken.create({
		userId: payload.sub,
		tokenHash: newHash,
		familyId: record.familyId,
		userAgent: req.get('user-agent') || '',
		ip: req.ip,
		expiresAt: refreshExpiresAt(),
	})

	setRefreshCookie(res, newRefreshPlain)
	res.json({ accessToken })
}

exports.logout = async (req, res) => {
	const refreshPlain = req.cookies?.refreshToken
	if (refreshPlain) {
		try {
			const payload = verifyRefreshToken(refreshPlain)
			await RefreshToken.update(
				{ revokedAt: new Date() },
				{ where: { userId: payload.sub, familyId: payload.fid, revokedAt: null } },
			)
		} catch {
			/* 無視錯誤 */
		}
	}
	clearRefreshCookie(res)
	res.json({ ok: true })
}

