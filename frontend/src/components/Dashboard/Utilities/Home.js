import React from "react";
import { Chart } from 'chart.js/auto';

class Home extends React.Component {

    constructor(props){
        super(props)
        this.myChart = null;
    }

    componentDidMount() {
        console.log(this.props.weatherData);
        this.populateWeather(this.props.weatherData);
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

        this.updateChart();
    }

    updateChart() {

        console.log(this.props.weatherForecast);    
        const ctx = document.getElementById('myChart').getContext('2d');
      
        if (this.myChart) {
          this.myChart.destroy();
        }
      
        this.myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: null,
            datasets: [{
              label: 'Temperature',
              gridLines: 'false',
              data: this.props.weatherForecast,
              borderColor: '#0ba837',
              tension: 0.4,
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
              },
              x: {
                grid: {
                  display: false,
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

        //<img id='homeBackground' src="https://img.freepik.com/free-photo/harvested-grain-field-captured-sunny-day-with-some-clouds_181624-44956.jpg?w=1800&t=st=1684370902~exp=1684371502~hmac=cb72f01976942c7d753cb16fb4eb547d09496bfa64056cf06a7893905dc92a1f" draggable="false" alt="Agrosensor logo" />
    }

    

    render() {
        return (
            <>
            <div className="homeBackground">

            </div>
             <section id='fixedUtility' className='fixedUtility'>

                <h2>you have no new alerts</h2>

            </section>
        
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

            <div id='alertWidget' className={`col4Card ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                <canvas id="myChart" height='30%' width='100px'></canvas>
            </div>

            </>


        )
    }
}

export default Home;