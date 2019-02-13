var express = require('express');
var router = express.Router();
var util = require('util');
//var moment = require('moment');
var moment = require('moment-timezone');
var async = require('async');

var provider = require('../db/provider.js');
var weather = require('weather-js');
var radar = require('flightradar24-client/lib/radar');
var turf = require('@turf/turf');
var geoTz = require('geo-tz');

var title = "Air-Challenge";

console.log("Pre caching...");
geoTz.preCache();
console.log("Pre caching, Done.");

//Radians Helper
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

//Gets the current time for a given gps coordinate
// eg. /time/current/-33.8888144,151.1226362
router.get('/time/current/:latlngString', function(req, res, next) {
	var latLngStringArray = req.params.latlngString.split(',');
	var latitude = latLngStringArray[0];
	var longitude = latLngStringArray[1];

 	var timezones = geoTz(latitude, longitude);
 	var timezone = timezones[0];

 	var momentValue = moment().tz(timezones[0]);
	var dateTime = momentValue.format("llll");
	var utcOffset = momentValue.utcOffset() / 60;
	if (utcOffset >= 0) {
		utcOffset = "UTC " + "+" + utcOffset;
	}
	else {
		utcOffset = "UTC " + utcOffset;
	}

 	var payload = {
 		dateTimeString: dateTime,
 		timezone: timezone,
 		offset: utcOffset
 	};

	res.header('Content-Type', 'application/json');
	res.json(payload);
});

//Gets the current weather for a given gps coordinate
// eg. /weather/current/-33.8888144,151.1226362
router.get('/weather/current/:latlngString', function(req, res, next) {
	var latLngStringArray = req.params.latlngString.split(',');
	var latitude = latLngStringArray[0];
	var longitude = latLngStringArray[1];

	var latlngString = getLatitudeAndLongitudeString(latitude, longitude);
	var degreeType = 'C';

	//Request weather from weather.js
	weather.find({ search: latlngString, degreeType: degreeType }, function(error, result) {
		if (error) {
			console.log(error);
		}

		var payload = [];
		if (result && result.length > 0){
			payload = result[0].current;

			payload.time = moment.utc();
			payload.latitude = latitude;
			payload.longitude = longitude;

			provider.addWeather(payload);
		}

		res.header('Content-Type', 'application/json');
		res.json(payload);
	});
});

//Gets Aircraft details within a radius of a given gps coordinate
// eg. /aircraft/-33.8888144,151.1226362/5
router.get('/aircraft/:latlngString/:distanceKms?', function(req, res, next) {
	var latLngStringArray = req.params.latlngString.split(',');
	var latitude = latLngStringArray[0];
	var longitude = latLngStringArray[1];

	//Default 100kms
	var distanceKms = req.params.distanceKms || 100;

	var box = getNWSEBoundingBox(latitude, longitude, distanceKms);

	//Request aircraft from flightradar24
	radar(box.north, box.west, box.south, box.east)
	.then(function(flights){
		var payload = [];

		async.eachSeries(flights, function(flight, childCallback){		
			if (!flight){
				childCallback();
				return;
			}

			flight.time = moment.utc();
			flight.totaltravelkms = 0;

			//Calculate the distance travelled since last and add it.
			var aircraftId = flight.id;

			provider.getAircraftLastRecordById(aircraftId, function(error, historyResults){
				if (error){
					childCallback(error);
				}

				if (historyResults && historyResults.length > 0){
					var existingFlight = historyResults[0];

					//Determine the distance
					var options = {units: 'kilometers'};
					var from = turf.point([existingFlight.location.y, existingFlight.location.x]);
					var to = turf.point([flight.longitude, flight.latitude]);
					var travelDistanceKms = turf.distance(from, to, options);

					flight.totaltravelkms = existingFlight.totaltravelkms + travelDistanceKms;
				}

				//Double check the radius
				//For some reason the API returns planes a bit further out
				//This should also make things more circular rather than a box
				var radFrom = turf.point([longitude, latitude]);
				var radTo = turf.point([flight.longitude, flight.latitude]);
				var radDistanceKms = turf.distance(radFrom, radTo, options);

				if (radDistanceKms <= distanceKms){
					payload.push(flight);
				}

				//Add to database
				provider.addAircraft(flight);

				childCallback();
			});

			
		}, function(error){
			if (error){
				console.log(error);
			}

			res.header('Content-Type', 'application/json');
			res.json(payload);
		});
	})
	.catch(function(error){
		console.log(error);
	});
});

// Gets all weather records
router.get('/weather', function(req, res, next) {
	provider.getWeather(function(error, results){
		res.json(results);
	});
});

// Gets all aircraft records
router.get('/aircraft', function(req, res, next) {
	provider.getAircraft(function(error, results){
		res.json(results);
	});
});

// Gets the NWSE Bounding Box for given decimal lat and lng and radius in kms
function getNWSEBoundingBox(latitude, longitude, radiusKms){
	var distance = radiusKms;
	var options = {units: 'kilometers'};
	var point = turf.point([longitude, latitude]);

	var north = turf.destination(point, distance, 0, options).geometry.coordinates[1];
	var south = turf.destination(point, distance, 180, options).geometry.coordinates[1];

	var east = turf.destination(point, distance, 90, options).geometry.coordinates[0];
	var west = turf.destination(point, distance, -90, options).geometry.coordinates[0];

	var result = {
		north: parseFloat(north),
		south: parseFloat(south),
		east: parseFloat(east),
		west: parseFloat(west)
	};

	return result;
}

//Format decimal lat lng into a string
function getLatitudeAndLongitudeString(latitude, longitude){
	var latlngString = util.format("%s, %s", latitude, longitude);
	return latlngString;
}

module.exports = router;
