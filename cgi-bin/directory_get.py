#!C:\Users\neilf\AppData\Local\Microsoft\WindowsApps\python3.exe

import directory_photos
import directory_utils
import json
import mysql.connector
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
  <h1>Directory: CGI GET Test</h1>
  <p>&#9989; This CGI script works!</p>
  <h2>SQL:</h2>
  """)
  (myConn, myCursor) = directory_utils.open()
  print("<p>&#9989; Database connection established!</p>")
  try:
    myCursor.execute("SELECT * from Employees")
    result = myCursor.fetchall()
  except mysql.connector.Error as e:
    print("&#10060; Employees table not found.")
    os.exit(1)
  print("<p>&#9989; Found the Employees table.</p>")
  directory_utils.close(myConn, myCursor)
  print("""
  <h2>GET parameters:</h2>
  <pre>""")
  for name in params.keys():
    print("%s = %s" % (escape(name), escape(params[name])))
  if len(params) == 0:
    print("<i>No GET parameters</i>")
  print ("""</pre>
  <h2>Test POST:</h2>
  <form method="post" action="directory_post.py">
    <input type="text" name="name1" value="value 1">
    <input type="text" name="name2" value="value 2">
    <input type="submit">
  </form>

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


# Fetch summary data of all employees.
def json_employees(query):
  try:
    office_id = int(query.get("office", 0))
  except ValueError:
    office_id = 0
  (myConn, myCursor) = directory_utils.open()
  if (office_id == 0):
    myCursor.execute("SELECT id, name, email, phone, active FROM Employees ORDER BY active DESC, name")
  else:
    myCursor.execute("SELECT id, name, email, phone, active FROM Employees INNER JOIN employees_offices ON id = employee WHERE office = %s ORDER BY active DESC, name", (office_id,))
  employees_result = myCursor.fetchall()
  # List all offices.
  myCursor.execute("SELECT id, name FROM Offices ORDER BY name")
  offices_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  employees_data = []
  for row in employees_result:
    employees_data.append({
      "id": row[0],
      "name": row[1],
      "email": row[2],
      "phone": row[3],
      "active": row[4],
      "photo": directory_photos.get_primary_image("employees", row[0]),
    })
  offices_data = []
  for row in offices_result:
    offices_data.append({
      "id": row[0],
      "name": row[1],
    })
  return {"employees": employees_data, "offices": offices_data}


# Fetch all the data for a single employee.
def json_employee(query):
  try:
    employee_id = int(query.get("id", 0))
  except ValueError:
    employee_id = 0
  (myConn, myCursor) = directory_utils.open()

  # Employee data.
  if employee_id == 0:
    employee_result = None
  else:
    myCursor.execute("SELECT name, email, phone, title, about, birthday, birthmonth, startdate, active FROM Employees WHERE id = %s", (employee_id,))
    employee_result = myCursor.fetchone()

  # Office data.
  if employee_id == 0:
    # Editing new employee, list all offices.
    myCursor.execute("SELECT id, name FROM Offices ORDER BY name")
  elif query.get("offices", "") == "all":
    # Editing existing employee, list all offices and indicate which ones the employee occupies.
    myCursor.execute("SELECT id, name, employee FROM Offices LEFT JOIN (SELECT * FROM Employees_Offices WHERE employee = %s) Sub ON offices.id = Sub.office ORDER BY name", (employee_id,))
  else:
    # Show existing employee's offices.
    myCursor.execute("SELECT id, name FROM Offices INNER JOIN Employees_Offices ON id = office WHERE employee = %s ORDER BY name", (employee_id,))
  offices_result = myCursor.fetchall()

  # Skill data.
  if employee_id == 0:
    # Editing new employee, list all skills.
    myCursor.execute("SELECT id, name FROM Skills ORDER BY name")
  elif query.get("skills", "") == "all":
    # Editing existing employee, list all skills and indicate which ones the employee has.
    myCursor.execute("SELECT id, name, employee FROM Skills LEFT JOIN (SELECT * FROM Employees_Skills WHERE employee = %s) Sub ON Skills.id = Sub.skill ORDER BY name", (employee_id,))
  else:
    # Show existing employee's skills.
    myCursor.execute("SELECT id, name FROM Skills INNER JOIN Employees_Skills ON id = skill WHERE employee = %s ORDER BY name", (employee_id,))
  skills_result = myCursor.fetchall()

  # Language data.
  if employee_id == 0:
    # Editing new employee, list all languages.
    myCursor.execute("SELECT iso, name FROM Languages ORDER BY name")
  elif query.get("languages", "") == "all":
    # Editing existing employee, list all languages and indicate which ones the employee has.
    myCursor.execute("SELECT iso, name, level, employee FROM Languages LEFT JOIN (SELECT * FROM Employees_Languages WHERE employee = %s) Sub ON Languages.iso = Sub.language ORDER BY name", (employee_id,))
  else:
    # Show existing employee's languages.
    myCursor.execute("SELECT iso, name, level FROM Languages INNER JOIN Employees_Languages ON iso = language WHERE employee = %s ORDER BY name", (employee_id,))
  languages_result = myCursor.fetchall()

  directory_utils.close(myConn, myCursor)

  # Photographs.
  photos = []
  if employee_id != 0 and query.get("photos", "") == "all":
    # Fetch all the photographs.
    photos = directory_photos.list_images("employees", employee_id)

  employee_data = None
  if employee_result:
    employee_data = {
      "name": employee_result[0],
      "email": employee_result[1],
      "phone": employee_result[2],
      "title": employee_result[3],
      "about": employee_result[4],
      "birthday": employee_result[5],
      "birthmonth": employee_result[6],
      "startdate": str(employee_result[7]),
      "active": employee_result[8],
    }

  offices_data = []
  for row in offices_result:
    if len(row) == 3:
      offices_data.append({
        "id": row[0],
        "name": row[1],
        "employee": row[2],
      })
    else:
      offices_data.append({
        "id": row[0],
        "name": row[1],
      })

  skills_data = []
  for row in skills_result:
    if len(row) == 3:
      skills_data.append({
        "id": row[0],
        "name": row[1],
        "employee": row[2],
      })
    else:
      skills_data.append({
        "id": row[0],
        "name": row[1],
      })

  languages_data = []
  for row in languages_result:
    if len(row) == 4:
      languages_data.append({
        "iso": row[0],
        "name": row[1],
        "level": row[2],
        "employee": row[3],
      })
    elif len(row) == 3:
      languages_data.append({
        "iso": row[0],
        "name": row[1],
        "level": row[2],
      })
    else:
      languages_data.append({
        "iso": row[0],
        "name": row[1],
      })

  return {"employee": employee_data, "offices": offices_data, "skills": skills_data, "languages": languages_data, "photos": photos}


