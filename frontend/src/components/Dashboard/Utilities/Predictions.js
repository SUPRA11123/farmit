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
        
       
        <section className='imageInput'>
          <h2>Input</h2>
          {previewImages.length > 0 && (
            previewImages.map((previewImage, index) => (
              <img key={index} src={previewImage} alt={`Preview of uploaded image ${index}`} />
            ))
          )}
        </section>

        <section className='imageOutput'>
          <h2>Output</h2>
          
         
        </section>

        <section className='predictionsBtns'>

        <label id='uploadImgs'>
            <input type="file" multiple onChange={this.handleFileUpload}/>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload Images
        </label>

       {/*{hasUploadedImages && (  )}*/} 
        <button id='processImgs' onClick={this.processImages}>Process Images</button>
         
        <button id='downloadImgs'>Download Images <i className="fa-solid fa-cloud-arrow-down"></i></button>
        </section>
      </>
    );
  }
}

export default Predictions;
