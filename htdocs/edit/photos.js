/**
 * @license
 * Copyright 2025 Neil Fraser
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for the edit/photos.html page.
 * @author neil.fraser@gmail.com (Neil Fraser)
 */
import * as utils from '../utils.js';

/**
 * 'employee' or 'office'.
 * @type {string}
 */
let type = '';

/**
 * Employee or office's ID number.
 * @type {number}
 */
let id = NaN;

let serverPhotos = [];

let maxPhotos = NaN;

const types = {
  'employees': {name: 'Employees', url: '../employees.html'},
  'offices': {name: 'Offices', url: '../offices.html'},
};

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Get the name from the URL and display it as a title.
  // This value can't be trusted, but it's just decorative.
  const name = utils.getParam('name');
  document.getElementById('name').textContent = name;

  // Get the type (employees or offices) from the URL.
  type = utils.getParam('type') || '';
  const typeInfo = types[type];
  if (!typeInfo) {
    throw TypeError('Unknown type: ' + type);
  }
  const a = document.getElementById('type');
  a.textContent = typeInfo.name;
  a.href = typeInfo.url;

  // Get the ID from the URL.
  id = parseInt(utils.getParam('id')) || 0;
  // Load the photo data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'photos', 'type': type, 'id': id},
    callback: function(responseJson) {
      if (responseJson['maxPhotos']) {
        console.log('MaxPhotos:', responseJson['maxPhotos']);
        maxPhotos = responseJson['maxPhotos'];
        document.getElementById('maxPhotos').textContent = maxPhotos;
      }
      renderPhotos(responseJson['photos']);
    }
  });

  // Inject type/ID/name into upload form.
  document.getElementById('uploadType').value = type;
  document.getElementById('uploadId').value = id;
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of photos.
 * @param {!Array<string>} photos Array of photo filenames.
 */
function renderPhotos(photos) {
  utils.spinner(false);
  console.log('Photos:', photos);
  if (!photos) return;
  serverPhotos = photos;
  const div = document.getElementById('photo_gallery');
  div.innerHTML = '';
  photos.forEach(function(photo) {
    const span = document.createElement('span');
    span.className = 'reorder_photo_span';
    span.draggable = true;
    span.dataset.id = photo;

    const img = new Image();
    img.className = 'photo';
    img.src = `../uploads/${type}/${id}/${photo}`;
    span.appendChild(img);

    const deleteIcon = new Image();
    deleteIcon.src = '../delete.png';
    deleteIcon.className = 'delete_icon';
    deleteIcon.title = 'Delete this photo';
    deleteIcon.dataset.id = photo;
    deleteIcon.addEventListener('click', deletePhoto);
    span.appendChild(deleteIcon);
    div.appendChild(span);
  });
  setFormEnabled();
}

/**
 * Delete a single photo.
 * @param {!Event} _e Click event.
 */
function deletePhoto(_e) {
  const photo = this.dataset.id;
  if (!photo) throw Error('No photo ID');
  const button = this;
  utils.postXhr({
    params: {'nav': 'delete_photo', 'type': type, 'id': id, 'filename': photo},
    callback: function(responseJson) {
      renderPhotos(responseJson['photos']);
    }
  });
}

function submitUpload(e) {
  // Prevent the form from submitting, we'll send it via XHR.
  e.preventDefault();

  // Check if a file was selected.
  const photoInput = document.getElementById('uploadPhoto');
  if (!photoInput.value) {
    utils.butter('Please select a photo to upload');
    return;
  }

  // Send the form data to the server.
  const form = document.getElementById('uploadForm');
  const formData = new FormData(form);
  const xhr = new XMLHttpRequest();
  xhr.open(form.method, '/cgi-bin/directory_multipart.py');
  xhr.responseType = 'json';
  xhr.onload = function() {
    utils.spinner(false);
    photoInput.value = ''; // Clear the file input
    if (xhr.status === 200) {
      const responseJson = xhr.response;
      if (responseJson['error']) {
        utils.butter(responseJson['error']);
      } else {
        renderPhotos(responseJson['photos']);
      }
    } else {
      utils.butter(xhr.response);
    }
  };
  xhr.send(formData);
  utils.spinner(true);
}
document.getElementById('uploadForm').addEventListener('submit', submitUpload);

/**
 * Enable drag-and-drop reordering of photos.
 */
document.addEventListener('DOMContentLoaded', () => {
  let draggedItem = null;
  let draggedItemPrev = null;
  let draggedItemNext = null;
  let placeholder = null;

  const imageContainer = document.getElementById('photo_gallery');

  // Function to create a placeholder
  function createPlaceholder() {
    placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
  }

  function removePlaceholder() {
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    placeholder = null;
  }

  imageContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('reorder_photo_span')) {
      draggedItem = e.target;
      draggedItem.classList.add('dragging');
      draggedItemPrev = draggedItem.previousElementSibling;
      draggedItemNext = draggedItem.nextElementSibling;
    }
  });

  imageContainer.addEventListener('dragend', (_e) => {
    if (!draggedItem) return;
    draggedItem.classList.remove('dragging');
    removePlaceholder();
    draggedItem = null;

    const newPhotos = [];
    for (const photo of document.querySelectorAll('.reorder_photo_span')) {
      newPhotos.push(photo.dataset.id);
    }
    if (newPhotos.join('\n') !== serverPhotos.join('\n')) {
      utils.postXhr({
        params: {'nav': 'reorder_photos', 'type': type, 'id': id, 'photos': newPhotos.join('\n')},
        callback: function(responseJson) {
          renderPhotos(responseJson['photos']);
        }
      });
    }
  });

  imageContainer.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necessary to allow dropping
    const targetItem = e.target.closest('.reorder_photo_span');

    if (targetItem && targetItem !== draggedItem) {
      // Remove existing placeholder before inserting new one
      removePlaceholder();

      // Determine if dragging before or after the target item
      const rect = targetItem.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2; // For horizontal layout

      if (e.clientX < midpoint) {
        if (draggedItemNext !== targetItem) {
          createPlaceholder();
          imageContainer.insertBefore(placeholder, targetItem);
        }
      } else {
        if (draggedItemPrev !== targetItem) {
          createPlaceholder();
          imageContainer.insertBefore(placeholder, targetItem.nextSibling);
        }
      }
    }
  });


  imageContainer.addEventListener('drop', (e) => {
    if (!draggedItem) return;
    if (placeholder && placeholder.parentNode) {
      // Insert the dragged item where the placeholder is
      imageContainer.insertBefore(draggedItem, placeholder);
      // Clean up placeholder immediately after drop
      removePlaceholder();
    }
  });
});

function setFormEnabled() {
  const uploadPhoto = document.getElementById('uploadPhoto');
  const uploadSubmit = document.getElementById('uploadSubmit');
  const photoCount = document.getElementById('photo_gallery').childElementCount;
  if (maxPhotos <= photoCount) {
    uploadPhoto.disabled = true;
    uploadSubmit.disabled = true;
  } else {
    uploadPhoto.disabled = false;
    uploadSubmit.disabled = false;
  }
  document.getElementById('reorder_msg').style.display = (photoCount < 2) ? 'none': 'block';
}
