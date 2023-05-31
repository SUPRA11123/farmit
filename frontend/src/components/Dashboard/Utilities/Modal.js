import React from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import { Chart } from "chart.js/auto";



class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temperatureData: [],
      humidityData: [],
      startDate: "",
      endDate: "",
      showDateInputs: false,
    };
    this.chartRef = React.createRef();
    this.chart = null;

  }

  componentDidMount() {

    this.fetchData(); // Fetch data initially

    // Fetch data every 20 seconds
    this.interval = setInterval(() => {
      this.fetchData();
    }, 20000);
  }

  componentWillUnmount() {
    clearInterval(this.interval); // Clear the interval when the component unmounts
  }

  fetchData() {
    // Create a new InfluxDB instance
    const influxDB = new InfluxDB({
      url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
      token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",
    });

    const queryApi = influxDB.getQueryApi("FarmIT");

    const temperatureQuery = `
      from(bucket: "test")
      |> range(start: -5m) 
      |> filter(fn: (r) =>
        r._measurement == "mqtt_consumer" and
        r._field == "decoded_payload_temperature" and
        r.topic == "v3/farmit@ttn/devices/${this.props.sensorData.sensorId}/up" and
        exists r._value
      )
    `;

    const humidityQuery = `
      from(bucket: "test")
      |> range(start: -5m)
      |> filter(fn: (r) =>
        r._measurement == "mqtt_consumer" and
        r._field == "decoded_payload_humidity" and
        r.topic == "v3/farmit@ttn/devices/${this.props.sensorData.sensorId}/up" and
        exists r._value
      )
    `;

    const fetchTemperatureData = queryApi.queryRows(temperatureQuery, {
      next: (row, tableMeta) => {
        this.setState((prevState) => {
          const temperatureData = [...prevState.temperatureData, { ...row }];
          const temperatureValues = temperatureData.map((row) => row["5"]);
          return { temperatureData, temperatureValues };
        });
      },
      error: (error) => {
        console.error("Error occurred during temperature query:", error);
      },
      complete: () => {
        this.updateChart();
      },
    });

    const fetchHumidityData = queryApi.queryRows(humidityQuery, {
      next: (row, tableMeta) => {
        this.setState((prevState) => {
          const humidityData = [...prevState.humidityData, { ...row }];
          const humidityValues = humidityData.map((row) => row["5"]);
          return { humidityData, humidityValues };
        });
      },
      error: (error) => {
        console.error("Error occurred during humidity query:", error);
      },
      complete: () => {
        this.updateChart();
      },
    });

    Promise.all([fetchTemperatureData, fetchHumidityData])
      .catch((error) => {
        console.error("Error occurred during queries:", error);
      });
  }

  exportDataToCSV = () => {
    // Show the date inputs
    this.setState({ showDateInputs: true });
  };

  handleStartDateChange = (event) => {
    this.setState({ startDate: event.target.value });
  };

  handleEndDateChange = (event) => {
    this.setState({ endDate: event.target.value });
  };

  handleExportCSV = () => {
    const { startDate, endDate } = this.state;
    // Perform the CSV export with the selected start and end dates

    console.log("Exporting CSV data from", startDate, "to", endDate);

    // get data from influxdb
    const influxDB = new InfluxDB({
      url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
      token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",

    });

    const queryApi = influxDB.getQueryApi("FarmIT");

    const testQuery = `
    from(bucket: "test")
    |> range(start: ${startDate}, stop: ${endDate})
    |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
    |> filter(fn: (r) => r["_field"] == "decoded_payload_temperature" or r["_field"] == "decoded_payload_humidity")
  `;

  let data = [];

  const fetchTestData = queryApi.queryRows(testQuery, {
    next: (row, tableMeta) => {
      const time = row[4];
      const variable = row[6] === "decoded_payload_temperature" ? "temperature" : "humidity";
      const value = row[5];
      
      const existingData = data.find((item) => item.time === time);
      if (existingData) {
        existingData[variable] = value;
      } else {
        const newData = { time };
        newData[variable] = value;
        data.push(newData);
      }
    },
    error: (error) => {
      console.error("Error occurred during test query:", error);
    },
    complete: () => {
      console.log("Query completed");
      console.log(data);
  
      // Sort the data array by time in ascending order
      data.sort((a, b) => new Date(a.time) - new Date(b.time));
  
      // Create the CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "time,temperature,humidity\r\n";
      data.forEach((item) => {
        csvContent += `${item.time},${item.temperature || ""},${item.humidity || ""}\r\n`;
      });
  
      var encodedUri = encodeURI(csvContent);
  
      var link = document.createElement("a");
  
      link.setAttribute("href", encodedUri);
  
      link.setAttribute("download", "my_data.csv");
  
      document.body.appendChild(link); // Required for FF
  
      link.click();
      // Perform further operations with the data here
    },
  });

    Promise.all([fetchTestData])
      .catch((error) => {
        console.error("Error occurred during queries:", error);
      });

    // After exporting, reset the state and hide the date inputs
    this.setState({ startDate: "", endDate: "", showDateInputs: false });
  };

 


  updateChart() {
    const { humidityData, temperatureData } = this.state;
    const chartRef = this.chartRef.current;

    if (chartRef) {
      const chartContext = chartRef.getContext("2d");

      // Extract the timestamps and values from humidityData
      const humidityTimestamps = humidityData.map((row) => {
        const utcTimestamp = row["4"];
        const localTimestamp = new Date(utcTimestamp).toLocaleTimeString();
        return localTimestamp;
      });

      const humidityValues = humidityData.map((row) => row["5"]);
      const temperatureValues = temperatureData.map((row) => row["5"]);

      // Check if both temperature and humidity data have the same length
      if (humidityValues.length !== temperatureValues.length) {
        return;
      }


      if (!this.chart) {

        // Create a new chart if it doesn't exist
        this.chart = new Chart(chartContext, {
          type: "line",
          data: {
            labels: [],
            datasets: [
              {
                data: [],
                borderColor: "blue",
                fill: false,
                label: "Humidity (%)",
              },
              {
                data: [],
                borderColor: "red",
                fill: false,
                label: "Temperature (ºC)",
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: true, // Display the legend
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: "Value",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Time",
                },
              },
            },
            animation: {
              duration: 500, // Animation duration in milliseconds
            },
          },
        });
      }

      // Calculate the range of data points to show
      const maxDataPoints = 10; // Maximum number of data points to show
      const startIdx = Math.max(humidityTimestamps.length - maxDataPoints, 0);
      const endIdx = humidityTimestamps.length - 1;

      // Update the chart with the new data
      this.chart.data.labels = humidityTimestamps.slice(startIdx, endIdx + 1);
      this.chart.data.datasets[0].data = humidityValues.slice(startIdx, endIdx + 1);
      this.chart.data.datasets[1].data = temperatureValues.slice(startIdx, endIdx + 1);
      this.chart.update();
    }
  }




  render() {
    const { setOpenModal } = this.props;

    const { showDateInputs, startDate, endDate } = this.state;

    return (
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="titleCloseBtn">
            <button onClick={() => setOpenModal(false)}>X</button>
          </div>
          <div className="title">
            <h5>Field data</h5>
          </div>
          <div className="title2">
            <h1>Real-Time Temperature and Humidity Values From Sensor {this.props.sensorData.sensorId}</h1>
          </div>
          <div className="body">
            <div>
              <canvas ref={this.chartRef} style={{ height: "450px", width: "700px" }} />
            </div>
            <br />
            {showDateInputs && (
              <div>
                <label htmlFor="startDate">Start Date:</label>
                <input type="text" id="startDate" value={startDate} onChange={this.handleStartDateChange} />
                <br />
                <label htmlFor="endDate">End Date:</label>
                <input type="text" id="endDate" value={endDate} onChange={this.handleEndDateChange} />
                <br />
                <button onClick={this.handleExportCSV}>Export</button>
              </div>
            )}
            {!showDateInputs && (
              <div className="exportButton">
                <button onClick={this.exportDataToCSV}>CSV <i class="fa-sharp fa-solid fa-download"></i></button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default Modal;