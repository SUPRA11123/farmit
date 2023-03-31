import React from "react";

class Weather extends React.Component {

    componentDidMount() {
        this.populateWeatherForecast(this.props.weatherForecast);
    }

    async populateWeatherForecast(weatherForecast) {

        console.log(weatherForecast);
    
    }

    render() {
        return (
            <h1>Weather</h1>
        )
    }
}

export default Weather;