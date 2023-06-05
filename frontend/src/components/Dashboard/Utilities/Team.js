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
        this.cancelMember = this.cancelMember.bind(this);
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

                    console.log(response.data);
                    // create a new member object with the field property
                    const updatedMember = {
                      ...member,
                      field: response.data.map(field => field.name).join(", ")
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

        document.getElementById("teamOverlay").classList.add('hidden');

        // set state of the field selected on the fields dropdown

        // get password and confirm password from form

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("role").value;

        // get the select value from the fields dropdown



        const farmId = this.props.farmDetails.id;

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
                    const fields = this.state.selectedFields;
                    axios.put("http://localhost:8000/addfieldmanager/" + response.data.id + "/", {
                        fields: fields
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
        document.getElementById("teamOverlay").classList.remove('hidden');
        document.getElementById("addTeamMember").classList.remove('hidden');
    }

    cancelMember() {
        document.getElementById("addTeamMember").reset();
        document.getElementById("teamOverlay").classList.add('hidden');
        document.getElementById("addTeamMember").classList.add('hidden');

        this.setState({
            role: "",
            fields: [],
        });
    }

    handleFieldChange = (event) => {
        const selectedFields = Array.from(event.target.selectedOptions, (option) => option.value);

        console.log(selectedFields);
        this.setState({ selectedFields });
    }


    render() {

        const { role } = this.state;
        return (
            <>
                <section id="teamContainer" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                  

                    <table id="teamTable">
                        <thead>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Field</th>
                            <th><button id="addNewMember" onClick={this.showTeamForm}><i className="fa-solid fa-plus"></i></button></th>
                        </thead>
                        <tbody>
                            {this.state.team.map(member => (
                            <tr key={member.id} colspan="5">
                                <td>{member.name}</td>
                                <td>{member.role}</td>
                                <td>{member.email}</td>
                                <td>{member.field}</td>
                                <td>
                                    <div className="delete-container">
                                        <i className="fa-solid fa-ellipsis-vertical"></i>
                                        <button className="delete-button">Delete</button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>


                </section>

                <form id="addTeamMember" className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onSubmit={this.handleSubmit}>
                            
                    <h2><i className="fa-solid fa-people-group"></i>Add new member <i className="fa-solid fa-xmark" id="teamCancel" onClick={this.cancelMember}></i></h2>
                    <hr></hr>

                
                        <label htmlFor="name">Name</label>
                        <input required type="text" id="name" name="name" className="form-control" placeholder="Name" />
         
       
                        <label htmlFor="email">Email</label>
                        <input required type="text" id="email" name="email" className="form-control" placeholder="Email" />
          

                        <label htmlFor="password">Password</label>
                        <input required type="password" id="password" name="password" className="form-control" placeholder="Password" />
      

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input required type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="Confirm Password" />
    
                        <label htmlFor="role">Role</label>
                        <select defaultValue="" id="role" name="role" className="form-control" onChange={this.handleRoleChange}>
                            <option value="" selected disabled>Select a role</option>
                            <option value="field manager">field manager</option>
                            <option value="farmer">farmer</option>
                        </select>
           
                    {role === 'field manager' && (
                        <>
                            <label htmlFor="fields">Fields</label>
                            <select id="fields" name="fields" className="form-control" onChange={this.handleFieldChange} multiple>
                                <option value="" selected disabled>Select a field</option>
                                {this.state.fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </>
                    )}
                    {this.state.passwordMatchError && (
                        <p style={{ color: "red" }}>Passwords do not match</p>
                    )}

                    <button id='addMember' type="submit">Create User</button>

                </form>

                <div id='teamOverlay' className="overlayDarken hidden"></div>

            </>
        )
    }
}

export default Team;