/* VARIABLES */

$font1: 'Inter', sans-serif;
$green: #0ba837;
$lightGreen: #BAECB8;
$grey: #f4f4f4;
$darkGrey: #8D8D8D;
$red: #C44940;
$blue: #4079c4;
$lightBlue: #D0DDFF;

/* MIXINS */

@mixin theme($theme: centreAbs) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.hidden {
    visibility: hidden;
}


body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: $font1;
}

/* Global classes */

.screen {
    position: absolute;
    width: 100vw;
    height: 100vh;
}

/* Landing styles */

#landingContainer {

    background-color: $green;

    aside {
        position: absolute;
        right: 0;
        width: 60%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        #mapContainer {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 100%;
        }
    }
}

#landingCard {
    position: absolute;
    left: 0;
    height: 100%;
    width: 40%;
    color: black;
    font-family: $font1;
    overflow: hidden;
    background-color: white;

    img {
        position: absolute;
        width: 50%;
        left: 25%;
        top: 15%;
    }

    h2 {
        font-size: 2.5vh;
        margin-top: 25%;
        margin-bottom: 10%;
        text-align: center;
    }

    form {
        position: absolute;
        width: 60%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        p { 
            text-align: center;
            color: #0AA837;
            cursor: pointer;
        }

        p :hover {
            text-decoration: underline;
        }

       label {
        font-size: 2vh;
        margin-top: 10%;
       }

        input[type=email], input[type=password], input[type=text], select  {
            width: 100%;
            font-size: 2vh;
            padding: 12px 20px;
            margin-top: 2.5%;
            margin-bottom: 5%;
            box-sizing: border-box;
            border-radius: 5px;
        }

        input[type=text]:focus{
           border: 1px solid $green;
        }

        .submitActive {
            background-color: $green;
            color: white;
        }

        input[type=submit] {
            width: 100%;
            font-size: 2vh;
            padding: 2.5%;
            font-family: $font1;
            border: none;
            border-radius: 5px;
            margin-top: 5%;
            cursor: pointer;
        }

        #errorMessage {
            color: $red;
        }   
    }
}

#mapPrompt {
    text-align: center;
}

/* Main styles */

#loadingIcon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5vh;
    color: $green;
}

#navContainerMobile {
    display: none;
}

.navContainer {
    position: absolute;
    height: 100%;
    width: 15%;
    background-color: #f4f4f4;
    transition: width 1s;
    z-index: 200;
   
    .navTop {
        position: relative;
        width: 100%;
        height: 20%;
        display: flex;
        align-items: center;
        justify-content: center;
    }


    #toggleNavMenu {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 2.5vh;
        background-color: rgb(177, 175, 175);
        padding: 5px;
        color: white;
        border-radius: 0 0 0 5px;
        transition: 0.5s;
    }


    #toggleNavMenu:hover {
        background-color: $green;
        color: white;
        cursor: pointer;
    }

    #mobileNavBtn {
        display: none;
    }

    nav {
        position:relative;
        height: 50%;
        width: 100%;
    }

    ul {
        -webkit-user-select: none;    
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-family: $font1;
        padding: 0;
        display: flex;
        flex-direction: column;
        list-style-type: none;
        color: $darkGrey;

        li {
            display: flex;
            align-items: center;
            justify-content: right;
            flex-direction: row;
            padding: 5% 0 5% 0;
            white-space:nowrap;

        }

        li p {
            font-size: 2vh;
            margin-left: 10%;
           
        }

        li:hover {
            cursor: pointer;
            background-color: $green;
            color: white;
            transition: 0.25s;
            i {color: white;}
        }

        li i {
            margin: 5% 15% 5% 5%;
            font-size: 3vh;
        }

    }

    #logout {
        position: absolute;
        bottom: -50%;
        width: 100%;
        color: rgb(177, 175, 175);


        i {
            -moz-transform: scale(-1, 1);
            -webkit-transform: scale(-1, 1);
            -o-transform: scale(-1, 1);
            -ms-transform: scale(-1, 1);
            transform: scale(-1, 1);
        }
     }
 
     #logout:hover {
         color: $red;
         background-color: unset;
     }

}

.navLogoImg {
    width: 40%;
    cursor: pointer;
}

.smallNav {

    width: 5%;

    img {
        transition: 1s;
        width: 60%;
    }

    img {transition-delay: 0.5;}
    #toggleNavMenu {transform: rotate(180deg);border-radius: 0 5px 0 0;}
}

@keyframes ripple{
    0% { transform: scale(1); }
    50% { transform: scale(1.3); opacity:1; }
    100% { transform: scale(1.6); opacity:0; }
  }


.navActive {
    color: $green;
    box-shadow: inset 5px 0px 0px 0px $green;

    i {color: $green;}
}


.settingsActive {color: $green;}

