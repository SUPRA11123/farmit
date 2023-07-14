import React from 'react';
import CountrySelect from './CountrySelect';
import Map from './Map';
import coordData from '../../resources/country-coord.json'
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

const URL = process.env.REACT_APP_URL;

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

    var language = localStorage.getItem("language") || "en";

    var languageText = {
      en: {

        //LOGIN SCREEN
        text1: "Dashboard Login",
        text2: "Email",
        text3: "Password",
        text4: "Login",
        text5: "Dont have an account?",
        text6: "Register",

        //REGISTER SCREEN
        text7: "Create your account",
        text8: "Name",
        text9: "Email",
        text10: "Password",
        text11: "Confirm Password",
        text12: "Next",
        text13: "Already have an account?",
        text14: "Login",
        text15: "Details about your farm",
        text16: "Farm name",
        text17: "Country",
        text18: "Please click on the map to set a marker for your farm",
        text19: "Submit",
        text20: "Passwords do not match",
        text21: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and no special characters",
        text22: "User already exists",
      },
      pt: {
        //LOGIN SCREEN
        text1: "Login no painel de controlo",
        text2: "E-mail",
        text3: "Palavra-passe",
        text4: "Iniciar Sessão",
        text5: "Não tem uma conta?",
        text6: "Registo",

        //REGISTER SCREEN
        text7: "Criar conta",
        text8: "Nome",
        text9: "E-Mail",
        text10: "Palavra-passe",
        text11: "Confirmar palavra-passe",
        text12: "Próximo",
        text13: "já tem uma conta?",
        text14: "Conecte-se",
        text15: "Detalhes sobre a sua quinta",
        text16: "Nome da quinta",
        text17: "País",
        text18: "Por favor, clique no mapa para definir um marcador para a sua quinta",
        text19: "Registar",
        text20: "As palavras-passe não coincidem.",
        text21: "A palavra-passe deve conter, pelo menos, uma letra maiúscula, uma letra minúscula, um dígito e não pode conter caracteres especiais.",
        text22: "O utilizador já existe",
      },
    };

    this.state = {
      country: {
        countryLat: 54,
        countryLong: -2
      },
      marker: {
        markerLat: 0,
        markerLong: 0
      },
      zoom: 5,
      textContent: languageText[language],
      
    };

  }
  
  componentDidMount() {
    window.addEventListener('beforeunload', this.handleUnload);
    window.addEventListener('unload', this.handleUnload);
  }
  
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('unload', this.handleUnload);
  }

 
  
  handleUnload = async () => {
    const farmInfoForm = document.getElementById('farmInfo');
    if (farmInfoForm && !farmInfoForm.classList.contains('hidden')) {
      const email = document.getElementById('createEmail').value;
      if (email) {
        await this.deleteUser(email);
      }
    }
  };
  deleteUser = async (email) => {
    try {
      await axios.delete(URL + "deleteuser/" + email + '/');
      console.log('User deleted successfully');
    } catch (error) {
      console.log(error);
    }
  };

  handleZoomChange = (newZoom) => {
    this.setState({ zoom: newZoom });
  };

  handleNext(event) {

    event.preventDefault();

    var name = document.getElementById("createName").value;
    var email = document.getElementById("createEmail").value;
    var password = document.getElementById("createPwd").value;

    var confirmPassword = document.getElementById("confirmPwd").value;

    if (password !== confirmPassword) {
      document.getElementById("errorMessageRegister").innerText = this.state.textContent.text20;
      document.getElementById("errorMessageRegister").classList.remove('hidden');
      return;
    }

    // get name and email from form
    axios.post(URL + 'signup/', {
      name: name,
      email: email,
      password: password,
      role: "owner"
    }).then(response => {
     
        console.log(response);
        document.getElementById("userInfo").classList.add("hidden");
        document.getElementById("farmInfo").classList.remove("hidden");
      
    }).catch(error => {

      console.log(error);

      if (error.response.data.errors.email === "user with this email already exists.") {
    
        document.getElementById("errorMessageRegister").innerText = this.state.textContent.text22;
        document.getElementById("errorMessageRegister").classList.remove('hidden');
      } else {
        document.getElementById("errorMessageRegister").innerText = this.state.textContent.text21;
        document.getElementById("errorMessageRegister").classList.remove('hidden');
      }
      // print the error but dont show the password

      console.log(error);

    });
  }

  handleToDashboard() {

    this.props.setStateOfParent("dashboardScreen");

  }

  toLogin() {

    document.getElementById("userInfo").classList.add("hidden");
    document.getElementById("farmInfo").classList.add("hidden");
    document.getElementById("userLogin").classList.remove("hidden");

  }

  toRegister() {

    document.getElementById("userInfo").classList.remove("hidden");
    document.getElementById("userLogin").classList.add("hidden");

  }

  changeMap() {

    var farmMap = document.getElementById("mapContainer");
    farmMap.classList.remove("hidden");
    document.getElementById('landingGraphic').classList.add('hidden');

    document.getElementById("mapPrompt").classList.remove("hidden");

    var farmCountry = document.getElementById("country");
    var countryCoords = coordData.filter(function (coordData) { return coordData.Country === farmCountry.value });

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
  
    this.setState(prevState => ({
      marker: {
        markerLat: lat,
        markerLong: lng
      },
      country: {
        countryLat: prevState.country.countryLat,
        countryLong: prevState.country.countryLong
      }
    }));
  
    if (document.getElementById("farmName").value) {
      document.getElementById("farmNext").classList.add("submitActive");
    } else {
      document.getElementById("farmNext").classList.remove("submitActive");
    }
  };
  

  checkAccountComplete() {

    if (document.getElementById("createName").value && document.getElementById("createEmail").value && document.getElementById("createPwd").value && document.getElementById("confirmPwd").value) {
      document.getElementById("accountNext").classList.add("submitActive");
    } else {
      document.getElementById("accountNext").classList.remove("submitActive");
    }

    if (document.getElementById("loginEmail").value && document.getElementById("loginPwd").value) {
      document.getElementById("loginInBtn").classList.add("submitActive");
    } else {
      document.getElementById("loginInBtn").classList.remove("submitActive");
    }


  }

  handleLogin(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPwd").value;


    axios.post(URL + 'signin/', {
      email: email,
      password: password
    })
      .then((response) => {
        console.log({ token: response.data.token });
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
    const password = document.getElementById("createPwd").value;

    const id = await this.getUser(email);

    if ((this.state.marker.markerLat !== 0 && this.state.marker.markerLong !== 0) && id !== 0) {

      var farmName = document.getElementById("farmName").value;
      var country = document.getElementById("country").value;

      axios
        .post(URL + 'createfarm/', {
          name: farmName,
          country: country,
          latitude: this.state.marker.markerLat,
          longitude: this.state.marker.markerLong,
          owner: id
        })
        .then(response => {
          console.log(response);

          axios.post(URL + 'signin/', {
            email: email,
            password: password
          })
            .then((response) => {
              console.log({ token: response.data.token });
              localStorage.setItem('token', response.data.token);
              this.handleToDashboard();
            })
            .catch((error) => {
              document.getElementById("errorMessage").innerHTML = error.response.data.message + ", please try again";
            });
        })
        .catch(error => {
          console.log(error);
          alert(error.response.data.message);
        });
    } else {
      return;
    }
  }

  getUser(email) {
    return axios
      .get(URL + 'getuserbyemail/' + email + '/')
      .then(response => {
        return response.data.id;
      })
      .catch(error => {
        console.log(error);
        return 0;
      });
  }

  async signInWithGoogle(email) {
    const user = await this.getUser(email);

    if (user !== 0) {

      axios.post(URL + 'signin/', {
        email: email,
      })
        .then((response) => {
          console.log({ token: response.data.token });
          localStorage.setItem('token', response.data.token);
          this.handleToDashboard();
        })
        .catch((error) => {
          document.getElementById("errorMessage").innerHTML = error.response.data.message + ", please try again";
        });


    } else {
      alert("User does not exist");
    }
  }  

  render() {

    return (

      <div id='landingContainer' className='screen'>

        <main id='landingCard'>

          <img src={require('../../resources/img/logo.png')} alt="agrosense logo" />


          <form id="userLogin" onSubmit={this.handleLogin}>

            <h2>{this.state.textContent.text1}</h2>

            <div id="googleSignIn">
              <GoogleLogin
                locale='en'
                uxMode="popup"
                uxLanguage="es"
                onSuccess={credentialResponse => {
                  var decoded = jwt_decode(credentialResponse.credential);
                  this.signInWithGoogle(decoded.email);
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
              />
            </div>

            <p id='errorMessage'></p>

            <label htmlFor="loginEmail">{this.state.textContent.text2}</label><br />
            <input onChange={this.checkAccountComplete} required type="email" id="loginEmail" name="loginEmail" /><br />

            <label htmlFor="loginPwd">{this.state.textContent.text3}</label><br />
            <input onChange={this.checkAccountComplete} required type="password" id="loginPwd" name="loginPwd" /><br />

            <input id="loginInBtn" type="submit" value={this.state.textContent.text4} />

            <p>{this.state.textContent.text5} <span onClick={this.toRegister}>{this.state.textContent.text6}</span></p>

          </form>

          <form id="userInfo" className="hidden" onSubmit={this.handleNext}>

            <h2>{this.state.textContent.text7}</h2>

            <label htmlFor="Name">{this.state.textContent.text8}</label><br />
            <input onChange={this.checkAccountComplete} required type="text" id="createName" name="Name" /><br />

            <label htmlFor="email">{this.state.textContent.text9}</label><br />
            <input onChange={this.checkAccountComplete} required type="email" id="createEmail" name="email" /><br />

            <label htmlFor="pwd">{this.state.textContent.text10}</label><br />
            <input onChange={this.checkAccountComplete} required type="password" id="createPwd" name="pwd" /><br />

            <label htmlFor="confirmPwd">{this.state.textContent.text11}</label><br />
            <input onChange={this.checkAccountComplete} required type="password" id="confirmPwd" name="confirmPwd" /><br />
            
            <input id="accountNext" type="submit" value={this.state.textContent.text12} />

            <p id='errorMessageRegister' style={{ color: '#C44940', fontWeight: 'bold' }} className='hidden'></p>

            <p>{this.state.textContent.text13} <span onClick={this.toLogin}>{this.state.textContent.text14}</span></p>

          </form>

          <form id="farmInfo" className="hidden" onSubmit={this.handleFarmInfo}>

            <h2>{this.state.textContent.text15}</h2>

            <label htmlFor="farmName">{this.state.textContent.text16}</label><br />
            <input required type="text" id="farmName" name="farmName" /><br />

            <label htmlFor="country">{this.state.textContent.text17}</label><br />
            <CountrySelect id='farmCountry' changeMap={this.changeMap}></CountrySelect>

            <span id="mapPrompt" className='hidden'>{this.state.textContent.text18}</span>

            <input id="farmNext" type="submit" value={this.state.textContent.text19} />

          </form>

        </main>

        <aside>

        <img id="landingGraphic" src={require('../../resources/img/vectorsmall.png')} alt="Agrosensor graphic" />

          <div className="hidden" id='mapContainer'>
            <Map zoom={this.state.zoom} markerPosition={{ lat: this.state.marker.markerLat, lng: this.state.marker.markerLong }} onClick={this.handleMapClick} center={{ lat: this.state.country.countryLat, lng: this.state.country.countryLong }} onZoomChange={this.handleZoomChange}></Map>
          </div>
        </aside>

      </div>

    );

  }

}

export default Landing;