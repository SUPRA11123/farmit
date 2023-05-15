import React from "react";
import { Chart } from 'chart.js/auto';

class Weather extends React.Component {

    constructor(props) {
        super(props);
        this.setForecast = this.setForecast.bind(this);
        this.state = {
            day: 0,
            forecastData: [],
            forecastLabels: []
          };
        this.myChart = null;
    }

    async populateWeatherForecast(weatherForecast) {
        let dailyForecasts = [];
        const today = new Date();
      
        for (let i = 0; i < weatherForecast.list.length; i++) {
          const day = new Date(
            weatherForecast.list[i].dt_txt.slice(0, 4),
            weatherForecast.list[i].dt_txt.slice(5, 7) - 1,
            weatherForecast.list[i].dt_txt.slice(8, 10)
          );
      
          const dayIndex = Math.floor((day - today) / (24 * 60 * 60 * 1000));
      
          if (!dailyForecasts[dayIndex]) {
            dailyForecasts[dayIndex] = {
              temperature: [],
              labels: []
            };
          }
      
          dailyForecasts[dayIndex].temperature.push(weatherForecast.list[i].main.temp);
          dailyForecasts[dayIndex].labels.push(this.getLabels(day) + ' @' + weatherForecast.list[i].dt_txt.slice(10, 16));
        }
      
        const forecastData = dailyForecasts.map(day => day.temperature);
        const forecastLabelsData = dailyForecasts.map(day => day.labels);
      
        this.setState({
          forecastData: forecastData,
          forecastLabels: forecastLabelsData
        }, () => {
          this.updateChart();
        });
      }
      
      
      updateChart() {

        const forecastData = this.state.forecastData;
        const forecastLabels = this.state.forecastLabels;
      
        const ctx = document.getElementById('myChart').getContext('2d');
      
        if (this.myChart) {
          this.myChart.destroy(); // Destroy the existing chart instance before creating a new one
        }
      
        this.myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: forecastLabels[this.state.day], // Use labels based on the selected day
            datasets: [{
              label: 'Temperature',
              gridLines: 'false',
              data: forecastData[this.state.day], // Use data based on the selected day
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
      

    

    render() {

        let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date();

        return (
            <>
            <div className="weatherCityContainer">          
                <h2>{(this.props.weatherData.main.temp).toFixed(0)}°C</h2>
                <ul>
                    <li>{weekday[today.getDay()]} @ {this.displayTime()}</li>
                    <li>Climate: {this.props.weatherData.weather[0].description}</li>
                </ul>
            </div>

            <div className="weatheDataContainer">
                <div style={{marginLeft: 0}}>
                    <h2>Pressure</h2>
                    <p>{this.props.weatherData.main.pressure} hpa</p>
                </div>
            
                <div>
                    <h2>Humidity</h2>
                    <p>{this.props.weatherData.main.humidity}%</p>
                </div>
     
                <div>
                    <h2>Wind</h2>
                    <p>{this.convertToKM(this.props.weatherData.wind.speed)} km/h</p>
                </div>

                <div id="sunsetSunrise">
                    <h2>Sunrise and Sunset</h2>
                    {this.getSunriseSunset()}
                </div>
 
            </div>

    
            
            <div className="lineChartContainer">
                <ul className="daySelector">
                    <h2>
                        Display:
                        <select name="statSelector" id="statSelector">
                        <option value="temperature">temperature</option>
                        <option value="humidity">humidity</option>
                        </select>
                    </h2>
                    <li><button onClick={() => this.setForecast(0)} className="daySelectorActive" id="dayBtn0">Tomorrow: <span>{Math.max.apply(Math, this.state.forecastData[0]).toFixed(0)}°C</span></button></li>
                    <li><button onClick={() => this.setForecast(1)} id="dayBtn1">{this.getDay(2)}: <span>{Math.max.apply(Math, this.state.forecastData[1]).toFixed(0)}°C</span></button></li>
                    <li><button onClick={() => this.setForecast(2)} id="dayBtn2">{this.getDay(3)}: <span>{Math.max.apply(Math, this.state.forecastData[2]).toFixed(0)}°C</span></button></li>
                    <li><button onClick={() => this.setForecast(3)} id="dayBtn3">{this.getDay(4)}: <span>{Math.max.apply(Math, this.state.forecastData[3]).toFixed(0)}°C</span></button></li>
                </ul>
                <canvas id="myChart" height='25' width='100px'></canvas>
            </div>
           
    
            </>
        )
    }
}

export default Weather;
