/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the birthdays.html page.
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

  // Load the birthday data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'birthdays', 'office': officeId},
    callback: function(responseJson) {
      renderBirthdays(responseJson['employees'], responseJson['offices']);
    }
  });

  // Reload the page if the office filter changes.
  const officeSelect = document.getElementById('office');
  officeSelect.addEventListener('change', function(_e) {
    window.location.href = 'birthdays.html?office=' + encodeURIComponent(this.value);
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of birthdays.
 * @param {!Array<!Object>} employees Array of employee objects.
 * @param {!Array<!Object>} offices Array of office objects.
 */
function renderBirthdays(employees, offices) {
  utils.spinner(false);
  console.log('Employees:', employees);
  console.log('Offices:', offices);
  // Populate the office dropdown.
  const officeSelect = document.getElementById('office');
  for (const office of offices) {
    const option = new Option(office['name'], office['id'], undefined, office['id'] == officeId);
    officeSelect.appendChild(option);
  }
  const tbody = document.getElementById('data_tbody');
  tbody.innerHTML = '';
  if (employees.length === 0) return;

  // Find the next birthday.
  const now = new Date();
  const nowMonthDay = ((now.getMonth() + 1) * 100) + now.getDate();
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    const employeeMonthDay =
        (parseInt(employee['birthmonth']) * 100) + parseInt(employee['birthday']);
    if (employeeMonthDay >= nowMonthDay) {
      // All the previous birthdays are next year.  Wrap them to the end.
      employees = employees.slice(i).concat(employees.slice(0, i));
      break;
    }
  }

  // Print each birthday.
  let prevMonth = NaN;
  employees.forEach(function(employee) {
    const id = parseInt(employee['id']);
    const day = parseInt(employee['birthday']);
    const month = parseInt(employee['birthmonth']);
    const name = utils.htmlEscape(employee['name'] || '--');
    if (prevMonth !== month) {
      // Print a month header.
      prevMonth = month;
      const tr = document.createElement('tr');
      tr.setAttribute('colspan', 2);
      const td = document.createElement('td');
      td.textContent = utils.monthNames[month - 1];
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${day}</td><td><a href="employee.html?${id}">${name}</td>`;
    tbody.appendChild(tr);
  });
}
