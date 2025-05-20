/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the skill.html page.
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
  // Get the skill ID from the URL.
  const skillId = parseInt(utils.getParam('id'));
  if (!skillId) {
    utils.butter('No skill ID provided.');
    return;
  }
  // Get the optional office ID from the URL.
  officeId = parseInt(utils.getParam('office')) || 0;

  // Load the skill's data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'skill', 'id': skillId, 'office': officeId},
    callback: function(responseJson) {
      renderSkill(responseJson['skill'], responseJson['employees'], responseJson['offices']);
    }
  });

  // Reload the page if the office filter changes.
  const officeSelect = document.getElementById('office');
  officeSelect.addEventListener('change', function(_e) {
    window.location.href = `skill.html?id=${skillId}&office=${encodeURIComponent(this.value)}`;
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the skill's data.
 * @param {Object} skill A skill object, or null if does not exist.
 * @param {!Array<!Object>} employees Array of employee objects.
 * @param {!Array<!Object>} offices Array of office objects.
 */
function renderSkill(skill, employees, offices) {
  utils.spinner(false);
  console.log('Skill:', skill);
  console.log('Employees:', employees);
  console.log('Offices:', offices);
  // Populate the office dropdown.
  const officeSelect = document.getElementById('office');
  for (const office of offices) {
    const option = new Option(office['name'], office['id'], undefined, office['id'] == officeId);
    officeSelect.appendChild(option);
  }
  if (!skill) {
    utils.butter('Skill does not exist.');
    return;
  }
  const name = skill['name'] || '--';
  document.getElementById('skill_name').textContent = name;

  const employeeTd = document.getElementById('skill_employees')
  for (const employee of employees) {
    // <li><a href="employee.html?1">Albert Einstein</a></li>
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = 'employee.html?' + employee['id'];
    a.appendChild(document.createTextNode(employee['name']));
    li.appendChild(a);
    employeeTd.appendChild(li);
  }
}
