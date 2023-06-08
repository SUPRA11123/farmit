import React from 'react';
import EXIF from 'exif-js';
import axios from "axios";

const URL = process.env.REACT_APP_URL;

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      previewImages: [],
      selectedImage: null,
      selectedImageDate: null,
    };

    this.processImages = this.processImages.bind(this);

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
        });
    });
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
  
    return (
      <>
        <section className='imageInput'>
          <div className='imageInputHeader'>
            <h2>Input Images</h2>
          </div>
  
          {hasUploadedImages && (
            <div>
              <div className='thumbnailContainer'>
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
              {selectedImageDate && (
                <p className='imageDate'>Date taken: {selectedImageDate}</p>
              )}
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
          <h2>Output</h2>
          {selectedImage ? (
            <img
              className='largePreview'
              src={selectedImage}
              alt='Large preview of uploaded image'
            />
          ) : (
            <p>No image selected</p>
          )}
          {/* Render output here */}
        </section>
  
        <section className='predictionsBtns'>
          {showProcessButton && (
            <button
              id='processImgs'
              className={`${
                localStorage.getItem('darkMode') === 'true' ? 'darkMode' : ''
              }`}
              onClick={this.processImages}
              disabled={!hasUploadedImages}
            >
              Process Images
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
