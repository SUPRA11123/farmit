import React from "react";
import { Chart } from 'chart.js/auto';
import axios from "axios";

const URL = process.env.REACT_APP_URL;


class Home extends React.Component {

  constructor(props) {
    super(props)
    this.myChart = null;

    this.state = {
      day: 0,
      forecastData: [],
      forecastLabels: [],
      statSelector: 'temperature',
      sensor_latitude: null,
      sensor_longitude: null,
      markers: [],
    };

  }

  async componentDidMount() {

    const markers = [];

    this.populateWeather(this.props.weatherData);

    const map = new window.google.maps.Map(document.getElementById("homeMap"), {
      mapTypeId: "satellite",
      center: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
      zoom: 12.5,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      draggable: false,
      clickable: true,
      draggableCursor: 'pointer',
    });

    map.addListener('click', (event) => {
      this.props.displayScreen("maps");
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

    marker.addListener('click', (event) => {
      this.props.displayScreen("maps");
    });




    // get the fields for the farm

    var fields;
    const role = this.props.user.role;



    if (role === "field manager") {
      fields = await this.getFieldsByManager(this.props.user.id);
    } else {
      fields = await this.getFields(this.props.farmDetails.id);
    }

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

          rectangle.addListener('click', (event) => {
            this.props.displayScreen("maps");
          });

          this.props.sensors.forEach((sensor) => {

            // check if the sensor is inside the rectangle
            if (this.isPointInsideRectangle(sensor, rectangleBounds)) {

              const markerIcon = {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: 'white',
                fillOpacity: 1,
                strokeColor: 'green',
                strokeWeight: 2,
                scale: 15,
              };

              // create a marker for the sensor with a label
              const marker = new window.google.maps.Marker({

                position: { lat: sensor.latitude, lng: sensor.longitude },
                map: map,
                label: {
                  // add text saying the temperature and humidity of the sensors with a break in between
                  text: sensor.temperature + "°C\n" + sensor.humidity + "%",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                },
              });

              marker.addListener('click', (event) => {
                this.props.displayScreen("maps");
              });

              markers.push(marker); 
            }

           
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

          polygon.addListener('click', (event) => {
            this.props.displayScreen("maps");
          });

          const polygonCoordinates = coordinates.map((coord) => {
            const [lat, lng] = coord.split(",");
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
          });


          this.props.sensors.forEach((sensor) => {
            // check if the sensor is inside the rectangle
            if (this.isPointInsidePolygon(sensor, polygonCoordinates)) {

              // add a little point in the rectangle in the point position

              const markerIcon = {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: 'white',
                fillOpacity: 1,
                strokeColor: 'green',
                strokeWeight: 2,
                scale: 15,
              };

              // create a marker for the sensor with a label
              const marker = new window.google.maps.Marker({

                position: { lat: sensor.latitude, lng: sensor.longitude },
                map: map,
                label: {
                  // add text saying the temperature and humidity of the sensors with a break in between
                  text: sensor.temperature + "°C\n" + sensor.humidity + "%",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                },
              });

              marker.addListener('click', (event) => {
                this.props.displayScreen("maps");
              });

              markers.push(marker); 
            }
          });

        }

      });

    }
    this.setState({ markers: markers }); // Update the state with the markers array


  }
  

