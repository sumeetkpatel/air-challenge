import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import RotatedMarker from './RotatedMarker';
import { Card } from 'react-bootstrap';

class AirMap extends Component {

	render() {
		const crosshairIcon = L.icon({
			iconUrl: require('./crosshair.png'),
			iconSize: [64,64],
			iconAnchor: [32, 32],
			popupAnchor: [0, -32]
			// shadowUrl: null,
			// shadowSize: null,
			// shadowAnchor: null
		});

		const aircraftIcon = L.icon({
			iconUrl: require('./aircraft.png'),
			iconSize: [64,64],
			iconAnchor: [32, 32],
			popupAnchor: [0, -32]
			// shadowUrl: null,
			// shadowSize: null,
			// shadowAnchor: null
		});

		const position = [this.props.latitude, this.props.longitude];
		const radiusKms = this.props.radiusKms;
		const radousMetres = radiusKms * 1000;
		const maxZoom = this.props.maxZoom;
		const circleColor = "transparent";

		return (
			<Map
				center={position}
				zoom={this.props.zoom}
				maxZoom={maxZoom}
				onMoveEnd={this.handleMoveEnd}
				onClick={this.handleOnClick}
			>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<Marker position={position} icon={crosshairIcon}>
				</Marker>

				<Circle center={position} fillColor={circleColor} radius={radousMetres} />

				{this.props.aircraft.map((a, idx) => 
					<RotatedMarker key={a.id} position={a.position} icon={aircraftIcon} rotationAngle={a.bearing} rotationOrigin={'center'}>
						<Popup autoPan={true}>
							<Card className="aircraft" key={idx}>
								<Card.Body>
									<Card.Title>{a.name}</Card.Title>
									<Card.Subtitle className="mb-2 text-muted">{a.origin} to {a.destination}</Card.Subtitle>
									<Card.Subtitle className="mb-2 text-muted">Travel: {a.totaltravelkms.toFixed(2)} kms</Card.Subtitle>
									<pre className="json">
										{JSON.stringify(a, null, 2) }
									</pre>
								</Card.Body>
							</Card>
						</Popup>
					</RotatedMarker>
				)}
			</Map>
		);
	}

	handleMoveEnd = (e) => {
		/* Dropped in favour of clicks
		If you turn this on, either turn popup autopan to off, or throttle api requests
		
		//Map move cause a  map move

		var map = e.target;
		var location = map.getCenter().wrap();
		var zoom = map.getZoom();

		this.props.onMapMoved({
			latitude: location.lat,
			longitude: location.lng,
			zoom: zoom
		});
		*/
	}

	handleOnClick = (e) => {
		//Map clicks cause a map move

		var map = e.target;

		var location = e.latlng.wrap();
		var zoom = map.getZoom();

		this.props.onMapMoved({
			latitude: location.lat,
			longitude: location.lng,
			zoom: zoom
		});
	}
}

export default AirMap;