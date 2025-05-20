/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the language.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from './utils.js';

/**
 * Office's ID number.
 * @type {number}
 */
let officeId = NaN;

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Get the language ISO from the URL.
  const iso = utils.getParam('iso');
  if (!iso) {
    utils.butter('No language ISO provided.');
    return;
  }
  // Get the optional office ID from the URL.
  officeId = parseInt(utils.getParam('office')) || 0;

  // Load the language's data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'language', 'iso': iso, 'office': officeId},
    callback: function(responseJson) {
      renderLanguage(responseJson['language'], responseJson['employees'], responseJson['offices']);
    }
  });

  // Reload the page if the office filter changes.
  const officeSelect = document.getElementById('office');
  officeSelect.addEventListener('change', function(_e) {
    window.location.href = `language.html?iso=${iso}&office=${encodeURIComponent(this.value)}`;
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the language's data.
 * @param {Object} language A language object, or null if does not exist.
 * @param {!Array<!Object>} employees Array of employee objects.
 * @param {!Array<!Object>} offices Array of office objects.
 */
function renderLanguage(language, employees, offices) {
  utils.spinner(false);
  console.log('Language:', language);
  console.log('Employees:', employees);
  console.log('Offices:', offices);
  // Populate the office dropdown.
  const officeSelect = document.getElementById('office');
  for (const office of offices) {
    const option = new Option(office['name'], office['id'], undefined, office['id'] == officeId);
    officeSelect.appendChild(option);
  }
  if (!language) {
    utils.butter('Language does not exist.');
    return;
  }
  const name = language['name'] || '--';
  document.getElementById('language_name').textContent = name;

  const employeeTd = document.getElementById('language_employees')
  for (const employee of employees) {
    // <li><a href="employee.html?1">Albert Einstein</a> (Beginner)</li>
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = 'employee.html?' + employee['id'];
    a.appendChild(document.createTextNode(employee['name']));
    li.appendChild(a);
    const level = utils.languageLevels[employee['level']] || '?';
    li.appendChild(document.createTextNode(` (${level})`));
    employeeTd.appendChild(li);
  }
}
