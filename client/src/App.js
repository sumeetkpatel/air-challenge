import util from 'util';
import React, { Component } from 'react';
import './App.css';
import { Container, Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';

import AirMap from './AirMap';
import Weather from './Weather';
import Poi from './Poi';

const API_URL = process.env.REACT_APP_API_URL;

class App extends Component {

	constructor() {
		super();

		this.state = {
			latitude: 51.45315114582281,
			longitude: -0.1263603088748422,

			// latitude: -33.8888144,
			// longitude: 151.1226362,
			zoom: 9,
			maxZoom: 18,
			aircraftRadiusKms: 100,
			weather: {},
			time: "",
			aircraft: []
		}
	}
	
	componentDidMount() {
		//Initial fetch, no user event
		this.queryRadar();
	}

	onMapMoved = (location) => {
		//Ignore badly formed positions
		if (typeof location.latitude === 'undefined' | typeof location.longitude === 'undefined')
			return;

		//Skip redundant updates
		if (this.state.latitude === location.latitude &&
			this.state.longitude === location.longitude &&
			this.state.zoom === location.zoom){
			return;
		}

		this.gotoLocation(location);
	}

	queryRadar() {
		const latlngString = util.format("%s,%s", this.state.latitude, this.state.longitude);

		//Fetch the aircraft nearby
		//We do this first since its the slowest
		fetch(util.format("%s/aircraft/%s/%s/", API_URL, latlngString, this.state.aircraftRadiusKms))
			.then(res => res.json())
			.then(aircraft => {
				const filtered = aircraft.map((a) => {
					a.position = [ a.latitude, a.longitude ];
					a.name = a.registration ? a.registration : a.callsign;
					a.origin = a.origin || "N/A";
					a.destination = a.destination || "N/A";
					return a;
				});

				this.setState({ aircraft: filtered })
			});

		//Fetch the time
		fetch(util.format('%s/time/current/%s/', API_URL, latlngString))
			.then(res => res.json())
			.then(time => this.setState({ time }));

		//Fetch the weather
		fetch(util.format('%s/weather/current/%s/', API_URL, latlngString))
			.then(res => res.json())
			.then(weather => this.setState({ weather }));
	}
	
	gotoShortcut = (e) => {
		var location = {
			latitude: parseFloat(e.target.getAttribute("data-lat")),
			longitude: parseFloat(e.target.getAttribute("data-lng")),
			zoom: this.state.zoom
		};

		this.gotoLocation(location);
	}

	locateMe = (e) => {
		var zoom = this.state.zoom;
		var gotoFunc  = this.gotoLocation;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position){
				var location = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					zoom: zoom
				};
				gotoFunc(location);

			});
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	gotoLocation = (location) => {
		this.setState({
			latitude: location.latitude,
			longitude: location.longitude,
			zoom: location.zoom
		}, () => {
			//Map moved, so refetch data
			this.queryRadar();	
		});
	}

	render() {
		

		return (
			<Container fluid="true" className="App">
				<Row>
					<Col>
						<h1>Nearby Aircraft ({this.state.aircraftRadiusKms} kms)</h1>
						<div className="shortcuts-container">
							<Poi jump={this.gotoShortcut} locateMe={this.locateMe}/>
						</div>
						<div className="map-container">
							<div className="panel-container">		
								<Weather latitude={this.state.latitude} longitude={this.state.longitude} time={this.state.time} weather={this.state.weather}/>
							</div>
							<AirMap 
								onMapMoved={this.onMapMoved} 
								
								maxZoom={this.state.maxZoom} 

								latitude={this.state.latitude} 
								longitude={this.state.longitude} 
								zoom={this.state.zoom}

								aircraft={this.state.aircraft}
								radiusKms={this.state.aircraftRadiusKms} 
							/>
						</div>

						<div className="aircraft-container">
							{this.state.aircraft.map((a, idx) => 
								<OverlayTrigger key={idx} placement="top" overlay={
									<Tooltip>
										<pre className="json">
											{JSON.stringify(a, null, 2)}
										</pre>
									</Tooltip>
								}>
									<Card className="aircraft">
										<Card.Body>
											<Card.Title>{a.name}</Card.Title>
											<Card.Subtitle className="mb-2 text-muted">{a.origin} to {a.destination}</Card.Subtitle>
											{!!a.flight ? (
												<Card.Subtitle className="mb-2 text-muted">Flight: <a target="_blank" rel="noopener noreferrer" href={"https://www.google.com/search?q=" + a.flight}>{a.flight}</a></Card.Subtitle>
											) : (
												<Card.Subtitle className="mb-2 text-muted">Flight: none</Card.Subtitle>
											)}
											<Card.Subtitle className="mb-2 text-muted">Travel: {a.totaltravelkms.toFixed(2)} kms</Card.Subtitle>

										</Card.Body>
									</Card>
								</OverlayTrigger>
							)}
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default App;