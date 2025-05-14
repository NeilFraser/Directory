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


const types = {
  'employees': {name: 'Employees', url: '../employees.html'},
  'offices': {name: 'Offices', url: '../offices.html'},
}

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
      renderPhotos(responseJson['photos']);
    }
  });

  // Inject type/ID/name into upload form.
  document.getElementById('uploadType').value = type;
  document.getElementById('uploadId').value = id;
  document.getElementById('uploadName').value = name;
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of photos.
 * @param {!Array<string>} photos Array of photo filenames.
 */
function renderPhotos(photos) {
  utils.spinner(false);
  console.log('Photos:', photos);
  const div = document.getElementById('photo_div');
  div.innerHTML = '';
  photos.forEach(function (photo) {
    const span = document.createElement('span');
    const img = new Image();
    img.src = `../uploads/${type}/${id}/${photo}`;
    span.appendChild(img);
    div.appendChild(span);
    const deleteIcon = new Image();
    deleteIcon.src = '../delete.png';
    deleteIcon.className = 'delete_icon';
    deleteIcon.title = 'Delete this photo';
    deleteIcon.dataset.id = photo;
    deleteIcon.addEventListener('click', deletePhoto);
    div.appendChild(deleteIcon);
  });
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
      utils.spinner(false);
      if (responseJson['deleted']) {
        utils.deleteElement(button.previousElementSibling);
        utils.deleteElement(button);
      } else {
        utils.butter('Failed to delete photo');
      }
    }
  });
}
