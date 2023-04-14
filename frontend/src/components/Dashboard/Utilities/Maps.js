import React from "react";
import axios from "axios";


class Maps extends React.Component {


    async componentDidMount() {

        // check if any field already exists

        const fields = await this.getFields(this.props.farmDetails.id);

        console.log(fields);

        const map = new window.google.maps.Map(document.getElementById("map"), {

            mapTypeId: "satellite",
            center: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
            zoom: 15,
        });


        const marker = new window.google.maps.Marker({
            position: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
            map: map,
            //change the color of the label
        });


        if (fields.length > 0) {
            fields.forEach((field) => {

                // add a marker for each field
              

                const coordinates = field.coordinates.split(";");
                console.log(coordinates);

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
                });

                rectangle.addListener("click", () => {
                   this.showData();
                });

                const lat = (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
                const lng = (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;

                const marker = new window.google.maps.Marker({
                    position: { lat: lat, lng: lng},
                    map: map,
                    label: field.name,
                });

                console.log(rectangle);

            })
        }

        this.initDrawing(map);

    }

    getFields(id) {
        return axios
            .get("http://localhost:8000/getfieldsbyid/" + id + "/")
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
                draggable: true,
                clickable: true,
            },

            rectangleOptions: {
                editable: true,
                draggable: true,
                clickable: true,
                strokeColor: "#0ba837",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#0ba837",
                fillOpacity: 0.35,
            }

        });
        

        window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
            // open a pop up to confirm or cancel the polygon

            console.log(polygon);
            polygon.addListener("click", () => {
                polygon.setMap(null);
                // allow drawing again
                drawingManager.setOptions({
                    drawingControl: true,
                });
            });
        });

        // add event listener to drawing manager rectangle
        window.google.maps.event.addListener(drawingManager, 'rectanglecomplete', (rectangle) => {

            // disable drawing mode
            drawingManager.setDrawingMode(null);
            drawingManager.setOptions({
                drawingControl: false,
            });


            const popup = document.createElement('div');
            popup.classList.add('popup');

            const message = document.createElement('p');
            message.textContent = 'Do you want to add this rectangle?';

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Add';

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';


            acceptButton.addEventListener('click', () => {
                
                drawingManager.setOptions({
                    drawingControl: false,
                });

                rectangle.setEditable(false);

                popup.remove();
                document.getElementById("createField").classList.remove("hidden");

                // await for the user to submit the form
                const formSubmitPromise = new Promise((resolve) => {
                    document.getElementById("createField").addEventListener("submit", (event) => {
                        event.preventDefault();
                        resolve(); // resolve the promise when the form is submitted
                    });
                });
            
                formSubmitPromise.then(() => {


                const bounds = rectangle.getBounds();
                const coordinates = {
                    north: bounds.getNorthEast().lat(),
                    east: bounds.getNorthEast().lng(),
                    south: bounds.getSouthWest().lat(),
                    west: bounds.getSouthWest().lng(),
                };
                console.log(coordinates);

                const lat = (parseFloat(coordinates[0]) + parseFloat(coordinates[2])) / 2;
                const lng = (parseFloat(coordinates[1]) + parseFloat(coordinates[3])) / 2;

                // convert coordinates string with ; to array
                const coordinatesString = coordinates.north + ";" + coordinates.east + ";" + coordinates.south + ";" + coordinates.west;

                console.log(coordinatesString);

                // get the form data
                const fieldName = document.getElementById("fieldName").value;
                const cropType = document.getElementById("cropType").value;

                console.log(fieldName);
                console.log(cropType);
                

                // call the backend to add the coordinates
                axios.post('http://localhost:8000/createfield/', {
                    name: fieldName,
                    crop_type: cropType,
                    type: "rectangle",
                    coordinates: coordinatesString,
                    farm: this.props.farmDetails.id,
                }).then((res) => {
                    console.log(res);
                }).catch((err) => {
                    console.log(err);
                    rectangle.setMap(null);
                });

                // add click listener to the rectangle
                rectangle.addListener("click", () => {
                    this.showData();
                });

                document.getElementById("fieldName").value = "";
                document.getElementById("cropType").value = "";


                // allow drawing again
                drawingManager.setOptions({
                    drawingControl: true,
                });
            });
            });

            cancelButton.addEventListener('click', () => {
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

        console.log("create field");
        
        document.getElementById("createField").classList.add("hidden");

            
        
    }

    /*cancel() {
        document.getElementById("createField").classList.add("hidden");
    }*/

    showData() {
        console.log("show data");
    }





    render() {


        return (
            <><><h1>Maps</h1>

            <div id ="add"></div>

                <form id="createField" className="hidden" onSubmit={this.createField}>
                    <input required type="text" name="name" id="fieldName" placeholder="Field Name" />
                    <input required type="text" name="crop_type" id="cropType" placeholder="Crop Type" />
                    <input id="loginInBtn" type="submit" value="Create Field" />
                    <input id="cancelBtn" type="button" value="Cancel" onClick={this.cancel}/>
                </form>

                <div id="map">


                </div></>



            </>



        )
    }
}

export default Maps;