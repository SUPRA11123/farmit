import React from "react";
import { Chart } from 'chart.js/auto';

class Weather extends React.Component {

    constructor(props) {
        super(props);
        this.setForecast = this.setForecast.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            day: 0,
            forecastData: [],
            forecastLabels: [],
            statSelector: 'temperature'
          };
        this.myChart = null;
    }

    async populateWeatherForecast(weatherForecast) {
      const dailyForecasts = [];
      const today = new Date();
    
      for (let i = 0; i < 5; i++) {
        const forecastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    
        const forecastData = weatherForecast.list.filter(item => {
          const itemDate = new Date(item.dt_txt);
          return itemDate.getDate() === forecastDate.getDate() &&
                 itemDate.getMonth() === forecastDate.getMonth() &&
                 itemDate.getFullYear() === forecastDate.getFullYear();
        });
    
        dailyForecasts.push({
          temperature: forecastData.map(item => item.main.temp),
          humidity: forecastData.map(item => item.main.humidity),
          labels: forecastData.map(item => this.getLabels(new Date(item.dt_txt)) + ' @ ' + item.dt_txt.slice(11, 16))
        });
      }
    
      const forecastData = dailyForecasts.map(day => day[this.state.statSelector]);
      const forecastLabelsData = dailyForecasts.map(day => day.labels);
    
      this.setState({
        forecastData: forecastData,
        forecastLabels: forecastLabelsData
      }, () => {
        this.updateChart();
      });

      if (forecastData[0].length <= 1) {
        this.setState({day: 1});
        const firstLi = document.querySelector("#daySelector li:first-child");
        firstLi.classList.add('hidden');
        document.getElementById("dayBtn1").classList.add('daySelectorActive');
      }

    }
    
      
      
      updateChart() {

        const forecastData = this.state.forecastData;
        const forecastLabels = this.state.forecastLabels;      
        const ctx = document.getElementById('myChart').getContext('2d');
      
        if (this.myChart) {
          this.myChart.destroy();
        }

        const darkMode = localStorage.getItem("darkMode") === "true";
        const labelColor = darkMode ? '#ffffff' : '#8D8D8D';
      
        this.myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: forecastLabels[this.state.day],
            datasets: [{
              label: this.state.statSelector,
              gridLines: 'false',
              data: forecastData[this.state.day],
              tension: 0.4,
              // if data is temperature, use red, else use green
              backgroundColor: this.state.statSelector === 'temperature' ? '#BAECB8' : '#9ac3ff',
              borderColor:this.state.statSelector === 'temperature' ? '#0ba837' : '#0068ff',
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
                  color: labelColor, 
                  callback: function (value) {
                    if (this.state.statSelector === "humidity") {
                      return value + '%';
                    } else {
                      return value + '°C';
                    }
                  }.bind(this),
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
      
      

    componentDidMount() {
        this.populateWeatherForecast(this.props.weatherForecast);
    }

    convertToKM(speed){
        return (speed*3.6).toFixed(2);
    }

    getSunriseSunset() {
        
        var sunriseZero; var sunsetZero;
        var sunriseEpoch = this.props.weatherData.sys.sunrise;
        var sunrise = new Date(0); 
        sunrise.setUTCSeconds(sunriseEpoch);
        if(sunrise.getMinutes() < 10) {sunriseZero = "0";}else{sunriseZero=""}

        var sunsetEpoch = this.props.weatherData.sys.sunset;
        var sunset = new Date(0); 
        sunset.setUTCSeconds(sunsetEpoch);
        if(sunset.getMinutes() < 10) {sunsetZero = "0";}else{sunsetZero=""}

        return <><p><i className="fa-solid fa-circle-up"></i> {sunrise.getHours()}:{sunriseZero}{sunrise.getMinutes()}  <i className="fa-solid fa-circle-down"></i> {sunset.getHours()}:{sunsetZero}{sunset.getMinutes()}</p></>;
    }

    displayTime(){
        var x = new Date();
        var zero;
        if(x.getMinutes() < 10) {zero = "0";}else{zero=""}
        var date = ' ' + x.getHours( )+ ":" + zero +  x.getMinutes();
        return date;
    }

    getDay(x) {

        let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date();
        var result = today.setDate(today.getDate() + x);
        let date = new Date(result);
        return weekday[date.getDay()];

    }

    getLabels(day) {

        let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return weekday[day.getDay()];
    }

      setForecast(x) {

        const currentActiveBtn = document.querySelector('.daySelectorActive');
        if (currentActiveBtn) {
          currentActiveBtn.classList.remove('daySelectorActive');
        }
      
        const activeDayBtn = document.getElementById('dayBtn' + x);
        activeDayBtn.classList.add('daySelectorActive');
      
        this.setState(
          {
            day: x,
          },
          () => {
            this.updateChart();
          }
        );
      }
      
      handleChange(event) {
        const selectedValue = event.target.value;
        this.setState(
          {
            statSelector: selectedValue
          },
          () => {
            this.populateWeatherForecast(this.props.weatherForecast);
          }
        );
      }

    render() {

        let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date();

        return (
            <>
            <div id="weatherCityContainer" className={`weatherCityContainer ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>          
                <h2>{(this.props.weatherData.main.temp).toFixed(0)}°C</h2>
                <ul>
                    <li>{weekday[today.getDay()]} @ {this.displayTime()}</li>
                    <li>Climate: {this.props.weatherData.weather[0].description}</li>
                </ul>
            </div>

            <div className="weatheDataContainer">
                <div style={{marginLeft: 0}} className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                    <h2>Pressure</h2>
                    <p>{this.props.weatherData.main.pressure} hpa</p>
                </div>
            
                <div className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                    <h2>Humidity</h2>
                    <p>{this.props.weatherData.main.humidity}%</p>
                </div>
     
                <div className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                    <h2>Wind</h2>
                    <p>{this.convertToKM(this.props.weatherData.wind.speed)} km/h</p>
                </div>

                <div id="sunsetSunrise" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                    <h2>Sunrise and Sunset</h2>
                    {this.getSunriseSunset()}
                </div>
 
            </div>

    
            
            <div className={`lineChartContainer ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
        
              <select name="statSelector" id="statSelector" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onChange={this.handleChange}>
                <option value="temperature">Temperature <i className="fa-solid fa-sun"></i></option>
                <option value="humidity">Humidity</option>
              </select>   

              <canvas id="myChart" height='20%' width='100px'></canvas>

              <ul id="daySelector" className={`daySelector ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                  <li><button onClick={() => this.setForecast(0)} className="daySelectorActive" id="dayBtn0">Today</button></li>
                  <li><button onClick={() => this.setForecast(1)} id="dayBtn1">{this.getDay(1)}</button></li>
                  <li><button onClick={() => this.setForecast(2)} id="dayBtn2">{this.getDay(2)}</button></li>
                  <li><button onClick={() => this.setForecast(3)} id="dayBtn3">{this.getDay(3)}</button></li>
                  <li><button onClick={() => this.setForecast(4)} id="dayBtn4">{this.getDay(4)}</button></li>
              </ul>

            </div>
           
    
            </>
        )
    }
}

export default Weather;
