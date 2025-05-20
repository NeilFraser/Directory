-- Create the EmployeeDirectory database.
CREATE DATABASE EmployeeDirectory;
USE EmployeeDirectory;

-- Create empty tables.
CREATE TABLE employees (
  id integer AUTO_INCREMENT PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255),
  phone varchar(255),
  title varchar(255),
  about text,
  birthday tinyint,  -- Birthday does not have year, just day & month.
  birthmonth tinyint,
  startdate date DEFAULT (CURRENT_DATE),
  active boolean DEFAULT true
);

CREATE TABLE offices (
  id integer AUTO_INCREMENT PRIMARY KEY,
  name varchar(255) NOT NULL,
  address varchar(255),
  latitude float,
  longitude float
);

-- Many-to-many relationship between employees and offices.
-- An office can have any number of employees.
-- An employee may work out of any number of offices.
CREATE TABLE employees_offices (
  employee integer,
  office integer,
  FOREIGN KEY (employee) REFERENCES employees(id),
  FOREIGN KEY (office) REFERENCES offices(id)
);

CREATE TABLE languages (
  iso char(2) PRIMARY KEY,  -- Use ISO 639 codes for languages.
  name varchar(255) NOT NULL
);

INSERT INTO languages (iso, name) VALUES
  ('ar', 'Arabic'),
  ('bg', 'Bulgarian'),
  ('bn', 'Bengali'),
  ('cs', 'Czech'),
  ('da', 'Danish'),
  ('de', 'German'),
  ('el', 'Greek'),
  ('en', 'English'),
  ('es', 'Spanish'),
  ('et', 'Estonian'),
  ('fi', 'Finnish'),
  ('fr', 'French'),
  ('he', 'Hebrew'),
  ('hi', 'Hindi'),
  ('hr', 'Croatian'),
  ('hu', 'Hungarian'),
  ('id', 'Indonesian'),
  ('it', 'Italian'),
  ('ja', 'Japanese'),
  ('jv', 'Javanese'),
  ('ko', 'Korean'),
  ('lt', 'Lithuanian'),
  ('lv', 'Latvian'),
  ('nl', 'Dutch'),
  ('no', 'Norwegian'),
  ('pa', 'Punjabi'),
  ('pl', 'Polish'),
  ('pt', 'Portuguese'),
  ('ro', 'Romanian'),
  ('ru', 'Russian'),
  ('sk', 'Slovak'),
  ('sl', 'Slovenian'),
  ('sw', 'Swahili'),
  ('ta', 'Tamil'),
  ('th', 'Thai'),
  ('tr', 'Turkish'),
  ('uk', 'Ukrainian'),
  ('ur', 'Urdu'),
  ('vi', 'Vietnamese'),
  ('zh', 'Chinese'),
  ('zu', 'Zulu');
-- Add more languages as needed.
-- See https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes

-- Many-to-many relationship between employees and languages.
-- A language may be possessed by any number of employees.
-- An employee may have any number of languages.
CREATE TABLE employees_languages (
  employee integer,
  language char(2),
  level tinyint DEFAULT 0,  -- 0-2 will be Basic, Intermediate, Expert
  FOREIGN KEY (employee) REFERENCES employees(id),
  FOREIGN KEY (language) REFERENCES languages(iso)
);

CREATE TABLE skills (
  id integer AUTO_INCREMENT PRIMARY KEY,
  name varchar(255)
);

-- Many-to-many relationship between employees and skills.
-- A skill may be possessed by any number of employees.
-- An employee may have any number of skills.
CREATE TABLE employees_skills (
  employee integer,
  skill integer,
  FOREIGN KEY (employee) REFERENCES employees(id),
  FOREIGN KEY (skill) REFERENCES skills(id)
);
