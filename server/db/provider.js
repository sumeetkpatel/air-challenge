var util = require('util');
var pgp = require('pg-promise')(/*options*/)
var async = require('async');

var db;

const connectionOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
};

module.exports.init = function(){
	db = pgp(connectionOptions);

	var tasks = [
		// function(callback) { module.exports.dropWeather(callback) },
		// function(callback) { module.exports.dropAircraft(callback) },

		function(callback) { module.exports.createWeather(callback) },
		function(callback) { module.exports.createAircraft(callback) }
	];

	async.series(tasks, function(error, results){
		if (error){
			console.log(error);
			throw "Couldn't create database";
		}
	});
};

module.exports.addWeather = function(weather, callback){
	var data = [ weather.time, weather.latitude, weather.longitude, weather.temperature, weather ];
	dbNone('INSERT INTO weather VALUES($1, point($2, $3), $4, $5)', data, callback);
}

module.exports.addAircraft = function(aircraft, callback){
	var data = [ aircraft.time, aircraft.latitude, aircraft.longitude, aircraft.id, aircraft.totaltravelkms, aircraft ];
	dbNone('INSERT INTO aircraft VALUES($1, point($2, $3), $4, $5, $6)', data, callback);
}

module.exports.getWeather = function(callback){
	var sql = 'SELECT * FROM weather';
	dbAny(sql, undefined, callback);
};

module.exports.getAircraft = function(callback){
	var sql = 'SELECT * FROM aircraft';
	dbAny(sql, undefined, callback);
};

module.exports.getAircraftLastRecordById = function(aircraftId, callback){
	var data = [ aircraftId ];
	var sql = 'SELECT * FROM aircraft WHERE aircraftid = $1 ORDER BY time DESC LIMIT 1';
	dbAny(sql, data, callback);
};

module.exports.createWeather = function(callback){
	var sql = 'CREATE TABLE IF NOT EXISTS weather (time timestamptz NOT NULL, location point NOT NULL, temperature int, data jsonb)';
	dbAny(sql, undefined, callback);
};

module.exports.createAircraft = function(callback){
	var sql = 'CREATE TABLE IF NOT EXISTS aircraft (time timestamptz NOT NULL, location point NOT NULL, aircraftid varchar(8), totaltravelkms real, data jsonb)';
	dbAny(sql, undefined, callback);
};

module.exports.dropWeather = function(callback){
	var sql = 'DROP TABLE IF EXISTS weather';
	dbAny(sql, undefined, callback);
};

module.exports.dropAircraft = function(callback){
	var sql = 'DROP TABLE IF EXISTS aircraft';
	dbAny(sql, undefined, callback);
};

function dbAny(sql, data, callback){
	db.any(sql, data)
	.then((results) => {
		if (callback)
			callback(undefined, results);
	})
	.catch((error) => {
		console.error('Database error:', error);
		console.log(sql);
		if (callback)
			callback(error);
	});
};

function dbNone(sql, data, callback){
	db.none(sql, data)
	.then((results) => {
		if (callback)
			callback(undefined, results);
	})
	.catch((error) => {
		console.error('Database error:', error);
		console.log(sql, data);
		if (callback)
			callback(error);
	});
};