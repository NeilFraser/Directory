import * as utils from '../utils.js';

/**
 * When the page has loaded, fetch then render the data.
 */
function onload() {
  // Load the skills' data.
  utils.spinner(true);
  utils.getXhr({
    params: {'nav': 'skills'},
    callback: function(responseJson) {
      renderSkills(responseJson['skills']);
    }
  });

  document.getElementById('createButton').addEventListener('click', createSkill);
  // When pressing enter, submit the new skill.
  document.getElementById('newSkill').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createSkill();
      e.preventDefault();
    }
  });
}
window.addEventListener('DOMContentLoaded', onload);

/**
 * Render the list of skills.
 * @param {!Array<!Object>} skills Array of skill objects.
 */
function renderSkills(skills) {
  utils.spinner(false);
  console.log('Skills:', skills);
  const tbody = document.getElementById('data_tbody');
  tbody.innerHTML = '';
  skills.forEach(function (skill) {
    const id = parseInt(skill['id']);
    const name = utils.htmlEscape(skill['name'] || '?');
    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.dataset.name = name;
    tr.innerHTML = `<td><a href="skill.html?id=${id}">${name}</a></td>
      <td><button class="renameButton">Rename</button> &nbsp; <button class="deleteButton">Delete</button></td>`;
    tbody.appendChild(tr);
  });
  Array.from(document.getElementsByClassName('renameButton')).forEach(function (button) {
    button.addEventListener('click', renameSkill);
  });
  Array.from(document.getElementsByClassName('deleteButton')).forEach(function (button) {
    button.addEventListener('click', deleteSkill);
  });
}

function createSkill(_e) {
  const input = document.getElementById('newSkill');
  const newName = input.value.trim();
  if (!newName) {
    // No name.
    input.focus();
    return;
  }
  utils.spinner(true);
  utils.postXhr({
    params: {'nav': 'skills', 'new_name': newName},
    callback: function(responseJson) {
      utils.spinner(false);
      if (responseJson['skills']) {
        renderSkills(responseJson['skills']);
      } else {
        utils.butter('Failed to add skill');
      }
      input.value = '';
      input.focus();
    }
  });
}

function renameSkill(_e) {
  const id = parseInt(this.parentNode.parentNode.dataset.id);
  if (!id) throw Error('No skill ID');
  const oldName = this.parentNode.parentNode.dataset.name;
  const newName = prompt('Rename skill to:', oldName);
  if (!newName) return;
  utils.postXhr({
    params: {'nav': 'skills', 'new_name': newName, 'rename_id': id},
    callback: function(responseJson) {
      utils.spinner(false);
      if (responseJson['skills']) {
        renderSkills(responseJson['skills']);
      } else {
        utils.butter('Failed to rename skill');
      }
    }
  });
}

function deleteSkill(_e) {
  const id = parseInt(this.parentNode.parentNode.dataset.id);
  if (!id) throw Error('No skill ID');
  if (!confirm('Delete this skill?')) return;
  utils.postXhr({
    params: {'nav': 'skills', 'delete_id': id},
    callback: function(responseJson) {
      utils.spinner(false);
      if (responseJson['skills']) {
        renderSkills(responseJson['skills']);
      } else {
        utils.butter('Failed to delete skill');
      }
    }
  });
}

