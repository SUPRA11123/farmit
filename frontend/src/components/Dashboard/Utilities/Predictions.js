import React from 'react';

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      previewImages: []
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
            previewImages
          });
        }
      };

      reader.readAsDataURL(file);
    }
  }

  processImages() {

    //Process the images here
    
  }

  render() {
    const { previewImages, selectedImages } = this.state;
    const hasUploadedImages = previewImages.length > 0;

    return (
      <>
        <section className='imageUpload'>
          <h2>Upload images</h2>
            <input type="file" multiple onChange={this.handleFileUpload} />
          {hasUploadedImages && (
            <button onClick={this.processImages}>Predict fruit and count</button>
          )}
        </section>
        <section className='imagePreview'>
          <h2>Image preview</h2>
          {previewImages.length > 0 && (
            previewImages.map((previewImage, index) => (
              <img key={index} src={previewImage} alt={`Preview of uploaded image ${index}`} />
            ))
          )}
        </section>
      </>
    );
  }
}

export default Predictions;
