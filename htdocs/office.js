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

  const td = document.getElementById('office_coordinates');
  if (office['latitude'] === null || office['longitude'] === null) {
    td.textContent = 'N/A';
  } else {
    const lat = Number(office['latitude']);
    const lon = Number(office['longitude']);
    const pad = 0.05;
    const bbox = (lon - pad) + ',' + (lat - pad) + ',' + (lon + pad) + ',' + (lat + pad);
    const marker = lat + ',' + lon;
    const iframe = td.querySelector('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${marker}`;
    const link = td.querySelector('a');
    link.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;
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
