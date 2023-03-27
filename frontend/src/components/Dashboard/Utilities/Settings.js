import React from "react";

class Settings extends React.Component {

    handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("isAlreadyCalled");
        window.location.href = "/";
    }


    render() {
        return (

            <>
            <h1>Settings</h1>
            <button id="logoutBtn" onClick={this.handleLogout}>Logout</button> 
            </>
            
        )
    }
}

export default Settings;