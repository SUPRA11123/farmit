import React from "react";
import axios from "axios";
import L from "leaflet";


class Maps extends React.Component {

    state = {
        pngData: null,
    };


    componentDidMount() {
        var map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([51.5, -0.09]).addTo(map)
            .bindPopup('This is a test!')
            .openPopup();


        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { subdomains: ['a', 'b', 'c'] }).addTo(map);
        // or Google Basemap. (Warning! This basemap is not suitable, nor is licenced for a production use!)
        L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map);


        this.getMapData();
    }

    getMapData() {


        const url = `https://api-dynacrop.worldfromspace.cz/api/v2/processing_request?api_key=demo_api_key`;

        axios.
            post(url, {
                "rendering_type": "observation",
                "date_from": "2022-01-03",
                "date_to": "2023-04-02",
                "layer": "NDVI",
                "polygon_id": 63548
            })
            .then(response => {
                console.log(response);

                const pngData = response.data.result.png;

                console.log(pngData);

                this.setState({ pngData });

            }
            )
            .catch(error => {
                console.log(error);
            });

    }



    render() {
        const { pngData } = this.state;

        return (


            <><h1>Maps</h1>
                <div id="map"></div>

            </>

        )
    }
}

export default Maps;