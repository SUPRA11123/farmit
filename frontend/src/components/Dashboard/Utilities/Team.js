import React from "react";
import axios from "axios";

class Team extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            passwordMatchError: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        console.log("Submitted form");

        console.log(this.state.password);

        // get password and confirm password from form

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const farmId = this.props.farmDetails.id;
        console.log(farmId);

        if (password === confirmPassword) {
            console.log("Passwords match");
            this.setState({ passwordMatchError: false });
            // call backend to create user
            axios.post("http://localhost:8000/signup/", {
                name: name,
                email: email,
                password: password,
                role: 'farmer'
            }).then(response => {
                console.log(response);

                axios.put("http://localhost:8000/adduser/" + farmId + "/", {
                    email: response.data.email
                    }).then(response => {
                        console.log(response);

                        document.getElementById("name").value = "";
                        document.getElementById("email").value = "";
                        document.getElementById("password").value = "";
                        document.getElementById("confirmPassword").value = "";
                    }
                ).catch(error => {
                    console.log(error);
                }
                );        
            }).catch(error => {
                console.log(error);
            });
        } else {
            console.log("Passwords do not match");
            this.setState({ passwordMatchError: true });
        }

    }


    render() {
        return (
            <>
                <h1>Team</h1>
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input required type="text" id="name" name="name" className="form-control" placeholder="Name" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input required type="text" id="email" name="email" className="form-control" placeholder="Email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input required type="password" id="password" name="password" className="form-control" placeholder="Password" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input required type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="Confirm Password" />
                    </div>

                    {this.state.passwordMatchError && (
                        <p style={{ color: "red" }}>Passwords do not match</p>
                    )}

                    <br />
                    <button type="submit">Create User</button>
                </form>
            </>
        )
    }
}

export default Team;