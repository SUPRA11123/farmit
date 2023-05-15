import React from 'react';
import Home from './Utilities/Home';
import Weather from './Utilities/Weather';
import Monitor from './Utilities/Monitor';
import Maps from './Utilities/Maps';
import Predictions from './Utilities/Predictions';
import Tasks from './Utilities/Tasks';
import Team from './Utilities/Team';
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
        maps: Maps,
        predictions: Predictions,
        settings: Settings,
        team: Team,
        tasks: Tasks

    }

    constructor(props) {
        super(props);
        this.state = { currentDashboardScreen: "dashboard"};
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.displayDashboardScreen = this.displayDashboardScreen.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
        this.myDivRef = React.createRef();
      
    }

    async componentDidMount() {
       
        const token = localStorage.getItem("token");
        // decode the token 
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        const decodedToken = JSON.parse(window.atob(base64));

        console.log(decodedToken);

        // get the current user

        const user = await this.getUser(decodedToken.id);
        this.setState({user: user})

        const farmDetails = await this.getFarmDetails(decodedToken);

         // print the farm details
         this.farmDetails = farmDetails;
 
         this.setState({farmDetails: farmDetails});


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
}

getFarmDetails(token) {

    if(token.role === "field manager"){
       return axios
       .get(URL + "getfarmbyfieldmanager/" + token.id + "/")
         .then((res) => {
                console.log(res);
                return res.data;
            }
        )
        .catch((err) => {
            console.log(err);
        }
        );
    }else{
        return axios
        .get(URL + "getfarmbyownerorfarmer/" + token.id + "/")
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
   
}


    changeUtility(util){
        this.setState({currentDashboardScreen: util});
    }

    displaySettings(){
        document.getElementById('fixedUtility').classList.add("expandFixed");
    }

    displayDashboardScreen(screen){this.setState({currentDashboardScreen: screen});}


    handleLogout(){
        localStorage.removeItem("token");
        window.location.href = "/";    
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

        document.getElementById("navListMobile").classList.toggle('hidden');

    }

    handleMobileClick() {
        if (window.innerWidth < 600) {
            document.getElementById("navListMobile").classList.add('hidden');
         }
    }
 
    render() {


        const { currentDashboardScreen, weatherData, weatherForecast, farmDetails, user } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];


        if (!weatherData || !weatherForecast || !farmDetails || !user) {
            return (<i id="loadingIcon" className="fas fa-circle-notch fa-spin"></i>);
        }

        return(
            <div id='appContainer' className='screen'>

                <aside id='navContainer'>
                    <div id='navTop'>
                    <img src={require('../../resources/img/roundLogo.png')} draggable="false" alt="Agrosensor logo"/>
                    </div>
                    <nav id='navList'>
                        <ul>
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p>Dashboard<i className="fa-solid fa-table-cells-large"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p>Weather<i className="fa-solid fa-cloud-sun"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p>My Fields<i className="fa-regular fa-map"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p>Predictions<i className="fa-solid fa-bullhorn"></i></p></li>
                            {this.state.user.role === 'owner' && (                           
                            <li onClick={() => this.setState({currentDashboardScreen: "team"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive": ""}><p>My Team<i className="fa-solid fa-people-group"></i></p></li>
                            )}
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p>Settings<i className="fa-solid fa-gear"></i></p></li>
                            <li id='logout' onClick={this.handleLogout}><p>Logout<i className="fa-solid fa-arrow-right-from-bracket"></i></p></li>
                        </ul>
                    </nav>
                </aside>

                <aside id='navContainerMobile'>
                    <div id='navTop'>
                    <i onClick={this.expandMobileNav} id='mobileNavBtn' className="fa-solid fa-bars"></i>
                    <img src={require('../../resources/img/roundLogo.png')} draggable="false" alt="Agrosensor logo"/>
                    </div>
                    <nav id='navListMobile' className='hidden'>
                        <ul>
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p>Dashboard<i className="fa-solid fa-table-cells-large"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p>Weather<i className="fa-solid fa-cloud-sun"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p>My Fields<i className="fa-regular fa-map"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p>Predictions<i className="fa-solid fa-bullhorn"></i></p></li>
                            {this.state.user.role === 'owner' && (                           
                            <li onClick={() => this.setState({currentDashboardScreen: "team"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive": ""}><p>My Team<i className="fa-solid fa-people-group"></i></p></li>
                            )}
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p>Settings<i className="fa-solid fa-gear"></i></p></li>
                            <li id='logout' onClick={this.handleLogout}><p>Logout<i className="fa-solid fa-arrow-right-from-bracket"></i></p></li>
                        </ul>
                    </nav>
                </aside>

                <main ref={this.divRef} id='utilityContainer'>

                <section id='scrollUtility'>

                    <CurrentUtility scrollToMap={this.scrollToMap} displayScreen={this.displayDashboardScreen} weatherData={this.state.weatherData} weatherForecast={this.state.weatherForecast} farmDetails={this.state.farmDetails} user={this.state.user}/>

                </section>

             

                </main>

            </div>


        )
    }

}

export default Dashboard;