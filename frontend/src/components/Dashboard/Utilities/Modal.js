import React from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import { Chart } from "chart.js/auto";


class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temperatureData: [],
      humidityData: [],
    };
    this.chartRef = React.createRef();
    this.chart = null;

  }

  componentDidMount() {

    const { sensorData } = this.props;
    console.log("Sensor Data:", sensorData);
    
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
      token: "m6MJWTKk2p2bCoq1hqmsyt44relL7JCGpu-NbPh5iMPDODLf9ALAeXdbfY77iXr3T-eY7GkbU1BKhf6hMzT4eA==",
    });
  
    const queryApi = influxDB.getQueryApi("FarmIT");
  
    const temperatureQuery = `
      from(bucket: "test")
      |> range(start: -24h)
      |> filter(fn: (r) =>
        r._measurement == "mqtt_consumer" and
        r._field == "decoded_payload_temperature" and
        exists r._value
      )
    `;
  
    const humidityQuery = `
      from(bucket: "test")
      |> range(start: -24h)
      |> filter(fn: (r) =>
        r._measurement == "mqtt_consumer" and
        r._field == "decoded_payload_humidity" and
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
            <h1>Real-Time Temperature and Humidity Values From Sensor X</h1>
          </div>
          <div className="body">
            <div>
            <canvas ref={this.chartRef} style={{ height: "450px", width: "700px" }} />
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}  

export default Modal;