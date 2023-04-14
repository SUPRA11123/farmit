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

    UNIT = "metric";
    WEATHER_API_KEY = "aa63df15430f30c399f6228866963714"

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
        this.state = { currentDashboardScreen: "dashboard"};
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.displayDashboardScreen = this.displayDashboardScreen.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
      
    }

    async componentDidMount() {
       
        const token = localStorage.getItem("token");
        // decode the token 
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const decodedToken = JSON.parse(window.atob(base64));

        // get the current user

        const user = await this.getUser(decodedToken.id);
        this.setState({user: user.name})



        const farmDetails = await this.getFarmDetails(decodedToken.id);


        // print the farm details
        console.log(farmDetails);

        // get the weather data
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${farmDetails.latitude}&lon=${farmDetails.longitude}&units=${this.UNIT}&appid=${this.WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        this.weatherData = data;
        this.setState({weatherData: data})

        // get the weather forecast

        const url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${farmDetails.latitude}&lon=${farmDetails.longitude}&units=${this.UNIT}&appid=${this.WEATHER_API_KEY}`;
        const response2 = await fetch(url2);
        const data2 = await response2.json();

        this.weatherForecast = data2;
        this.setState({weatherForecast: data2})

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


    changeUtility(util){
        this.setState({currentDashboardScreen: util});
    }

    displaySettings(){
        document.getElementById('fixedUtility').classList.add("expandFixed");
    }

    displayDashboardScreen(screen){
        this.setState({currentDashboardScreen: screen});
    }

    handleLogout(){
        localStorage.removeItem("token");
        window.location.href = "/";    
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

    getUser(id) {
        return axios
        .get("http://localhost:8000/getuserbyid/" + id + "/")
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    }

 
    render() {


        const { currentDashboardScreen, weatherData, weatherForecast } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];

        if (!weatherData || !weatherForecast || !weatherForecast) {
            return null;
        }

        return(
            <div id='appContainer' className='screen'>

                <aside id='navContainer'>
                    <div id='navTop'>
                    <img src={require('../../resources/img/logo.png')} alt="Agrosensor logo"/>
                    </div>
                    <nav>
                        <ul>
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"})} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p><i className="fa-solid fa-table-cells-large"></i>Dashboard</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"})} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p><i className="fa-solid fa-cloud-sun"></i>Weather</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "monitor"})} className={this.state.currentDashboardScreen === "monitor" ? "navActive": ""}><p><i className="fa-solid fa-desktop"></i>Monitor</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "resources"})} className={this.state.currentDashboardScreen === "resources" ? "navActive": ""}><p><i className="fa-solid fa-boxes-stacked"></i>Resources</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"})} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p><i className="fa-regular fa-map"></i>Maps</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"})} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p><i className="fa-solid fa-bullhorn"></i>Predictions</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"})} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p><i className="fa-solid fa-gear"></i>Settings</p></li>
                            <li id='logout' onClick={this.handleLogout}><p><i className="fa-solid fa-arrow-right-from-bracket"></i>Logout</p></li>
                        </ul>


                    </nav>
                </aside>

                <main id='utilityContainer'>

                <section id='fixedUtility'>

                    <h2>{this.getWelcomeMessage()} {this.state.user}</h2>
                    <p>your current dashboard for today</p>

                </section>

                <section id='scrollUtility'>

                    <CurrentUtility displayScreen={this.displayDashboardScreen} weatherData={this.state.weatherData} weatherForecast={this.state.weatherForecast}/>

                </section>

             

                </main>

            </div>
        )
    }

}

export default Dashboard;