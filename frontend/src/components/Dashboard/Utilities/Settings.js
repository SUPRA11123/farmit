import axios from "axios";
import React from "react";

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.changeTheme = this.changeTheme.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("darkMode") === "true") {
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

        if (themeSelector.checked) {

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

    deleteAccount() {

        console.log(this.props.user.email);
        const confirmed = window.prompt("To confirm account deletion, please type your password.");


        if (confirmed) {

            // User clicked "OK"
            // print what he wrote in the prompt
            console.log("Account deletion confirmed:", confirmed);

            axios
                .delete("http://localhost:8000/deleteaccount/", {
                    data: {
                        email: this.props.user.email,
                        password: confirmed,
                    },
                })
                .then((response) => {
                    console.log(response);
                    localStorage.removeItem("token");
                    localStorage.removeItem("darkMode");
                    window.location.reload();
                })
                .catch((error) => {
                    console.log(error);
                });

        } else {
            // User clicked "Cancel" or closed the dialog
            console.log("Account deletion cancelled.");
        }
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
                        <input id="themeSelector" onChange={this.changeTheme} className="toggle-checkbox" type="checkbox" />
                        <div className="toggle-switch"></div>
                    </label>
                    <button className="delete-btn" onClick={this.deleteAccount}>Delete Account</button>
                </section>

            </>

        )
    }
}

export default Settings;