.utilityContainer {
    font-family: $font1;
    position: absolute;
    width: 85%;
    height: 100%;
    left: 15%;
    transition: all 1s, background-color 1ms;
    overflow: scroll;
}

.utilityContainer::-webkit-scrollbar{
    display: none;
}

.expandedUtility {
    width: 95%;
    left: 5%;

    #homeMap::before {
        width: 90%;
        left: 7.5%;
    }
}

@keyframes slideInFromLeft {
    0% {
      transform: translateX(-5%);
    }
    100% {
      transform: translateX(0);
    }
  }


#centreToMap {
    position: absolute;
    top: 12%;
    left: 2%;
    z-index: 1;
    font-size: 2.5vh;
    color: $darkGrey;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}

#centreToMap:hover {
    background-color: $green;
    color: white;
}

.notification-container {
    position: relative;
    display: inline-block;
  }
  
  .notification {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: $red;
    color: white;
    border-radius: 50%;
    height: 20px;
    width: 20px;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
  }

.alertContainer {
    position: absolute;
    z-index: 99;
    right: 10px;
    width: 7.5%;
    height: 10%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    i {
        font-size: 3vh;
        color: $darkGrey;       
        border-radius: 5px;
        padding: 5px;
        background-color: $grey;
        border: 1px solid #D9D9D9;
    }

    i:hover {
        cursor: pointer;
        color: $green;
    }
}

.alertMenu {
    position: fixed;
    z-index: 5;
    height: 70%;
    width: 30%;
    right: 2%;
    top: 2.5%;
    background: $grey;
    border-radius: 15px;
    backdrop-filter: none;
    overflow: scroll;

    h2 {
        display: flex;
        align-items: center;
        justify-content: left;
        margin-left: 5%;
        height: 10%;
        font-size: 2.5vh;
        color: $darkGrey;
        i { color: $green; margin-right: 2.5%;}
    }

    .alertsContainer {
        position: absolute;
        top: 15%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .alertCard {
            position: relative;
            width: 85%;
            height: auto;
            border-radius: 5px;
            background-color: white;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
            margin-right: 10px;

            h2 {
                font-size: 2vh;
                margin-left: 0;
                margin-right: 5px;
                width: 90%;
            }

            i {
                width: 10%;
                margin: 5%;
                font-size: 5vh;
                color: $red;
            }

        } 
    }

    #clearAllAlerts {
        position: relative;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        font-family: $font1;
        cursor: pointer;
        margin-bottom: 5%;
        margin-top: 2.5%;
        border: 2px solid $darkGrey;
        color: $darkGrey;
        background-color: unset;
    }

    #clearAllAlerts:hover {
        color: $red;
        border: 2px solid $red;
    }

    #addNewAlert {
        display: none;
        position: fixed;
        top: 75%;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        font-family: $font1;
        cursor: pointer;
    }

    .alertCardAnimation {
        opacity: 0; 
        animation: fadeIn 0.5s ease-in-out forwards;
        animation-delay: 0.5s; 
      }
      
      @keyframes fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
}

.alertMenuAnimation {
    animation: expandAlertMenu 0.5s ease forwards;
}

@keyframes expandAlertMenu {
    0% {
      height: 0;
      width: 0;
    }
    100% {
        height: 70%;
        width: 45%;
    }
  }

.blurBox {
    position: fixed;
    z-index: 200;
    height: 100%;
    width: 100%;
    backdrop-filter: blur(4px);
    
}



#scrollUtility {
    position: absolute;
    width: 95%;
    height: 97.5%;
    left: 2.5%;
    top: 2.5%;
    font-family: $font1;
}


#weatherWidget:hover {
    background-color: $lightBlue;
    cursor: pointer;
    border: 1px solid white;
}

.homeBackground {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    height: 17.5%;
    top: 0;
    
 //background-image: url("https://img.freepik.com/free-photo/harvested-grain-field-captured-sunny-day-with-some-clouds_181624-44956.jpg?w=1800&t=st=1684370902~exp=1684371502~hmac=cb72f01976942c7d753cb16fb4eb547d09496bfa64056cf06a7893905dc92a1f");
    background-size: cover;
    background-position: 50%;
    border-radius: 5px;

    h1 {
        margin: 0;
        font-family: $font1;
        font-size: 4vh;
        color: $green;
        font-weight: bold;
        margin-bottom: 5px;
    }

    p {
        margin: 0;
        font-family: $font1;
        font-size: 2vh;;
    }
}

.Col2Card {
    position: absolute;
    top: 20%;
    left: 0%;
    width: 30%;
    height: 35%;
    background-color: $grey;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $darkGrey;

    #widgetPin {
        color: $red;
    }

    #widgetHumidity i {
        color: $blue;
    }

    #wigetClouds {
        text-transform: capitalize;
    }

    h1 {
        color: black;
        font-size: 5vh;
        margin: 0;
        font-weight: normal;
    }

    .weatherWigetTop, .weatherWigetBottom {
        position: absolute;
        width: 100%;
        height: 10%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      
    }

    .weatherWigetBottom {bottom: 10%;}
    .weatherWigetTop {top: 0}
    
}

