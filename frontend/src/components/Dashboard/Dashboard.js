import React from 'react';
import Home from './Utilities/Home';
import Weather from './Utilities/Weather';
import Monitor from './Utilities/Monitor';
import Resources from './Utilities/Resources';
import Maps from './Utilities/Maps';
import Predictions from './Utilities/Predictions';
import Settings from './Utilities/Settings';
import axios from 'axios';

class Dashboard extends React.Component {

    WEATHER_API_KEY = "aa63df15430f30c399f6228866963714";
    UNIT = "metric";

    utilityComponents = {

        dashboard: Home,
        weather: Weather,
        monitor: Monitor,
        resources: Resources,
        maps: Maps,
        predictions: Predictions,
        settings: Settings,

    }

    constructor(props) {
        super(props);
        this.state = { currentDashboardScreen: "dashboard" };
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
      
    }

    changeUtility(util){
        this.setState({currentDashboardScreen: util});
    }

    displayTime(){
        var x = new Date();
        var zero;
        if(x.getMinutes < 10) {zero = "0";}else{zero=""}
        var date = x.getHours( )+ ":" + zero +  x.getMinutes();
        return date;
    }

    displaySettings(){
        document.getElementById('fixedUtility').classList.add("expandFixed");
        
    }

    async componentDidMount() {
       
            const token = localStorage.getItem("token");
            // decode the token 
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            const decodedToken = JSON.parse(window.atob(base64));


            const farmDetails = await this.getFarmDetails(decodedToken.id);


            // print the farm details
            console.log(farmDetails);

            // get the weather data
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${farmDetails.latitude}&lon=${farmDetails.longitude}&units=${this.UNIT}&appid=${this.WEATHER_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            this.weatherData = data;
            this.setState({weatherData: data})

            console.log(data)

        


    }

    getFarmDetails(id) {
        return axios
        .get("http://localhost:8000/getfarmbyowner/" + id + "/")
        .then((res) => {
            console.log(res);
            return res.data;
        }
        )
        .catch((err) => {
            console.log(err);
        }
        );
    }



 
    render() {

        const { currentDashboardScreen, weatherData } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];

        if (!weatherData) {
           return null;
        }

        return(
            <div id='appContainer' className='screen'>

                <aside id='navContainer'>
                    <div id='navTop'>
                    </div>
                    <nav>
                        <ul>
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"})} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p><i className="fa-solid fa-table-cells-large"></i>Dashboard</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"})} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p><i className="fa-solid fa-cloud-sun"></i>Weather</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "monitor"})} className={this.state.currentDashboardScreen === "monitor" ? "navActive": ""}><p><i className="fa-solid fa-desktop"></i>Monitor</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "resources"})} className={this.state.currentDashboardScreen === "resources" ? "navActive": ""}><p><i className="fa-solid fa-boxes-stacked"></i>Resources</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"})} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p><i className="fa-regular fa-map"></i>Maps</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"})} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p><i className="fa-solid fa-bullhorn"></i>Predictions</p></li>
                        </ul>
                    </nav>
                </aside>

                <main id='utilityContainer'>

                <section id='fixedUtility'>

                    <ul>
                        <li><h2><i className="fa-regular fa-clock"></i>{this.displayTime()}</h2></li>
                        <li><button>Add new farm</button></li>
                        <li><i onClick={() => this.setState({currentDashboardScreen: "settings"})} className={this.state.currentDashboardScreen === "settings" ? "settingsActive fa-solid fa-gear": "fa-solid fa-gear"}></i></li>
                    </ul>

                </section>

                <section id='scrollUtility'>

                    <CurrentUtility weatherData={this.state.weatherData}/>

                </section>

             

                </main>

            </div>
        )
    }

}

export default Dashboard;