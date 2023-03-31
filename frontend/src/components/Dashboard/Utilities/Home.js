import React from "react";

class Home extends React.Component {

    componentDidMount() {
        this.populateWeather(this.props.weatherData);
    }

    displayTime(){
        var x = new Date();
        var zero;
        if(x.getMinutes() < 10) {zero = "0";}else{zero=""}
        var date = ' ' + x.getHours( )+ ":" + zero +  x.getMinutes();
        return date;
    }
  
    populateWeather(data){
        console.log(data);
        document.getElementById("wigetWeather").innerHTML = (data.main.temp).toFixed(0) + "°C";
        document.getElementById("wigetClouds").innerHTML = data.weather[0].description;
        document.getElementById("wigetWind").innerHTML += " " + this.convertToKM(data.wind.speed) + " km/h";
        document.getElementById("wigetLocation").innerHTML += " " + data.name;
        document.getElementById("widgetHumidity").innerHTML += " " + data.main.humidity + "%";
    }

    convertToKM(speed){
        return (speed * 3.6).toFixed(2);
    }

    render() {
        return (
            <div onClick={() => this.props.displayScreen("weather")} id="weatherWidget" className="Col2Card">
                <div className="weatherWigetTop">
                    <p id="wigetLocation"><i id="widgetPin"  className="fa-solid fa-location-pin"></i></p>
                    <p><i className="fa-regular fa-clock"></i>{this.displayTime()}</p>
                </div>
                <h1 id="wigetWeather"></h1>
                <p id="wigetClouds"></p>

                <div className="weatherWigetBottom">
                    <p id="wigetWind"><i className="fa-solid fa-wind"></i></p>
                    <p id="widgetHumidity"><i className="fa-solid fa-droplet"></i></p>


               
                </div>
            </div>
        )
    }
}

export default Home;