import React from 'react';
import Home from './Utilities/Home';
import Weather from './Utilities/Weather';
import Modal from './Utilities/Modal';
import Monitor from './Utilities/Monitor';
import Maps from './Utilities/Maps';
import Predictions from './Utilities/Predictions';
import Tasks from './Utilities/Tasks';
import Team from './Utilities/Team';
import Settings from './Utilities/Settings';
import axios from 'axios';
import { InfluxDB } from "@influxdata/influxdb-client";

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
        tasks: Tasks,
        modal: Modal,

    }

    constructor(props) {
        super(props);
        this.state = { currentDashboardScreen: "dashboard"};
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.displayDashboardScreen = this.displayDashboardScreen.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
        this.toggleAlertMenu = this.toggleAlertMenu.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
        this.getTheme = this.getTheme.bind(this);
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

        // get sensor data

        this.sensorLocationQuery();

        // fecth the sensorData every 20 seconds
        setInterval(async () => {
            await this.sensorLocationQuery();
        }
        , 20000);

    }

    async sensorLocationQuery() {
        const influxDB = new InfluxDB({
            url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
            token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",
          });
          
          const queryApi = influxDB.getQueryApi("FarmIT");
          
          const sensorLocationQuery = `
            from(bucket: "test")
            |> range(start: -50m)
            |> filter(fn: (r) =>
              r._measurement == "mqtt_consumer" and
              (
                r._field == "decoded_payload_temperature" or
                r._field == "decoded_payload_humidity" or
                r._field == "locations_user_latitude" or
                r._field == "locations_user_longitude"
              ) and
              exists r._value
            )
            |> last()
          `;
          
          const sensors = {}; // Object to store sensor data
          
          const fetchSensorLocationData = new Promise((resolve, reject) => {
            queryApi.queryRows(sensorLocationQuery, {
              next: (row, tableMeta) => {
                const sensorData = tableMeta.toObject(row);
          
                const { _field, _value, topic } = sensorData;
          
                // Extract the sensor ID from the topic. It's the 4th part of the topic
                const sensorId = topic.split("/")[3];
          
                if (_field === "locations_user_latitude") {
                  sensors[sensorId] = { ...sensors[sensorId], latitude: _value, sensorId };
                } else if (_field === "locations_user_longitude") {
                  sensors[sensorId] = { ...sensors[sensorId], longitude: _value, sensorId };
                } else if (_field === "decoded_payload_temperature") {
                  sensors[sensorId] = { ...sensors[sensorId], temperature: _value, sensorId };
                } else if (_field === "decoded_payload_humidity") {
                  sensors[sensorId] = { ...sensors[sensorId], humidity: _value, sensorId };
                }
              },
              error: (error) => {
                console.error(error);
                console.log("\nFinished ERROR");
                reject(error);
              },
              complete: () => {
                console.log("\nFinished SUCCESS");
                // Set the sensor data in the state
                const sensorArray = Object.values(sensors);
                this.setState({ sensors: sensorArray });
                resolve();
              },
            });
          });
                    
        }

    getFarmDetails(token) {

        if(token.role === "field manager"){
        return axios
        .get(URL + "getfarmbyfieldmanager/" + token.id + "/")
            .then((res) => {
                    return res.data;
                }
            )
            .catch((err) => {
                console.log(err);
            });
        }else{
            return axios
            .get(URL + "getfarmbyownerorfarmer/" + token.id + "/")
            .then((res) => {
                return res.data;
            }
            )
            .catch((err) => {
                console.log(err);
            }
            );
        }
    
    }

    changeUtility(util){this.setState({currentDashboardScreen: util});}

    displaySettings(){document.getElementById('fixedUtility').classList.add("expandFixed");}

    displayDashboardScreen(screen){this.setState({currentDashboardScreen: screen});}

    changeTheme(x){this.setState({isDarkMode: x})}

    getTheme(){return this.state.isDarkMode}

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

    expandMobileNav() {document.getElementById("navListMobile").classList.toggle('hidden');}

    handleMobileClick() {
        if (window.innerWidth < 600) {
            document.getElementById("navListMobile").classList.add('hidden');
         }
    }

    toggleMenu() {
        localStorage.setItem("menuToggled", true);
        const navItems = document.querySelectorAll('#navList li p');
        navItems.forEach(item => { item.classList.toggle("hidden"); });
        document.getElementById('navContainer').classList.toggle('smallNav');
        document.getElementById('utilityContainer').classList.toggle('expandedUtility')

    }

    toggleAlertMenu() {
        document.getElementById('alertMenu').classList.toggle('hidden');
        document.getElementById('alertMenu').classList.toggle('alertMenuAnimation');
        const alertBell = document.getElementById('alertBell');
        alertBell.classList.toggle('fa-bell');
        alertBell.classList.toggle('fa-xmark');
        alertBell.classList.toggle('fa-regular');
        alertBell.classList.toggle('fa-solid');
        document.getElementById('alertOverlay').classList.toggle('hidden');
        document.getElementById('alertOverlay').classList.toggle('overlayDarkenAnimation');
        document.getElementById('openSettings').classList.toggle('hidden');
        document.getElementById('notification').classList.toggle('hidden');
        document.getElementById('addNewAlert').classList.toggle('alertCardAnimation');
        const alertCards = document.getElementById("alertsContainer").querySelectorAll("div");
        alertCards.forEach((card) => {
          card.classList.toggle('alertCardAnimation');
        });
      }
      
      
    render() {


        const { currentDashboardScreen, weatherData, weatherForecast, farmDetails, user, sensors } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];


        if (!weatherData || !weatherForecast || !farmDetails || !user || !sensors) {
            return (<i id="loadingIcon" className="fas fa-circle-notch fa-spin"></i>);
        }

        return(
            <div id='appContainer' className='screen'>

                <aside id="navContainer" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''} navContainer`}>
                    <div id='navTop' className='navTop'>
                    <img className="navLogoImg" onClick={() => this.setState({currentDashboardScreen: "dashboard"})} src={require('../../resources/img/roundLogo.png')} draggable="false" alt="Agrosensor logo"/>
                    <i onClick={this.toggleMenu} id="toggleNavMenu" className="fa-solid fa-angles-left"></i>
                    </div>
                    <nav id='navList'>
                        <ul>
                            <li onClick={() => this.setState({currentDashboardScreen: "dashboard"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive": ""}><p>Dashboard</p><i className="fa-solid fa-table-cells-large"></i></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p>Fields</p><i className="fa-regular fa-map"></i></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "tasks"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "tasks" ? "navActive": ""}><p>Tasks</p><i className="fa-solid fa-bullseye"></i></li>
                            {this.state.user.role === 'owner' && (                           
                            <li onClick={() => this.setState({currentDashboardScreen: "team"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive": ""}><p>Team</p><i className="fa-solid fa-people-group"></i></li>
                            )}
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p>Weather</p><i className="fa-solid fa-cloud-sun"></i></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p>Fruit Predictions</p><i className="fa-solid fa-leaf"></i></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p>Settings</p><i className="fa-solid fa-gear"></i></li>
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
                            <li onClick={() => this.setState({currentDashboardScreen: "maps"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive": ""}><p>My Fields<i className="fa-regular fa-map"></i></p></li>
                            {this.state.user.role === 'owner' && (                           
                            <li onClick={() => this.setState({currentDashboardScreen: "team"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive": ""}><p>Tasks<i className="fa-solid fa-people-group"></i></p></li>
                            )}
                            <li onClick={() => this.setState({currentDashboardScreen: "predictions"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive": ""}><p>Predictions<i className="fa-solid fa-bullhorn"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "weather"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive": ""}><p>Weather<i className="fa-solid fa-cloud-sun"></i></p></li>
                            <li onClick={() => this.setState({currentDashboardScreen: "settings"}, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive": ""}><p>Settings<i className="fa-solid fa-gear"></i></p></li>
                            <li id='logout' onClick={this.handleLogout}><p>Logout<i className="fa-solid fa-arrow-right-from-bracket"></i></p></li>
                        </ul>
                    </nav>
                </aside>

                <main ref={this.divRef} id='utilityContainer' className={`utilityContainer ${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>

                <section id='scrollUtility'>
                
                    <section className='alertContainer'>
                    <i id="openSettings" onClick={() => this.setState({currentDashboardScreen: "settings"})} className={`fa-solid fa-gear ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}></i>
                    <div class="notification-container">
                        <i onClick={this.toggleAlertMenu} id='alertBell' className={`fa-regular fa-bell ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}></i>
                        <span id='notification' class="notification">5</span>
                    </div>
                    
         
                    </section>
                   
                    <CurrentUtility 
                    scrollToMap={this.scrollToMap} displayScreen={this.displayDashboardScreen} 
                    weatherData={this.state.weatherData} weatherForecast={this.state.weatherForecast} 
                    farmDetails={this.state.farmDetails} user={this.state.user} 
                    changeTheme={this.changeTheme} getTheme={this.getTheme}
                    sensors={this.state.sensors}
                    logout={this.handleLogout}
                    />


                </section>

                </main>

                

                <section id="alertMenu" className={`alertMenu hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                    <h2>Alerts</h2>

                    <div id="alertsContainer" className='alertsContainer'>

                        <div className='alertCard'>

                        <i class="fa-solid fa-wifi"></i>
                        <h2>Low soil moisture detected in Field A. Irrigation recommended within the next 24 hours to maintain optimal soil moisture levels.</h2>

                        </div>

                        <div className='alertCard'>

                        <i class="fa-solid fa-bullseye"></i>
                        <h2>At 4:25PM, Tiago completed the task: "Pick fruits"</h2>

                        </div>

                        <div className='alertCard'>

                        <i class="fa-solid fa-cloud-sun"></i>
                        <h2>The temperature could reach over 27°C on tuesday</h2>

                        </div>

                        <div className='alertCard'>

                        <i class="fa-solid fa-circle-exclamation"></i>
                        <h2>Low soil moisture detected in Field A. Irrigation recommended within the next 24 hours to maintain optimal soil moisture levels.</h2>

                        </div>
                        <div className='alertCard'>

                        <i class="fa-solid fa-circle-exclamation"></i>
                        <h2>Low soil moisture detected in Field A. Irrigation recommended within the next 24 hours to maintain optimal soil moisture levels.</h2>

                        </div>

                        

                        <button id='clearAllAlerts'><i className="fa-solid fa-trash"></i> Clear All</button>

                    </div>

                    <button id='addNewAlert'>Add new Alert</button>

                </section>

                <div id='alertOverlay' className="overlayDarken hidden"></div>

            </div>
        )
    }

}

export default Dashboard;