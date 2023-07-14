import React from "react";
import axios from "axios";

class Team extends React.Component {

    constructor(props) {
        super(props);

        var language = localStorage.getItem("language") || "en";

        var languageText = {
        en: {

            text1: "Name",
            text2: "Role",
            text3: "Email",
            text4: "Field",
            text5: "Add new member",
            text6: "Name",
            text7: "Role",
            text8: "Email",
            text9: "Password",
            text10: "Confirm Password",
            text11: "Create Member",
        
        },
        pt: {

            text1: "Nome",
            text2: "Função",
            text3: "E-mail",
            text4: "Campos",
            text5: "Adicionar novo membro",
            text6: "Nome",
            text7: "Função",
            text8: "E-mail",
            text9: "Palavra-passe",
            text10: "Confirme Palavra-passe",
            text11: "Criar Membro",
            
        },
        };

        this.state = {
            name: "",
            email: "",
            password: "",
            role: "",
            confirmPassword: "",
            fields: [],
            team: [],
            passwordMatchError: false,
            textContent: languageText[language],
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEditMember = this.handleEditMember.bind(this);
        this.cancelMember = this.cancelMember.bind(this);
        this.cancelEditMember = this.cancelEditMember.bind(this);
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

                        this.setState({
                            role: "",
                            fields: [],
                            selectedFields: [],
                        });

                        this.componentDidMount();

                    }
                    ).catch(error => {
                        console.log(error);
                    }
                    );
                } else {
                    // get the select value from the fields dropdown
                    const fields = this.state.selectedFields;

                    if (fields) {

                        axios.put("http://localhost:8000/addfieldmanager/" + response.data.id + "/", {
                            fields: fields
                        }).then(response => {

                            document.getElementById("teamContainer").classList.remove('hidden');
                            document.getElementById("addTeamMember").classList.add('hidden');

                            this.setState({
                                role: "",
                                fields: [],
                                selectedFields: [],
                            });

                            this.componentDidMount();

                        }
                        ).catch(error => {
                            console.log(error);
                        }
                        );
                    } else {
                        document.getElementById("teamContainer").classList.remove('hidden');
                        document.getElementById("addTeamMember").classList.add('hidden');

                        this.setState({
                            role: "",
                            fields: [],
                            selectedFields: []
                        });

                        this.componentDidMount();
                    }
                }

            }).catch(error => {
                console.log(error);
            });
        } else {
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

    handleRoleChangeOnEdit = (event) => {
        this.setState({
            role: event.target.value,
        });

        if (event.target.value === "field manager") {
            axios.get("http://localhost:8000/getfieldsbyid/" + this.props.farmDetails.id + "/")
                .then(response => {
                    const fields = response.data.filter(field => !field.manager || field.manager == this.state.member.id);
                    this.setState({ fields });
                }).catch(error => {
                    console.log(error);
                });
        } else {
            this.setState({ selectedFields: [] });
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
            selectedFields: [],
        });
    }

    handleFieldChange = (event) => {
        const selectedFields = Array.from(event.target.selectedOptions, (option) => option.value);

        this.setState({ selectedFields });
    }

    showEditMemberForm(member) {

        document.getElementById("editTeamMember").reset();
        document.getElementById("teamOverlay").classList.remove('hidden');
        document.getElementById("editTeamMember").classList.remove('hidden');

        document.getElementById("editName").value = member.name;
        document.getElementById("editEmail").value = member.email;
        document.getElementById("editRole").value = member.role;

        this.setState({
            role: member.role,
            member: member,
        });

        if (member.role === "field manager") {
            axios.get("http://localhost:8000/getfieldsbyid/" + this.props.farmDetails.id + "/")
                .then(response => {
                    const fields = response.data.filter(field => !field.manager || field.manager === member.id);
                    this.setState({ fields });

                }).catch(error => {
                    console.log(error);
                });
        }

    }

    cancelEditMember() {
        document.getElementById("editTeamMember").reset();
        document.getElementById("teamOverlay").classList.add('hidden');
        document.getElementById("editTeamMember").classList.add('hidden');

        this.setState({
            role: "",
            fields: [],
            selectedFields: [],
        });
    }

    deleteMember(email) {
        axios.delete("http://localhost:8000/deleteuser/" + email + "/")
            .then(response => {
                console.log(response);
                this.componentDidMount();
            }).catch(error => {
                console.log(error);
            });

    }

    handleEditMember(event) {
        event.preventDefault();

        document.getElementById("teamOverlay").classList.add('hidden');

        // get role and fields if role is field manager
        const role = document.getElementById("editRole").value;
        const fields = this.state.selectedFields;


        // call the backend to edit the user
        axios.put("http://localhost:8000/edituser/" + this.state.member.id + "/", {
            role: role,
            fields: fields,
        }).then(response => {
            console.log(response);

            document.getElementById("editTeamMember").classList.add('hidden');

            this.setState({
                role: "",
                fields: [],
                selectedFields: [],
            });

            this.componentDidMount();

        }
        ).catch(error => {
            console.log(error);
        }
        );



    }

    isFormValid() {
        const fields = this.state.fields;

        if (this.state.role === "field manager" && fields.length === 0) {
            return false;
        } else {
            return true;
        }

    }

    isEditFormValid() {
        // get selected fields
        const fields = this.state.selectedFields;

        if (fields) {
            if (fields.length > 0 && this.state.role === "field manager") {
                return true;
            } else if (this.state.role === "farmer") {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }


    }

    render() {

        const { role } = this.state;

        return (
            <>
                <section id="teamContainer" className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>



                    <table id="teamTable">
                        <thead>
                            <th>{this.state.textContent.text1}</th>
                            <th>{this.state.textContent.text2}</th>
                            <th>{this.state.textContent.text3}</th>
                            <th>{this.state.textContent.text4}</th>
                            <th><button id="addNewMember" onClick={this.showTeamForm}><i className="fa-solid fa-plus"></i></button></th>
                        </thead>
                        <tbody>
                            {this.state.team.map(member => (
                                <tr key={member.id} colspan="5">
                                    <td>{member.name}</td>
                                    <td>{member.role}</td>
                                    <td>{member.email}</td>
                                    <td>{member.field}</td>
                                    {member.role !== 'owner' ? (
                                        <>
                                            <td>
                                                <button className="edit-button" onClick={() => this.showEditMemberForm(member)}>Edit</button>
                                                <button className="delete-button" onClick={() => this.deleteMember(member.email)}>Delete</button>
                                            </td>
                                        </>
                                    ) : (
                                        <td></td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>


                </section>

                <form id="addTeamMember" className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onSubmit={this.handleSubmit}>

                    <h2><i className="fa-solid fa-people-group"></i>{this.state.textContent.text5} <i className="fa-solid fa-xmark" id="teamCancel" onClick={this.cancelMember}></i></h2>
                    <hr></hr>


                    <label htmlFor="name">{this.state.textContent.text6}</label>
                    <input required type="text" id="name" name="name" className="form-control" placeholder="Name" />


                    <label htmlFor="role">{this.state.textContent.text7}</label>
                    <select defaultValue="" id="role" name="role" className="form-control" onChange={this.handleRoleChange} required>
                        <option value="" selected disabled>Select a role</option>
                        <option value="field manager">field manager</option>
                        <option value="farmer">farmer</option>
                    </select>

                    {role === 'field manager' && this.state.fields.length > 0 && (
                        <>
                            <label htmlFor="fields">{this.state.textContent.text8}</label>
                            <select id="fields" name="fields" className="form-control" onChange={this.handleFieldChange} multiple required>
                                <option value="" disabled>Select a field</option>
                                {this.state.fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </>
                    )}
                    {this.state.passwordMatchError && (
                        <p style={{ color: "red" }}>Passwords do not match</p>
                    )}


                    <label htmlFor="email">{this.state.textContent.text8}</label>
                    <input required type="text" id="email" name="email" className="form-control" placeholder="Email" />


                    <label htmlFor="password">{this.state.textContent.text9}</label>
                    <input required type="password" id="password" name="password" className="form-control" placeholder="Password" />


                    <label htmlFor="confirmPassword">{this.state.textContent.text10}</label>
                    <input required type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="Confirm Password" />


                    <button id="addMember" type="submit" disabled={!this.isFormValid()}>
                    {this.state.textContent.text11}
                    </button>

                </form>

                <form id="editTeamMember" className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onSubmit={this.handleEditMember}>

                    <h2><i className="fa-solid fa-people-group"></i>Edit existent team member <i className="fa-solid fa-xmark" id="editMemberCancel" onClick={this.cancelEditMember}></i></h2>
                    <hr></hr>


                    <label htmlFor="name">Name</label>
                    <input required type="text" id="editName" name="editName" className="form-control" placeholder="Name" disabled />

                    <label htmlFor="role">Role</label>
                    <select defaultValue={role} id="editRole" name="editRole" className="form-control" onChange={this.handleRoleChangeOnEdit}>
                        <option value="" disabled>Select a role</option>
                        <option value="field manager">field manager</option>
                        <option value="farmer">farmer</option>
                    </select>

                    {role === 'field manager' && this.state.fields.length > 0 && (
                        <>
                            <label htmlFor="fields">Fields</label>
                            <select id="fields" name="fields" className="form-control" onChange={this.handleFieldChange} multiple>
                                <option value="" disabled>Select a field</option>
                                {this.state.fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </>
                    )}


                    <label htmlFor="email">Email</label>
                    <input required type="text" id="editEmail" name="editEmail" className="form-control" placeholder="Email" disabled />

                    <button id="editMember" type="submit" disabled={!this.isEditFormValid()}>
                        Edit User
                    </button>
                </form>

                <div id='teamOverlay' className="overlayDarken hidden"></div>

            </>
        )
    }
}

export default Team;