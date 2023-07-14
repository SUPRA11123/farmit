import React from "react";
import { Chart } from 'chart.js/auto';
import axios from "axios";

const URL = process.env.REACT_APP_URL;


class Home extends React.Component {

  constructor(props) {
    super(props)
    this.myChart = null;

    var language = localStorage.getItem("language") || "en";

    var languageText = {
    en: {

        text1: "Dashboard for",
        text2: "5 Day Weather Forecast",
        text3: "Current Tasks",
        text4: "Not Started",
        text5: "In Progress",
        text6: "Completed",
        text7: "",
        text8: "",
        text9: "",
        text10: "",

    
    },
    pt: {

        text1: "Painel para",
        text2: "Previsão do tempo para os próximos 5 dias",
        text3: "Tarefas atuais",
        text4: "Por fazer",
        text5: "Em progesso",
        text6: "Concluídas",
        text7: "",
        text8: "",
        text9: "",
        text10: "",
        
    },
    };

    this.state = {
      day: 0,
      forecastData: [],
      forecastLabels: [],
      statSelector: 'temperature',
      sensor_latitude: null,
      sensor_longitude: null,
      markers: [],
      tasks: [],
      textContent: languageText[language],
    };
  }

  //On load, retrieve each sensor and field from DB, then add them to the Google map