# Fetch summary data of all offices.
def json_offices(query):
  (myConn, myCursor) = directory_utils.open()
  myCursor.execute("SELECT id, name, latitude, longitude, count(Sub.office) FROM Offices LEFT JOIN (SELECT office FROM Employees INNER JOIN Employees_Offices ON id = employee WHERE active = 1) Sub on Sub.office = id GROUP BY id, name, latitude, longitude ORDER BY count(Sub.office) DESC")
  offices_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  offices_data = []
  for row in offices_result:
    offices_data.append({
      "id": row[0],
      "name": row[1],
      "latitude": row[2],
      "longitude": row[3],
      "employeeCount": row[4],
    })
  return {"offices": offices_data}


# Fetch all the data for a single office.
def json_office(query):
  try:
    office_id = int(query.get("id", 0))
  except ValueError:
    office_id = 0
  (myConn, myCursor) = directory_utils.open()
  myCursor.execute("SELECT name, address, latitude, longitude FROM Offices WHERE id = %s", (office_id,))
  office_result = myCursor.fetchone()
  directory_utils.close(myConn, myCursor)
  office_data = None
  if office_result:
    office_data = {
      "name": office_result[0],
      "address": office_result[1],
      "latitude": office_result[2],
      "longitude": office_result[3],
    }

  # Photographs.
  photos = []
  if office_id != 0 and query.get("photos", "") == "all":
    # Fetch all the photographs.
    photos = directory_photos.list_images("offices", office_id)

  return {"office": office_data, "photos": photos}


# Fetch birthday data of active employees.
def json_birthdays(query):
  try:
    office_id = int(query.get("office", 0))
  except ValueError:
    office_id = 0
  (myConn, myCursor) = directory_utils.open()
  if (office_id == 0):
    myCursor.execute("SELECT id, name, birthday, birthmonth FROM Employees WHERE active = 1 AND birthday ORDER BY birthmonth, birthday")
  else:
    myCursor.execute("SELECT id, name, birthday, birthmonth FROM Employees INNER JOIN employees_offices ON id = employee WHERE active = 1 AND birthday AND office = %s ORDER BY birthmonth, birthday", (office_id,))
  employees_result = myCursor.fetchall()
  # List all offices.
  myCursor.execute("SELECT id, name FROM Offices ORDER BY name")
  offices_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  employees_data = []
  for row in employees_result:
    employees_data.append({
      "id": row[0],
      "name": row[1],
      "birthday": row[2],
      "birthmonth": row[3],
    })
  offices_data = []
  for row in offices_result:
    offices_data.append({
      "id": row[0],
      "name": row[1],
    })
  return {"employees": employees_data, "offices": offices_data}