.col4Card {
    position: absolute;
    height: 35%;
    width: 67.5%;
    right: 0%;
    top: 20%;
    border-radius: 15px;
    background-color: $grey;


    p {
        margin: 0;
        width: 100%;
        text-align: center;
        margin-top: 10px;
        color: $darkGrey;
    }

    #homeChart {
        width: 90% !important;
        margin-left: 5%;
        margin-top: 2.5%;
    }
}

.col4Card:hover {
    background-color: $lightBlue;
    cursor: pointer;
    border: 1px solid white;
}


#homeMap::before {
    content: '';
    position: fixed;
    left: 17.5%;
    top: 60%;
    width: 80%;
    height: 40%;
    background-color: $grey;
    border-radius: 15px;
    transition: all 1s, border 1ms, background-color 1ms;
}

#homeMap {
    position: absolute;
    width: 95%;
    left: 2.5%;
    height: 35%;
    top: 62.5%;
    border-radius: 15px;
    cursor: pointer;
}

#homeMap:hover::before {
    background-color: $lightBlue;
    border: 1px solid white;
  }


.lineChartContainer {
    position: absolute;
    border-radius: 5px;
    top: 25%;
    width: 100%;
    height: 70%;
    font-family: $font1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    background-color: $grey;

    select {
        font-size: 2.5vh;
        font-family: $font1;
        background-color: $grey;
        border-radius: 5px;
        color: #3d3d3d;
        margin-bottom: 5px;
    }

    h2 {
        font-size: 1.5vw;
        color: rgb(177, 175, 175);
    }

    #myChart {
        
    }
}

.weatherCityContainer {
    position: relative;
    top: 0%;
    height: 10%;
    width: 75%;
    left: 0%;
    margin-bottom: 2%;
    background-color: $grey;
    border-radius: 5px;
    color: $green;
    font-size: 2vh;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
        font-size: 6vh;
        margin-left: 2.5%;
    }

    ul {
        margin-right: 2.5%;
        list-style: none;
        color: black;
    }
}

.weatheDataContainer  {
    position: absolute;
    top: 12.5%;
    width: 100%;
    display: flex;
    flex-direction: row;

    div {
        width: 25%;
        margin: 0 5px 0 5px;
        border-radius: 5px;
        border: 2px solid $grey;

        h2 {
            color: $darkGrey;
            font-weight: normal;
            font-size: 1vw;
            margin-left: 5%;
        }
        
        p {
            color: #3d3d3d;
            text-align: center;
            font-weight: bold;
            font-size: 1.5vw;
            margin: 2.5% 0 2.5% 0;
        }

       
    }
    #sunsetSunrise {
        width: 25%;
        i {color: $darkGrey;}
    }
}

.daySelector {
    position: relative;
    width: 95%;
    list-style: none;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-left: 0;
    gap: 25px;
    border-radius: 15px;

    h2 {
        color: $darkGrey;
        font-size: 1vw;
        position: absolute;
        top: 0;
        text-align: center;
        width: 100%;
    }  

    li {
        width: 25%;
    }

    li button {
        font-family: $font1;
        background-color: unset;
        font-size: 1.5vw;
        border-radius: 5px;
        padding: 10px;
        color: $darkGrey;
        border: 2px solid $darkGrey;
        width: 100%;
        span {
            color: $green;
            font-weight: bold;
        }
    }

    li button:hover {
        cursor: pointer;
        background-color: $green;
        color: white;
        span {color: white;}
        
    }

    .daySelectorActive {
        border: 2px solid $green;
        color: $green;
    }
    
}

.fieldsTableConatiner::-webkit-scrollbar{
    display: none;
}

.fieldsTableConatiner {
    position: absolute;
    width: 45%;
    right: 0;
    top: 10%;
    height: 85%;
    font-family: $font1;
    border-radius: 15px;
    border: 2px solid #D9D9D9;
    overflow-y: scroll;
    overflow-x: visible;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;

    #createField {
        top: 0;
        width: 100%;
        height: 100%;
        background-color: $grey;
        border-radius: 25px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-family: $font1;


        label {
            font-size: 2.5vh;
            text-align: left;
            
        }

        input {
            margin: 5px;
            font-size: 2.5vh;
        }

    }

    #loginInBtn {
        margin: 5% 0 0 0;
        border: 1px solid $darkGrey;
        background-color: white;
        border-radius: 5px;
        font-size: 2vh;
    }

    #centreToMap {
        width: 20%;
        position: relative;
        margin-bottom: 2.5%;
  
    }

    .fieldsTableBtn {
        border: none;
        background-color: transparent;
        border-radius: 5px;
        font-size: 2.5vh;
        bottom: 2.5%;
        width: 100%;
        padding: 2.5% 0 2.5% 0;
        
    }

    .fieldsTableBtn:hover {
        cursor: pointer;
        background-color: $green;
        color: white;
    }

    .fieldsTable tbody tr:hover {
        background-color: $green /* Change this to the desired hover color */
    }

    #cancelNewField {
        position: absolute;
        height: 10%;
        bottom: 0;
        z-index: 69;
    }

    #addFieldsHeader {
        position: absolute;
        font-size: 2.5vh;
        z-index: 0;
        color: black;
        height: 15%;
        width: 90%;
        left: 5%;
        top: 15%;
        text-align: center;
    }
}

