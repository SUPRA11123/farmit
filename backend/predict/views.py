'''from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
import numpy as np
import argparse
import time
import cv2
import os
import torch
from PIL import Image
import numpy as np
#from yolov5.models.experimental import attempt_load
#from yolov5.utils.plots import plot_one_box
from matplotlib import pyplot as plt
#from yolov5.utils.general import non_max_suppression
#from yolov5.utils.torch_utils import select_device
#from yolov5.utils.autoanchor import check_anchors
# Create your views here.
from django.http import HttpResponse

from django.conf import settings


def index(request):
    return render(request, 'parseImage/index.html')
model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
def process_images(input_img):
    # Get the selected image file paths
    classIDs = []
    # fruitlist = []
    fruitsfound = {}
    # Process each selected image
    for file_path in input_img:
        # Load the image
        image = cv2.imread(file_path)
        if image.size == 0:
            print("no img")
        # Process the image with your model
        # ... (your model inference code here)
        results = model(image)
        # Display the image with the results
        # ... (your code to display the image here)
        results.print()
        results.show()
    cv2.imwrite(
        os.path.join(settings.BASE_DIR, f'static/parseImage/{img}_mod.jpg'),
        image,)
    return fruitsfound, f'{image}_mod.jpg'
# Images
#imgs = ['D:/OD/Supra/images/train/22.jpg','D:/OD/Supra/images/train/34.jpg']  # batch of images
def results(request):
    
    if request.method == 'POST' and request.FILES['fileup']:
        myfile = request.FILES['fileup']
        fs = FileSystemStorage()
        # conf = float(request.POST['confidence']) * 0.1
        conf = 0
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        fruitOut, outImg = process_images(filename)
        # return HttpResponse("uploaded at %s.. the list of fruits are: %s" % (uploaded_file_url, str(fruitOut)))
        return render(request, 'parseImage/results.html', {
            'outImg': outImg,
            'fruitOut': fruitOut
        })
    # return render(request, 'parseImage/results.html')
    return HttpResponse("could not upload")

'''
'''
import io
from PIL import Image as im
import torch

from django.shortcuts import render
from django.views.generic.edit import CreateView

from .models import ImageModel
from .forms import ImageUploadForm

def index(request):
    return render(request, 'image/imagemodel_form.html')
class UploadImage(CreateView):
    model = ImageModel
    template_name = 'image/imagemodel_form.html'
    fields = ["image"]

    def post(self, request, *args, **kwargs):
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            img = request.FILES.get('image')
            img_instance = ImageModel(
                image=img
            )
            img_instance.save()

            uploaded_img_qs = ImageModel.objects.filter().last()
            img_bytes = uploaded_img_qs.image.read()
            img = im.open(io.BytesIO(img_bytes))

            # Change this to the correct path
            model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
            results = model(img, size=640)
            results.render()
            for img in results.imgs:
                img_base64 = im.fromarray(img)
                img_base64.save("media/yolo_out/image0.jpg", format="JPEG")

            inference_img = "/media/yolo_out/image0.jpg"

            form = ImageUploadForm()
            context = {
                "form": form,
                "inference_img": inference_img
            }
            return render(request, 'image/imagemodel_form.html', context)

        else:
            form = ImageUploadForm()
        context = {
            "form": form
        }
        return render(request, 'image/imagemodel_form.html', context)
    '''
'''
import torch
import numpy as np
from django.shortcuts import render
import torchvision.transforms as transforms
# Define your YOLOv5 model and related functions here
from PIL import Image
from io import BytesIO

def yolov5_view(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.getList['image']
                # Read the file data
        file_data = uploaded_file.read()
        
        # Create a BytesIO object from the file data
        file_stream = BytesIO(file_data)
        img=Image.open(file_stream)
        image_np = np.array(img)
        image_tensor = torch.from_numpy(image_np).unsqueeze(0)
        # Open the image using PIL
        
        #Image.open(file_stream)
        # Load YOLOv5 model
        model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt') # Replace with your code to load the model
        
        # Define the preprocessing transformations
        preprocess = transforms.Compose([
            transforms.Resize((640, 480)),  # Resize to desired dimensions
            transforms.ToTensor(),  # Convert to tensor
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Normalize
])

# Apply the preprocessing transformations
        preprocessed_image = preprocess(img)

        # Run the model on the preprocessed image
        predictions = model(preprocessed_image)  # Replace with your code to make predictions
        # Process the predictions as needed
        #processed_predictions = process_predictions(predictions)  # Replace with your code to process the predictions
        
        # Return the results as a response
        return render(request, 'results.html', {'predictions': predictions})
    
    # If it's not a POST request, render the form template
    return render(request, 'upload.html')
'''
from django.shortcuts import render
from PIL import Image
import torch
from io import BytesIO
from collections import Counter
import os
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
from django.conf import settings