  async componentDidMount() {

    this.getTasksByAsignee(this.props.user.id);
    this.getTasks();
    this.populateWeather(this.props.weatherData);
    var maxLat = Math.atan(Math.sinh(Math.PI)) * 180 / Math.PI;
    const markers = [];



    const map = new window.google.maps.Map(document.getElementById("homeMap"), {
      mapTypeId: "satellite",
      center: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
      zoom: 17,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      draggable: true,
      clickable: true,
      draggableCursor: 'pointer',
      restriction: {
        latLngBounds: { north: maxLat, south: -maxLat, west: -180, east: 180 },
        strictBounds: true
      },
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
                content: "Sensor ID: <b>" + sensor.sensorId + "</b><br>Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b>',
              });



              marker.addListener('mouseover', () => {
                infoWindow.open(map, marker);
              });

              marker.addListener('mouseout', () => {
                infoWindow.close();
              });

              //text: sensor.temperature + "°C\n" + sensor.humidity + "%",

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

              var language = localStorage.getItem("language") || "en";
              var content;

              if(language == "en") {
                content = "Sensor ID: <b>" + sensor.sensorId + "</b><br>Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b><br><br> Click to view graph';
              } else if (language == "pt") {
                  content = "ID do Sensor: <b>" + sensor.sensorId + "</b><br>Temperatura: <b>" + sensor.temperature + '°C</b><br>Humidade: <b>' + sensor.humidity + '%</b><br><br> Clique para ver o gráfico';
              } else {
                  content = "Sensor ID: <b>" + sensor.sensorId + "</b><br>Temperature: <b>" + sensor.temperature + '°C</b><br>Humidity: <b>' + sensor.humidity + '%</b><br><br> Click to view graph';
              }

              const infoWindow = new window.google.maps.InfoWindow({
                content: content,
              });



              marker.addListener('mouseover', () => {
                infoWindow.open(map, marker);
              });

              marker.addListener('mouseout', () => {
                infoWindow.close();
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

  //Get a specific managers fields from DB via their ID

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

  //Get a team members specific task from DB via their ID

  getTasksByAsignee(id) {
    return axios
      .get(URL + "gettasksbyassignee/" + id + "/")
      .then((res) => {
        return res.data;
      }
      )
      .catch((err) => {
        console.log(err);
      }
      );
  }

  //Get the current fields from DB via farm ID

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

  //Determine if coordinate is within a drawn rectangle field

  isPointInsideRectangle(point, rectangleBounds) {
    var [north, east, south, west] = rectangleBounds;

    return (
      point.longitude >= west &&
      point.longitude <= east &&
      point.latitude >= south &&
      point.latitude <= north
    );
  }

  //Determine if coordinate is within a drawn polygon field

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

  //Display the current time

  displayTime() {
    var x = new Date();
    var zero;
    if (x.getMinutes() < 10) { zero = "0"; } else { zero = "" }
    var date = ' ' + x.getHours() + ":" + zero + x.getMinutes();
    return date;
  }

  //Retrieve the current tasks from DB via the farm ID

  getTasks() {

    if(this.props.user.role == "owner" || this.props.user.role == "field manager") {
      axios.get(URL + "gettasksbyfarm/" + this.props.farmDetails.id + "/")
      .then(response => {
          const tasks = response.data;
          this.setState({ tasks: tasks });
          const todoCount = tasks.filter(task => task.status === "To do").length;
          const inProgressCount = tasks.filter(task => task.status === "In progress").length;
          const completedCount = tasks.filter(task => task.status === "Completed").length;
          this.setState({ todoCount, inProgressCount, completedCount });
      })
      .catch(error => {
          console.log(error);
      });
    } else {

      axios.get(URL + "gettasksbyassignee/" + this.props.user.id + "/")
      .then(response => {
          document.getElementById("taskWidgetHeader").innerHTML = "My Current Tasks"
          const tasks = response.data;
          this.setState({ tasks: tasks });
          const todoCount = tasks.filter(task => task.status === "To do").length;
          const inProgressCount = tasks.filter(task => task.status === "In progress").length;
          const completedCount = tasks.filter(task => task.status === "Completed").length;
          this.setState({ todoCount, inProgressCount, completedCount });
      })
      .catch(error => {
          console.log(error);
      });

    }

   

}

  //Store API call into array and retrieve appropriate icon 

  populateWeather(data) {
    var iconcode = data.weather[0].icon;
    var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
    document.getElementById("widgetWeatherIcon").src = iconurl;

    document.getElementById("wigetWeather").innerHTML = (data.main.temp).toFixed(0) + "<span>°</span>";
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

  //Create short weekday labels for graph

  getLabels(day) {

    var language = localStorage.getItem("language") || "en";
    var weekday;

    if(language == "en") {
      weekday = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    } else if (language == "pt") {
      weekday = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    } else {
      weekday = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    }

    return weekday[day.getDay()];
  }

  //Create a line chart to visualize forecasted temperature data

  updateChart() {
    const forecastData = this.state.forecastData;
    const forecastLabels = this.state.forecastLabels;
    const ctx = document.getElementById('homeChart').getContext('2d');

    const evenIndices = forecastData.map((_, index) => index).filter(index => index % 2 === 0);
    const reducedForecastData = evenIndices.map(index => forecastData[index]);
    const reducedForecastLabels = evenIndices.map(index => forecastLabels.flat()[index]);

    if (this.myChart) {
      this.myChart.destroy();
    }

    const darkMode = localStorage.getItem("darkMode") === "true";
    const labelColor = darkMode ? '#ffffff' : '#8D8D8D';

    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: reducedForecastLabels.flat(),
        datasets: [{
          label: 'Temperature',
          data: reducedForecastData,
          borderColor: '#0ba837',
          tension: 0,
          backgroundColor: ctx => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
            gradient.addColorStop(0, '#0ba837'); // Start color
            gradient.addColorStop(1, '#BAECB8'); // End color with 0 opacity
            return gradient;
          },
          pointStyle: 'circle',
          pointRadius: 4,
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
              color: 'rgba(0, 0, 0, 0.1)',
            },
            suggestedMin: 0,
            suggestedMax: 40,
            ticks: {
              stepSize: 10,
              callback: function (value) {
                return value + '°C';
              },
              color: labelColor,
            },
          },
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              color: labelColor,
              maxTicksLimit: 10,
            },
          },
        },
      },
    });
  }

  //convert wind speed to KM/s

  convertToKM(speed) {
    return (speed * 3.6).toFixed(2);
  }

  //Serve a welcome message based on the current time

  getWelcomeMessage() {
    var today = new Date();
    var curHr = today.getHours();

    var language = localStorage.getItem("language") || "en";

    if (curHr < 12) {

      if(language == "en") {
        return "Good morning ";
      } else if (language == "pt") {
        return "Bom dia ";
      } else {
        return "Good morning ";
      }
   
    } else if (curHr < 18) {

      if(language == "en") {
        return "Good afternoon ";
      } else if (language == "pt") {
        return "Boa tarde ";
      } else {
        return "Good afternoon ";
      }

    } else {
      if(language == "en") {
        return "Good evening ";
      } else if (language == "pt") {
        return "Boa noite ";
      } else {
        return "Good evening ";
      }
    }
  }

  //Compute the current date, adding the suffix 

  getCurrentDayAndDate() {

    var language = localStorage.getItem("language") || "en";
    var daysOfWeek;
    var months;

    if(language == "en") {
      daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    } else if (language == "pt") {
      daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      months = ['de janeiro', 'de fevereiro', 'de março', 'de abril', 'de maio', 'de junho', 'de julho', 'de agosto', 'de setembro', 'de outubro', 'de novembro', 'de dezembro'];
    } else {
      daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    }

    const currentDate = new Date();
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const date = currentDate.getDate();
    const month = months[currentDate.getMonth()];

    function getOrdinalSuffix(date) {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const suffixIndex = date % 10 < 4 ? date % 10 : 0;
      

      var language = localStorage.getItem("language") || "en";

      if(language == "en") {
        return suffixes[suffixIndex];
      } else if (language == "pt") {
        return "";
      } else {
        return suffixes[suffixIndex];
      }

    }

    const ordinalSuffix = getOrdinalSuffix(date);

    return dayOfWeek + ', ' + date + ordinalSuffix + ' ' + month;
  }



  render() {
    return (
      <>
        <div className="homeBackground">
          <p className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>{this.getWelcomeMessage()}{this.props.user.name}!</p>
          <p className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}><span>{this.state.textContent.text1} {this.getCurrentDayAndDate()}</span></p>
        </div>


        {/* 
        <div className={`locationWidget ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <h2>{this.props.farmDetails.name}</h2>
          <p><i className="fa-solid fa-clock"></i>{this.displayTime()}</p>
        </div>
        */}

        <div onClick={() => this.props.displayScreen("weather")} id="weatherWidget" className={`Col2Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <div className="weatherWigetTop">
          <p id="wigetLocation"><i id="widgetPin" className="fa-solid fa-location-dot"></i></p>
            <img id="widgetWeatherIcon" src="" alt="Weather icon" />
          </div>
        
          <h1 id="wigetWeather">error</h1>
          <p id="wigetClouds"></p>

          <div className="weatherWigetBottom">
            <p id="wigetWind"><i className="fa-solid fa-wind"></i></p>
            <p id="widgetHumidity"><i className="fa-solid fa-droplet"></i></p>
          </div>

        </div>

        <div id='alertWidget' onClick={() => this.props.displayScreen("weather")} className={`animate__slideInUp col4Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <h2>{this.state.textContent.text2}</h2>
          <canvas id="homeChart" height='25%' width='100px'></canvas>
        </div>

        <div className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`} id="homeMap">

        </div>

        <div id='taskWidget' onClick={() => this.props.displayScreen("tasks")} className={`Col2Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          <h2 id="taskWidgetHeader">{this.state.textContent.text3}</h2>
          <div className="taskCount">
            <p style={{ color: '#4079c4', fontWeight: 'bold' }}>{this.state.textContent.text4}: <span>{this.state.todoCount}</span></p>
          </div>
          <div className="taskCount">
            <p style={{ color: '#C44940', fontWeight: 'bold' }}>{this.state.textContent.text5}: <span>{this.state.inProgressCount}</span></p>
          </div>
          <div className="taskCount">
            <p style={{ color: '#0ba837', fontWeight: 'bold' }}>{this.state.textContent.text6}: <span>{this.state.completedCount}</span></p>
          </div>
        </div>

      </>


    )
  }
}

export default Home;