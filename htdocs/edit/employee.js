/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the edit/employee.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from '../utils.js';

/**
 * Employee's ID number.
 * @type {number}
 */
let id = NaN;

let languageArray = undefined;

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Get the employee ID from the URL.
  id = parseInt(window.location.search.substring(1)) || 0;
  // Load the employee's data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'employee', 'id': id, 'offices': 'all', 'skills': 'all', 'languages': 'all'},
    callback: function(responseJson) {
      renderEmployee(responseJson['employee'], responseJson['offices'], responseJson['skills'], responseJson['languages']);
    }
  });

  document.getElementById('addLanguage').addEventListener('click', addLanguage);

  document.getElementById('saveButton').addEventListener('click', saveEmployee);
  document.getElementById('cancelButton').addEventListener('click', function() {
    window.location.href = '../employees.html';
  });

  const deleteButton = document.getElementById('deleteButton');
  deleteButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee();
    }
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the employee's data.
 * @param {Object} employee An employee object, or null if does not exist.
 * @param {!Array<!Object>} offices Array of office objects.
 * @param {!Array<!Object>} skills Array of skill objects.
 * @param {!Array<!Object>} languages Array of language objects.
 */
function renderEmployee(employee, offices, skills, languages) {
  utils.spinner(false);
  console.log('Employee:', employee);
  console.log('Offices:', offices);
  console.log('Skills:', skills);
  console.log('Languages:', languages);
  languageArray = languages;
  if (!employee) {
    utils.butter('Employee does not exist.');
    return;
  }

  const name = employee['name'] || '';
  const nameInput = document.getElementById('employee_name');
  nameInput.value = name;
  nameInput.addEventListener('change', updatePhotoLink);

  let email = employee['email'] || '';
  document.getElementById('employee_email').value = email;

  const phone = employee['phone'] || '';
  document.getElementById('employee_phone').value = phone;

  const title = employee['title'] || '';
  document.getElementById('employee_title').value = title;

  const about = employee['about'] || '';
  document.getElementById('employee_about').value = about;

  const photoLink = document.getElementById('employee_photos');
  photoLink.target += id;
  function updatePhotoLink() {
    photoLink.href = 'photos.html?type=employees&id=' + id + '&name=' + encodeURIComponent(nameInput.value);
  }
  updatePhotoLink();

  const birthday = parseInt(employee['birthday']) || '';
  document.getElementById('employee_birthday').value = birthday;
  const birthmonth = parseInt(employee['birthmonth']) || 0;
  document.getElementById('employee_birthmonth').value = birthmonth;

  const startDate = employee['startdate'] || '';
  document.getElementById('employee_startdate').value = startDate;

  const active = employee['active'];
  document.getElementById('employee_active').checked = !!active;

  const officeTd = document.getElementById('employee_offices');
  for (const office of offices) {
    // <div><input type="checkbox" class="officecheckbox" value="1" checked> Zurich</div>
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'officecheckbox';
    input.value = office['id'];
    input.checked = !!office['employee'];
    div.appendChild(input);
    div.appendChild(document.createTextNode(office['name']));
    officeTd.appendChild(div);
  }

  const skillSelect = document.getElementById('employee_skills');
  for (const skill of skills) {
    const option = new Option(skill['name'], skill['id'], undefined, !!skill['employee']);
    skillSelect.appendChild(option);
  }

  for (const language of languages) {
    const level = language['level'] || 0;
    if (level > 0) {
      const [languageSelect, levelSelect] = addLanguage();
      languageSelect.value = language['iso'];
      levelSelect.value = level;
    }
  }
}

function addLanguage() {
  const div = document.createElement('div');
  const languageSelect = document.createElement('select');
  languageSelect.className = 'languageSelect';
  for (const language of languageArray) {
    const option = new Option(language['name'], language['iso']);
    languageSelect.appendChild(option);
  }
  div.appendChild(languageSelect);
  const levelSelect = document.createElement('select');
  levelSelect.className = 'levelSelect';
  for (let i = 0; i < utils.languageLevels.length; i++) {
    const option = new Option(utils.languageLevels[i], i);
    levelSelect.appendChild(option);
  }
  div.appendChild(levelSelect);
  document.getElementById('employee_languages').appendChild(div);
  return [languageSelect, levelSelect];
}

/**
 * Save button pressed.  Post the updated data to the server.
 */
function saveEmployee() {
  const name = document.getElementById('employee_name').value.trim();
  const email = document.getElementById('employee_email').value.trim();
  const phone = document.getElementById('employee_phone').value.trim();
  const title = document.getElementById('employee_title').value.trim();
  const about = document.getElementById('employee_about').value.trim();
  const birthday = parseInt(document.getElementById('employee_birthday').value) || 0;
  const birthmonth = parseInt(document.getElementById('employee_birthmonth').value);
  const startDate = document.getElementById('employee_startdate').value.trim();
  const active = Number(document.getElementById('employee_active').checked);

  const offices = [];
  for (const input of document.getElementsByClassName('officecheckbox')) {
    if (input.checked) {
      offices.push(parseInt(input.value));
    }
  }

  const skills = [];
  for (const option of document.getElementById('employee_skills').selectedOptions) {
    skills.push(parseInt(option.value));
  }

  const languages = {};
  const div = document.getElementById('employee_languages');
  const languageSelects = Array.from(div.getElementsByClassName('languageSelect'));
  const levelSelects = Array.from(div.getElementsByClassName('levelSelect'));
  const count = Math.min(languageSelects.length, levelSelects.length);
  for (let i = 0; i < count; i++) {
    if (levelSelects[i].value > 0) {
      languages[languageSelects[i].value] = levelSelects[i].value;
    }
  }

  utils.spinner(true);
  utils.postXhr({
    params: {
      'nav': 'save_employee',
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'title': title,
      'about': about,
      'birthday': birthday,
      'birthmonth': birthmonth,
      'startdate': startDate,
      'active': active,
      'offices': offices.join(','),
      'skills': skills.join(','),
      'languages': JSON.stringify(languages),
    },
    callback: function(responseJson) {
      utils.spinner(false);
      const id = parseInt(responseJson['employeeId']);
      if (id) {
        window.location.href = '../employee.html?' + id;
      } else {
        utils.butter('Failed to save employee');
      }
    }
  });
}

/**
 * Delete button pressed.  Post the delete request to the server.
 */
function deleteEmployee() {
  utils.spinner(true);
  utils.postXhr({
    params: {'nav': 'delete_employee', 'id': id},
    callback: function(responseJson) {
      utils.spinner(false);
      if (responseJson['deleted'] > 0) {
        window.location.href = '../employees.html';
      } else {
        utils.butter('Failed to delete employee');
      }
    }
  });
}