.fieldsTable {
    font-family: $font1;
    width: 100%;
    background-color: #F4F4F4;
    border-collapse: collapse;
    position: relative;
    top: 0;
    border-radius: 15px 15px 0 0;
  
    th h2 {
      position: relative;
      text-align: left;
      border-radius: 25px;
      margin: 15%;
      font-size: 2.5vh;
      font-weight: bold;
    }
  
    thead tr {
   
        border-radius: 25px;
        border-bottom: 2px solid #D9D9D9;
    }
  
    tbody tr:nth-child(odd) {
      background-color: white;
    }
  
  
    tbody tr { 
        line-height: 50px; 
        td:last-child {
            width: 50px;
          }
    }

  
    tbody tr td span {
      margin-left: 15%;
      font-size: 2vh;
    }

    tbody tr:hover {
        background-color: $green;
        color: white;
       
      }

    i {
       font-size: 2.5vh;
       padding-right: 10px;
  
      }
  
    tbody tr:hover {
      cursor: pointer;
      background-color: $lightBlue;
    }

  }
  

#createField {
    position: absolute;
    width: 100%;
    height: 70%;
    top: 25%;
    left: 0;
   
}

#map{
    position: relative;
    top: 10%;
    height: 85%;
    width: 52.5%;
    border-radius: 15px;
 }

 #add{
 
    position: absolute;
    width: 100%;
    text-align: center;

 }

 #div{
   
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translate(-50%, -50%);
 }

 #googleSignIn {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
}

//TEAM STYLES

.teamNav {
    position: absolute;
    width: 100%;
    height: 10%;
    display: flex;
    align-items: center;
}

.teamNavBtn {
    font-family: $font1;
    font-size: 2.5vh;
    background-color: unset;
    margin: 5px;
    color: $darkGrey;
    cursor: pointer;
    background-color: $grey;
    border: 1px solid $darkGrey;
    border-radius: 5px;
}

.manageBtnActive {
    background-color: $green;
    color: white;
}

#taskBoard {
    position: absolute;
    width: 100%;
    height: 90%;
    top: 10%;
    border-radius: 15px;
    display: flex;
    flex-direction: row;
  

    .taskColumn:hover > h2 {
        color: $green;
    }

    .taskContainer::-webkit-scrollbar{
        display: none;
      }

    .taskColumn {
        
        position: relative;
        width: 33%;
        height: 100%;
        border-radius: 15px 15px 0 0;
        margin-right: 10px;
        margin-top: 0;
        background-color: #D9D9D9;

        h2 {
            position: absolute;
            width: 100%;
            font-size: 2.5vh;
            font-family: $font1;
            font-weight: bold;
            color: #3d3d3d;
            margin: 0;
            z-index: 5;
            padding: 2.5% 0 2.5% 0;
            background-color: $grey;
            border-radius: 15px 15px 0 0;
            text-align: center;
        }

        #addNewTask {
            position: absolute;
            font-size: 2.5vh;
            right: 5%;
            color: white;
            cursor: pointer;
            background-color: $green;
            border-radius: 5px;
            border: none;
        }

        #addNewTask:hover {
            background-color: $green;
            color: white;
        }

        .taskContainer {
            scrollbar-width: none;
            position: absolute;
            width: 100%;
            height: 95%;
            top: 5%;
            overflow-y: scroll;
            border-radius: 15px;
            margin: 5px;
            margin-top: 0;
        }

        .taskContainer:first-child {
            margin-top: 10%;
            background-color: red;
        }

        .taskCard::-webkit-scrollbar{
            display: none;
          }

        .taskCard {
            position: relative;
            height: auto;
            width: 90%;
            margin: 5%;
            border-radius: 5px;
            background-color: white;
            padding-bottom: 5%;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            

            h3 {
                padding-top: 5%;
                margin: 10px;
                font-size: 2vh;
            }

            span {
                margin: 10px;
                padding-bottom: 2.5%;
                font-size: 1.75vh;
                color: $darkGrey;
                
            }

            p {
                margin: 10px;
                font-size: 1.75vh;
                color: $green;
                margin-bottom: 7.5%;
            }

            .taskSettings {
                font-size: 2.5vh;
                position: absolute;
                right: 5%;
                top: 10%;
                color: $darkGrey;
                cursor: pointer;
            }

        }
    }
}