def yolov5_view(request):
    print("SYUDHAUYADHSY")
    class_counts_total = 0
    if request.method != 'POST':
        # If it's not a POST request, render the form template
        return render(request, 'upload.html')
    # Assuming you have a form with an 'image' field for file upload
    uploaded_files = request.FILES.getlist('fileup')
    fs = FileSystemStorage()
    # Load the YOLOv5 model
    model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
    # Create the output directory if it doesn't exist    
    output_dir = 'output'
    output_dir = os.path.join(settings.MEDIA_ROOT, 'output')
    os.makedirs(output_dir, exist_ok=True)
    # List to store the predictions for each image
    predictions_list = []
    image_paths = []
    a = 0   

    # Process each uploaded image
    for uploaded_file in uploaded_files:
        # Read the file data
        file_data = uploaded_file.read()

# Create a BytesIO object from the file data
        file_stream = BytesIO(file_data)

# Open the image using PIL
        image = Image.open(file_stream)

        # Run the model on the image
        results = model(image)
        #results.print()
        #results.show()
        #results.save()

        results_count=results.pandas().xyxy[0]
        # Add the predictions to the list
        #predictions_list.append((results_count,image_paths))
        predictions_list.append(results_count)
        # Save the image in the output directory
        #image_filename = os.path.join(output_dir, results.save())
        #image.save(image_filename)
        #filename = fs.save(output_dir, results)
        total_classes = sum(len(predictions) for predictions in predictions_list)
        # Count the occurrences of each class
        #class_names = [prediction[0] for predictions in predictions_list for prediction in predictions]
            # Count the occurrences of each class
        #class_counts = Counter(class_names)
        #print(class_counts)
        #results_blue=print(results_count['name'].value_counts()['Blue'])
        # Calculate the occurrences of each class
        class_counts=results_count['name'].value_counts()

        print("boas")
        
        print(class_counts[0])
      

        class_counts_total = class_counts.add(class_counts_total, fill_value=0)
        
       



        
        print(class_counts_total)
        # Get the count of "Blue" class across all images
        #blue_count1 = sum(class_counts.get("Blue", 0) for class_name, count in class_counts.items())
        #blue_count = class_counts.get("Blue", 0) 
        #blue_count = sum(class_counts.get('Blue', 0) for class_counts in predictions_list)
        blue_count = sum(count for class_name, count in class_counts.items() if class_name == 'Blue')
        # Save the images


        for i,image_array in enumerate(results.render()):

            print(i)
        # Convert the NumPy array to a PIL image
            image_pil = Image.fromarray(image_array)
        
            # Save the image
            
            image_filename = f"image_{a}.jpg"
            print(image_filename)
            image_path = os.path.join(output_dir, image_filename)
            image_pil.save(image_path)
            
            a+=1
            
        
        image_paths.append(image_path)

        print(image_paths)
                    # Save the image in the output directory
        
        
 
        #print(results_blue)
        #results_red=print(results_count['name'].value_counts()['Red'])
        #results_green=print(results_count['name'].value_counts()['Green'])

    # Return the results to the template
    # get the whole path until results.html
    current_path = os.getcwd()

    file_path = current_path.replace('\\', '/')
    print(file_path)

    # add predict/templates/results.html to the path
    file_path = file_path + '/predict/templates/results.html'
    
    
    return render(request, file_path, {'predictions_list':predictions_list,'total_classes': total_classes,'class_counts':class_counts,'class_counts_total':class_counts_total,'blue_count':int(blue_count),'image_paths':image_paths})
