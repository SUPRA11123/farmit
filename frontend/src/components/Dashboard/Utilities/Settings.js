import axios from "axios";
import React from "react";

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.changeTheme = this.changeTheme.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.changePassword = this.changePassword.bind(this);
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

    deleteAccount(event) {

        event.preventDefault();

        // get password from document get id
        const password = document.getElementById('settingsPassword').value;

        console.log(password);


        axios
            .delete("http://localhost:8000/deleteaccount/", {
                data: {
                    email: this.props.user.email,
                    password: password,
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
    }

    showDeleteForm() {
        document.getElementById("confirmDelete").reset();
        document.getElementById('confirmDelete').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.remove('hidden');
    }

    cancelDelete() {
        document.getElementById('confirmDelete').classList.add('hidden');
        document.getElementById('settingsOverlay').classList.add('hidden');
    }

    showChangePasswordForm() {
        document.getElementById("changePassword").reset();
        document.getElementById('changePassword').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.remove('hidden');
    }

    changePassword(event) {
        event.preventDefault();
    
        console.log("Change password clicked");
    
        const password = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
    
        console.log(password);
        console.log(newPassword);
        console.log(confirmPassword);
    
        // if new password and confirm password are the same, send request to backend
        if (newPassword === confirmPassword) {
            axios.put("http://localhost:8000/changepassword/", {
                email: this.props.user.email,
                currentPassword: password,
                newPassword: newPassword,
            })
            .then((response) => {
                console.log(response);
                // close the form
                document.getElementById('changePassword').classList.add('hidden');
                document.getElementById('settingsOverlay').classList.add('hidden');

            })
            .catch((error) => {
                console.log(error);
            });
        } else {
            alert("New passwords do not match");
        }
    }
    

    cancelChangePassword() {
        document.getElementById('changePassword').classList.add('hidden');
        document.getElementById('settingsOverlay').classList.add('hidden');
    }

    showLogoutForm() {
        document.getElementById('confirmLogout').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.remove('hidden');
    }

    cancelLogout(){
        document.getElementById('confirmLogout').classList.add('hidden');
        document.getElementById('settingsOverlay').classList.add('hidden');
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

                    <button className={`settingsBtn ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onClick={this.showLogoutForm}><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</button><br/>
                    <button className="settingsBtn" onClick={this.showChangePasswordForm}><i className="fa-solid fa-unlock"></i> Change Password</button><br/>
                    <button className="settingsBtn" onClick={this.showDeleteForm}><i className="fa-solid fa-trash"></i> Delete Account</button><br/>

                    <h2>General</h2>
                    <hr></hr>
                    <label className="toggle">
                        <span className="toggle-label">Dark Mode: </span>
                        <input id="themeSelector" onChange={this.changeTheme} className="toggle-checkbox" type="checkbox" />
                        <div className="toggle-switch"></div>
                    </label>
                    
                </section>

                <div id="confirmLogout" className={`confirmLogout hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                <i className="fa-solid fa-xmark cancelSettingsAction" id="deleteAccountCancel" onClick={this.cancelLogout}></i>
                <h2>Logout of Agrosensor</h2>
                <button onClick={this.props.logout} >Logout</button>

                </div>

                <form id='confirmDelete' className={`confirmDelete hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onSubmit={this.deleteAccount}>
                    <i className="fa-solid fa-xmark cancelSettingsAction" id="deleteAccountCancel" onClick={this.cancelDelete}></i>
                    <h2>Delete Account</h2>
                    <label>To delete your Agrosensor account, you are required to enter your password:</label><br />
                    <input required type="password" id="settingsPassword" name="password" placeholder="Password" /><br />
                    <button id='deleteAccount' type="submit">Delete Account</button>

                </form>

                <form id='changePassword' className={`changePassword hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}  onSubmit={this.changePassword}>
                    <i className="fa-solid fa-xmark cancelSettingsAction" id="changePasswordCancel" onClick={this.cancelChangePassword}></i>
                    <h2>Change Password</h2>
                    <label>To change your Agrosensor account password, you are required to enter your current password.</label><br /><br />
                    <label>Your new password must have, at least, <span class="underline">8</span> characters, </label>
                    <label>including <span class="underline">1</span> <strong>uppercase</strong> letter, <span class="underline">1</span></label>
                    <label> <strong>lowercase</strong> letter and <span class="underline">1</span> <strong>digit</strong>.</label>
                    <label> (Max 50 chars!)</label>
                    <input required type="password" id="currentPassword" name="password" placeholder="Current Password" /><br />
                    <input required type="password" id="newPassword" name="password" placeholder="New Password" /><br />
                    <input required type="password" id="confirmNewPassword" name="password" placeholder="Confirm New Password" /><br />
                    <button id='changePassword' type="submit">Change Password</button>
                </form>

                <div id='settingsOverlay' className="overlayDarken hidden"></div>

            </>

        )
    }
}

export default Settings;