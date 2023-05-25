import React from "react";

class Modal extends React.Component {

  constructor(props) {
    super(props);
    this.getSensorData();
  }

  getSensorData() {
    console.log("Getting sensor data");

    fetch('/api/dashboards/uid/e83c5363-5c9e-4e1c-87ff-572530c7f0bd', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJrIjoiMTJhZWUwNjk0NTNlNTEzMWU1MTNkOTYyY2M5YzA3MmM3MTg1YThkNyIsIm4iOiJzZW5zb3JfRGF0YSIsImlkIjo4NTczNzZ9'
      },
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response data here
        console.log(data);
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.error(error);
      });
    
  }
   

  render() {
    const { setOpenModal } = this.props;

    return (
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="titleCloseBtn">
            <button onClick={() => setOpenModal(false)}>X</button>
          </div>
          <div className="title">
            <h5>Field data</h5>
          </div>
          <div className="body">
            <p>No data to be displayed.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;