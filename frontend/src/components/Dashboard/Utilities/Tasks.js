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
            fields: [],
            team: [],
            passwordMatchError: false
        };

    }

    componentDidMount() {

        const currentDate = new Date().toISOString().split('T')[0];
        document.getElementById('taskDeadline').setAttribute('min', currentDate);

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

    createTask(event) {
        event.preventDefault();

        // get all the data from the form
        const data = new FormData(event.target);

        // get the data from the form
        const task = data.get('task');
        const taskDescription = data.get('taskDescription');
        const taskAsignee = data.get('taskAsignee');
        const taskField = data.get('taskField');

        console.log(task);
        console.log(taskDescription);
        console.log(taskAsignee);
        console.log(taskField);

        // create a new task
        axios.post("http://localhost:8000/createtask/", {
            name: task,
            description: taskDescription,
            asignee: taskAsignee,
            field: taskField,
            status: "To Do"
        })
            .then(response => {
                console.log(response);
                document.getElementById("addTask").reset();
                document.getElementById("taskBoard").classList.remove('hidden');
                document.getElementById("addTask").classList.add('hidden');
            }
            )
            .catch(error => {
                console.log(error);
            }
            );


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
                    <input type="text" id="task" name="task" />

                    <label htmlFor="taskAsignee">Assignee</label>
                    <select defaultValue="" id="taskAsignee" name="taskAsignee" className="form-control">
                        <option value="" disabled>Select a team member</option>
                        {this.state.team.map(member => (
                           <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>

                 

                    <label htmlFor="taskField">Field</label>
                    <select defaultValue="" id="fields" name="fields" className="form-control">
                        <option value="" selected disabled>Select a field</option>
                        {this.state.fields.map(field => (
                            <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                    </select>

                    <label htmlFor="taskDeadline">Deadline</label>
                    <input type="date" id="taskDeadline" name="taskDeadline" />



                    <button id="taskCancel" onClick={this.cancelTask}>Cancel</button>

                    <input id="taskSubmit" type="submit" value="Create" />

                </form>

            </>

        )
    }
}

export default Tasks;