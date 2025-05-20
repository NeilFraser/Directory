/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the offices.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from './utils.js';

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Load the office data
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'offices'},
    callback: function(responseJson) {
      renderOffices(responseJson['offices']);
    }
  });

  document.getElementById('addButton').addEventListener('click', function() {
    window.location.href = 'edit/add_office.html';
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of offices.
 * @param {!Array<!Object>} offices Array of office objects.
 */
function renderOffices(offices) {
  utils.spinner(false);
  console.log('Offices:', offices);
  const tbody = document.getElementById('data_tbody');
  offices.forEach(function (office) {
    const id = parseInt(office['id']);
    const name = utils.htmlEscape(office['name'] || '--');
    const count = parseInt(office['employeeCount']);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><a href="office.html?${id}">${name}</td>
        <td><a href="employees.html?office=${id}">${count}</a></td>`;
    tbody.appendChild(tr);
  });
}
