import * as utils from '../utils.js';

/**
 * When the page has loaded, bind the button actions.
 */
function onload() {
  document.getElementById('saveButton').addEventListener('click', saveOffice);
  document.getElementById('cancelButton').addEventListener('click', function() {
    window.location.href = '../offices.html';
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Save button pressed.  Ask the server to create a new office.
 */
function saveOffice() {
  const name = document.getElementById('office_name').value.trim();
  utils.spinner(true);
  utils.postXhr({
    params: {
      'nav': 'add_office',
      'name': name,
    },
    callback: function(responseJson) {
      utils.spinner(false);
      const id = parseInt(responseJson['officeId']);
      if (id) {
        window.location.href = 'office.html?' + id;
      } else {
        utils.butter('Failed to save office');
      }
    }
  });
}
