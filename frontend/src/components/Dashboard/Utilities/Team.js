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

    showAddTaskForm() {
        document.getElementById("addTask").reset();
        document.getElementById("taskBoard").classList.add('hidden');
        document.getElementById("addTask").classList.remove('hidden');
    }

    cancelTask() {
        document.getElementById("addTask").reset();
        document.getElementById("taskBoard").classList.remove('hidden');
        document.getElementById("addTask").classList.add('hidden');
    }

    changeScreen(choice) {

        switch (choice) {
            case "team":
                document.getElementById('taskBoard').classList.add("hidden");
                document.getElementById('teamContainer').classList.remove("hidden");
                document.getElementById('taskManagementBTN').classList.remove('manageBtnActive');
                document.getElementById('teamManagementBTN').classList.add('manageBtnActive');

                break;
            case "task":
                document.getElementById('taskBoard').classList.remove("hidden");
                document.getElementById('teamContainer').classList.add("hidden");
                document.getElementById('taskManagementBTN').classList.add('manageBtnActive');
                document.getElementById('teamManagementBTN').classList.remove('manageBtnActive');
                break;
            default:
                console.log("error changing screens");
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

                <nav className="teamNav">
                    <button onClick={() => this.changeScreen("task")} id="taskManagementBTN" className="manageBtnActive teamNavBtn"><i className="fa-solid fa-bullseye"></i>Task Board</button>
                    <button onClick={() => this.changeScreen("team")} id="teamManagementBTN" className="teamNavBtn"><i class="fa-solid fa-user"></i>Team Management</button>
                </nav>

                <section id="taskBoard" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

                    <div className="taskColumn">
                        <h2>To Do<button id="addNewTask" onClick={this.showAddTaskForm}><i class="fa-solid fa-plus"></i></button></h2>

                        <div id='toDoTasksContainer' className="taskContainer">
                            <div className="taskCard">
                                <h3>Go to the shops</h3>
                                <p>Pickup the banana</p>
                                <span><i className="fa-regular fa-user"></i>Tiago Afonso</span>
                                <i className="fa-solid fa-ellipsis-vertical taskSettings"></i>
                            </div>
                        </div>


                    </div>

                    <div className="taskColumn">
                        <h2>In Progress</h2>

                        <div id='inProgressTasksContainer' className="taskContainer">

                        </div>
                    </div>

                    <div className="taskColumn">
                        <h2>Completed</h2>

                        <div id='completedTasksContainer' className="taskContainer">

                        </div>
                    </div>

                </section>

                <section id="teamContainer" className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>

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


                <form id="addTask" className="hidden">
                    <h2>Add a new task</h2>
                    <label htmlFor="task">Task</label>
                    <input required type="text" id="task" name="task" />

                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <input type="text" id="task" name="task" />

                    <label htmlFor="taskAsignee">Assignee</label>
                    <select id="taskAsignee" name="taskAsignee">
                        <option>Team member 1</option>
                    </select>

                    <label htmlFor="taskField">Field</label>
                    <select id="fields" name="fields" className="form-control">
                        <option value="" selected disabled>Select a field</option>
                        {this.state.fields.map(field => (
                            <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                    </select>

                    <button id="taskCancel" onClick={this.cancelTask}>Cancel</button>

                    <input id="taskSubmit" type="submit" value="Create" />

                </form>

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