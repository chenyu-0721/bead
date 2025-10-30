const bcrypt = require('bcrypt')
const crypto = require('crypto')

exports.hashPassword = plain => bcrypt.hash(plain, 12)
exports.comparePassword = (plain, hash) => bcrypt.compare(plain, hash)

// 對 refresh token 做雜湊（DB 不存明碼）
exports.hashToken = token => crypto.createHash('sha256').update(token).digest('hex')

// 產生 familyId
exports.newFamilyId = () => crypto.randomUUID()
