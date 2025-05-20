#  SPDX-FileCopyrightText: 2025 Neil Fraser
#  SPDX-License-Identifier: Apache-2.0

# Utility functions for CGI parsing and database access.

import directory_config
import mysql.connector
import os

from sys import stdin
from urllib.parse import unquote_plus


# Ensure that an X-Requested-With HTTP header was sent.
# If it doesn't exist, then this request may be originating from a form,
# as part of a cross-side scripting attack.
def xhr_check():
  # The browser is sending the HTTP header 'X-Requested-With'.
  # Apache changes this to the environment variable 'HTTP_X_REQUESTED_WITH'.
  # Nginx or other web servers may be different.
  if os.environ.get("HTTP_X_REQUESTED_WITH") != "XMLHttpRequest":
    print("Status: 403 Forbidden")
    print("Content-type: text/plain")
    print()
    print("This API may only be used with XMLHttpRequest")
    os.exit(1)


# Parse a query string (e.g. a=1&b=2) into a dictionary (e.g. {"a": 1, "b": 2}).
# Very minimal parser.  Does not combine repeated names (a=1&a=2), ignores
# valueless names (a&b), does not support isindex.
def parse_get():
  return _parse(os.environ["QUERY_STRING"])


# Parse POST data (e.g. a=1&b=2) into a dictionary (e.g. {"a": 1, "b": 2}).
# Very minimal parser.  Does not combine repeated names (a=1&a=2), ignores
# valueless names (a&b), does not support isindex or multipart/form-data.
def parse_post():
  content_len = os.environ.get("CONTENT_LENGTH", "0")
  return _parse(stdin.read(int(content_len)))


def _parse(data):
  parts = data.split("&")
  dict = {}
  for part in parts:
    tuple = part.split("=", 1)
    if len(tuple) == 2:
      dict[tuple[0]] = unquote_plus(tuple[1])
  return dict


# Open a connection to the database and return the connection and cursor.
def open():
  try:
    myConn = mysql.connector.connect(
      user = directory_config.DATABASE["user"],
      password = directory_config.DATABASE["password"],
      host = directory_config.DATABASE["host"])

  except mysql.connector.Error as e:
    print("&#10060; Can't connect to database: ", e)
    os.exit(1)

  # Open EmployeeDirectory database
  myCursor = myConn.cursor()
  try:
    myCursor.execute("USE %s" % directory_config.DATABASE["database"])
  except mysql.connector.Error as e:
    print("&#10060; Can't use database: ", e)
    close(myConn, myCursor)
    os.exit(1)
  return myConn, myCursor


# Close the connection to the database and its cursor.
def close(myConn, myCursor):
  myCursor.close()
  myConn.close()
