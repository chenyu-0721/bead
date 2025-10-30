var express = require('express')
var router = express.Router()

/* GET 珠子分配頁面 */
router.get('/', function (req, res, next) {
	res.render('beads', { title: '珠子分配系統' })
})

module.exports = router
