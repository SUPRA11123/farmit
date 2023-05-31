import React from "react";
import axios from "axios";

class Team extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            password: "",
            role: "",
            confirmPassword: "",
            fields: [],
            team: [],
            passwordMatchError: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        axios.get("http://localhost:8000/getteam/" + this.props.farmDetails.id + "/")
          .then(response => {
            const team = response.data;
      
            // iterate through the team members and get their fields
            const promises = team.map(member => {
              if (member.role === "field manager") {
                return axios.get("http://localhost:8000/getfieldsbymanager/" + member.id + "/")
                  .then(response => {
                    // create a new member object with the field property
                    const updatedMember = {
                      ...member,
                      field: response.data[0].name
                    };
                    return updatedMember;
                  })
                  .catch(error => {
                    console.log(error);
                    return member; // return the member as-is if there's an error
                  });
              }
              return member; // return the member as-is for other roles
            });
      
            // wait for all promises to resolve
            Promise.all(promises)
              .then(updatedTeam => {
                this.setState({ team: updatedTeam });
              })
              .catch(error => {
                console.log(error);
              });
          })
          .catch(error => {
            console.log(error);
          });
      }
      

    handleSubmit(event) {
        event.preventDefault();

        // set state of the field selected on the fields dropdown

        // get password and confirm password from form

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("role").value;

        // get the select value from the fields dropdown



        const farmId = this.props.farmDetails.id;
        console.log(farmId);

        if (password === confirmPassword) {
            this.setState({ passwordMatchError: false });
            // call backend to create user
            axios.post("http://localhost:8000/signup/", {
                name: name,
                email: email,
                password: password,
                role: role
            }).then(response => {
                if (role === "farmer") {
                    axios.put("http://localhost:8000/addfarmer/" + farmId + "/", {
                        email: email
                    }).then(response => {
                        console.log(response);

                        // show the team table
                        document.getElementById("teamContainer").classList.remove('hidden');
                        document.getElementById("addTeamMember").classList.add('hidden');

                        this.componentDidMount();

                    }
                    ).catch(error => {
                        console.log(error);
                    }
                    );
                } else {
                    // get the select value from the fields dropdown
                    const field = this.state.selectedField;
                    axios.put("http://localhost:8000/addfieldmanager/" + field + "/", {
                        email: email
                    }).then(response => {

                     
                        document.getElementById("teamContainer").classList.remove('hidden');
                        document.getElementById("addTeamMember").classList.add('hidden');
                        
                        this.componentDidMount();

                    }
                    ).catch(error => {
                        console.log(error);
                    }
                    );
                }

            }).catch(error => {
                console.log(error);
            });
        } else {
            console.log("Passwords do not match");
            this.setState({ passwordMatchError: true });
        }

    }

    handleRoleChange = (event) => {
        this.setState({
            role: event.target.value,
        });

        if (event.target.value === "field manager") {
            axios.get("http://localhost:8000/getfieldsbyid/" + this.props.farmDetails.id + "/")
                .then(response => {
                    const fields = response.data.filter(field => !field.manager);
                    this.setState({ fields });
                }).catch(error => {
                    console.log(error);
                });
        }
    }

    showTeamForm() {
        document.getElementById("addTeamMember").reset();
        document.getElementById("teamContainer").classList.add('hidden');
        document.getElementById("addTeamMember").classList.remove('hidden');
    }

    cancelMember() {
        document.getElementById("addTeamMember").reset();
        document.getElementById("teamContainer").classList.remove('hidden');
        document.getElementById("addTeamMember").classList.add('hidden');
    }

    handleFieldChange = (event) => {
        const selectedField = event.target.value;
        this.setState({ selectedField });
    }



    render() {

        const { role } = this.state;
        return (
            <>
                <section id="teamContainer" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                    <h2>My Team <button id="addNewMember" onClick={this.showTeamForm}><i className="fa-solid fa-plus"></i>add new member</button></h2>

                    <table id="teamTable">
                        <thead>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Field</th>
                        </thead>
                        <tbody>
            {this.state.team.map(member => (
                console.log(member),
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.email}</td>
                <td>{member.field}</td>
              </tr>
            ))}
          </tbody>
                    </table>


                </section>

                <form id="addTeamMember" className="form hidden" onSubmit={this.handleSubmit}>
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
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" className="form-control" onChange={this.handleRoleChange}>
                            <option value="" selected disabled>Select the role you want</option>
                            <option value="field manager">field manager</option>
                            <option value="farmer">farmer</option>
                        </select>
                    </div>
                    {role === 'field manager' && (
                        <div className="form-group">
                            <label htmlFor="fields">Fields</label>
                            <select id="fields" name="fields" className="form-control" onChange={this.handleFieldChange}>
                                <option value="" selected disabled>Select a field</option>
                                {this.state.fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {this.state.passwordMatchError && (
                        <p style={{ color: "red" }}>Passwords do not match</p>
                    )}

                    <br />
                    <button id="memberCancel" onClick={this.cancelMember}>Cancel</button>
                    <button type="submit">Create User</button>


                </form>
            </>
        )
    }
}

export default Team;