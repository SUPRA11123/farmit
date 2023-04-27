import React from 'react';
import Home from './Utilities/Home';
import Weather from './Utilities/Weather';
import Monitor from './Utilities/Monitor';
import Resources from './Utilities/Resources';
import Maps from './Utilities/Maps';
import Predictions from './Utilities/Predictions';
import Settings from './Utilities/Settings';
import axios from 'axios';

const URL = process.env.REACT_APP_URL;

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
        this.state = { currentDashboardScreen: "dashboard", isMobile: false};
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.displayDashboardScreen = this.displayDashboardScreen.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
        this.myDivRef = React.createRef();
      
    }

    async componentDidMount() {

        const isMobile = window.innerWidth < 600;
        this.setState({ isMobile });
       
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
         this.farmDetails = farmDetails;
 
         this.setState({farmDetails: farmDetails});

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

        console.log(data);

}

getFarmDetails(id) {
    return axios
    .get(URL + "getfarmbyowner/" + id + "/")
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

        console.log("works");
        this.setState({currentDashboardScreen: screen});

        if (screen === this.utilityComponents.maps) {
            document.getElementById("fixedUtility").classList.add("hidden");
        } else {
            document.getElementById("fixedUtility").classList.remove("hidden");
        }
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
        .get(URL + "getuserbyid/" + id + "/")
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });
    }

    expandMobileNav() {
        document.getElementById("navList").classList.toggle('hidden');
    }

    handleMobileClick() {
        if (window.innerWidth < 600) {
            document.getElementById("navList").classList.add('hidden');
         }
    }


    render() {

        const { currentDashboardScreen, weatherData, weatherForecast, farmDetails, isMobile } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];

        if (!weatherData || !weatherForecast || !farmDetails) {
            return "Loading...";
        }

        return(
            <div id='appContainer' className='screen'>

                <aside id='navContainer'>
                    <div id='navTop'>
                    <i onClick={this.expandMobileNav} id='mobileNavBtn' className="fa-solid fa-bars"></i>
                    <img src={require('../../resources/img/logo.png')} alt="Agrosensor logo"/>
                    </div>
                    <nav id='navList' className={isMobile ? 'hidden' : ''}>
                        <ul >
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p><i className="fa-solid fa-table-cells-large"></i>Dashboard</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p><i className="fa-solid fa-cloud-sun"></i>Weather</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "monitor"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "monitor" ? "navActive": ""}><p><i className="fa-solid fa-desktop"></i>Monitor</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "resources"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "resources" ? "navActive": ""}><p><i className="fa-solid fa-boxes-stacked"></i>Resources</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p><i className="fa-regular fa-map"></i>Maps</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p><i className="fa-solid fa-bullhorn"></i>Predictions</p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p><i className="fa-solid fa-gear"></i>Settings</p></li>
                            <li id='logout' onClick={this.handleLogout}><p><i className="fa-solid fa-arrow-right-from-bracket"></i>Logout</p></li>
                        </ul>
                    </nav>
                </aside>

                <main ref={this.divRef} id='utilityContainer'>

                <section id='fixedUtility'>

                    <h2>{this.getWelcomeMessage()} {this.state.user}</h2>
                    <p>your current dashboard for today</p>

                    <i id='alertBell' className="fa-regular fa-bell"></i>

                    <div id='userIcon'>
                        {(this.state.user).charAt(0).toUpperCase()}
                    </div>

                </section>

                <section id='scrollUtility'>

                    <CurrentUtility scrollToMap={this.scrollToMap} displayScreen={this.displayDashboardScreen} weatherData={this.state.weatherData} weatherForecast={this.state.weatherForecast} farmDetails={this.state.farmDetails}/>

                </section>

                </main>

            </div>


        )
    }

}

export default Dashboard;