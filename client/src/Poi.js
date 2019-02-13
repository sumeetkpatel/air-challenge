import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class Poi extends Component {

	constructor() {
		super();

		this.locations = [
			["Sydney", "-33.86802445718921", "151.21019840240479"],
			["Brisbane", "-27.468076742610673", "153.02135467529297"],
			["Melbourne", "-37.81304818664074", "144.96356964111328"],
			["Auckland", "-36.851664458771495", "174.77325439453125"],
			["London", "51.45315114582281", "-0.1263603088748422"],
			["New York", "40.73187677071802", "-73.99017333984375"],
			["Tokyo", "35.68543097594523", "139.75261688232422"],
			["Fiji", "-18.051876101600108", "178.48663330078125"],
			["Mumbai", "18.950125580943176", "72.83403396606445"],
			["Hong Kong", "22.27764299279862", "114.1644287109375"],
			["Moscow", "55.750446033213514", "37.61710166931152"],
			["Rio De Janeiro", "-22.91001896504284", "-43.210086822509766"],
			["Singapore", "1.3896131708435702", "103.84689331054688"],
			["McMurdo", "-77.8500", "166.6667"],
			["Paris", "48.856431", "2.351203"],
			["Cairo", "30.0443858", "31.2356901"],
			["Dubai", "25.2046199", "55.2699682"],
			["San Francisco", "37.775491", "-122.420311"],
			["Mexico City", "19.436018", "-99.136505"],
			["Seoul", "37.551043", "126.981697"],
		];
	}

	render() {
		return (
			<div>
				<Button variant="info" onClick={this.props.locateMe}>Current Location</Button>

				{this.locations.map((location, idx) => 
					<Button key={idx} variant="outline-info" onClick={this.props.jump} data-lat={location[1]} data-lng={location[2]}>{location[0]}</Button>	
				)}
				
			</div>
		)
	}

}

export default Poi;