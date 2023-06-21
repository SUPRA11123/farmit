# Create your models here.
import os

from django.db import models
from django.utils.translation import gettext_lazy as _


class ImageModel(models.Model):
    image = models.ImageField(_("image"), upload_to='images')

    class Meta:
        verbose_name = "Image"
        verbose_name_plural = "Images"

    def __str__(self):
        return str(os.path.split(self.image.path)[-1])