import * as utils from './utils.js';

/**
 * Employee's ID number.
 * @type {number}
 */
let id = NaN;

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Get the employee ID from the URL.
  id = parseInt(window.location.search.substring(1));
  if (!id) {
    utils.butter('No employee ID provided.');
    return;
  }
  // Load the employee's data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'employee', 'id': id, 'offices': 'mine', 'photos': 'all'},
    callback: function(responseJson) {
      renderEmployee(responseJson['employee'], responseJson['offices'], responseJson['skills'], responseJson['languages'], responseJson['photos']);
    }
  });

  document.getElementById('editButton').addEventListener('click', function() {
    window.location.href = 'edit/employee.html?' + id;
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the employee's data.
 * @param {Object} employee An employee object, or null if does not exist.
 * @param {!Array<!Object>} offices Array of office objects.
 * @param {!Array<!Object>} skills Array of skill objects.
 * @param {!Array<!Object>} languages Array of language objects.
 * @param {!Array<string>} photos Array of photo URLs.
 */
function renderEmployee(employee, offices, skills, languages, photos) {
  utils.spinner(false);
  console.log('Employee:', employee);
  console.log('Offices:', offices);
  console.log('Skills:', skills);
  console.log('Languages:', languages);
  console.log('Photos:', photos);
  if (!employee) {
    utils.butter('Employee does not exist.');
    return;
  }
  const name = employee['name'] || '--';
  document.getElementById('employee_name').textContent = name;

  let email = utils.htmlEscape(employee['email'] || '');
  if (email) {
    email = '<a href="mailto:' + email + '">' + email + '</a>';
  } else {
    email = '--';
  }
  document.getElementById('employee_email').innerHTML = email;

  const phone = employee['phone'] || '--';
  document.getElementById('employee_phone').textContent = phone;

  const title = employee['title'] || '--';
  document.getElementById('employee_title').textContent = title;

  const about = utils.htmlEscape(employee['about'] || '--');
  document.getElementById('employee_about').innerHTML = about.replace(/\n/g, '<br>');

  const birthday = parseInt(employee['birthday']);
  const birthmonth = parseInt(employee['birthmonth']);
  let birthdaymonth = '--';
  if (!isNaN(birthday) && !isNaN(birthmonth) && birthday >= 1 && birthday <= 31 && birthmonth >= 1 && birthmonth <= 12) {
    birthdaymonth = birthday + ' ' + utils.monthNames[birthmonth - 1];
  }
  document.getElementById('employee_birthday').textContent = birthdaymonth;

  const startDate = employee['startdate'] || '--';
  document.getElementById('employee_startdate').textContent = startDate;

  const active = employee['active'];
  document.getElementById('employee_active').textContent = active ? 'Yes' : 'No';

  const officesTd = document.getElementById('employee_offices')
  for (const office of offices) {
    // <div><a href="office.html?1">Zurich</a></div>
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = 'office.html?' + office['id'];
    a.appendChild(document.createTextNode(office['name']));
    div.appendChild(a);
    officesTd.appendChild(div);
  }

  const skillsTd = document.getElementById('employee_skills')
  for (const skill of skills) {
    // <div><a href="skill.html?id=1">JavaScript</a></div>
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = 'skill.html?id=' + skill['id'];
    a.appendChild(document.createTextNode(skill['name']));
    div.appendChild(a);
    skillsTd.appendChild(div);
  }

  const languagesTd = document.getElementById('employee_languages')
  for (const language of languages) {
    // <div><a href="language.html?iso=1">German</a> (Beginner)</div>
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = 'language.html?iso=' + language['iso'];
    a.appendChild(document.createTextNode(language['name']));
    div.appendChild(a);
    const level = utils.languageLevels[language['level']] || '?';
    div.appendChild(document.createTextNode(` (${level})`));
    languagesTd.appendChild(div);
  }

  const div = document.getElementById('photo_div');
  div.innerHTML = '';
  photos.forEach(function (photo) {
    const span = document.createElement('span');
    const img = new Image();
    img.src = `uploads/employees/${id}/${photo}`;
    span.appendChild(img);
    div.appendChild(span);
  });
}
