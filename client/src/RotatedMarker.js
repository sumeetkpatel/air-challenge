//Credit:
//https://stackoverflow.com/a/53823590

import React, { Component } from "react";
import { withLeaflet } from "react-leaflet";
import { Marker } from "react-leaflet";
import { Marker as LeafletMarker } from 'leaflet-rotatedmarker';

const RotatedMarker = props => {
  const setupMarker = marker => {
    if (marker) {
      if (props.rotationAngle)
        marker.leafletElement.setRotationAngle(props.rotationAngle);
      marker.leafletElement.setRotationOrigin(props.rotationOrigin);
    }
  };

  return <Marker ref={el => setupMarker(el)} {...props} />;
};

RotatedMarker.defaultProps = {
  rotationOrigin: "center"
};

export default withLeaflet(RotatedMarker);