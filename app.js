var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var cors = require('cors')

require('dotenv').config()

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var authRouter = require('./routes/auth')
var testRouter = require('./routes/test')
var crawlerRouter = require('./routes/crawler')
var beadsRouter = require('./routes/beads')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Cors 設定
var corsOptions = {
	origin: ['http://localhost:5173'],
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
	allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'Range'],
	credentials: true,
	exposedHeaders: ['set-cookie', 'Content-Range', 'Accept-Ranges'],
}

app.use(cors(corsOptions))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/data', testRouter)
app.use('/crawler', crawlerRouter)
app.use('/beads', beadsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
