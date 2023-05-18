import React from "react";
import axios from "axios";
import { useState } from "react";
import Modal from "./Modal";


const URL = process.env.REACT_APP_URL;


class Maps extends React.Component {



    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
        };
    }

    async componentDidMount() {

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
            zoom: 15,
            streetViewControl: false,
            mapTypeControl: false,
        });


        const marker = new window.google.maps.Marker({
            position: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
            map: map,
            label: {
                fontFamily: 'Fontawesome',
                text: '\uf015',
                color: 'white',

            },

        });

        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];
        var centreMap = document.getElementById("centreToMap");

        centreMap.addEventListener("click", () => {
            map.setCenter(marker.getPosition());
            map.setZoom(15);
        });

        if (fields.length > 0) {

            fields.forEach((field) => {

                var row = table.insertRow(0);

                var cell1 = row.insertCell(0);
                cell1.innerHTML = "<span>" + field.name + "</span>";

                var cell2 = row.insertCell(1);
                cell2.innerHTML = "<span>Conditions</span>";

                var cell3 = row.insertCell(2);
                cell3.innerHTML = "<span>" + field.crop_type + "</span>";


                if (field.type === "rectangle") {

    
                    const coordinates = field.coordinates.split(";");

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


                    rectangle.addListener("mouseover", () => {
                      console.log("mouseover");
                      this.highlightRow(field.name);
                    });       
                    
                    rectangle.addListener("mouseout", () => {
                        console.log("mouseout");
                        this.unhighlightRow(field.name);
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

                    console.log("lat: " + lat + " lng: " + lng);
                 
                    row.addEventListener("click", () => {
                        map.setCenter({ lat: lat, lng: lng });
                        map.setZoom(15);
                    });
                    rectangle.addListener("click", () => {
                        this.showData();
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

                    polygon.addListener("mouseover", () => {
                        console.log("mouseover");
                        this.highlightRow(field.name);
                      });       
                      
                      polygon.addListener("mouseout", () => {
                          console.log("mouseout");
                          this.unhighlightRow(field.name);
                      });
                      const bounds = new window.google.maps.LatLngBounds();
                      const polygonPath = polygon.getPath();
                    
                      polygonPath.forEach((latLng) => {
                        bounds.extend(latLng);
                      });
                    
                      const polygonCenter = bounds.getCenter();
                    
                      row.addEventListener("click", () => {
                        map.setCenter(polygonCenter);
                        map.setZoom(15);
                      });

                      
                    polygon.addListener("click", () => {
                        this.showData();
                    });

                }

            });
        }
        this.initDrawing(map);
    }

    getFieldsByManager(id) {
        return axios
            .get(URL + "getfieldsbymanager/" + id + "/")
            .then((res) => {
                console.log(res);
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
                console.log(res);
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

            document.getElementById("addNewField").addEventListener("click", () => {

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

                document.getElementById("addNewField").addEventListener("click", () => {
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
                        farm: this.props.farmDetails.id,
                    }).then((res) => {
                        console.log(res);
                        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];

                        var row = table.insertRow(0);

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);

                        console.log(polygon);

                        cell1.innerHTML = "<span>" + fieldName + "</span>";
                        cell2.innerHTML = "<span>conditions</span>";
                        cell3.innerHTML = "<span>" + cropType + "</span>";

                        polygon.isComplete = true;

                    }).catch((err) => {
                        console.log(err);
                        polygon.setMap(null);
                    });


                    // add click listener to the rectangle
                    polygon.addListener("click", () => {
                        this.showData();
                    });

                    document.getElementById("fieldName").value = "";
                    document.getElementById("cropType").value = "";
                });
            });

            polygon.addListener("click", () => {
                this.showData();
            });

            cancelButton.addEventListener('click', () => {
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

            document.getElementById("addNewField").addEventListener("click", () => {

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

                document.getElementById("addNewField").addEventListener("click", () => {
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

                    const marker = new window.google.maps.Marker({
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

                    });


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
                        farm: this.props.farmDetails.id,
                    }).then((res) => {
                        console.log(res);
                        var table = document.getElementById("fieldTable").getElementsByTagName('tbody')[0];


                        var row = table.insertRow(0);

                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);


                        cell1.innerHTML = "<span>" + fieldName + "</span>";
                        cell2.innerHTML = "<span>conditions</span>";
                        cell3.innerHTML = "<span>" + cropType + "</span>";

                        rectangle.isComplete = true;

                    }).catch((err) => {
                        console.log(err);
                        rectangle.setMap(null);
                    });


                    rectangle.addListener("click", () => {
                        this.showData();
                    });

                    document.getElementById("fieldName").value = "";
                    document.getElementById("cropType").value = "";
                });
            });

            rectangle.addListener("click", () => {
                this.showData();
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
        document.getElementById("addNewField").innerHTML = "<i class='fa-solid fa-plus'></i> Add Field";
        document.getElementById("addFieldsHeader").classList.add("hidden");
    }

   


    /*cancel() {
        document.getElementById("createField").classList.add("hidden");
    }*/

    showFieldForm() {

        var createFieldBTN = document.getElementById("addNewField");

        document.getElementById("fieldTable").classList.toggle("hidden");

        // check if table is hidden
        if (document.getElementById("fieldTable").classList.contains("hidden")) {
            createFieldBTN.innerHTML = "<i class='fa-solid fa-xmark'></i> Cancel";
            document.getElementById("addFieldsHeader").classList.remove("hidden");

        } else {
            createFieldBTN.innerHTML = "<i class='fa-solid fa-plus'></i> Add Field";
            document.getElementById("addFieldsHeader").classList.add("hidden");
            document.getElementById("createField").classList.add("hidden");
        }

    }

    showData() {
        console.log("show data");
        this.setState({ modalOpen: true });
    }

    highlightRow(fieldName) {
        const table = document.getElementById("fieldTable"); // Replace "your-table-id" with the actual ID of your table
        const rows = table.getElementsByTagName("tr");
      
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const firstColumnValue = row.cells[0].textContent.trim();
      
          if (firstColumnValue === fieldName) {
            console.log(row);
            row.style.backgroundColor = "#D0FFBC"; //
            // change the color of the background of the row
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
                console.log(row);
                row.style.backgroundColor = ""; 
            }
        }
    }






    render() {

        const { modalOpen } = this.state;

        return (
            <>
             
                <div id="map">
                {modalOpen && (
                        <Modal setOpenModal={(isOpen) => this.setState({ modalOpen: isOpen })} />
                    )}
                </div>
                <div className="fieldsTableConatiner">

                    <h2 className="hidden" id="addFieldsHeader">Use the rectangle/polygon tool to draw the field onto map</h2>
                   
                    <form id="createField" className="hidden" onSubmit={this.createField}>
                        <label htmlFor="name">Field Name</label>
                        <input required type="text" name="name" id="fieldName" placeholder="enter name" />
                        <label htmlFor="name">Crop</label>
                        <input required type="text" name="crop_type" id="cropType" placeholder="select type" />
                        <input id="loginInBtn" type="submit" value="Create Field" />
                    </form>

                    <div id="add"></div>

                    <table id='fieldTable' className="fieldsTable">
                        <thead>
                            <tr>
                                <th><h2>Fields</h2></th>
                                <th><h2>Condition</h2></th>
                                <th><h2>Crop</h2></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                            <tr>
                                <td><p></p></td>
                                <td><p></p></td>
                                <td><p></p></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <button onClick={this.centreToMap} id="centreToMap" className="fieldsTableBtn"><i className="fa-solid fa-location-crosshairs"></i></button>
                    {this.props.user.role === 'farmer' || this.props.user.role === 'field manager' ? null :
                        <button onClick={this.showFieldForm} id="addNewField" className="fieldsTableBtn"> <i className="fa-solid fa-plus"></i> Add Field</button>
                    }

                </div>

            </>
        )
    }
}

export default Maps;