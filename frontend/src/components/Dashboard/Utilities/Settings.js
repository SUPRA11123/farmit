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
        
        const password = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    
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

    showTandC() {
        document.getElementById('tAndC').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.remove('hidden');
    }

    cancelTandC(){
        document.getElementById('tAndC').classList.add('hidden');
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
                    
                    <label className="toggle">
                        <span className="toggle-label">Language: </span> 
                        <select id="languageSelector" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                            <option value="English">English</option>
                            <option value="Portuguese">Portuguese</option>
                        </select>
                    </label>

                    <button className="settingsBtn" onClick={this.showTandC}><i className="fa-solid fa-file-contract"></i> Terms & Conditions</button>
                    
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
                    <i className="fa-solid fa-xmark cancelSettingsAction" onClick={this.cancelChangePassword}></i>
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

                <div id="tAndC" className={`tAndC hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                <i className="fa-solid fa-xmark cancelSettingsAction" onClick={this.cancelTandC}></i>
                <h2>Terms and Conditions</h2>
                <h3>Terms of use</h3>
                <p>
                By using the "Agrosensor" program, the user accepts the terms and conditions listed below. Furthermore, the user undertakes to comply with all laws and rules that may apply when using the program.
                </p>

                <h3>Data security</h3>
                <p>
                The "Agrosensor" program records all user data, including name, email address and details of the fields being observed. This data is kept confidential and is only used to provide the services provided by the application. Except as required by law, the app does not disclose the data it collects from third parties.
                </p>

                <h3>Intellectual property</h3>
                <p>
                Intellectual property laws protect all content of the “Agrosensor” application, including texts, graphics, icons and source code. This material is the property of the company that developed the program. Without the prior written consent of the company, the user is not allowed to reproduce, distribute, modify or use the content of the application for commercial gain.
                </p>

                <h3>Responsibility</h3>
                <p>
                The company that developed the "Agrosensor" App is not responsible for any damage or harm that may be acquired from the use of the app for the device or for the user. The user is responsible for ensuring that the program works on his device and protecting his login data.    The user is also responsible for ensuring that all data provided to the program is correct and up to date.
                </p>

                <h3>Acceptable usage</h3>
                <p>
                The program must only be used for morally and legally correct purposes. The user undertakes not to transmit, store or distribute any illicit, defamatory, discriminatory, offensive or annoying content through the program. Any content that does not comply with these guidelines may be removed by App developers.
                </p>

                <h3>Warnings and Notifications</h3>
                <p>
                The company responsible for the "Agrosensor" application may send emails or notifications from within the App, informing users about updates, modifications or other crucial information related to the use of the program. The user is asked whether he wants to receive these alerts.
                </p>

                <h3>Technical support</h3>
                <p>
                Technical help is available from the company that developed the "Agrosensor" application to solve problems related to its use. Support can be obtained via email or App chat.
                </p>

                <h3>Limitation of Liability</h3>
                <p>
                Even if the company that owns the "Agrosensor" application has been informed of the probably of such damages, under no circumstances will the company be liable for any damages, losses or expenses resulting from the use of the App.
                </p>

                <h3>Indemnity</h3>
                <p>
                By using the "Agrosensor" application or by violating these terms and conditions, the user agrees to defend, compensate and hold harmless the owner of the "Agrosensor" App, as well as all its directors, employees and agents.
                </p>

                <h3>Use license</h3>
                <p>
                The developer of the "Agrosensor" application offers the user a limited, non-exclusive and non-transferable license to use the App in accordance with the terms and conditions set forth in this document. The license prohibits 
                </p>

                <h3>Termination</h3>
                <p>
                If a user violates these terms and conditions, the company that owns the App "Agrosensor" has the right to terminate your agreement immediately and without prior notice. By deactivating your account and uninstall the program, the user can also cancel his contract in the application at any time.
                </p>

                <h3>Changes to terms</h3>
                <p>
                The terms are subject to modifications at any time by the company that owns the App "Agrosensor". Following the publication of the adjusted terms of this, the modifications will be effective immediately. Any conc
                </p>

                <h3>Applicable law</h3>
                <p>
                The laws of the country where the company that developed the App "Agrosensor" is based apply to these terms and conditions. The competent courts of the country where the company is Base will be solely responsible for resolving any dispute relating to these terms and conditions.
                </p>

                </div>

                <div id='settingsOverlay' className="overlayDarken hidden"></div>

            </>

        )
    }
}

export default Settings;