import React from "react";

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
            passwordMatchError: false
        };
    
    }

    showAddTaskForm(){
        document.getElementById("addTask").reset();
        document.getElementById("taskBoard").classList.add('hidden');
        document.getElementById("addTask").classList.remove('hidden');
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


        <form id="addTask" className="hidden">
                    <h2>Add a new task</h2>
                    <label htmlFor="task">Task</label>
                    <input required type="text" id="task" name="task"/>

                    <label htmlFor="taskDescription">Description (Optional)</label>
                    <input type="text" id="task" name="task"/>

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

        </>

        )
    }
}

export default Tasks;