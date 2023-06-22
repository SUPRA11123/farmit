import React from 'react';
import EXIF from 'exif-js';
import axios from "axios";
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

const URL = process.env.REACT_APP_URL;

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      previewImages: [],
      selectedImage: null,
      selectedImageDate: null,
      totalAll: 0,
      totalRed: 0,
      totalBlue: 0,
      totalGreen: 0,
      percentage: 0,
    };

    this.processImages = this.processImages.bind(this);
    this.clearAllImages = this.clearAllImages.bind(this);
    this.scanImages = this.scanImages.bind(this);
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    this.createBarChart();
  }

  updateChart() {
    const { totalGreen, totalRed, totalBlue } = this.state;

    if (!this.chartRef.current || !totalGreen || !totalRed || !totalBlue) {
      return;
    }

    const chart = this.chartRef.current.chart;

    // Update the chart data and options
    chart.data.datasets[0].data = [totalGreen, totalRed, totalBlue];
    chart.update();
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the relevant state values have changed
    if (
      prevState.totalGreen !== this.state.totalGreen ||
      prevState.totalRed !== this.state.totalRed ||
      prevState.totalBlue !== this.state.totalBlue
    ) {
      this.updateChart();
    }
  }

  handleFileUpload = (event) => {
    const files = event.target.files;
    const selectedImages = [];
    const previewImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        selectedImages.push(file);
        previewImages.push(reader.result);

        if (selectedImages.length === files.length) {
          this.setState({
            selectedImages,
            previewImages,
            selectedImage: previewImages[0],
          });

          const firstImage = selectedImages[0];
          this.getDateFromImage(firstImage);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  getDateFromImage(imageFile) {
    const reader = new FileReader();

    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result;

      image.onload = () => {
        EXIF.getData(image, () => {
          const dateTaken = EXIF.getTag(image, 'DateTimeOriginal');
          this.setState({ selectedImageDate: dateTaken }); // Update the selectedImageDate state
        });
      };
    };

    reader.readAsDataURL(imageFile);
  }

  scanImages() {
    document.getElementById('processImgs').innerHTML = "<i class='fas fa-spinner fa-spin'></i>";
    const { selectedImages } = this.state;
  
    const formData = new FormData();
  
    selectedImages.forEach((imageFile, index) => {
      formData.append('fileup', imageFile);
    });
  
    axios
      .post('http://localhost:8000/newscan/results/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log(response.data); // Handle the response here
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = response.data;
        const totalBerries = tempDiv.querySelector("#total");
        const typeBerries = tempDiv.querySelector("#types");

        const text = typeBerries.innerHTML;

        const blueRegex = /Blue\s+(\d+\.\d+)/;
        const greenRegex = /Green\s+(\d+\.\d+)/;
        const redRegex = /Red\s+(\d+\.\d+)/;

        const blueMatch = text.match(blueRegex);
        const greenMatch = text.match(greenRegex);
        const redMatch = text.match(redRegex);

        const blueNumber = blueMatch ? parseFloat(blueMatch[1]) : null;
        const greenNumber = greenMatch ? parseFloat(greenMatch[1]) : null;
        const redNumber = redMatch ? parseFloat(redMatch[1]) : null;

        document.getElementById("BlueCount").innerHTML = blueNumber;
        document.getElementById("GreenCount").innerHTML = greenNumber;
        document.getElementById("RedCount").innerHTML = redNumber;

        const totalAll = parseFloat(totalBerries.innerHTML);
        const bluePercentage = (blueNumber / totalAll) * 100;

        this.setState({totalAll: totalBerries.innerHTML, totalRed: redNumber, totalGreen: greenNumber, totalBlue: blueNumber, percentage: bluePercentage.toFixed(0) });

        document.getElementById('predictionDataContainer').classList.remove('hidden');
        document.getElementById('processImgs').classList.add('hidden');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  processImages() {
    const { selectedImages } = this.state;
    document.getElementById('processImgs').innerHTML = "<i class='fas fa-spinner fa-spin'></i>";
  
    if (selectedImages.length === 0) {
      // No images selected
      return;
    }
  
    const processedImages = [...this.state.previewImages];
  
    selectedImages.forEach((imageFile, index) => {
      const formData = new FormData();
      formData.append("fileup", imageFile);
  
      axios
        .post(URL + "scan/results/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": "{{ csrf_token }}",
          },
        })
        .then((response) => {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = response.data;
          const imageElement = tempDiv.querySelector("img");
          const imageSrc = imageElement.src;
          const modifiedImageSrc = imageSrc.replace(
            "http://localhost:3000",
            "http://localhost:8000"
          );
  
          processedImages[index] = modifiedImageSrc;
  
          if (index === selectedImages.length - 1) {
            this.setState({
              previewImages: processedImages,
              selectedImageIndex: 0,
            });
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .then(() => {
          
          document.getElementById('processImgs').classList.add('hidden');
          document.getElementById('countMaturity').classList.remove('hidden');
          document.getElementById('imageInputH2').innerText = "Results";
        });
    });
  }

  clearAllImages() {
    this.setState({
      selectedImages: [],
      previewImages: [],
      selectedImage: null,
      selectedImageDate: null,
    });
    document.getElementById('predictionDataContainer').classList.add('hidden');
  }
  createBarChart() {
    const ctx = this.chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Green', 'Red', 'Blue'],
        datasets: [
          {
            label: 'Bars',
            data: [this.state.totalGreen, this.state.totalRed, this.state.totalBlue],
            backgroundColor: ['#52AF4E', '#D82C2C', '#6100FF'],
            barBorderRadius: 5,
          },
        ],
      },
      options: {
        scales: {
          y: {
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            font: {
              weight: 'bold',
            },
            color: 'black',
            display: (context) => {
              return context.dataset.data[context.dataIndex] > 0; // Display label only if data value is greater than 0
            },
            formatter: (value) => {
              return value; // Customize the label formatting if needed
            },
          },
        },
      },
    });
    this.chartRef.current.chart = chart;
  }
  
  
  
  render() {
    const {
      previewImages,
      selectedImage,
      selectedImageDate,
      selectedImages,
    } = this.state;
    const hasUploadedImages = previewImages.length > 0;
    const showProcessButton = hasUploadedImages;
    const showClearButton = hasUploadedImages;
  
    return (
      <>
        <section className='imageInput'>
          <div className={`imageInputHeader ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
            {showClearButton && (
              <button className={`imageClearBtn ${localStorage.getItem('darkMode') === 'true' ? 'darkMode' : ''}`} onClick={this.clearAllImages}>
                <i className="fa-solid fa-delete-left"></i>
                <span className="clearAllText">Clear All</span>
              </button>
            )}
          </div>
  
          {hasUploadedImages && (
            <div>
              <div id="thumbnailContainer" className='thumbnailContainer'>
                {previewImages.map((image, index) => (
                  <img
                    key={index}
                    className={`thumbnail ${
                      selectedImage === image ? 'selected' : ''
                    }`}
                    src={image}
                    alt={`Preview of uploaded image ${index}`}
                    onClick={() =>
                      this.setState({ selectedImage: image }, () => {
                        // Get the date from the selected image
                        const selectedImageFile = selectedImages[index];
                        this.getDateFromImage(selectedImageFile);
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}
  
          {!hasUploadedImages && (
            <label
              id='uploadImgs'
              className={`${
                localStorage.getItem('darkMode') === 'true' ? 'darkMode' : ''
              }`}
            >
              <input
                id='imagesToBeProccessed'
                type='file'
                multiple
                onChange={this.handleFileUpload}
              />
              <i className='fa-solid fa-cloud-arrow-up'></i> Upload Images
            </label>
          )}
        </section>
  
        <section id='imageOutput' className='imageOutput'>
          <div className={`imageInputHeader ${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
          </div>
          
          {selectedImage ? (
            <>
            <div className='largePreviewContainer'>

            <img
              className='largePreview'
              src={selectedImage}
              alt='Large preview of uploaded image'
            />
            
            </div>
          
           
            <p id='countMaturity' className='hidden'>Count: ??? <br></br>Maturity: ???</p>
            </>
          ) : (
            <p></p>
          )}
          <div id='predictionDataContainer' className='predictionDataContainer hidden'>

            <div className='barChartContainer'>

              <h2>Maturity Levels</h2>

              <div className='maturityContainer'>
                <span id='GreenCount'>0</span>
                <span id='RedCount'>0</span>
                <span id='BlueCount'>0</span>
              </div>

              <canvas width="90%" ref={this.chartRef}></canvas>

            </div>

            <div className='countContainer'>

              <h2>Count</h2>

              <div className='countBox'>

                <p>Total Mature</p>

                <h3>{this.state.percentage}%</h3>

              </div>

              <div className='countBox'>

                <p>Weight</p>

                <h3>{((this.state.totalBlue)*0.3).toFixed(0)}g</h3>

              </div>

            </div>

          </div>
          {/* Render output here */}
        </section>
  
        <section className='predictionsBtns'>
          {showProcessButton && (
            <button
              id='processImgs'
              className={`${localStorage.getItem('darkMode') === 'true' ? 'darkMode' : ''}`}
              onClick={this.scanImages}
              disabled={!hasUploadedImages}
            >
              Scan
            </button>
          )}
  
          <button
            id='downloadImgs'
            className={`hidden ${
              localStorage.getItem('darkMode') === 'true' ? 'darkMode' : ''
            }`}
            disabled={!hasUploadedImages}
          >
            Download Images <i className='fa-solid fa-cloud-arrow-down'></i>
          </button>
        </section>
      </>
    );
  }
}

export default Predictions;
