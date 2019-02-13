var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var dotenv = require('dotenv');
dotenv.config();

var indexRouter = require('./routes/index');
var provider = require('./db/provider.js');

provider.init();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Setup CORS
var corsWhitelist = process.env.CORS_ORIGINS.split(",");
var corsOptions = {
	origin: function (origin, callback) {
		//Not same origin and doesnt match list
		if (origin && corsWhitelist.indexOf(origin) === -1) {
			callback(new Error('Not allowed by CORS'));
			return;
		}

		callback(null, true);
	}
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug')

app.set('json spaces', 2);

app.use('/', indexRouter);

module.exports = app;