#taskOverlay{z-index: 199;}

.overlayDarken {
    position: fixed;
    top: 0;
    left: 0;
    height: 110%;
    width: 110%;
    z-index: 1;
    background: rgba(0,0,0,0.2);
    backdrop-filter: blur(0);
    
}

.overlayDarkenAnimation {
    animation: blurAnimation 1s ease forwards;
}

@keyframes blurAnimation {
    0% {
      backdrop-filter: blur(0);
      background: rgba(0,0,0,0);
    }
    100% {
      backdrop-filter: blur(2px);
      background: rgba(0,0,0,0.2);
    }
  }

#addTask {
    position: absolute;
    z-index: 300;
    width: 50%;
    height: fit-content;
    top: 10%;
    left: 25%;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: white;
    backdrop-filter: none;
    color: $darkGrey;
    border: 2px solid $darkGrey;
    padding-bottom: 2.5%;

    hr {
        margin: 0;
        width: 100%;
        height: 2px;
        border: none;
        background-color: $darkGrey;
    }

    h2 {
        i{color: $green; margin-right: 10px;}
        color: black;
        font-size: 2.5vh;
        width: 100%;
        text-align: center;
        #taskCancel {
            position: absolute;
            right: 2.5%;
            color: black;
            cursor: pointer;
        }
    }

    input, select, button {
        width: 60%;
        font-family: $font1;
     
    }

    button {
        margin: 25px;
        font-size: 2.5vh;
    }

    label {
        font-size: 2vh;
        margin: 5px;
        margin-top: 2.5%;
        width: 60%;
        text-align: left;
    }

    #taskSubmit {
        background-color: $green;
        color: white;
        border: none;
        width: auto;
        padding: 5px;
        font-size: 2.5vh;
        border-radius: 5px;
        margin-top: 5%;
        cursor: pointer;
    }
}

#addTeamMember {
    position: absolute;
    width: 50%;
    height: fit-content;
    left: 25%;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    color: $darkGrey;
    z-index: 202;
    border: 2px solid $darkGrey;

    h2 {
        color: black;
        font-size: 2.5vh;
        i{color: $green; margin-right: 10px;}
    }

    hr {
        height: 2px;
        background-color: $darkGrey;
        border: none;
        width: 100%;
    }

    input, select, button {
        width: 60%;
        font-size: 2.5vh;
    }

    button {
        margin: 25px;
    }

    label {
        margin: 5px;
        width: 60%;
        text-align: left;
        
    }

    #teamCancel {
        position: absolute;
        right: 5%;
        font-size: 3vh;
        color: black;
        cursor: pointer;
    }

    #addMember {
        background-color: #0ba837;
        color: white;
        border: none;
        width: auto;
        padding: 5px;
        font-size: 2.5vh;
        border-radius: 5px;
        margin-top: 10%;
        cursor: pointer;
    }

}

#editTeamMember {
    position: absolute;
    width: 50%;
    height: fit-content;
    left: 25%;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    color: $darkGrey;
    z-index: 202;
    border: 2px solid $darkGrey;

    h2 {
        color: black;
        font-size: 2.5vh;
        i{color: $green; margin-right: 10px;}
    }

    hr {
        height: 2px;
        background-color: $darkGrey;
        border: none;
        width: 100%;
    }

    input, select, button {
        width: 60%;
        font-size: 2.5vh;
    }

    button {
        margin: 25px;
    }

    label {
        margin: 5px;
        width: 60%;
        text-align: left;
        
    }

    #editMemberCancel {
        position: absolute;
        right: 5%;
        font-size: 3vh;
        color: black;
        cursor: pointer;
    }

    #editMember {
        background-color: #0ba837;
        color: white;
        border: none;
        width: auto;
        padding: 5px;
        font-size: 2.5vh;
        border-radius: 5px;
        margin-top: 10%;
        cursor: pointer;
    }

}

#teamOverlay {
    z-index: 199;
}

.modalBackground {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    backdrop-filter: blur(4px); /* Apply a blur effect to the background */
  }

  .modalContainer {
    height: 50%;
    border-radius: 12px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    display: flex;
    flex-direction: column;
    padding: 25px;
    position: fixed;
    top: 55%;
    left: 50%;
    z-index: 4000; /* Set a higher z-index to ensure the modal appears above the blurred background */
  }

  .modalContainer .title {
    position: absolute;
    top: 2%;
  }

  .titleCloseBtn {
    display: flex;
    justify-content: flex-end;
  }

  .titleCloseBtn button {
    background-color: transparent;
    border: none;
    font-size: 25px;
    cursor: pointer;
  }

  .modalContainer .body {
  flex: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.7rem;
  text-align: center;
}

