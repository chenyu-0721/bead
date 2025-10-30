const express = require('express')
const router = express.Router()
const testController = require('../controllers/test')
const auth = require('../middleware/auth')

router.get('/test', auth, testController.getFakeData)

module.exports = router
