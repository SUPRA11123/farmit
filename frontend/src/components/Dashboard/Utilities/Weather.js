import React from "react";
import { Chart } from 'chart.js/auto';

class Weather extends React.Component {

    constructor(props) {
        super(props);
    }

    async populateWeatherForecast(weatherForecast) {

        console.log(weatherForecast);
        let temperature = [];
        let Labels = [];

       
        const today = new Date();
           
        for(let i=0; i < weatherForecast.list.length; i++){

            temperature.push(weatherForecast.list[i].main.temp);
            Labels.push(weatherForecast.list[i].dt_txt);
              
        }


        //Labels.push(weekday[nextDay.getDay()]);
        

        const ctx = document.getElementById('myChart').getContext('2d');
        
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
            labels: Labels,
            datasets: [{
                label: 'Temperature',
                data: temperature,
                borderColor: '#0ba837',
                tension: 0.4,
                backgroundColor: '#BAECB8',
                fill: true,
                lineTension: 0.4,
            }]
        }
        });

    }

    componentDidMount() {
        this.populateWeatherForecast(this.props.weatherForecast);
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
            <canvas id="myChart" height='25' width='100px'></canvas>
            </div>
    
            </>
        )
    }
}

export default Weather;