.highlighted {
    background-color: yellow; /* Customize the highlighting style as desired */
  }


  .delete-container .delete-button {
    display: none;
  }
  
  .delete-container:hover .delete-button {
    display:inline-flex;
    
  }

  .delete-container:hover :not(.delete-button) {
    display: none;
  }

  .delete-button {
    align-items: center;
    justify-content: center;
    border: none;
    z-index: 300;
    background: $red;
    color: white;
    cursor: pointer;
    margin: 0;
    padding: 5px;
    border-radius: 5px;
  }

  .edit-button{
    align-items: center;
    justify-content: center;
    border: none;
    z-index: 300;
    background: $blue;
    color: white;
    cursor: pointer;
    margin: 0;
    padding: 5px;
    border-radius: 5px;
  }

#teamContainer {
    position: absolute;
    width: 100%;
    height: 85%;
    top: 10%;
    background-color: $grey;
    border-radius: 15px;
    display: block;
    border: 2px solid #D9D9D9;

    h2 {
        font-size: 2.5vh;
        font-family: "Inter", sans-serif;
        color: #3d3d3d;
        margin: 2.5%;
        width: 95%;
        padding-bottom: 2.5%;
        border-bottom: 1px solid black;
    }


    #addNewMember {

   
        right: 2.5%;
        color: $green;
        cursor: pointer;
        background-color: $green;
        color: white;
        border-radius: 5px;
        font-size: 3vh;
        border: none;
    }

    #addNewMember:hover {
        color: $green;
        cursor: pointer;
    }

    #teamTable {
        position: absolute;
        top: 2.5%;
        width: 100%;
        border-radius: 5px;
        border-collapse: collapse;
        font-family: $font1;

        thead {
            text-align: left;
            border-bottom: 2px solid #D9D9D9;
            font-size: 2.5vh;
            background-color: $grey;
            th {padding-left: 5%; padding-bottom: 2.5%;}
        }

        tbody tr:hover {
            background-color: $green !important;
        }
        tbody tr td:last-child {
            width: 50px; /* Adjust the width as needed */
          }
        tbody tr td {
            font-size: 2vh;
            padding-left: 5%;
            width: 50px;
        }

        tbody tr:nth-child(odd) {
            background-color: white;
          }
        
        
        tbody tr { line-height: 50px; margin-left: 5%; }
    }
}

.modalBackground {
    z-index: 2000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(4px); /* Apply a blur effect to the background */
  }

  .modalContainer {
    width: 80%;
    height: 80%;
    border-radius: 12px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    display: flex;
    flex-direction: column;
    padding: 25px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2; /* Set a higher z-index to ensure the modal appears above the blurred background */
  }

  .modalContainer .title {
    position: absolute;
    top: 2%;
  }

  .titleCloseBtn {
    display: flex;
    justify-content: flex-end;
  }

  .titleCloseBtn button {
    background-color: transparent;
    border: none;
    font-size: 25px;
    cursor: pointer;
  }

  .modalContainer .body {
  flex: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.7rem;
  text-align: center;
}

.title2{
    font-size: 2.5vh;
    font-family: "Inter", sans-serif;
    color: #3d3d3d;
    width: 95%;
    border-bottom: 1px solid black;
    text-align: center;
}

.highlighted {
    background-color: $blue; /* Customize the highlighting style as desired */
}

//PREDICTIONS STYLES

.imageInput {
    position: absolute;
    left: 0;
    top: 10%;
    height: 75%;
    width: 47.5%;
    border: 2px solid #D9D9D9;
    border-radius: 15px;


    h2 {
        font-size: 2.5vh;
        font-family: $font1;
        width: 100%;
        text-align: center;
    }


}

.imageOutput {
    position: absolute;
    top: 10%;
    right: 0;
    height: 75%;
    width: 47.5%;
    border: 2px solid #D9D9D9;
    border-radius: 25px;

    h2 {
        font-size: 2.5vh;
        font-family: $font1;
        width: 100%;
        text-align: center;
    }
}

.predictionsBtns {
    position: absolute;
    width: 100%;
    height: 10%;
    bottom: 2.5%;
    display: flex;
    align-items: center;
    justify-content: center;

    #uploadImgs {
        position: absolute;
        left: 0;
        cursor: pointer;
        font-size: 2.5vh;
        font-family: $font1;
        border: none;
        background-color: $grey;
        color: black;
        border-radius: 5px;
        padding: 10px 20px;

        input[type="file"] {
            display: none;
        }

    }

    #uploadImgs:hover, #downloadImgs:hover {
        color: $green;
    }

    #processImgs {

        cursor: pointer;
        font-size: 2.5vh;
        font-family: $font1;
        border: none;
        background-color: $green;
        color: white;
        border-radius: 5px;
        padding: 10px 20px;

    }

    #downloadImgs {
        position: absolute;
        right: 0;
        cursor: pointer;
        font-size: 2.5vh;
        font-family: $font1;
        border: none;
        background-color: $grey;
        color: black;
        border-radius: 5px;
        padding: 10px 20px;
    }
    
}