  componentDidUpdate(prevProps) {
    if (prevProps.sensors !== this.props.sensors) {

      // get all the markers from state
      const markers = this.state.markers;

      // for each sensor in the sensors array, update the marker
      this.props.sensors.forEach((sensor) => {
        markers.forEach((marker) => {
          if (marker.position.lat() === sensor.latitude && marker.position.lng() === sensor.longitude) {
            
            // update the text of the marker
            marker.setLabel({
              text: sensor.temperature + "°C\n" + sensor.humidity + "%",
              color: "white",
              fontSize: "10px",
              fontWeight: "bold",
            });

          }
        });
      });



      this.setState({ markers: markers });
    }
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



  displayTime() {
    var x = new Date();
    var zero;
    if (x.getMinutes() < 10) { zero = "0"; } else { zero = "" }
    var date = ' ' + x.getHours() + ":" + zero + x.getMinutes();
    return date;
  }

  populateWeather(data) {
    var iconcode = data.weather[0].icon;
    var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
    document.getElementById("widgetWeatherIcon").src = iconurl;

    document.getElementById("wigetWeather").innerHTML = (data.main.temp).toFixed(0) + "°C";
    document.getElementById("wigetClouds").innerHTML = data.weather[0].description;
    document.getElementById("wigetWind").innerHTML += " " + this.convertToKM(data.wind.speed) + " km/h";
    document.getElementById("wigetLocation").innerHTML += " " + data.name;
    document.getElementById("widgetHumidity").innerHTML += " " + data.main.humidity + "%";

    const dailyForecasts = [];
    const today = new Date();
    const weatherForecast = this.props.weatherForecast;
    const allTemperatures = [];

    for (let i = 0; i < 5; i++) {
      const forecastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);

      const forecastData = weatherForecast.list.filter(item => {
        const itemDate = new Date(item.dt_txt);
        return itemDate.getDate() === forecastDate.getDate() &&
          itemDate.getMonth() === forecastDate.getMonth() &&
          itemDate.getFullYear() === forecastDate.getFullYear();
      });

      const temperatures = forecastData.map(item => item.main.temp);
      allTemperatures.push(...temperatures);

      dailyForecasts.push({
        temperature: temperatures,
        humidity: forecastData.map(item => item.main.humidity),
        labels: forecastData.map(item => this.getLabels(new Date(item.dt_txt)) + '@' + item.dt_txt.slice(11, 16))
      });
    }

    const forecastLabelsData = dailyForecasts.map(day => day.labels);

    this.setState({
      forecastData: allTemperatures,
      forecastLabels: forecastLabelsData
    }, () => {
      this.updateChart();
    });
  }

  getLabels(day) {
    let weekday = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    return weekday[day.getDay()];
  }

  updateChart() {
    const forecastData = this.state.forecastData;
    const forecastLabels = this.state.forecastLabels;
    const ctx = document.getElementById('homeChart').getContext('2d');

    if (this.myChart) {
      this.myChart.destroy();
    }

    const darkMode = localStorage.getItem("darkMode") === "true";
    const labelColor = darkMode ? '#ffffff' : '#8D8D8D';

    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: forecastLabels.flat(),
        datasets: [{
          label: 'Temperature',
          data: forecastData,
          borderColor: '#0ba837',
          tension: 0,
          backgroundColor: '#BAECB8',
          pointStyle: 'rectRounded',
          fill: true,
          lineTension: 0.4,
        }],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            grid: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 40,
            ticks: {
              callback: function (value) {
                return value + '°C';
              },
              color: labelColor,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              color: labelColor,
            },
          },
        },
      },
    });
  }

  convertToKM(speed) {
    return (speed * 3.6).toFixed(2);
  }

  getWelcomeMessage() {
    var today = new Date();
    var curHr = today.getHours();

    if (curHr < 12) {
      return "Good morning,";
    } else if (curHr < 18) {
      return "Good afternoon,";
    } else {
      return "Good evening,";
    }
  }

  getCurrentDayAndDate() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const date = currentDate.getDate();
    const month = months[currentDate.getMonth()];

    function getOrdinalSuffix(date) {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const suffixIndex = date % 10 < 4 ? date % 10 : 0;
      return suffixes[suffixIndex];
    }

    const ordinalSuffix = getOrdinalSuffix(date);

    return dayOfWeek + ', ' + date + ordinalSuffix + ' ' + month;
  }



  render() {
    return (
      <>
        <div className="homeBackground">
          <h1>Agrosensor</h1>
          <p className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>{this.props.farmDetails.name} - {this.getCurrentDayAndDate()}</p>
        </div>

        <div onClick={() => this.props.displayScreen("weather")} id="weatherWidget" className={`Col2Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <div className="weatherWigetTop">
            <p id="wigetLocation"><i id="widgetPin" className="fa-solid fa-location-pin"></i></p>
            <p><i className="fa-regular fa-clock"></i>{this.displayTime()}</p>
          </div>
          <img id="widgetWeatherIcon" src="" alt="Weather icon" />
          <h1 id="wigetWeather">error</h1>
          <p id="wigetClouds"></p>

          <div className="weatherWigetBottom">
            <p id="wigetWind"><i className="fa-solid fa-wind"></i></p>
            <p id="widgetHumidity"><i className="fa-solid fa-droplet"></i></p>
          </div>


        </div>

        <div id='alertWidget' onClick={() => this.props.displayScreen("weather")} className={`col4Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <p>5 Day Weather Forecast</p>
          <canvas id="homeChart" height='25%' width='100px'></canvas>
        </div>

        <div className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`} id="homeMap">

        </div>

      </>


    )
  }
}

export default Home;