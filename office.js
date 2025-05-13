import * as utils from './utils.js';

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
  if (!id) {
    utils.butter('No office ID provided.');
    return;
  }
  // Load the office's data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'office', 'id': id, 'photos': 'all'},
    callback: function(responseJson) {
      renderOffice(responseJson['office'], responseJson['photos']);
    }
  });

  document.getElementById('editButton').addEventListener('click', function() {
    window.location.href = 'edit/office.html?' + id;
  });

  document.getElementById('office_employees').href += '?office=' + id;
  document.getElementById('office_birthdays').href += '?office=' + id;
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the office's data.
 * @param {Object} office An office object, or null if does not exist.
 * @param {!Array<string>} photos Array of photo URLs.
 */
function renderOffice(office, photos) {
  utils.spinner(false);
  console.log('Office:', office);
  console.log('Photos:', photos);
  if (!office) {
    utils.butter('Office does not exist.');
    return;
  }
  const name = office['name'] || '--';
  document.getElementById('office_name').textContent = name;

  const address = utils.htmlEscape(office['address'] || '');
  document.getElementById('office_address').innerHTML = address.replace(/\n/g, '<br>');

  if (office['latitude'] !== null && office['longitude'] !== null) {
    const coordinates = office['latitude'] + ', ' + office['longitude'];
    document.getElementById('office_coordinates').textContent = coordinates;
  }

  const div = document.getElementById('photo_div');
  div.innerHTML = '';
  photos.forEach(function (photo) {
    const span = document.createElement('span');
    const img = new Image();
    img.src = `uploads/offices/${id}/${photo}`;
    span.appendChild(img);
    div.appendChild(span);
  });
}