.largePreview {
    width: 60%;
    margin-left: 20%;
    margin-top: 5%;
    max-height: 300px;
    object-fit:cover;
    border-radius: 15px;
  }

  .imageDate {
    width: 100%;
    text-align: center;
    font-family: $font1;
    font-size: 2vh;
  }

  .thumbnailContainer::-webkit-scrollbar {
    height: 4px;
    background: white;
  }
  
  .thumbnailContainer::-webkit-scrollbar-thumb:horizontal {
    margin-top: 5px;
    background: $green;
    border-radius: 10px;
    width: 5px;
  }
  
  
  .thumbnailContainer {
    position: absolute;
    bottom: 2.5%;
    width: 95%;
    left: 2.5%;
    height: 10%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    overflow-x: scroll;
    overflow-y: hidden;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    cursor: pointer;
    margin-bottom: 5%;
  }
  
  .thumbnail.selected {
    border: 2px solid $green;
  }

//SETTINGS STYLES

.settingsContainer {
    position: absolute;
    top: 0;
    z-index: 300;
    width: 100%;
    height: 95%;
    background-color: $grey;
    border-radius: 15px;

    .myProfileContainer {
        position: relative;
        width: 50%;
        height: 30%;
    }
    
    hr {width: 90%;}

    h2 { margin-top: 5%; margin-left: 5%;  font-size: 2.5vh;}

    p { margin-left: 5%; }

    .settingsBtn {
        color: black;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        cursor: pointer;
        background-color: #D9D9D9;
        margin-left: 5%;
        margin-top: 10px;
    }

    .settingsBtn:hover {
        color: $red;
    }

}

.tAndC {
    position: absolute;
    z-index: 302;
    width: 60%;
    height: 80%;
    left: 10%;
    padding: 5%;
    border-radius: 15px;
    background-color: $grey;
    overflow-y: scroll;
    h2 {width:100%;text-align:center;margin-top: 0;}
    h3,p {font-size: 2vh;}
}

.tAndC::-webkit-scrollbar{
    display: none;
}

.confirmLogout {
    position: absolute;
    z-index: 302;
    width: 40%;
    left: 20%;
    padding: 5%;
    border-radius: 15px;
    background-color: $grey;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h2 {
        margin-top: 0;
     
    }

    button {
        background-color: $red;
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        cursor: pointer;
    }

}

.confirmDelete {
    position: absolute;
    z-index: 302;
    width: 40%;
    left: 20%;
    padding: 5%;
    border-radius: 15px;
    background-color: $grey;

    h2 {
        margin-top: 0;
        width: 100%;
        text-align: center;
    }

    input {
        margin: 5% 0 5% 0;
        width: 90%;
        // center the input
        position: relative;
        left: 50%;
        transform: translate(-50%, 0);

        // make the input more beautiful
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        font-size: 16px;
        padding: 5px 0;
        text-align: center;
        outline: none;

    }

    #deleteAccount {
        background-color: #ff4136;
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        cursor: pointer;
        // place it on the middle of the screen
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);

    }
}

.cancelSettingsAction {
    position: absolute;
    right: 5%;
    top: 5%;
    font-size: 3vh;
    cursor: pointer;
}

.changePassword{
    position: absolute;
    z-index: 302;
    width: 40%;
    left: 20%;
    padding: 5%;
    border-radius: 15px;
    background-color: $grey;

    h2 {
        margin-top: 0;
    }


    input {
        margin: 5% 0 5% 0;
      // make input boxes, round boxes and clean/beautiful
        width: 90%;
        // center the input
        position: relative;
        left: 50%;
        transform: translate(-50%, 0);

        // make the input more beautiful
        border: none;
        border-bottom: 1px solid #000;
        background-color: transparent;
        font-size: 16px;
        padding: 5px 0;
        text-align: center;
        outline: none;

    }

    #changePassword{
        background-color: $green;
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 10px 20px;
        font-size: 2vh;
        cursor: pointer;
        // place it on the middle of the screen
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
    }

    .underline {
        text-decoration: underline;
      }

}

#languageSelector {
    font-size: 2vh;
}

  #settingsOverlay {
    z-index: 301;
  }

.toggle {
	cursor: pointer;
	display: inline-block;
    margin-left: 5%;
    margin-bottom: 10px;
    margin-top: 10px;
}

