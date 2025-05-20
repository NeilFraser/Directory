/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the edit/add_employee.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from '../utils.js';

/**
 * When the page has loaded, bind the button actions.
 */
function onload() {
  document.getElementById('saveButton').addEventListener('click', saveEmployee);
  document.getElementById('cancelButton').addEventListener('click', function() {
    window.location.href = '../employees.html';
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Save button pressed.  Ask the server to create a new employee.
 */
function saveEmployee() {
  const name = document.getElementById('employee_name').value.trim();
  utils.spinner(true);
  utils.postXhr({
    params: {
      'nav': 'add_employee',
      'name': name,
    },
    callback: function(responseJson) {
      utils.spinner(false);
      const id = parseInt(responseJson['employeeId']);
      if (id) {
        window.location.href = 'employee.html?' + id;
      } else {
        utils.butter('Failed to save employee');
      }
    }
  });
}
