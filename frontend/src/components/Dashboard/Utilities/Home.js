import React from "react";

class Home extends React.Component {

    componentDidMount() {
        this.populateWeather(this.props.weatherData);
    }


    populateWeather(data){
        console.log(data);
        document.getElementById("wigetWeather").innerHTML = (data.main.temp).toFixed(0) + "°C";
        document.getElementById("wigetClouds").innerHTML = data.weather[0].description;
        document.getElementById("wigetWind").innerHTML += " " + this.convertToKM(data.wind.speed) + " km/h";
        document.getElementById("wigetLocation").innerHTML += " " + data.name;
    }

    convertToKM(speed){
        return (speed * 3.6).toFixed(2);
    }

    render() {
        return (
            <div className="Col2Card">
                <div className="weatherWigetTop">
                    <p id="wigetLocation"><i className="fa-solid fa-location-pin"></i></p>
                </div>

                <h1 id="wigetWeather"></h1>
                <p id="wigetClouds"></p>

                <div className="weatherWigetBottom">
                    <p id="wigetWind"><i className="fa-solid fa-wind"></i></p>
                </div>
            </div>
        )
    }
}

export default Home;