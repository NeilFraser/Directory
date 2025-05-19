#!C:\Users\neilf\AppData\Local\Microsoft\WindowsApps\python3.exe

import directory_utils
import directory_photos
import json
import os
import re

from html import escape


# Show diagnostic information for the web.
def print_diagnostic(params):
  print("Content-type: text/html")
  print()
  print ("""
  <html>
  <body>
  <h1>Directory: CGI POST Test</h1>
  <p>&#9989; This CGI script works!</p>
  <h2>POST parameters:</h2>
  <pre>""")
  for name in params.keys():
    print("%s = %s" % (escape(name), escape(params[name])))
  if len(params) == 0:
    print("<i>No POST parameters</i>")
  print ("""</pre>
  <h2>Environment Variables:</h2>
  <pre>
  """)
  for name in os.environ.keys():
    print("%s = %s" % (escape(name), escape(os.environ[name])))
  print ("""
  </pre>
  </body>
  </html>
  """)


# Edit a single employee.
def save_employee(query):
  try:
    id = int(query.get("id", 0))
  except ValueError:
    id = 0
  name = query.get("name", None) or None
  email = query.get("email", None) or None
  phone = query.get("phone", None) or None
  title = query.get("title", None) or None
  about = query.get("about", None) or None
  offices = query.get("offices", "").split(",")
  skills = query.get("skills", "").split(",")
  try:
    languages = json.loads(query.get("languages", "") or "{}")
  except json.decoder.JSONDecodeError:
    languages = {}
  try:
    birthday = int(query.get("birthday", None))
  except ValueError:
    birthday = None
  try:
    birthmonth = int(query.get("birthmonth", None))
  except ValueError:
    birthmonth = None
  startDate = query.get("startdate", None) or None
  active = int(query.get("active", 0))

  (myConn, myCursor) = directory_utils.open()
  # Update existing record.
  myCursor.execute("UPDATE Employees SET name = %s, email = %s, phone = %s, title = %s, about = %s, birthday = %s, birthmonth = %s, startdate = %s, active = %s WHERE id = %s",
                    (name, email, phone, title, about, birthday, birthmonth, startDate, active, id))
  myCursor.execute("DELETE FROM Employees_Offices WHERE employee = %s", (id,))
  myCursor.execute("DELETE FROM Employees_Skills WHERE employee = %s", (id,))
  myCursor.execute("DELETE FROM Employees_Languages WHERE employee = %s", (id,))

  if len(offices) > 0:
    office_data = []
    for office in offices:
      office_data.append("(%d,%d)" % (id, int(office)))
    myCursor.execute("INSERT INTO Employees_Offices (employee, office) VALUES %s" % ",".join(office_data))

  if len(skills) > 0:
    skill_data = []
    for skill in skills:
      skill_data.append("(%d,%d)" % (id, int(skill)))
    myCursor.execute("INSERT INTO Employees_Skills (employee, skill) VALUES %s" % ",".join(skill_data))

  language_data = []
  for language in languages:
    level = int(languages[language])
    if re.match(r"^\w+$", language) and level > 0:
      language_data.append("(%d,\"%s\",%d)" % (id, language, level))
  if len(language_data) > 0:
    myCursor.execute("INSERT INTO Employees_Languages (employee, language, level) VALUES %s" % ",".join(language_data))

  myConn.commit()
  return {"employeeId": id}


# Add a new employee.
def add_employee(query):
  name = query.get("name", None) or None
  active = True

  (myConn, myCursor) = directory_utils.open()
    # Add new record.
  myCursor.execute("INSERT INTO Employees (name, active) VALUES (%s, %s)",
                    (name, active))
  id = myCursor.lastrowid
  myConn.commit()
  return {"employeeId": id}


# Delete a single employee.
def delete_employee(query):
  try:
    id = int(query.get("id", 0))
  except ValueError:
    id = 0
  deleted = 0

  if id > 0:
    (myConn, myCursor) = directory_utils.open()
    myCursor.execute("DELETE FROM Employees_Offices WHERE employee = %s", (id,))
    myCursor.execute("DELETE FROM Employees WHERE id = %s", (id,))
    myConn.commit()
    deleted = myCursor.rowcount
    # Delete all images belonging to this employee.
    directory_photos.delete_images("employees", id)
  return {"deleted": deleted}


