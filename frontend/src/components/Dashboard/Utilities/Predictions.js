import React from 'react';
import EXIF from 'exif-js';

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      previewImages: [],
      selectedImage: null,
      selectedImageDate: null,
    };
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
    // Process the images here
  }

  render() {
    const { previewImages, selectedImage, selectedImageDate } = this.state;
    const hasUploadedImages = previewImages.length > 0;

    return (
      <>
        <section className='imageInput'>
          <h2>Input</h2>
          {hasUploadedImages && (
            <div>
              <img className='largePreview' src={selectedImage} alt="Large preview of uploaded image" />
              <div className='thumbnailContainer'>
                {previewImages.map((image, index) => (
                  <img
                    key={index}
                    className={`thumbnail ${selectedImage === image ? 'selected' : ''}`}
                    src={image}
                    alt={`Preview of uploaded image ${index}`}
                    onClick={() => this.setState({ selectedImage: image }, () => {
                      // Get the date from the selected image
                      const selectedImageFile = this.state.selectedImages[index];
                      this.getDateFromImage(selectedImageFile);
                    })}
                  />
                ))}
              </div>
              {selectedImageDate && (
                <p className='imageDate'>Date taken: {selectedImageDate}</p>
              )}
            </div>
          )}
        </section>

        <section className='imageOutput'>
          <h2>Output</h2>
          {/* Render output here */}
        </section>

        <section className='predictionsBtns'>
          <label id='uploadImgs' className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>
            <input type="file" multiple onChange={this.handleFileUpload} />
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload Images
          </label>

          <button id='processImgs' className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`} onClick={this.processImages}>Process Images</button>

          <button id='downloadImgs' className={`${localStorage.getItem("darkMode") === "true" ? "darkMode" : ''}`}>Download Images <i className="fa-solid fa-cloud-arrow-down"></i></button>
        </section>
      </>
    );
  }
}

export default Predictions;
