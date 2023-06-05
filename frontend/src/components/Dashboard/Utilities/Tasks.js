import React from "react";
import axios from "axios";

class Tasks extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            name: "",
            email: "",
            password: "",
            role: "",
            confirmPassword: "",
            selectedField: "",
            selectedAssignee: "",
            fields: [],
            team: [],
            tasks: [],
            passwordMatchError: false
        };

        this.createTask = this.createTask.bind(this);
        this.showTasks = this.showTasks.bind(this);
        this.getMember = this.getMember.bind(this);
        this.cancelTask = this.cancelTask.bind(this);

    }

    componentDidMount() {

        axios.get("http://localhost:8000/getteam/" + this.props.farmDetails.id + "/")
            .then(response => {

                const team = response.data;
                this.setState({ team: team });
                this.getTasks();

            })
            .catch(error => {
                console.log(error);
            });

        axios.get("http://localhost:8000/getfieldsbyid/" + this.props.farmDetails.id + "/")
            .then(response => {
                const fields = response.data;
                this.setState({ fields: fields });

            })
            .catch(error => {
                console.log(error);
            });
    }

    getTasks() {

        axios.get("http://localhost:8000/gettasksbyfarm/" + this.props.farmDetails.id + "/")
            .then(response => {
                const tasks = response.data;
                this.setState({ tasks: tasks });
                this.showTasks(tasks);

            })
            .catch(error => {
                console.log(error);
            });

    }


    showAddTaskForm() {
        document.getElementById("addTask").reset();
        document.getElementById("taskOverlay").classList.remove('hidden');
        document.getElementById("addTask").classList.remove('hidden');
    }

    cancelTask() {
        document.getElementById("addTask").reset();
        document.getElementById("taskOverlay").classList.add('hidden');
        document.getElementById("addTask").classList.add('hidden');


        // clear the selected field and assignee
        this.setState({
            selectedField: "",
            selectedAssignee: ""
        });



    }

    async showTasks(tasks) {

        const toDo = document.getElementById('toDoTasksContainer');
        toDo.innerHTML = '';

        if (tasks.length > 0) {

            tasks.forEach((task) => {

                const div = document.createElement('div');
                div.classList.add('taskCard');

                const taskTitle = document.createElement('h3');
                taskTitle.innerHTML = task.title;

                const taskDescription = document.createElement('p');
                taskDescription.textContent = task.description;

                const taskMember = document.createElement('span');
                const member = this.getMember(task.farmer);
                taskMember.innerHTML = "<i class='fa-regular fa-user'></i> " + member.name;

                const taskSettings = document.createElement('i');
                taskSettings.classList.add('fa-solid', 'fa-ellipsis-vertical', 'taskSettings');

                const taskSettings2 = document.createElement("span");
                taskSettings2.classList.add('taskSettings')
                taskSettings2.innerHTML = '<div class="delete-container"><i class="fa-solid fa-ellipsis-vertical"></i><button class="delete-button">Delete</button></div>';

                div.appendChild(taskTitle);
                div.appendChild(taskDescription);
                div.appendChild(taskMember);
                div.appendChild(taskSettings2);

                if (task.status = 'To do') {
                    toDo.appendChild(div);
                } else if (task.status = 'In progress') {
                    document.getElementById('inProgressTasksContainer').appendChild(div);
                } else {
                    document.getElementById('completedTasksContainer').appendChild(div);
                }


            });

        }

    }

    getMember(id) {
        const team = this.state.team;
        const member = team.find(member => member.id === id);
        return member;
    }

    async createTask(event) {

        document.getElementById("taskOverlay").classList.add('hidden');

        event.preventDefault();

        console.log("creating task");

        const title = document.getElementById("task").value;
        const description = document.getElementById("taskDescription").value;
        const assignee = document.getElementById("taskAssignee").value;
        const field = document.getElementById("fields").value;

        const assigneeJson = JSON.parse(assignee);

        // call function to get the user by id


        axios.post("http://localhost:8000/createtask/", {
            title: title,
            description: description,
            farmer: assigneeJson.id,
            field: field,
        }).then(response => {
            console.log(response);
            // show the tasks table
            this.getTasks();
            document.getElementById("taskBoard").classList.remove('hidden');
            document.getElementById("addTask").classList.add('hidden');

        }
        ).catch(error => {
            console.log(error);
        }
        );
    }

    handleMemberChange = (event) => {

        const selectedMember = JSON.parse(event.target.value);

        this.setState({
            selectedAssignee: selectedMember,
        });

    };

    render() {
        return (
            <>
                <section id="taskBoard" className={`${localStorage.getItem("darkMode") === "true" ? "darkModeBG" : ''}`}>

                    <div id='taskOverlay' className="overlayDarken hidden"></div>

                    <div className={`taskColumn ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                        <h2 className="taskColumnHeader">To Do<button id="addNewTask" onClick={this.showAddTaskForm}><i class="fa-solid fa-plus"></i></button></h2>

                        <div id='toDoTasksContainer' className='taskContainer'>

                        </div>

                    </div>

                    <div className={`taskColumn ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                        <h2 className="taskColumnHeader">In Progress</h2>

                        <div id='inProgressTasksContainer' className='taskContainer'>

                        </div>
                    </div>

                    <div className={`taskColumn ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
                        <h2 className="taskColumnHeader">Completed</h2>

                        <div id='completedTasksContainer' className='taskContainer'>

                        </div>
                    </div>

                </section>


                <form id="addTask" className={`hidden ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onSubmit={this.createTask}>
                    <h2><i className="fa-solid fa-bullseye"></i>Create new task <i className="fa-solid fa-xmark" id="taskCancel" onClick={this.cancelTask}></i></h2>
                    <hr></hr>
                    <label htmlFor="task">Task</label>
                    <input required type="text" id="task" name="task" />

                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <input type="text" id="taskDescription" name="taskDescription" />

                    <label htmlFor="taskAssignee">Assignee</label>
                    <select
                        defaultValue=""
                        id="taskAssignee"
                        name="taskAssignee"
                        className="form-control"
                        onChange={this.handleMemberChange}
                    >
                        <option value="" disabled>Select a team member</option>
                        {this.state.team.map((member) => {
                            if (member.id !== this.props.user.id) {
                                return (
                                    <option key={member.id} value={JSON.stringify(member)}>
                                        {member.name}
                                    </option>
                                );
                            }
                            return null;
                        })}
                    </select>


                    {this.state.selectedAssignee && (
                        <>
                            <label htmlFor="taskField">Field</label>
                            <select defaultValue="" id="fields" name="fields" className="form-control">
                                {this.state.fields.length > 0 ? (
                                    <>
                                        <option value="" disabled>Select a field</option>
                                        {this.state.fields.map((field) => {
                                            // Check if the selected member is a field manager and the field is assigned to them
                                            if (this.state.selectedAssignee.role === "field manager" && field.manager === this.state.selectedAssignee.id) {
                                                return (
                                                    <option key={field.id} value={field.id}>{field.name}</option>
                                                );
                                            }
                                            // If not a field manager, show all fields
                                            else if (this.state.selectedAssignee.role !== "field manager") {
                                                return (
                                                    <option key={field.id} value={field.id}>{field.name}</option>
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                ) : (
                                    <option value="" disabled>No fields available</option>
                                )}
                            </select>
                        </>
                    )}


                    <input id="taskSubmit" type="submit" value="Create" />

                </form>

            </>

        )
    }
}

export default Tasks;