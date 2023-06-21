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
        this.state = {
            currentDashboardScreen: "dashboard",
            sensorsOwned: [],
            alerts: [],
        };
        this.changeUtility = this.changeUtility.bind(this);
        this.displaySettings = this.displaySettings.bind(this);
        this.displayDashboardScreen = this.displayDashboardScreen.bind(this);
        this.getFarmDetails = this.getFarmDetails.bind(this);
        this.toggleAlertMenu = this.toggleAlertMenu.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
        this.getTheme = this.getTheme.bind(this);
        this.myDivRef = React.createRef();
        this.sensorCreated = this.sensorCreated.bind(this);

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
        this.setState({ user: user })

        const farmDetails = await this.getFarmDetails(decodedToken);

        // print the farm details
        this.farmDetails = farmDetails;

        this.setState({ farmDetails: farmDetails });


        // get the weather data
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${farmDetails.latitude}&lon=${farmDetails.longitude}&units=${this.UNIT}&appid=${this.WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        this.weatherData = data;
        this.setState({ weatherData: data })


        if (this.state.user.role === "field manager") {
            axios.get(URL + "getfieldsbymanager/" + this.state.user.id + "/")
                .then((response) => {
                    this.setState({ fields: response.data });
                })
                .catch((error) => {
                    console.log(error);
                })
        }


        // get the weather forecast

        const url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${farmDetails.latitude}&lon=${farmDetails.longitude}&units=${this.UNIT}&appid=${this.WEATHER_API_KEY}`;
        const response2 = await fetch(url2);
        const data2 = await response2.json();

        this.weatherForecast = data2;
        this.setState({ weatherForecast: data2 });


        const totalDays = 4; // Number of days in the forecast
        const dataPointsPerDay = 8; // Number of data points per day (assuming 3-hour intervals)
        const iterationLimit = totalDays * dataPointsPerDay;

        let biggestTemperatureRegistered = 0;

        let biggestTemperatureRegisteredIndex = 0;

        let biggestTemperatureRegisteredDayName = "";


        for (let i = 1; i < iterationLimit; i++) {
            const temperature = data2.list[i].main.temp;
            const date = new Date(data2.list[i].dt_txt);
            const dayName = date.toLocaleString('en-us', { weekday: 'long' });

            if (temperature > biggestTemperatureRegistered) {
                biggestTemperatureRegistered = temperature;
            }

            if (temperature > biggestTemperatureRegisteredIndex) {
                biggestTemperatureRegisteredIndex = temperature;
                biggestTemperatureRegisteredDayName = dayName;
            }

        }

        alert = {
            type: "weather",
            message: `The temperature could reach over ${(biggestTemperatureRegistered).toFixed(0)}°C on ${biggestTemperatureRegisteredDayName}!`,
        }

        // get current date and day of the week

        const currentDate = new Date();

        const currentDayName = currentDate.toLocaleString('en-us', { weekday: 'long' });



        // get tomorrow's day of the week

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tomorrowDayName = tomorrow.toLocaleString('en-us', { weekday: 'long' });


        if (biggestTemperatureRegisteredDayName === tomorrowDayName) {
            alert.message = `The temperature could reach over ${(biggestTemperatureRegistered).toFixed(0)}°C tomorrow!`;
        }

        this.setState({ alerts: [alert] });


        axios.get(URL + "gettasksbyassignee/" + this.state.user.id + "/")
            .then((response) => {
                // get the count of tasks
                const tasks = response.data;


                // only count the tasks that are not completed
                const tasksCount = tasks.filter((task) => task.status !== "Completed").length;



                if (tasksCount > 0) {
                    const tasksAlert = {
                        type: "tasks",
                        message: `You have ${tasksCount} tasks assigned to you!`,
                    };

                    // Add tasks alert to the alerts array
                    this.setState((prevState) => ({
                        alerts: [...prevState.alerts, tasksAlert],
                    }));
                }
            })
            .catch((error) => {
                console.log(error);
            });









        // get sensors from farm

        // before calling sensorLocationQuery, we need to wait for the sensors to be fetched


        await this.getSensors();




        // only call sensorLocationQuery if there are sensors

        if (this.state.sensorsOwned.length > 0) {

            this.sensorLocationQuery();

            // fecth the sensorData every 5 seconds
            setInterval(async () => {
                await this.sensorLocationQuery();
            }
                , 5000);
        } else {
            this.setState({ sensors: [] });

        }


    }

    async sensorLocationQuery() {
        const influxDB = new InfluxDB({
            url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
            token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",
        });

        const queryApi = influxDB.getQueryApi("FarmIT");

        const sensorNames = this.state.sensorsOwned.map((sensor) => sensor.name);

        const sensorNamesFilter = sensorNames.map((sensorName) => `r["topic"] == "v3/farmit@ttn/devices/${sensorName}/up"`).join(" or ");

        const sensorLocationQuery = `
        from(bucket: "test")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
        |> filter(fn: (r) => r["_field"] == "decoded_payload_temperature" or r["_field"] == "decoded_payload_humidity")
        |> filter(fn: (r) => ${sensorNamesFilter})
      `;


        const sensors = {};



        const fetchSensorLocationData = new Promise((resolve, reject) => {
            queryApi.queryRows(sensorLocationQuery, {
                next: async (row, tableMeta) => {
                    const sensorData = tableMeta.toObject(row);
                    //console.log(sensorData);

                    const { _field, _value, topic } = sensorData;

                    // Extract the sensor ID from the topic. It's the 4th part of the topic
                    const sensorId = topic.split("/")[3];

                    // get the sensor object from the sensorsOwned array
                    const sensorFound = this.state.sensorsOwned.find((sensor) => sensor.name === sensorId);

                    var match;

                    if (this.state.user.role === "field manager") {
                        this.state.fields.forEach((field) => {
                            if (sensorFound.field === field.id) {
                                // Match found between sensor and field IDs
                                // Do something with the matched sensor and field
                                match = true;
                            }
                        });
                    } else {
                        match = true;
                    }




                    if (_field === "decoded_payload_temperature") {
                        sensors[sensorId] = { ...sensors[sensorId], temperature: _value, sensorId };

                        // if the temperature has been above 30 degrees Celsius in the past 24 hours, send an alert.
                        // if there's already an alert for this sensor, then don't send another alert

                        if (_value > 30 && !this.state.alerts.find((alert) => alert.sensorId === sensorId && alert.temperature === "high") && match) {
                            const alertMessage = `High temperature was detected in sensor ${sensorId} in the past 24 hours! Take necessary measures to cool the environment.`;

                            // Create an object with the alert details
                            const alert = {
                                sensorId,
                                type: "temperature",
                                value: _value,
                                message: alertMessage,
                                timestamp: Date.now(),
                                temperature: "high",
                            };

                            // Create a promise that resolves when the state is updated
                            const setStatePromise = new Promise((resolve) => {
                                this.setState((prevState) => ({
                                    alerts: prevState.alerts.some((alert) => alert.sensorId === sensorId && alert.temperature === "high")
                                        ? prevState.alerts // Alert already exists with temperature "high", return the current state
                                        : [...prevState.alerts, alert], // Add new alert to the state
                                }), resolve);
                            });

                            // Wait for the state to be updated before continuing
                            await setStatePromise;
                        } else if (_value < 10 && !this.state.alerts.find((alert) => alert.sensorId === sensorId && alert.temperature === "low") && match) {
                            const alertMessage = `Low temperature was detected in sensor ${sensorId} in the past 24 hours! Take necessary measures to warm the environment.`;

                            // Create an object with the alert details
                            const alert = {
                                sensorId,
                                type: "temperature",
                                value: _value,
                                message: alertMessage,
                                timestamp: Date.now(),
                                temperature: "low",
                            };

                            // Create a promise that resolves when the state is updated
                            const setStatePromise = new Promise((resolve) => {
                                this.setState((prevState) => ({
                                    alerts: prevState.alerts.some((alert) => alert.sensorId === sensorId && alert.temperature === "low")
                                        ? prevState.alerts // Alert already exists with temperature "low", return the current state
                                        : [...prevState.alerts, alert], // Add new alert to the state
                                }), resolve);
                            });

                            // Wait for the state to be updated before continuing
                            await setStatePromise;
                        }




                    } else if (_field === "decoded_payload_humidity") {
                        sensors[sensorId] = { ...sensors[sensorId], humidity: _value, sensorId };

                        // if for the past 24 hours, the humidity has been above 80%, then send an alert. 
                        // if there's already an alert for this sensor, then don't send another alert

                        if (_value > 60 && !this.state.alerts.find((alert) => alert.sensorId === sensorId && alert.humidity === "high") && match) {
                            const alertMessage = `High soil moisture was detected in sensor ${sensorId} in the past 24 hours! Make sure to maintain optimal soil moisture levels.`;

                            // Create an object with the alert details
                            const alert = {
                                sensorId,
                                type: "humidity",
                                value: _value,
                                message: alertMessage,
                                timestamp: Date.now(),
                                humidity: "high",
                            };

                            // Create a promise that resolves when the state is updated
                            const setStatePromise = new Promise((resolve) => {
                                this.setState((prevState) => ({
                                    alerts: prevState.alerts.some((alert) => alert.sensorId === sensorId && alert.humidity === "high")
                                        ? prevState.alerts // Alert already exists with humidity "high", return the current state
                                        : [...prevState.alerts, alert], // Add new alert to the state
                                }), resolve);
                            });

                            // Wait for the state to be updated before continuing
                            await setStatePromise;
                        }
                        else if (_value < 40 && !this.state.alerts.find((alert) => alert.sensorId === sensorId && alert.humidity === "low") && match) {
                            const alertMessage = `Low soil moisture was detected in sensor ${sensorId} in the past 24 hours! Make sure to water the plants appropriately.`;

                            // Create an object with the alert details
                            const alert = {
                                sensorId,
                                type: "humidity",
                                value: _value,
                                message: alertMessage,
                                timestamp: Date.now(),
                                humidity: "low",
                            };

                            // Create a promise that resolves when the state is updated
                            const setStatePromise = new Promise((resolve) => {
                                this.setState((prevState) => ({
                                    alerts: prevState.alerts.some((alert) => alert.sensorId === sensorId && alert.humidity === "low")
                                        ? prevState.alerts // Alert already exists with humidity "low", return the current state
                                        : [...prevState.alerts, alert], // Add new alert to the state
                                }), resolve);
                            });

                            // Wait for the state to be updated before continuing
                            await setStatePromise;
                        }



                    }

                    const sensor = this.state.sensorsOwned.find((sensor) => sensor.name === sensorId);
                    sensors[sensorId] = { ...sensors[sensorId], latitude: sensor.latitude, longitude: sensor.longitude, sensorId };

                },
                error: (error) => {
                    console.error(error);
                    console.log("\nFinished ERROR");
                    reject(error);
                },
                complete: () => {

                    // Set the sensor data in the state
                    const sensorArray = Object.values(sensors);
                    this.setState({ sensors: sensorArray });
                    resolve();
                },
            });
        });


    }

    getFarmDetails(token) {

        if (token.role === "field manager") {
            return axios
                .get(URL + "getfarmbyfieldmanager/" + token.id + "/")
                .then((res) => {
                    return res.data;
                }
                )
                .catch((err) => {
                    console.log(err);
                });
        } else {
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

    getSensors() {
        return new Promise((resolve, reject) => {
            axios.get(URL + "getsensors/" + this.state.farmDetails.id + "/")
                .then(response => {
                    console.log(response.data);
                    this.setState({ sensorsOwned: response.data }, () => {
                        resolve(); // Resolve the promise after setState is finished

                    });


                })
                .catch(error => {
                    console.log(error);
                    reject(error); // Reject the promise if there is an error
                });
        });
    }

    changeUtility(util) {
        this.setState({ currentDashboardScreen: util });
    }

    displaySettings() { document.getElementById('fixedUtility').classList.add("expandFixed"); }

    displayDashboardScreen(screen) {

        this.setState({ currentDashboardScreen: screen });
    }

    changeTheme(x) { this.setState({ isDarkMode: x }) }

    getTheme() { return this.state.isDarkMode }

    handleLogout() {
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
        document.getElementById("mobileNavBtn").classList.toggle("fa-bars");
        document.getElementById("mobileNavBtn").classList.toggle("fa-xmark");
    }

    handleMobileClick() {
        if (window.innerWidth < 600) {
            document.getElementById("navListMobile").classList.add('hidden');
            document.getElementById("mobileNavBtn").classList.toggle("fa-bars");
            document.getElementById("mobileNavBtn").classList.toggle("fa-xmark");
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
        document.getElementById('notification').classList.toggle('hidden');
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

    async sensorCreated() {


        await this.getSensors();

        this.sensorLocationQuery();

    }


    render() {


        const { currentDashboardScreen, weatherData, weatherForecast, farmDetails, user, sensors } = this.state;

        const CurrentUtility = this.utilityComponents[currentDashboardScreen];


        if (!weatherData || !weatherForecast || !farmDetails || !user || !sensors) {
            return (<i id="loadingIcon" className="fas fa-circle-notch fa-spin"></i>);
        }

        return (
            <div id='appContainer' className={`screen ${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>

                <aside id="navContainer" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''} navContainer`}>
                    <div id='navTop' className='navTop'>
                        <img className="navLogoImg" onClick={() => this.setState({ currentDashboardScreen: "dashboard" })} src={require('../../resources/img/roundLogo.png')} draggable="false" alt="Agrosensor logo" />
                        <h1>AGRO<span>SENSOR</span></h1>
                        <i onClick={this.toggleMenu} id="toggleNavMenu" className="fa-solid fa-angles-left"></i>
                    </div>
                    <nav id='navList'>
                        <ul>
                            <li onClick={() => this.setState({ currentDashboardScreen: "dashboard" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive" : ""}>
                                <i className="fa-solid fa-table-cells-large"></i>
                                <p>Dashboard</p>
                            </li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "maps" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive" : ""}>
                                <i className="fa-regular fa-map"></i>
                                <p>Fields</p>
                            </li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "tasks" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "tasks" ? "navActive" : ""}>
                                <i className="fa-solid fa-bullseye"></i>
                                <p>Tasks</p>
                            </li>
                            {this.state.user.role != 'farmer' && (
                                <li onClick={() => this.setState({ currentDashboardScreen: "team" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive" : ""}>
                                    <i className="fa-solid fa-people-group"></i>
                                    <p>Team</p>
                                </li>
                            )}
                            <li onClick={() => this.setState({ currentDashboardScreen: "weather" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive" : ""}>
                                <i className="fa-solid fa-cloud-sun"></i>
                                <p>Weather</p>
                            </li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "predictions" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive" : ""}>
                                <i className="fa-solid fa-leaf"></i>
                                <p>Fruit-scan</p>
                            </li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "settings" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive" : ""}>
                                <i className="fa-solid fa-gear"></i>
                                <p>Settings</p>
                            </li>
                        </ul>
                    </nav>

                </aside>

                <aside id='navContainerMobile'>
                    <div id='navTop' className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>
                        <i onClick={this.expandMobileNav} id='mobileNavBtn' className="fa-solid fa-bars"></i>
                        <h1>AGRO<span>SENSOR</span></h1>
                        <img src={require('../../resources/img/roundLogo.png')} draggable="false" alt="Agrosensor logo" />
                    </div>
                    <nav id='navListMobile' className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>
                        <ul>
                            <li onClick={() => this.setState({ currentDashboardScreen: "dashboard" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "dashboard" ? "navActive" : ""}><p><i className="fa-solid fa-table-cells-large"></i> Dashboard</p></li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "maps" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "maps" ? "navActive" : ""}><p><i className="fa-regular fa-map"></i> Fields</p></li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "tasks" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "tasks" ? "navActive" : ""}><p><i className="fa-solid fa-bullseye"></i> Tasks</p></li>
                            {this.state.user.role === 'owner' && (
                                <li onClick={() => this.setState({ currentDashboardScreen: "team" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "team" ? "navActive" : ""}><p><i className="fa-solid fa-people-group"></i> Team</p></li>
                            )}
                            <li onClick={() => this.setState({ currentDashboardScreen: "predictions" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "predictions" ? "navActive" : ""}><p><i className="fa-solid fa-leaf"></i> Fruit-scan</p></li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "weather" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "weather" ? "navActive" : ""}><p><i className="fa-solid fa-cloud-sun"></i> Weather</p></li>
                            <li onClick={() => this.setState({ currentDashboardScreen: "settings" }, this.handleMobileClick)} className={this.state.currentDashboardScreen === "settings" ? "navActive" : ""}><p><i className="fa-solid fa-gear"></i> Settings</p></li>
                        </ul>
                    </nav>
                </aside>

                <main ref={this.divRef} id='utilityContainer' className={`utilityContainer ${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>

                    <section id='scrollUtility'>

                        <section className='alertContainer'>
                            <div class="notification-container">
                                <i onClick={this.toggleAlertMenu} id='alertBell' className={`fa-regular fa-bell ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}></i>
                                <span id='notification' class="notification">{this.state.alerts.length}</span>
                            </div>


                        </section>

                        <CurrentUtility
                            scrollToMap={this.scrollToMap} displayScreen={this.displayDashboardScreen}
                            weatherData={this.state.weatherData} weatherForecast={this.state.weatherForecast}
                            farmDetails={this.state.farmDetails} user={this.state.user}
                            changeTheme={this.changeTheme} getTheme={this.getTheme}
                            sensors={this.state.sensors}
                            logout={this.handleLogout}
                            sensorCreated={this.sensorCreated}

                        />


                    </section>

                </main>



                <section id="alertMenu" className={`alertMenu hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                    <h2>Alerts</h2>
                    <div id="alertsContainer" className='alertsContainer'>
                        {this.state.alerts.map((alert, index) => {



                            const matchingSensor = this.state.sensorsOwned.find(
                                (sensor) => sensor.name === alert.sensorId
                            );

                            const key = `${index}-${alert.type}`;


                            if (alert.type === 'weather') {
                                return (
                                    <div
                                        className={`alertCard ${this.state.currentDashboardScreen === "weather" ? "navActive" : ""
                                            }`}
                                        key={key}
                                        onClick={() =>
                                            {
                                                this.setState({ currentDashboardScreen: "weather" }, this.handleMobileClick);
                                                this.toggleAlertMenu()
                                            }
                                        }
                                    >
                                         <i className="fa-solid fa-cloud-sun"></i>
                                        <h2>{alert.message}</h2>
                                    </div>
                                );
                               
                            }
                            if (
                                (this.state.user.role === "field manager" ||
                                    this.state.user.role === "farmer") &&
                                alert.type === "tasks"
                            ) {
                                return (
                                    <div
                                        className={`alertCard ${this.state.currentDashboardScreen === "tasks" ? "navActive" : ""
                                            }`}
                                        key={key}
                                        onClick={() =>
                                            {
                                                this.setState({ currentDashboardScreen: "tasks" }, this.handleMobileClick);
                                                this.toggleAlertMenu()
                                            }
                                        }
                                    >
                                        <i className="fas fa-tasks"></i>
                                        <h2>{alert.message}</h2>
                                    </div>
                                );

                            }


                                if (this.state.user.role === "field manager") {
                                    if (matchingSensor && this.state.fields.some(field => field.id === matchingSensor.field)) {
                                        return (
                                            <div className="alertCard" key={key}>
                                                {alert.type === 'humidity' && (
                                                    <>
                                                        <i class="fa-solid fa-circle-exclamation"></i>
                                                        <h2>{alert.message}</h2>
                                                    </>
                                                )}
                                                {alert.type === 'temperature' && (
                                                    <>
                                                        <i class="fa-solid fa-circle-exclamation"></i>
                                                        <h2>{alert.message}</h2>
                                                    </>
                                                )}

                                            </div>
                                        );
                                    }



                                } else {
                                    return (
                                        <div className="alertCard" key={key}>
                                            {alert.type === 'humidity' && (
                                                <>
                                                    <i class="fa-solid fa-circle-exclamation"></i>
                                                    <h2>{alert.message}</h2>
                                                </>
                                            )}
                                            {alert.type === 'temperature' && (
                                                <>
                                                    <i class="fa-solid fa-circle-exclamation"></i>
                                                    <h2>{alert.message}</h2>
                                                </>
                                            )}

                                        </div>
                                    );


                                }

                                return null;

                            })}




                        {/* <div className='alertCard'>

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

                        </div> */}



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