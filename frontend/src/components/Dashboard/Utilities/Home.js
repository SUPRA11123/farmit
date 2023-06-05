import React from "react";
import { Chart } from 'chart.js/auto';
import axios from "axios";

class Home extends React.Component {

    constructor(props){
        super(props)
        this.myChart = null;

        this.state = {
          day: 0,
          forecastData: [],
          forecastLabels: [],
          statSelector: 'temperature',
          sensor_latitude: null,
          sensor_longitude: null,
        };
    }

    componentDidMount() {

        this.populateWeather(this.props.weatherData);

        const map = new window.google.maps.Map(document.getElementById("homeMap"), {
          mapTypeId: "satellite",
          center: { lat: this.props.farmDetails.latitude, lng: this.props.farmDetails.longitude },
          zoom: 14,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggable: false,
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
        console.log(this.state.forecastData);
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
                    <p id="wigetLocation"><i id="widgetPin"  className="fa-solid fa-location-pin"></i></p>
                    <p><i className="fa-regular fa-clock"></i>{this.displayTime()}</p>
                </div>
                <img id="widgetWeatherIcon" src="" alt="Weather icon"/>
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