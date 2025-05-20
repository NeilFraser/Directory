/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the edit/office.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from '../utils.js';

/**
 * Office's ID number.
 * @type {number}
 */
let id = NaN;

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Get the office ID from the URL.
  id = parseInt(window.location.search.substring(1));
  if (id) {
    // Load the office's data.
    utils.spinner(true);
    utils.getXhr({
      params: {'nav': 'office', 'id': id},
      callback: function(responseJson) {
        renderOffice(responseJson['office']);
      }
    });
  }

  document.getElementById('saveButton').addEventListener('click', saveOffice);
  document.getElementById('cancelButton').addEventListener('click', function() {
    window.location.href = '../office.html?' + id;
  });

  const deleteButton = document.getElementById('deleteButton');
  deleteButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this office?')) {
      deleteOffice();
    }
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the office's data.
 * @param {Object} office An office object, or null if does not exist.
 */
function renderOffice(office) {
  utils.spinner(false);
  console.log('Office:', office);
  if (!office) {
    utils.butter('Office does not exist.');
    return;
  }

  const name = office['name'] || '';
  const nameInput = document.getElementById('office_name');
  nameInput.value = name;
  nameInput.addEventListener('change', updatePhotoLink);

  let address = office['address'] || '';
  document.getElementById('office_address').value = address;

  const latitude = office['latitude'] || '';
  document.getElementById('office_latitude').value = latitude;

  const longitude = office['longitude'] || '';
  document.getElementById('office_longitude').value = longitude;

  const photoLink = document.getElementById('office_photos');
  photoLink.target += id;
  function updatePhotoLink() {
    photoLink.href = 'photos.html?type=offices&id=' + id + '&name=' + encodeURIComponent(nameInput.value);
  }
  updatePhotoLink();
}

/**
 * Save button pressed.  Post the updated data to the server.
 */
function saveOffice() {
  const name = document.getElementById('office_name').value.trim();
  const address = document.getElementById('office_address').value.trim();
  const latitude = document.getElementById('office_latitude').value.trim();
  const longitude = document.getElementById('office_longitude').value.trim();

  utils.spinner(true);
  utils.postXhr({
    params: {
      'nav': 'save_office',
      'id': id,
      'name': name,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
    },
    callback: function(responseJson) {
      utils.spinner(false);
      const id = parseInt(responseJson['officeId']);
      if (id) {
        window.location.href = '../office.html?' + id;
      } else {
        utils.butter('Failed to save office');
      }
    }
  });
}

/**
 * Delete button pressed.  Post the delete request to the server.
 */
function deleteOffice() {
  utils.spinner(true);
  utils.postXhr({
    params: {'nav': 'delete_office', 'id': id},
    callback: function(responseJson) {
      utils.spinner(false);
      if (responseJson['deleted'] > 0) {
        window.location.href = '../offices.html';
      } else {
        utils.butter('Failed to delete office');
      }
    }
  });
}
