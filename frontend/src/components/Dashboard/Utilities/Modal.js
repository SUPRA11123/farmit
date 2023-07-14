import React from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import { Chart } from "chart.js/auto";
import zoomPlugin from 'chartjs-plugin-zoom';



Chart.register(zoomPlugin);


class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temperatureData: [],
      humidityData: [],
      startDate: "",
      endDate: "",
      showDateInputs: false,
      selectedTimeOption: "20m",
    };
    this.chartRef = React.createRef();

  }

  componentDidMount() {


    this.fetchData(); // Fetch data initially

    // Fetch data every 20 seconds
    this.interval = setInterval(() => {
      this.fetchData();
    }, 5000);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sensorData !== this.props.sensorData) {

      if (this.myChart) {
        this.myChart.destroy();
        this.myChart = undefined;
      }

      this.fetchData();

    }
  }





  componentWillUnmount() {
    clearInterval(this.interval); // Clear the interval when the component unmounts
  }

  fetchData() {
    const influxDB = new InfluxDB({
      url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
      token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",
    });

    const queryApi = influxDB.getQueryApi("FarmIT");


    const query = `
    from(bucket: "test")
    |> range(start: -${this.state.selectedTimeOption}) 
    |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
    |> filter(fn: (r) => r["_field"] == "decoded_payload_temperature" or r["_field"] == "decoded_payload_humidity")
    |> filter(fn: (r) => r["topic"] == "v3/farmit@ttn/devices/${this.props.sensorData.sensorId}/up")
  `;


    const data = []; // Initialize an empty array to store the data

    const fetchData = queryApi.queryRows(query, {
      next: (row, tableMeta) => {
        // Extract the relevant data from the row
        const time = row["4"];
        const field = row["6"];
        const value = row["5"];



        // Create a new data object
        const newData = { time, [field]: value };

        // Push the new data object into the data array
        data.push(newData);
      },
      error: (error) => {
        console.error("Error occurred during query:", error);
      },
      complete: () => {
        // console.log("Query completed");

        this.updateChart(data);
      },
    });

    Promise.all([fetchData]).catch((error) => {
      console.error("Error occurred during queries:", error);
    });
  }


  exportDataToCSV = () => {
    // Show the date inputs
    document.getElementById('sensorGraph').classList.add("hidden");
    document.getElementById('zoomOptions').classList.add("hidden");
    this.setState({ showDateInputs: true });
  };

  handleStartDateChange = (event) => {
    this.setState({ startDate: event.target.value });
  };

  handleEndDateChange = (event) => {
    this.setState({ endDate: event.target.value });
  };

  handleTimeRangeChange = (event) => {
    this.setState({ selectedTimeOption: event.target.value });

    // wait 1 second and then update the chart
    setTimeout(() => {
      if (this.myChart) {


        this.myChart.destroy();
        this.myChart = undefined;
        this.fetchData();
      }
    }, 100);




  };

  resetZoom = () => {
    if (this.myChart) {
      this.myChart.resetZoom();
    }
  };


  handleExportCSV = () => {

    const { startDate, endDate } = this.state;
    // Perform the CSV export with the selected start and end dates

    const formattedStartDate = new Date(startDate).toISOString().slice(0, -5) + "Z";
    const formattedEndDate = new Date(endDate).toISOString().slice(0, -5) + "Z";

    console.log(formattedStartDate);
    console.log(formattedEndDate);

    // get data from influxdb
    const influxDB = new InfluxDB({
      url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
      token: "WWs7Muam9CP-Y65yjsLgz9VVuzS9mfuwWmlFgJJjiLTKjPUdZGXdTpfQtG0ULZ5a2iy8z54rfbS5nPtUb6qWKg==",

    });

    const queryApi = influxDB.getQueryApi("FarmIT");

    const testQuery = `
    from(bucket: "test")
    |> range(start: ${formattedStartDate}, stop: ${formattedEndDate})
    |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
    |> filter(fn: (r) => r["_field"] == "decoded_payload_temperature" or r["_field"] == "decoded_payload_humidity")
  `;

    let data = [];

    const fetchTestData = queryApi.queryRows(testQuery, {
      next: (row, tableMeta) => {
        const time = new Date(row[4]).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).replace(',', '');
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
        // console.log("Query completed");

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

        // wait for the export to finish and then return to the graph
      },
    });

    Promise.all([fetchTestData])
      .catch((error) => {
        console.error("Error occurred during queries:", error);
      });

    // After exporting, reset the state and hide the date inputs
    this.setState({ startDate: "", endDate: "", showDateInputs: false });


    // wait for the csv file to be downloaded and then return to the graph
    document.getElementById('sensorGraph').classList.remove("hidden");
    document.getElementById('zoomOptions').classList.remove("hidden");


  };

  updateChart(data) {
    if (data.length === 0) {
      return; // No new data, exit the function
    }

    // populate the graph with humidity and temperature data
    const humidityData = data.filter((row) => row["decoded_payload_humidity"]);
    const temperatureData = data.filter((row) => row["decoded_payload_temperature"]);

    this.setState({ humidityData, temperatureData });

    // store the time values in an array and don't repeat them, also transform into local time
    const uniqueTime = new Set(data.map((row) => row.time));
    const time = [...uniqueTime].map((time) => new Date(time).toLocaleTimeString());

    const darkMode = localStorage.getItem("darkMode") === "true";
    const labelColor = darkMode ? '#ffffff' : '#8D8D8D';





    if (!this.myChart) {
      // console.log("creating chart");
      const chartRef = this.chartRef.current;
      const myChartRef = chartRef.getContext("2d");

      // limit the data points to 20 independent of the time range
      //     const maxDataPoints = 20;
      //     const stepSize = Math.ceil(time.length / maxDataPoints);

      //     const downsampledTime = time.filter((_, index) => index % stepSize === 0);
      // const downsampledTemperatureData = temperatureData.filter((_, index) => index % stepSize === 0);
      // const downsampledHumidityData = humidityData.filter((_, index) => index % stepSize === 0);



      this.myChart = new Chart(myChartRef, {
        type: "line",
        data: {
          labels: time,
          datasets: [
            {
              label: "Temperature (ºC)",
              data: temperatureData.map((row) => row.decoded_payload_temperature),
              borderColor: "#C44940",
              fill: false,
            },
            {
              label: "Humidity (%)",
              data: humidityData.map((row) => row.decoded_payload_humidity),
              borderColor: "#4079c4",
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                // enable pan on the axis of choice
                pan: {
                  enabled: true,
                },


                mode: 'xy',
              }
            },
            legend: {
              display: true, // Display the legend
              labels: {
                color: labelColor, // Set the color of the legend text
              },
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
              ticks: {
                color: labelColor,
              }
            },
            x: {
              title: {
                display: true,
                text: "Time",
              },
              ticks: {
                color: labelColor,
              }
            },
          },
          animation: {
            duration: 500, // Animation duration in milliseconds
          },
        },
      });
    } else {

      // console.log("updating chart");

      const latestTime = new Date([...uniqueTime][uniqueTime.size - 1]).toLocaleTimeString();
      const latestTemperature = temperatureData[temperatureData.length - 1].decoded_payload_temperature;
      const latestHumidity = humidityData[humidityData.length - 1].decoded_payload_humidity;

      if (!this.myChart.data.labels.includes(latestTime)) {
        // Add new data point to the chart
        this.myChart.data.labels.push(latestTime);
        this.myChart.data.datasets[0].data.push(latestTemperature);
        this.myChart.data.datasets[1].data.push(latestHumidity);

        // Remove the oldest data point if the chart exceeds a certain number of points
        const maxDataPoints = 20; // Adjust as needed
        if (this.myChart.data.labels.length > maxDataPoints) {
          this.myChart.data.labels.shift();
          this.myChart.data.datasets[0].data.shift();
          this.myChart.data.datasets[1].data.shift();
        }

        this.myChart.update();
      }
    }
  }

  render() {
    const { setOpenModal } = this.props;

    const { showDateInputs, startDate, endDate } = this.state;

    const timeOptions = [
      { value: '20m', label: 'Past 20m' },
      { value: '1h', label: 'Past 1h' },
      { value: '3h', label: 'Past 3h' },
      { value: '6h', label: 'Past 6h' },
      { value: '12h', label: 'Past 12h' },
      { value: '24h', label: 'Past 24h' },
    ];

    return (
      <div className={`modalContainer ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
        <div className="titleCloseBtn">
          <button onClick={() => { setOpenModal(false); this.props.largeMap(); }}>X</button>
        </div>
        <div className="title2">
          <h1>Temperature and Humidity Values From Sensor {this.props.sensorData.sensorId}</h1>

        </div>
        <div className="body">


          <canvas id="sensorGraph" ref={this.chartRef} style={{ height: "250px", width: "95%" }} />


          <br />
          {showDateInputs && (
            <form id="exportSensorDataForm" onSubmit={this.handleExportCSV}>
              <label htmlFor="startDate">Start Date:</label>
              <input type="datetime-local" id="startDate" value={startDate} onChange={this.handleStartDateChange} required />
              <br /><br />
              <label htmlFor="endDate">End Date:</label>
              <input type="datetime-local" id="endDate" value={endDate} onChange={this.handleEndDateChange} required />
              <br /><br />
              <input type="submit" value="Export data" />
            </form>
          )}

          <div id="zoomOptions" className="zoomOptions">
            <select value={this.selectedTimeOption} onChange={this.handleTimeRangeChange} className="timerange-dropdown">
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <button className="resetZoomButton" onClick={this.resetZoom}>Reset Zoom</button>
            {!showDateInputs && (
              <div className="exportButton">
                <button onClick={this.exportDataToCSV}><i class="fa-sharp fa-solid fa-download"></i> Download</button>
              </div>
            )}
          </div>

        </div>

      </div>
    );
  }
}

export default Modal;