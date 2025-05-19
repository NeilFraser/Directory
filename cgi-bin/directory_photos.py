import directory_config
import os
import random
import re
import shutil


# Allowed image file extensions.
IMAGE_EXTS = ("jpg", "jpeg", "gif", "png")

# This is an employee directory, not Google Photos.
MAX_IMAGES = 4


# Validate the type string.
def validate_type(type):
  if type not in ("employees", "offices"):
    raise NameError("Invalid type")


# Find the path to the directory of images for an entity (office or employee).
def path(type, id):
  validate_type(type)
  id = int(id)
  return os.path.join(directory_config.UPLOAD_DIR, type, str(id))


# Find all images for an entity.
def list_images(type, id):
  images = []
  dir = path(type, id)
  if os.path.isdir(dir):
    f = os.listdir(dir)
    for file in f:
      for ext in IMAGE_EXTS:
        if file.endswith("." + ext):
          images.append(file)
          break
    # TODO: Support smarter sorting if MAX_IMAGES > 10.
    images.sort()
  return images


# Fetch the primary image for an entity.
def get_primary_image(type, id):
  images = list_images(type, id)
  if len(images) > 0:
    return images[0]
  return None


# Delete all images belonging to an entity.
def delete_images(type, id):
  dir = path(type, id)
  if os.path.isdir(dir):
    shutil.rmtree(dir)


# Delete one specific image.
def delete_image(type, id, filename):
  if not re.match(r"\d+_\w+\.\w+", filename):
    raise Exception("Illegal filename")
  dir = path(type, id)
  # Delete the image file
  try:
    os.remove(os.path.join(dir, str(filename)))
  except FileNotFoundError:
    pass


def add_image(type, id, image_bytes, ext):
  ext = ext.lower()
  if ext not in IMAGE_EXTS:
    raise Exception("Illegal extension")

  # Find the biggest number
  images = list_images(type, id)
  if len(images) >= MAX_IMAGES:
    raise Exception("Maximum image limit")
  number = -1
  for image in images:
    m = re.search(r"\d+", image)
    if m:
      number = max(number, int(m.group()))
  number += 1

  # Save the image to disk.
  dir = path(type, id)
  if not os.path.isdir(dir):
    os.mkdir(dir)
  filename = str(number) + "_" + random_string() + "." + ext
  with open(os.path.join(dir, filename), "wb") as f:
    f.write(image_bytes)
  return filename


# Rename an image to a new order.
def rename_image(type, id, filename, order):
  if not re.match(r"\d+_\w+\.\w+", filename):
    raise Exception("Illegal filename")
  if filename.startswith(str(order) + "_"):
    return  # No need to rename.
  dir = path(type, id)
  # Rename the image file
  try:
    new_filename = str(order) + "_" + random_string() + "." + filename.split(".")[-1]
    os.rename(os.path.join(dir, filename), os.path.join(dir, new_filename))
  except FileNotFoundError:
    pass


# Random 6 character string.
def random_string():
  soup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return "".join(random.choices(soup, k=6))