# Edit a single office.
def save_office(query):
  try:
    id = int(query.get("id", 0))
  except ValueError:
    id = 0
  name = query.get("name", None) or None
  address = query.get("address", None) or None
  try:
    latitude = float(query.get("latitude", None))
  except ValueError:
    latitude = None
  try:
    longitude = float(query.get("longitude", None)) or None
  except ValueError:
    longitude = None

  (myConn, myCursor) = directory_utils.open()
  # Update existing record.
  myCursor.execute("UPDATE Offices SET name = %s, address = %s, latitude = %s, longitude = %s WHERE id = %s",
                    (name, address, latitude, longitude, id))
  myConn.commit()
  return {"officeId": id}


# Add a new office.
def add_office(query):
  name = query.get("name", None) or None

  (myConn, myCursor) = directory_utils.open()
  # Add new record.
  myCursor.execute("INSERT INTO Offices (name) VALUES (%s)", (name,))
  id = myCursor.lastrowid
  myConn.commit()
  return {"officeId": id}


# Delete a single office.
def delete_office(query):
  try:
    id = int(query.get("id", 0))
  except ValueError:
    id = 0
  deleted = 0

  if id > 0:
    (myConn, myCursor) = directory_utils.open()
    myCursor.execute("DELETE FROM Employees_Offices WHERE office = %s", (id,))
    myCursor.execute("DELETE FROM Offices WHERE id = %s", (id,))
    myConn.commit()
    deleted = myCursor.rowcount
    # Delete all images belonging to this office.
    directory_photos.delete_images("offices", id)
  return {"deleted": deleted}


# Add, delete or rename a skill.
def skills(query):
  try:
    delete_id = int(query.get("delete_id", 0))
  except ValueError:
    delete_id = 0
  new_name = query.get("new_name", None) or None
  try:
    rename_id = int(query.get("rename_id", 0))
  except ValueError:
    rename_id = 0

  (myConn, myCursor) = directory_utils.open()
  if delete_id:
    # Delete a skill.
    myCursor.execute("DELETE FROM Employees_Skills WHERE skill = %s", (delete_id,))
    myCursor.execute("DELETE FROM Skills WHERE id = %s", (delete_id,))
    myConn.commit()
  if new_name:
    if rename_id:
      # Rename a skill.
      myCursor.execute("UPDATE Skills SET name = %s WHERE id = %s",
                       (new_name, rename_id))
    else:
      # Add a skill.
      myCursor.execute("INSERT INTO Skills (name) VALUES (%s)", (new_name,))
    myConn.commit()

  # Respond with a list of updated skills.
  myCursor.execute("SELECT id, name FROM Skills ORDER BY name")
  skills_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  skills_data = []
  for row in skills_result:
    skills_data.append({
      "id": row[0],
      "name": row[1],
    })
  return {"skills": skills_data}


# Delete a single photo.
def delete_photo(query):
  type = query.get("type", None)
  id = int(query.get("id", None))
  filename = query.get("filename", None)

  # Delete all images belonging to this office.
  directory_photos.delete_image(type, id, filename)
  # Fetch all the photographs.
  photos = directory_photos.list_images(type, id)
  return {"photos": photos}


def reorder_photos(query):
  type = query.get("type", None)
  id = int(query.get("id", None))
  order = query.get("photos", None)
  if order:
    order = order.split("\n")
    for i in range(len(order)):
      filename = order[i]
      # Rename the file to the new order.
      directory_photos.rename_image(type, id, filename, i + 1)
  # Fetch all the photographs.
  photos = directory_photos.list_images(type, id)
  return {"photos": photos}


# Parse the POST request and route to the requested handler.
params = directory_utils.parse_post()
nav = params.get("nav", "")
if nav == "":
  print_diagnostic(params)
else:
  directory_utils.xhr_check()
  data = None
  if nav == "save_employee":
    data = save_employee(params)
  elif nav == "add_employee":
    data = add_employee(params)
  elif nav == "delete_employee":
    data = delete_employee(params)
  elif nav == "save_office":
    data = save_office(params)
  elif nav == "add_office":
    data = add_office(params)
  elif nav == "delete_office":
    data = delete_office(params)
  elif nav == "skills":
    data = skills(params)
  elif nav == "delete_photo":
    data = delete_photo(params)
  elif nav == "reorder_photos":
    data = reorder_photos(params)
  else:
    data = {"error": "Unknown nav value"}
  print("Content-type: application/json")
  print()
  print(json.dumps(data))
