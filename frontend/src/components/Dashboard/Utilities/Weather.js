import React from "react";
import { Chart } from 'chart.js/auto';

class Weather extends React.Component {

    constructor(props) {
        super(props);
        this.setForecast = this.setForecast.bind(this);
        this.state = {
            day: 0
        }
    }

    async populateWeatherForecast(weatherForecast) {

        console.log(weatherForecast);
        let temperature = [];
        let Labels = [];
        let forecast = [];
        let forecastLabels = [];

       
        const today = new Date();
           
        for(let i=0; i < weatherForecast.list.length; i++){
            temperature.push(weatherForecast.list[i].main.temp);
            
            var day = new Date((weatherForecast.list[i].dt_txt).slice(0,4), ((weatherForecast.list[i].dt_txt).slice(5,7))-1, (weatherForecast.list[i].dt_txt).slice(8,10));
            Labels.push(this.getLabels(day) + " @" +(weatherForecast.list[i].dt_txt).slice(10,16));
        }

        const chunkSize = 10;
        for (let i = 0; i < temperature.length; i += chunkSize) {
            const tempChunk = temperature.slice(i, i + chunkSize);
            const labelChunk = Labels.slice(i, i + chunkSize);
            forecast.push(tempChunk);    
            forecastLabels.push(labelChunk);
        }

        //Labels.push(weekday[nextDay.getDay()]);
        

        const ctx = document.getElementById('myChart').getContext('2d');
        
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
            labels: forecastLabels[this.state.day],
            datasets: [{
                label: 'Temperature',
                gridLines: 'false',
                data: forecast[this.state.day],
                borderColor: '#0ba837',
                tension: 0.4,
                backgroundColor: '#BAECB8',
                pointStyle: 'rectRounded',
                fill: true,
                lineTension: 0.4,
            }]
        },
        options:{
            plugins: {
                legend: {
                  display: false
                }
              },
            scales:{
                y:{
                    grid:{
                        display:false
                    }
                },
                x:{
                    grid:{
                        display:false
                    }
                }
            }
        }
        });

    }

    componentDidMount() {
        this.populateWeatherForecast(this.props.weatherForecast);
        this.getDayBtns();
    }

    convertToKM(speed){
        return (speed * 3.6).toFixed(2);
    }

    getSunriseSunset() {
        var sunriseEpoch = this.props.weatherData.sys.sunrise;
        var sunrise = new Date(0); 
        sunrise.setUTCSeconds(sunriseEpoch);

        var sunsetEpoch = this.props.weatherData.sys.sunset;
        var sunset = new Date(0); 
        sunset.setUTCSeconds(sunsetEpoch);

        return <><p><i className="fa-solid fa-circle-up"></i> {sunrise.getHours()}:{sunrise.getMinutes()}  <i className="fa-solid fa-circle-down"></i> {sunset.getHours()}:{sunset.getMinutes()}</p></>;
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

    getDayBtns(){
    
        for(let i = 1; i < 4; i++ ) {
            var dayBtn = document.getElementById('dayBtn' + i);
            dayBtn.innerHTML = this.getDay(i);

        }
    }

    setForecast(x) {

        this.setState({
            day: x
        });
        console.log(x);
    }


    render() {

        let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date();

        return (
            <>
            <div className="weatherCityContainer">
                <h2>{(this.props.weatherData.main.temp).toFixed(0)}°C</h2>
                <ul>
                    <li>{weekday[today.getDay()]}</li>
                    <li>{this.displayTime()}</li>
                    <li>{this.props.weatherData.weather[0].description}</li>
                </ul>
            </div>

            <div className="weatheDataContainer">
                <div>
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
            <h2>5 Day Forecast</h2>
            <canvas id="myChart" height='25' width='100px'></canvas>
            </div>
            <ul className="daySelector">
               
                <li><button onClick={() => this.setForecast(0)} className="daySelectorActive" id="dayBtn0">Today</button></li>
                <li><button onClick={() => this.setForecast(1)} id="dayBtn1"></button></li>
                <li><button onClick={() => this.setForecast(2)} id="dayBtn2"></button></li>
                <li><button onClick={() => this.setForecast(3)} id="dayBtn3"></button></li>
              

            </ul>
    
            </>
        )
    }
}

export default Weather;
