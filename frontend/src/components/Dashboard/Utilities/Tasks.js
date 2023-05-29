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

    }

    componentDidMount() {

        this.setMinDeadline();

        axios.get("http://localhost:8000/gettasksbyfarm/" + this.props.farmDetails.id + "/")
            .then(response => {
                const tasks = response.data;
                this.setState({ tasks });
            })
            .catch(error => {
                console.log(error);
            });


        axios.get("http://localhost:8000/getfieldsbyid/" + this.props.farmDetails.id + "/")
            .then(response => {
                const fields = response.data;
                this.setState({ fields });
            })
            .catch(error => {
                console.log(error);
            });

        axios.get("http://localhost:8000/getteam/" + this.props.farmDetails.id + "/")
            .then(response => {
                const team = response.data;
                this.setState({ team });
            })
            .catch(error => {
                console.log(error);
            });
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

    async createTask(event) {
        event.preventDefault();

        console.log("creating task");

        const title = document.getElementById("task").value;
        const description = document.getElementById("taskDescription").value;
        const assignee = document.getElementById("taskAssignee").value;
        const field = document.getElementById("fields").value;
        const deadline = document.getElementById("taskDeadline").value;

        // call function to get the user by id


        axios.post("http://localhost:8000/createtask/", {
            title: title,
            description: description,
            farmer: assignee,
            field: field,
            deadline: deadline
        }).then(response => {
            console.log(response);
            // show the tasks table
            document.getElementById("taskBoard").classList.remove('hidden');
            document.getElementById("addTask").classList.add('hidden');

        }
        ).catch(error => {
            console.log(error);
        }
        );
    }


    setMinDeadline() {
        const currentDate = new Date().toISOString().slice(0, 16);
        document.getElementById("taskDeadline").setAttribute("min", currentDate);
    }

    render() {
        return (
            <>
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


                <form id="addTask" className="hidden" onSubmit={this.createTask}>
                    <h2>Add a new task</h2>
                    <label htmlFor="task">Task</label>
                    <input required type="text" id="task" name="task" />

                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <input type="text" id="taskDescription" name="taskDescription" />

                    <label htmlFor="taskAssignee">Assignee</label>
                    <select defaultValue="" id="taskAssignee" name="taskAssignee" className="form-control">
                        <option value="" disabled>Select a team member</option>
                        {this.state.team.map((member) => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>

                    <label htmlFor="taskField">Field</label>
                    <select defaultValue="" id="fields" name="fields" className="form-control">
                        {this.state.fields.length > 0 ? (
                            <>
                                <option value="" disabled>Select a field</option>
                                {this.state.fields.map((field) => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </>
                        ) : (
                            <option value="" disabled>No fields available</option>
                        )}
                    </select>


                    <label htmlFor="taskDeadline">Deadline</label>
                    <input type="datetime-local" id="taskDeadline" name="taskDeadline" />

                    <button id="taskCancel" onClick={this.cancelTask}>Cancel</button>
                    <input id="taskSubmit" type="submit" value="Create" />
                </form>

            </>

        )
    }
}

export default Tasks;