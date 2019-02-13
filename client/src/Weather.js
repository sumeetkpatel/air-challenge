import util from 'util';
import React, { Component } from 'react';
import { Media } from 'react-bootstrap';

class Weather extends Component {

	render() {
		var weather = this.props.weather;

		var hasWeather = false;
		var weatherString = "No weather data";

		if (weather.temperature){
			hasWeather = true;
			var temperatureString = util.format("%s°C", weather.temperature);
			var skyString = weather.skytext;
			var feelsLikeString = util.format("Feels like: %s°C", weather.feelslike);
			var windString = util.format("Wind: %s", weather.winddisplay);
			var humidityString = util.format("Humidity: %s%%", weather.humidity);
			var weatherUrl = weather.imageUrl.replace(/^http:\/\//i, 'https://');
		}

		return (
			<div>
				<div className="time-container">
					<h4>Time and Date</h4>
					<div>{this.props.time.dateTimeString}</div>
					<div>{this.props.time.timezone} / {this.props.time.offset} </div>
				</div>
				<hr />
				<div className="weather-container">
					<h4>Weather</h4>
					{hasWeather	? 
						(
							<div>
								<Media>
									<img src={weatherUrl} alt="weather" />
									<Media.Body>
										<h2>{temperatureString}</h2>
										<h3>{skyString}</h3>
										<span>{feelsLikeString}</span>
										<br/>
										<span>{humidityString}</span>
										<br/>
										<span>{windString}</span>
									</Media.Body>
								</Media>
							</div>
						):(
							<div>
								<h3>{weatherString}</h3>
							</div>
						)
					}
				</div>
				<hr />
				<div className="location-container">
					<h4>Location</h4>
					<div className="location">
						<span>{this.props.latitude.toFixed(6)}, {this.props.longitude.toFixed(6)}</span>
					</div>
				</div>
			</div>
		)
	}
}

export default Weather;