/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the employees.html page.
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
  // Get the optional office ID from the URL.
  officeId = parseInt(utils.getParam('office')) || 0;
  // Load the employee data
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'employees', 'office': officeId},
    callback: function(responseJson) {
      renderEmployees(responseJson['employees'], responseJson['offices']);
    }
  });

  document.getElementById('addButton').addEventListener('click', function() {
    window.location.href = 'edit/add_employee.html';
  });
  // Reload the page if the office filter changes.
  const officeSelect = document.getElementById('office');
  officeSelect.addEventListener('change', function(_e) {
    window.location.href = 'employees.html?office=' + encodeURIComponent(this.value);
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of employees.
 * @param {!Array<!Object>} employees Array of employee objects.
 * @param {!Array<!Object>} offices Array of office objects.
 */
function renderEmployees(employees, offices) {
  utils.spinner(false);
  console.log('Employees:', employees);
  console.log('Offices:', offices);
  // Populate the office dropdown.
  const officeSelect = document.getElementById('office');
  for (const office of offices) {
    const option = new Option(office['name'], office['id'], undefined, office['id'] == officeId);
    officeSelect.appendChild(option);
  }
  // Populate the employee table.
  const tbody = document.getElementById('data_tbody');
  tbody.innerHTML = '';
  employees.forEach(function (employee) {
    const id = parseInt(employee['id']);
    const photo = employee['photo'] || null;
    const photoUrl = 'uploads/employees/' +
        (photo ? id + '/' + utils.htmlEscape(photo) : 'placeholder.svg');
    const name = utils.htmlEscape(employee['name'] || '--');
    const active = employee['active'] === 1
    let email = utils.htmlEscape(employee['email'] || '');
    if (email && active) {
      email = '<a href="mailto:' + email + '">' + email + '</a>';
    } else if (!email) {
      email = '--';
    }
    const phone = utils.htmlEscape(employee['phone'] || '--');
    const tr = document.createElement('tr');
    if (!active) {
      tr.className = 'inactive';
    }
    tr.innerHTML = `<td><img class="photo_icon" src="${photoUrl}"></td>
        <td><a href="employee.html?${id}">${name}</td>
        <td>${email}</td>
        <td>${phone}</td>`;
    tbody.appendChild(tr);
  });
}
