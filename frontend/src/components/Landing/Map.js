import React from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

function MyComponent(props){

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyCopODfgpyWWKlvCY8hyTSiY9AAoNTxnBE"
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {

    setMap(map);
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={props.center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        key={props.center.lat + props.center.lng}
        onClick={props.onClick}
      >
        <Marker 
        position={props.markerPosition} 
        onLoad={onLoad}
        />
        <></>
      </GoogleMap>
  ) : <></>
}

export default React.memo(MyComponent)