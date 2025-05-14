#!C:\Users\neilf\AppData\Local\Microsoft\WindowsApps\python3.exe

import directory_photos
import json
import os
import re

from html import escape
from sys import stdin
from urllib.parse import urlencode

def getBoundary():
  ct = os.environ.get("CONTENT_TYPE", "")
  if not ct:
    raise Exception("No Content-Type header")
  ct_parts = ct.split("; ")
  if "multipart/form-data" not in ct_parts:
    raise Exception("Not multipart/form-data")
  for ct_part in ct_parts:
    if ct_part.startswith("boundary="):
      return ct_part[9:].strip()
  raise Exception("No boundary")


def getParams(boundary):
  # Read all the form content.
  content_len = os.environ.get("CONTENT_LENGTH", "0")
  content = stdin.buffer.read(int(content_len))

  # Split the form content into sections based on the boundary string.
  params = {}
  for param_content in content.split(bytes("--" + boundary, "utf-8")):
    # Split the parameter into headers and data.
    blank = param_content.find(b"\r\n\r\n")
    if blank == -1:
      continue
    headers = param_content[:blank].decode("utf-8")
    data = param_content[blank + 4 :]
    if data.endswith(b"\r\n"):
      data = data[:-2]
    param = {}
    for header in headers.split("\r\n"):
      colon = header.find(": ")
      if colon == -1: continue
      header_name = header[:colon]
      header_data = header[colon + 2:]
      param[header_name] = header_data
    param["Data"] = data

    header = param.get("Content-Disposition", "")
    m = re.search(r' name="(\w+)"', header)
    if m:
      params[m.group(1)] = param
  return params


def print_diagnostic(boundary, params):
  print("Content-type: text/html")
  print()
  print ("""
  <html>
  <body>
  <h1>Directory: CGI POST multipart/form-data Test</h1>
  <h2>Boundary:</h2>
  %s
  <h2>Params:</h2>
  """ % escape(boundary))
  for name in params.keys():
    print("%s<pre>%s</pre><hr>" % (name, params[name]))
  print ("""
  </body>
  </html>
  """)


def json_uploadPhoto(params):
  if "image" not in params:
    return {"error": "No image"}
  if "type" not in params:
    return {"error": "No type"}
  if "id" not in params:
    return {"error": "No id"}
  if "name" not in params:
    return {"error": "No name"}

  type = params["type"]["Data"].decode("utf-8")
  directory_photos.validate_type(type)
  name = params["name"]["Data"].decode("utf-8")

  try:
    id = int(params["id"]["Data"])
  except ValueError:
    return {"error": "Invalid id"}

  image_param = params["image"]
  image = image_param["Data"]
  m = re.search(r' filename="[^"]*\.(\w+)"', image_param["Content-Disposition"])
  if not m:
    return {"error": "No filename"}
  try:
    directory_photos.add_image(type, id, image, m.group(1))
  except (Exception, NameError) as e:
    return {"error": str(e)}
  # Redirect to the photos page.
  print("Status: 302 Found")
  print("Location: /../edit/photos.html?" + urlencode({"type": type, "id": id, "name": name}))
  print("Content-type: text/plain")
  print()
  print ("Upload successful.  Redirecting to photos editor...")


# Parse the multipart request and route to the requested handler.
boundary = getBoundary()
params = getParams(boundary)
nav = params.get("nav", None)
if not nav:
  print_diagnostic(boundary, params)
else:
  # directory_utils.xhr_check()
  data = None
  if nav["Data"] == b"uploadPhoto":
    data = json_uploadPhoto(params)
  else:
    data = {"error": "Unknown nav value"}
  if data is not None:
    print("Content-type: application/json")
    print()
    print(json.dumps(data))