# Fetch list of all skills.
def json_skills(query):
  (myConn, myCursor) = directory_utils.open()
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


# Fetch all the data for a single skill.
def json_skill(query):
  try:
    skill_id = int(query.get("id", 0))
  except ValueError:
    skill_id = 0
  try:
    office_id = int(query.get("office", 0))
  except ValueError:
    office_id = 0
  (myConn, myCursor) = directory_utils.open()
  # Look up this skill's name.
  myCursor.execute("SELECT name FROM Skills WHERE id = %s", (skill_id,))
  skill_result = myCursor.fetchone()
  # Find all employees with this skill.
  if (office_id == 0):
    myCursor.execute("SELECT id, name FROM Employees INNER JOIN Employees_Skills ON id = employee WHERE active = 1 AND skill = %s ORDER BY name", (skill_id,))
  else:
    myCursor.execute("SELECT id, name FROM Employees INNER JOIN Employees_Skills ON id = Employees_Skills.employee INNER JOIN Employees_Offices ON id = Employees_Offices.employee WHERE active = 1 AND skill = %s AND office = %s ORDER BY name", (skill_id, office_id))
  employees_result = myCursor.fetchall()
  # List all offices.
  myCursor.execute("SELECT id, name FROM Offices ORDER BY name")
  offices_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  skill_data = None
  if skill_result:
    skill_data = {
      "name": skill_result[0],
    }
  employees_data = []
  for row in employees_result:
    employees_data.append({
      "id": row[0],
      "name": row[1],
    })
  offices_data = []
  for row in offices_result:
    offices_data.append({
      "id": row[0],
      "name": row[1],
    })
  return {"skill": skill_data, "employees": employees_data, "offices": offices_data}


# Fetch all the data for a single language.
def json_language(query):
  try:
    language_iso = query.get("iso", "_")
  except ValueError:
    language_iso = "_"
  if not re.match(r"^\w+$", language_iso):
    raise Exception("Invalid language ISO")
  try:
    office_id = int(query.get("office", 0))
  except ValueError:
    office_id = 0
  (myConn, myCursor) = directory_utils.open()
  # Look up this language's name.
  myCursor.execute("SELECT name FROM Languages WHERE iso = %s", (language_iso,))
  language_result = myCursor.fetchone()
  # Find all employees with this language.
  if (office_id == 0):
    myCursor.execute("SELECT id, name, level FROM Employees INNER JOIN Employees_Languages ON id = employee WHERE active = 1 AND language = %s ORDER BY level, name", (language_iso,))
  else:
    myCursor.execute("SELECT id, name, level FROM Employees INNER JOIN Employees_Languages ON id = Employees_Languages.employee INNER JOIN Employees_Offices ON id = Employees_Offices.employee WHERE active = 1 AND language = %s AND office = %s ORDER BY level, name", (language_iso, office_id))
  employees_result = myCursor.fetchall()
  # List all offices.
  myCursor.execute("SELECT id, name FROM Offices ORDER BY name")
  offices_result = myCursor.fetchall()
  directory_utils.close(myConn, myCursor)
  language_data = None
  if language_result:
    language_data = {
      "name": language_result[0],
    }
  employees_data = []
  for row in employees_result:
    employees_data.append({
      "id": row[0],
      "name": row[1],
      "level": row[2],
    })
  offices_data = []
  for row in offices_result:
    offices_data.append({
      "id": row[0],
      "name": row[1],
    })
  return {"language": language_data, "employees": employees_data, "offices": offices_data}


# Fetch all the data for a single employee.
def json_photos(query):
  id = int(query.get("id", ""))
  type = query.get("type", "")
  directory_photos.validate_type(type)

  # Fetch all the photographs.
  photos = directory_photos.list_images(type, id)
  return {"photos": photos}


# Parse the GET request and route to the requested handler.
params = directory_utils.parse_get()
nav = params.get("nav", "")
if nav == "":
  print_diagnostic(params)
else:
  directory_utils.xhr_check()
  data = None
  if nav == "employees":
    data = json_employees(params)
  elif nav == "employee":
    data = json_employee(params)
  elif nav == "offices":
    data = json_offices(params)
  elif nav == "office":
    data = json_office(params)
  elif nav == "birthdays":
    data = json_birthdays(params)
  elif nav == "skills":
    data = json_skills(params)
  elif nav == "skill":
    data = json_skill(params)
  elif nav == "language":
    data = json_language(params)
  elif nav == "photos":
    data = json_photos(params)
  else:
    data = {"error": "Unknown nav value"}
  print("Content-type: application/json")
  print()
  print(json.dumps(data))