.toggle-switch {
	display: inline-block;
	background: #ccc;
	border-radius: 16px;
	width: 58px;
	height: 32px;
	position: relative;
	vertical-align: middle;
	transition: background 0.25s;
	&:before,
	&:after {
		content: "";
	}
	&:before {
		display: block;
		background: linear-gradient(to bottom, #fff 0%,#eee 100%);
		border-radius: 50%;
		box-shadow: 0 0 0 1px rgba(0,0,0,0.25);
		width: 24px;
		height: 24px;
		position: absolute;
		top: 4px;
		left: 4px;
		transition: left 0.25s;
	}
	.toggle:hover &:before {
		background: linear-gradient(to bottom, #fff 0%,#fff 100%);
		box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
	}
	.toggle-checkbox:checked + & {
		background: $green;
		&:before {
			left: 30px;
		}
	}
}
.toggle-checkbox {
	position: absolute;
	visibility: hidden;
}
.toggle-label {
	margin-left: 5px;
	position: relative;
	top: 2px;
}

.darkModeBG {
    background-color: #3d3d3d;
    h2, p {color: white !important;}
    #homeMap::before {
        background-color: #636363 !important;
    }
    
}

.darkMode {

    .taskColumnHeader, .settingsBtn {
        background-color: #2a2a2a !important;
    }

    .alertCard {
        background-color: #3d3d3d !important;
    }

    .taskCard {
        background-color: #3d3d3d !important;
        p {color: $green !important;}
    }
    
    background-color: #636363 !important;
    color: white !important;

    nav ul li, h2, h1, p, ul, button, input {
        color: white !important;
    }

    img {
        filter: brightness(0) invert(1);
    }

    thead {
        background-color: unset !important;
    }

    tbody tr:nth-child(odd) {
        background-color: #2a2a2a !important;
    }

    tbody tr:hover {
        background-color: $green;
        color: white;
    }

    .alertContainer i {
        background-color: unset !important;
    }

    #uploadImgs:hover {
        color: $green !important;
    }

    //{` ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}
}

.datePickerContainer {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  
  .datePicker {
    margin-right: 10px;
  }
  

.exportButton {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }
  
  .exportButton button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  
  

// MOBILE STYLES

@media only screen and (max-width: 600px) {

    //LANDING STYLES

    #landingContainer {
        aside {
            display: none;
        }
    }

    #landingCard {

        width: 100%;

        img {
            top: 5%;
        }

        #googleSignIn {
            transform: none;
            position: relative;
            left: 0;
            top: 0;
            width: 100%;
        }

    }




    // MAIN STYLES

    #navContainer {
        display: none;
    }
   
    #navContainerMobile {
        display: inline;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;

        #navTop {
            display: flex;
            align-items: center;
        }

        #navListMobile {
            position: absolute;
            height: 90%;
            top: 10%;
            width: 100%;
            z-index: 99;
            background-color: $grey;
        }

        #mobileNavBtn {
            color: white;
            font-size: 3vh;
            margin-left: 25px;
        }
       
        #navTop {
            height: 10%;
            background-color: $green;
            img {display: none;}
        }
        ul {
            -webkit-user-select: none;    
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            font-family: $font1;
            padding: 0;
            display: flex;
            flex-direction: column;
            list-style-type: none;
            color: $darkGrey;
            text-align: center;
    
            li p {
                font-size: 2.5vh;
                margin: 2.5%;
                margin-left: 10%;
                padding: 2.5% 0 2.5% 0;
            }
        }
        nav ul {
            margin-top: 0;
        }

        nav ul li{
            z-index: 20;
            background-color: white;
        }

        nav ul li p {
           margin-left: 5%;
        }

        #logout {
            width: 100%;
            position: relative;
        }
    }

    #utilityContainer {
        left: 0;
        top: 10%;
        width: 100%;
        overflow: hidden;
        background-color: white;
    }

    .fixedUtility {
        background-color: white;
        width: 95%;
        left: 2.5%;
        

        h2 {
            font-size: 3vh;
            margin-left: 2.5%;
        }

        p {
            margin-left: 2.5%;
        }
    }

    #scrollUtility {
        width: 100%;
        background-color: white;
        left: 0;
        top: 0;
    }

    //DASHBOARD STYLES

    #weatherWidget {
        width: 95%;
        left: 2.5%;
    }

    #alertWidget {
        top: 100%;
    }

    //WEATHER STYLES 

    .weatherCityContainer {
        top: 2.5%;
        width: 95%;
        left: 2.5%;
        background-color: $grey;
        color: $green;
    }

    .weatheDataContainer { 
        
        position: relative;
        top: 5%;
        width: 95%;
        left: 2.5%;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5px;

        div, #sunsetSunrise {
            width: 45%;
        }

        div h2, div p {
            font-size: 3vw;
        }


    }

    .lineChartContainer {
        position: relative;
        top: 5%;

        #myChart {
            top: 5%;
        }
    }

    .daySelector {
        position: relative;
        top: 25%;
        width: 95%;
        left: 2.5%;
        padding: 5% 0 5% 0;

        li button {
            font-size: 3vw;
        }

    
    }

  }