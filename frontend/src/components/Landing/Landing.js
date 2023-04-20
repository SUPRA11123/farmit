import React from 'react';
import CountrySelect from './CountrySelect';
import Map from './Map';
import coordData from '../../resources/country-coord.json'
import axios from 'axios';

class Landing extends React.Component {

  lat;
  lng;
  WEATHER_API_KEY = "aa63df15430f30c399f6228866963714" 

    constructor(props) {

        super(props);
        this.handleNext = this.handleNext.bind(this);
        this.handleToDashboard = this.handleToDashboard.bind(this);
        this.changeMap = this.changeMap.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleFarmInfo = this.handleFarmInfo.bind(this);
        this.getUser = this.getUser.bind(this);


        this.state = {
            country: {
            countryLat: 54, 
            countryLong: -2
            },
            marker: {
                markerLat: 0,
                markerLong: 0
            }
        };
      }
    
    handleNext(event) {

        event.preventDefault();

        var name = document.getElementById("createName").value;
        var email = document.getElementById("createEmail").value;
        var password = document.getElementById("createPwd").value;

        // get name and email from form
        axios.post('http://localhost:8000/signup/', {
            name: name,
            email: email,
            password: password
        }).then(response => {
          if (response.data.message === "User already exists") {
                console.log(response);
                alert("User already exists");
            }else{
              console.log(response);
              document.getElementById("userInfo").classList.add("hidden");
              document.getElementById("farmInfo").classList.remove("hidden");
            }
        }).catch(error => {
            console.log(error);
        });
    }

    handleToDashboard() {
      
      this.props.setStateOfParent("dashboardScreen");

    }

    toLogin(){

        document.getElementById("userInfo").classList.add("hidden");
        document.getElementById("farmInfo").classList.add("hidden");
        document.getElementById("userLogin").classList.remove("hidden");

    }

    toRegister(){

        document.getElementById("userInfo").classList.remove("hidden");
        document.getElementById("userLogin").classList.add("hidden");

    }

    changeMap() {

        var farmMap = document.getElementById("mapContainer");
        farmMap.classList.remove("hidden");

        document.getElementById("mapPrompt").classList.remove("hidden");
        
        var farmCountry = document.getElementById("country");
        var countryCoords = coordData.filter(function(coordData){return coordData.Country === farmCountry.value});

        this.setState({
            country: {
              countryLat: countryCoords[0].Latitude,
              countryLong: countryCoords[0].Longitude,
            }
          });

    }

    handleMapClick = (t, map, coord) => {
    
        const lat = t.latLng.lat();
        const lng = t.latLng.lng();

        this.setState({
            marker: { markerLat: lat, markerLong: lng },
            country: { countryLat: lat, countryLong: lng}
          });

        if(document.getElementById("farmName").value){
            document.getElementById("farmNext").classList.add("submitActive");
        } else {
            document.getElementById("farmNext").classList.remove("submitActive");
        }
        
    }

    checkAccountComplete(){

        if(document.getElementById("createName").value && document.getElementById("createEmail").value && document.getElementById("createPwd").value ){
            document.getElementById("accountNext").classList.add("submitActive");
        } else {
            document.getElementById("accountNext").classList.remove("submitActive");
        }

        if(document.getElementById("loginEmail").value && document.getElementById("loginPwd").value){
            document.getElementById("loginInBtn").classList.add("submitActive");
        } else {
            document.getElementById("loginInBtn").classList.remove("submitActive");
        }

    }

    handleLogin(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPwd").value;

       
        axios.post('http://localhost:8000/signin/', {
          email: email,
          password: password
        })
        .then((response) => {
          console.log({token: response.data.token});
          localStorage.setItem('token', response.data.token);
          this.handleToDashboard();
        })
        .catch((error) => {
          document.getElementById("errorMessage").innerHTML = error.response.data.message + ", please try again";
        });

    }

    async handleFarmInfo(event) {
        event.preventDefault();
      
        const email = document.getElementById("createEmail").value;
      
        const id = await this.getUser(email);
              
        if ((this.state.marker.markerLat !== 0 && this.state.marker.markerLong !== 0) && id !== 0) {
      
          var farmName = document.getElementById("farmName").value;
          var country = document.getElementById("country").value;
      
      
          axios
            .post('http://localhost:8000/createfarm/', {
              name: farmName,
              country: country,
              latitude: this.state.marker.markerLat,
              longitude: this.state.marker.markerLong,
              owner: id
            })
            .then(response => {
              console.log(response);
              this.handleToDashboard();
            })
            .catch(error => {
              console.log(error);
              alert(error.response.data.message);
            });
        } else {
          alert("Please select a location on the map");
        }
      }

      getUser(email) {
        return axios
          .get('http://localhost:8000/getuserbyemail/' + email + '/')
          .then(response => {
            return response.data.id;
          })
          .catch(error => {
            console.log(error);
            return 0;
          });
      }
    
    render() {

        return (
         
            <div id='landingContainer' className='screen'>

            <main id='landingCard'>

                <img src={require('../../resources/img/logo.png')} alt="agrosense logo"/>

                <form id="userInfo" className="hidden" onSubmit={this.handleNext}> 

                    <h2>Create your account</h2>

                    <label htmlFor="Name">Name</label><br/>
                    <input onChange={this.checkAccountComplete} required type="text" id="createName" name="Name"/><br/>

                    <label htmlFor="email">Email</label><br/>
                    <input onChange={this.checkAccountComplete} required type="email" id="createEmail" name="email"/><br/>

                    <label htmlFor="pwd">Password</label><br/>
                    <input onChange={this.checkAccountComplete} required type="password" id="createPwd" name="pwd"/><br/>

                    <input id="accountNext" type="submit" value="Next" />

                    <p>Already have an account?<span onClick={this.toLogin}>Login</span></p>

                </form>

                <form id="farmInfo" className="hidden" onSubmit={this.handleFarmInfo}> 

                    <h2>Details about your farm</h2>

                    <label htmlFor="farmName">Farm Name</label><br/>
                    <input required type="text" id="farmName" name="farmName"/><br/>

                    <label htmlFor="country">Country</label><br/>
                    <CountrySelect id='farmCountry' changeMap={this.changeMap}></CountrySelect>

                    <span id="mapPrompt" className='hidden'>Please click on the map to set a marker for your farm</span>

                    <input id="farmNext" type="submit" value="Next" />

                    <p>Already have an account?<span onClick={this.toLogin}>Login</span></p>

                </form>

                <form id="userLogin" onSubmit={this.handleLogin}> 

                    <h2>Dashboard Login</h2>

                    <p id='errorMessage'></p>

                    <label htmlFor="loginEmail">Email</label><br/>
                    <input onChange={this.checkAccountComplete} required type="email" id="loginEmail" name="loginEmail"/><br/>

                    <label htmlFor="loginPwd">Password</label><br/>
                    <input onChange={this.checkAccountComplete} required type="password" id="loginPwd" name="loginPwd"/><br/>

                    <input id="loginInBtn" type="submit" value="Login"/>

                    <p>Need to create an account?<span onClick={this.toRegister}>Register</span></p>

            </form>

            </main>

            <aside>
                <div className="hidden" id='mapContainer'>
                <Map markerPosition={{lat: this.state.marker.markerLat, lng: this.state.marker.markerLong}} onClick={this.handleMapClick} center={{ lat: this.state.country.countryLat, lng: this.state.country.countryLong }}></Map>
                </div>
            </aside>

            </div>

        );

    }

}

export default Landing;