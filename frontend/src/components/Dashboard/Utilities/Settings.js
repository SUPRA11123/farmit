import React from "react";

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.changeTheme = this.changeTheme.bind(this);
    }

    componentDidMount() {
        if(localStorage.getItem("darkMode") === "true") {
            document.getElementById("themeSelector").checked = true;
            this.addTheme();
        }
    }

    changeTheme() {

        
        //document.querySelector('#navContainer').classList.add('hidden');
        //document.getElementById('navContainer')
        //document.getElementById('navContainer').classList.toggle('smallNav');

        const themeSelector = document.querySelector('#themeSelector');
        this.props.changeTheme(themeSelector.checked);

        if(themeSelector.checked) {

            if (document.getElementById('navContainer').classList.contains('smallNav')) {
                
                
                localStorage.setItem("darkMode", true);
            } else {
                localStorage.setItem("darkMode", true);
            }
            
       
          
        } else {

            localStorage.setItem("darkMode", false);
        }
        document.getElementById('navContainer').classList.add('smallNav');
    }

    addTheme() {
       // document.getElementById('settingsContainer').classList.add('darkMode');
       // document.getElementById('utilityContainer').classList.add('darkModeBG');
        //document.getElementById('navContainer').classList.add('darkMode');


    }

    removeTheme() {
        document.getElementById('settingsContainer').classList.remove('darkMode');
        document.getElementById('utilityContainer').classList.remove('darkModeBG');
        //document.getElementById('navContainer').classList.remove('darkMode');
    }

  

    render() {

        return (
            <>
            <section id="settingsContainer" className={`settingsContainer ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
               
                <h2>My Profile</h2>
                <hr></hr>
                <p>Name: {this.props.user.name}</p>
                <p>Farm: {this.props.farmDetails.name}</p>
                <p>Email: {this.props.user.email}</p>

                <h2>General</h2>
                <hr></hr>
                <label className="toggle">
                    <span className="toggle-label">Dark Mode: </span>
                    <input id="themeSelector" onChange={this.changeTheme} className="toggle-checkbox" type="checkbox"/>
                    <div className="toggle-switch"></div>
                </label>
            </section>

            </>
            
        )
    }
}

export default Settings;