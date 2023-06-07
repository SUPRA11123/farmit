import React from "react";
import axios from "axios";
import { useState } from "react";
import Modal from "./Modal";
import { InfluxDB } from "@influxdata/influxdb-client";
import { point } from "leaflet";



const URL = process.env.REACT_APP_URL;


class Maps extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            sensor_latitude: null,
            sensor_longitude: null,
            markers: [],
        };
    }

    async componentDidMount() {

        const markers = [];


        // check if any field already exists
        var fields;
        const role = this.props.user.role;

        if (role === "field manager") {
            fields = await this.getFieldsByManager(this.props.user.id);
        } else {
            fields = await this.getFields(this.props.farmDetails.id);
        }


        const map = new window.google.maps.Map(document.getElementById("map"), {

            mapTypeId: "satellite",
            center: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
            zoom: 14,
            streetViewControl: false,
            mapTypeControl: false,
        });

        map.addListener("click", (event) => {
            this.showClickedCoordinates(event.latLng);
        });


        const marker = new window.google.maps.Marker({
            position: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
            map: map,
            label: {
                fontFamily: 'Fontawesome',
                text: '\uf015',
                color: 'white',
            },
            cursor: "drag",

        });

        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];
        var centreMap = document.getElementById("centreToMap");

        centreMap.addEventListener("click", () => {
            map.setCenter(marker.getPosition());
            map.setZoom(14);
        });

        if (fields.length > 0) {

            fields.forEach((field) => {

                if (field.type === "rectangle") {

                    const coordinates = field.coordinates.split(";");

                    const rectangleBounds = coordinates.map(parseFloat);


                    const rectangle = new window.google.maps.Rectangle({
                        strokeColor: "#0ba837",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#0ba837",
                        fillOpacity: 0.35,
                        map,
                        bounds: {
                            north: parseFloat(coordinates[0]),
                            south: parseFloat(coordinates[2]),
                            east: parseFloat(coordinates[1]),
                            west: parseFloat(coordinates[3]),
                        },
                        isComplete: false,
                    });

                    var row = table.insertRow(0);

                    var cell1 = row.insertCell(0);
                    cell1.innerHTML = "<span>" + field.name + "</span>";

                    var cell2 = row.insertCell(1);
                    cell2.innerHTML = "<span>" + field.area + " m<sup>2 </span>";

                    var cell3 = row.insertCell(2);
                    cell3.innerHTML = "<span>" + field.crop_type + "</span>";

                    var cell4 = row.insertCell(3);
                    cell4.innerHTML = '<div class="delete-container"><i class="fa-solid fa-ellipsis-vertical"></i><button class="delete-button">Delete</button></div>';

                    cell4.addEventListener('click', () => {
                        axios.delete(URL + "deletefield/" + field.id + "/")
                            .then((response) => {
                                console.log(response);
                                row.remove();
                                rectangle.setMap(null);
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    });

                    this.props.sensors.forEach((sensor) => {

                        // check if the sensor is inside the rectangle
                        if (this.isPointInsideRectangle(sensor, rectangleBounds)) {


                              // add a little point in the rectangle in the point position
                              const markerIcon = {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: 'white',
                                fillOpacity: 1,
                                strokeColor: 'green',
                                strokeWeight: 2,
                                scale: 15,
                              };
                              
                              const marker = new window.google.maps.Marker({
                                position: { lat: sensor.latitude, lng: sensor.longitude },
                                map: map,
                                icon: markerIcon,
                                label: {
                                  fontFamily: 'Fontawesome',
                                  text: '\uf1eb',
                                  color: 'white',
                                  color: 'green',
                                  clickable: true,
                                  background: 'white',
                                },
                              });
                
                              const infoWindow = new window.google.maps.InfoWindow({
                                content: "Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b>',
                              });
                              
                              
                              
                              marker.addListener('mouseover', () => {
                                infoWindow.open(map, marker);
                              });
                              
                              marker.addListener('mouseout', () => {
                                infoWindow.close();
                              });

                              marker.infoWindow = infoWindow;


                            markers.push(marker);

                            // on click, open the modal
                            marker.addListener("click", () => {
                                this.showData(sensor);
                                this.smallMap();
                            });



                        }
                    });



                    rectangle.addListener("mouseover", () => {
                        this.highlightRow(field.name);
                    });

                    rectangle.addListener("mouseout", () => {
                        this.unhighlightRow(field.name);
                    });

                    rectangle.addListener("click", (event) => {
                        this.showClickedCoordinates(event.latLng);
                    });

                    const lat = (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
                    const lng = (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;

                    /*const marker = new window.google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: map,
                        label: {
                            text: field.name,
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "10px",
                        },
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 0,
                        },

                    });*/


                    row.addEventListener("click", () => {
                        map.setCenter({ lat: lat, lng: lng });
                        map.setZoom(13);
                    });


                } else {

                    // separate the coordinates by ;
                    const coordinates = field.coordinates.split(";");

                    // split each coordinate by ,
                    const coordinatesArray = coordinates.map((coordinate) => {
                        return coordinate.split(",");
                    });

                    // add each coordinate to the path
                    const path = [];
                    coordinatesArray.forEach((coordinate) => {
                        path.push({ lat: parseFloat(coordinate[0]), lng: parseFloat(coordinate[1]) });
                    });

                    // create polygon
                    const polygon = new window.google.maps.Polygon({
                        paths: coordinates.map((coord) => {
                            const [lat, lng] = coord.split(",");
                            return { lat: parseFloat(lat), lng: parseFloat(lng) };
                        }),
                        strokeColor: "#0ba837",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#0ba837",
                        fillOpacity: 0.35,
                        map,
                        path: path,
                        isComplete: false,
                    });

                    var row = table.insertRow(0);

                    var cell1 = row.insertCell(0);
                    cell1.innerHTML = "<span>" + field.name + "</span>";

                    var cell2 = row.insertCell(1);
                    cell2.innerHTML = "<span>" + field.area + " m<sup>2 </span>";

                    var cell3 = row.insertCell(2);
                    cell3.innerHTML = "<span>" + field.crop_type + "</span>";

                    var cell4 = row.insertCell(3);
                    cell4.innerHTML = '<div class="delete-container"><i class="fa-solid fa-ellipsis-vertical"></i><button class="delete-button">Delete</button></div>';

                    cell4.addEventListener('click', () => {
                        axios.delete(URL + "deletefield/" + field.id + "/")
                            .then((response) => {
                                console.log(response);
                                row.remove();
                                polygon.setMap(null);
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    });


                    const polygonCoordinates = coordinates.map((coord) => {
                        const [lat, lng] = coord.split(",");
                        return { lat: parseFloat(lat), lng: parseFloat(lng) };
                    });


                    this.props.sensors.forEach((sensor) => {
                        // check if the sensor is inside the rectangle
                        if (this.isPointInsidePolygon(sensor, polygonCoordinates)) {

                            const markerIcon = {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: 'white',
                                fillOpacity: 1,
                                strokeColor: 'green',
                                strokeWeight: 2,
                                scale: 15,
                              };
                              
                              const marker = new window.google.maps.Marker({
                                position: { lat: sensor.latitude, lng: sensor.longitude },
                                map: map,
                                icon: markerIcon,
                                label: {
                                  fontFamily: 'Fontawesome',
                                  text: '\uf1eb',
                                  color: 'white',
                                  color: 'green',
                                  clickable: true,
                                  background: 'white',
                                },
                              });
                
                              const infoWindow = new window.google.maps.InfoWindow({
                                content: "Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b>',
                              });
                              
                              
                              
                              marker.addListener('mouseover', () => {
                                infoWindow.open(map, marker);
                              });
                              
                              marker.addListener('mouseout', () => {
                                infoWindow.close();
                              });

                             marker.infoWindow = infoWindow;

                            markers.push(marker);

                            // on click, open the modal
                            marker.addListener("click", () => {
                                this.showData(sensor);
                                this.smallMap();
                            });
                        }
                    });


                    polygon.addListener("mouseover", () => {
                        this.highlightRow(field.name);
                    });

                    polygon.addListener("mouseout", () => {
                        this.unhighlightRow(field.name);
                    });

                    polygon.addListener("click", (event) => {
                        this.showClickedCoordinates(event.latLng);
                    });


                    const bounds = new window.google.maps.LatLngBounds();
                    const polygonPath = polygon.getPath();

                    polygonPath.forEach((latLng) => {
                        bounds.extend(latLng);
                    });

                    const polygonCenter = bounds.getCenter();

                    row.addEventListener("click", () => {
                        map.setCenter(polygonCenter);
                        map.setZoom(13);
                    });
                }

            });
        }

        this.setState({ markers: markers }); // Update the state with the markers array

        this.initDrawing(map);
    }


    componentDidUpdate(prevProps) {
        if (prevProps.sensors !== this.props.sensors) {

            // get all the markers from state
            const markers = this.state.markers;

            // for each sensor in the sensors array, update the marker
            this.props.sensors.forEach((sensor) => {
                markers.forEach((marker) => {
                    if (marker.position.lat() === sensor.latitude && marker.position.lng() === sensor.longitude) {

                        const infoWindow = marker.infoWindow;

                        infoWindow.setContent("Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b>');

                        /* 
                        // update the text of the marker
                        marker.setLabel({
                            fontFamily: 'Fontawesome',
                            text: "\uf2c8 " + sensor.temperature + '°C ' + "\uf043 " + sensor.humidity + '%',
                            color: 'black',
                            fontSize: '1vh',
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            labelOrigin: new window.google.maps.Point(24, -12),
                        });
                        */

                    }
                });
            });



            this.setState({ markers: markers });
        }
    }


    showClickedCoordinates(latLng) {
        const { lat, lng } = latLng.toJSON();
        console.log(`Clicked coordinates: Latitude: ${lat}, Longitude: ${lng}`);
    }




    isPointInsideRectangle(point, rectangleBounds) {
        var [north, east, south, west] = rectangleBounds;

        return (
            point.longitude >= west &&
            point.longitude <= east &&
            point.latitude >= south &&
            point.latitude <= north
        );
    }

    isPointInsidePolygon(point, coordinates) {

        var inside = false;
        var [x, y] = [point.latitude, point.longitude];

        for (var i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
            var xi = coordinates[i].lat;
            var yi = coordinates[i].lng;
            var xj = coordinates[j].lat;
            var yj = coordinates[j].lng;

            var intersect =
                yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }


    getFieldsByManager(id) {
        return axios
            .get(URL + "getfieldsbymanager/" + id + "/")
            .then((res) => {
                return res.data;
            }
            )
            .catch((err) => {
                console.log(err);
            }
            );
    }

    getFields(id) {
        return axios
            .get(URL + "getfieldsbyid/" + id + "/")
            .then((res) => {
                return res.data;
            }
            )
            .catch((err) => {
                console.log(err);
            }
            );
    }

    initDrawing(map) {

        // allow drawing on map
        const drawingManager = new window.google.maps.drawing.DrawingManager({
            // add drawing options here
            drawingControlOptions: {
                drawingModes: [
                    window.google.maps.drawing.OverlayType.POLYGON,
                    window.google.maps.drawing.OverlayType.RECTANGLE,
                ],
                // add labels to drawing options
                position: window.google.maps.ControlPosition.TOP_CENTER,
            },
            polygonOptions: {
                editable: true,
                clickable: true,
                strokeColor: "#0ba837",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#0ba837",
                fillOpacity: 0.35,
            },

            rectangleOptions: {
                editable: true,
                clickable: true,
                strokeColor: "#0ba837",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#0ba837",
                fillOpacity: 0.35,
            }
        });

        drawingManager.setDrawingMode(null);

        drawingManager.setOptions({
            drawingControl: false,
        });

        const addFieldButton = document.getElementById("addNewField");
        addFieldButton.addEventListener("click", () => {
            if (drawingManager.drawingControl === false) {
                // If drawing mode is off, turn it on for polygons and rectangles
                drawingManager.setOptions({
                    drawingControl: true,
                });
                // delete the rectangle being drawn
                drawingManager.setDrawingMode(null);
            } else {
                // If drawing mode is on, turn it off
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({ drawingControl: false });
            }
        });


        window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {

            document.getElementById("cancelNewField").addEventListener("click", () => {

                popup.remove();

                if (!polygon.isComplete) {
                    polygon.setMap(null);
                }

                if (document.getElementById("fieldTable").classList.contains("hidden")) {
                    drawingManager.setOptions({
                        drawingControl: false,
                    });
                }

            });

            drawingManager.setOptions({
                drawingControl: false,
            });

            drawingManager.setDrawingMode(null);

            //hide a label
            document.getElementById("addFieldsHeader").classList.add("hidden");

            const popup = document.createElement('div');
            popup.classList.add('popup');

            const message = document.createElement('p');
            message.textContent = 'Do you want to add this polygon?';

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Add';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';


            acceptButton.addEventListener('click', () => {

                let cancelFormSubmitPromise = false;

                drawingManager.setOptions({
                    drawingControl: false,
                });

                drawingManager.setDrawingMode(null);

                polygon.setEditable(false);

                popup.remove();
                document.getElementById("createField").classList.remove("hidden");

                const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath()).toFixed(0);


                const formSubmitPromise = new Promise((resolve, reject) => {
                    document.getElementById("createField").addEventListener("submit", (event) => {
                        event.preventDefault();
                        if (!cancelFormSubmitPromise) {
                            resolve(); // resolve the promise when the form is submitted
                        } else {
                            reject();
                        }
                    });
                });

                document.getElementById("cancelNewField").addEventListener("click", () => {
                    cancelFormSubmitPromise = true;
                });



                formSubmitPromise.then(() => {


                    const paths = polygon.getPaths();
                    var vertices = [];

                    for (var i = 0; i < paths.getLength(); i++) {
                        var path = paths.getAt(i);

                        for (var j = 0; j < path.getLength(); j++) {
                            var vertex = path.getAt(j);
                            vertices.push({ lat: vertex.lat(), lng: vertex.lng() });
                        }
                    }


                    // convert the vertices to a string
                    const coordinates = vertices.map((vertex) => {
                        return vertex.lat + "," + vertex.lng;
                    }).join(";");


                    // get the form data
                    const fieldName = document.getElementById("fieldName").value;
                    const cropType = document.getElementById("cropType").value;

                    // call the backend to add the coordinates
                    axios.post(URL + 'createfield/', {
                        name: fieldName,
                        crop_type: cropType,
                        type: "polygon",
                        coordinates: coordinates,
                        area: area,
                        farm: this.props.farmDetails.id,
                    }).then((res) => {

                        console.log(res);


                        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];

                        var row = table.insertRow(0);

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);

                        cell1.innerHTML = "<span>" + fieldName + "</span>";
                        cell2.innerHTML = "<span>" + area + "</span> m<sup>2";
                        cell3.innerHTML = "<span>" + cropType + "</span>";
                        cell4.innerHTML = '<div class="delete-container"><i class="fa-solid fa-ellipsis-vertical"></i><button class="delete-button">Delete</button></div>';

                        cell4.addEventListener('click', () => {
                            axios.delete(URL + "deletefield/" + res.data.id + "/")
                                .then((response) => {
                                    console.log(response);
                                    row.remove();
                                    polygon.setMap(null);
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        });


                        polygon.isComplete = true;


                        const bounds = new window.google.maps.LatLngBounds();
                        const polygonPath = polygon.getPath();

                        polygonPath.forEach((latLng) => {
                            bounds.extend(latLng);
                        });

                        const polygonCenter = bounds.getCenter();

                        row.addEventListener("click", () => {
                            map.setCenter(polygonCenter);
                            map.setZoom(13);
                        });

                    }).catch((err) => {
                        console.log(err);
                        polygon.setMap(null);
                    });

                    polygon.addListener("mouseover", () => {
                        this.highlightRow(fieldName);
                    });

                    polygon.addListener("mouseout", () => {
                        this.unhighlightRow(fieldName);
                    });

                    document.getElementById("fieldName").value = "";
                    document.getElementById("cropType").value = "";
                });
            });



            cancelButton.addEventListener('click', () => {
                document.getElementById("addFieldsHeader").classList.remove("hidden");
                polygon.setMap(null);
                drawingManager.setOptions({
                    drawingControl: true,
                });
                popup.remove();
            });

            popup.appendChild(message);
            popup.appendChild(acceptButton);
            popup.appendChild(cancelButton);

            // show the popup on the div, but outside the map
            document.getElementById("add").appendChild(popup);


        });
        // add event listener to drawing manager rectangle
        window.google.maps.event.addListener(drawingManager, 'rectanglecomplete', (rectangle) => {

            document.getElementById("cancelNewField").addEventListener("click", () => {

                popup.remove();

                if (!rectangle.isComplete) {
                    rectangle.setMap(null);
                }

                if (document.getElementById("fieldTable").classList.contains("hidden")) {
                    drawingManager.setOptions({
                        drawingControl: false,
                    });
                }

            });

            drawingManager.setOptions({
                drawingControl: false,
            });

            drawingManager.setDrawingMode(null);

            //hide a label
            document.getElementById("addFieldsHeader").classList.add("hidden");


            const popup = document.createElement('div');
            popup.classList.add('popup');

            const message = document.createElement('p');
            message.textContent = 'Do you want to add this rectangle?';

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Add';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';


            acceptButton.addEventListener('click', () => {

                let cancelFormSubmitPromise = false;

                drawingManager.setOptions({
                    drawingControl: false,
                });

                drawingManager.setDrawingMode(null);

                rectangle.setEditable(false);

                popup.remove();
                document.getElementById("createField").classList.remove("hidden");


                // get the area of the rectangle
                const area = window.google.maps.geometry.spherical.computeArea(rectangle.getBounds()).toFixed(0);


                const formSubmitPromise = new Promise((resolve, reject) => {
                    document.getElementById("createField").addEventListener("submit", (event) => {
                        event.preventDefault();
                        if (!cancelFormSubmitPromise) {
                            resolve(); // resolve the promise when the form is submitted
                        } else {
                            reject();
                        }
                    });
                });

                document.getElementById("cancelNewField").addEventListener("click", () => {
                    cancelFormSubmitPromise = true;
                });

                formSubmitPromise.then(() => {

                    const bounds = rectangle.getBounds();
                    const coordinates = {
                        north: bounds.getNorthEast().lat(),
                        east: bounds.getNorthEast().lng(),
                        south: bounds.getSouthWest().lat(),
                        west: bounds.getSouthWest().lng(),
                    };

                    const lat = (parseFloat(coordinates.north) + parseFloat(coordinates.south)) / 2;
                    const lng = (parseFloat(coordinates.east) + parseFloat(coordinates.west)) / 2;

                    /*const marker = new window.google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: map,
                        label: {
                            text: document.getElementById("fieldName").value,
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "10px",
                        },
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 0,
                        },

                    });*/


                    // convert coordinates string with ; to array
                    const coordinatesString = coordinates.north + ";" + coordinates.east + ";" + coordinates.south + ";" + coordinates.west;

                    // get the form data
                    const fieldName = document.getElementById("fieldName").value;
                    const cropType = document.getElementById("cropType").value;


                    // call the backend to add the coordinates
                    axios.post(URL + 'createfield/', {
                        name: fieldName,
                        crop_type: cropType,
                        type: "rectangle",
                        coordinates: coordinatesString,
                        area: area,
                        farm: this.props.farmDetails.id,
                    }).then((res) => {
                        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];


                        var row = table.insertRow(0);

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        var cell4 = row.insertCell(3);


                        cell1.innerHTML = "<span>" + fieldName + "</span>";
                        cell2.innerHTML = "<span>" + area + "</span> m<sup>2";
                        cell3.innerHTML = "<span>" + cropType + "</span>";
                        cell4.innerHTML = '<div class="delete-container"><i class="fa-solid fa-ellipsis-vertical"></i><button class="delete-button">Delete</button></div>';

                        cell4.addEventListener('click', () => {
                            axios.delete(URL + "deletefield/" + res.data.id + "/")
                                .then((response) => {
                                    console.log(response);
                                    row.remove();
                                    rectangle.setMap(null);

                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        });

                        rectangle.isComplete = true;

                        row.addEventListener("click", () => {
                            map.setCenter({ lat: lat, lng: lng });
                            map.setZoom(13);
                        });

                    }).catch((err) => {
                        console.log(err);
                        rectangle.setMap(null);
                    });


                    rectangle.addListener("mouseover", () => {
                        this.highlightRow(fieldName);
                    });

                    rectangle.addListener("mouseout", () => {
                        this.unhighlightRow(fieldName);
                    });


                    document.getElementById("fieldName").value = "";
                    document.getElementById("cropType").value = "";
                });
            });

            cancelButton.addEventListener('click', () => {
                document.getElementById("addFieldsHeader").classList.remove("hidden");
                rectangle.setMap(null);
                drawingManager.setOptions({
                    drawingControl: true,
                });
                popup.remove();
            });

            popup.appendChild(message);
            popup.appendChild(acceptButton);
            popup.appendChild(cancelButton);

            // show the popup on the div, but outside the map
            document.getElementById("add").appendChild(popup);


        });

        drawingManager.setMap(map);
    }


    createField(event) {
        event.preventDefault();
        document.getElementById("createField").classList.add("hidden");
        document.getElementById("fieldTable").classList.remove("hidden");
        document.getElementById("cancelNewField").classList.add("hidden");
        document.getElementById("addFieldsHeader").classList.add("hidden");
    }




    /*cancel() {
        document.getElementById("createField").classList.add("hidden");
    }*/

    showFieldForm() {

        document.getElementById("fieldTable").classList.toggle("hidden");

        // check if table is hidden
        if (document.getElementById("fieldTable").classList.contains("hidden")) {
            document.getElementById('cancelNewField').classList.remove('hidden');
            document.getElementById("addFieldsHeader").classList.remove("hidden");

        } else {
            document.getElementById('cancelNewField').classList.add('hidden');
            document.getElementById("addFieldsHeader").classList.add("hidden");
            document.getElementById("createField").classList.add("hidden");
        }

    }

    showData(sensorData) {

        this.setState({ modalOpen: true, sensorData: sensorData });
    }

    smallMap(){
        document.getElementById("map").classList.add("smallMap");
    }

    largeMap(){
        document.getElementById("map").classList.remove("smallMap");
    }

    highlightRow(fieldName) {

        const table = document.getElementById("fieldTable");
        const rows = table.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const firstColumnValue = row.cells[0].textContent.trim();

            if (firstColumnValue === fieldName) {
                row.style.backgroundColor = "#0ba837";
                row.style.color = 'white';
            }
        }
    }

    unhighlightRow(fieldName) {
        const table = document.getElementById("fieldTable");
        const rows = table.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const firstColumnValue = row.cells[0].textContent.trim();

            if (firstColumnValue === fieldName) {
                row.style.backgroundColor = "";
                row.style.color = '';
            }
        }
    }

    render() {

        const { modalOpen } = this.state;

        return (
            <>

                <button onClick={this.centreToMap} id="centreToMap" className='fieldsTableBtn'><i className="fa-solid fa-location-crosshairs"></i></button>
                <div id="map">
                  
                </div>
                {modalOpen && (
                        <Modal setOpenModal={(isOpen) => this.setState({ modalOpen: isOpen })}
                            sensorData={this.state.sensorData} largeMap={this.largeMap}
                        />
                    )}
                <div className="fieldsTableConatiner">

                    <h2 className="hidden" id="addFieldsHeader">Use the rectangle/polygon tool to draw the field onto map</h2>
                    <button onClick={this.showFieldForm} id="cancelNewField" className={`fieldsTableBtn hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}><i className='fa-solid fa-xmark'></i> Cancel</button>

                    <form id="createField" className="hidden" onSubmit={this.createField}>
                        <label htmlFor="name">Field Name</label>
                        <input autocomplete="off" required type="text" name="name" id="fieldName" placeholder="enter name" />
                        <label htmlFor="name">Crop</label>
                        <input autocomplete="off" required type="text" name="crop_type" id="cropType" placeholder="select type" />
                        <input id="loginInBtn" type="submit" value="Create Field" />
                    </form>

                    <div id="add"></div>

                    <table id='fieldTable' className={`fieldsTable ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                        <thead>
                            <tr>
                                <th><h2>Field</h2></th>
                                <th><h2>Land Area</h2></th>
                                <th><h2>Crop</h2></th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr>
                                <td colSpan={4}>


                                    {this.props.user.role === 'farmer' || this.props.user.role === 'field manager' ? null :


                                        <button onClick={this.showFieldForm} id="addNewField" className={`fieldsTableBtn`}> <i className="fa-solid fa-plus"></i> Add Field</button>
                                    }
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </>
        )
    }
}

export default Maps;    