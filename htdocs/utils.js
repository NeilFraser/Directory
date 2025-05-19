/**
 * Get an XHR request from the server.
 * @param {!Object} options Options for the request.
 */
export function getXhr(options) {
  const params = options.params;
  if (!params) throw Error('params is required');
  const callback = options.callback;

  // Build the URL.
  const url = '/cgi-bin/directory_get.py?' + paramsToData(params);

  // Send the request.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.responseType = 'json';
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(xhr.response);
    } else {
      console.error(xhr.response);
    }
  }
  xhr.send();
}

/**
 * POST an XHR request to the server.
 * @param {!Object} options Options for the request.
 */
export function postXhr(options) {
  const params = options.params;
  if (!params) throw Error('params is required');
  const callback = options.callback;

  // Build the URL.
  const url = '/cgi-bin/directory_post.py';

  // Send the request.
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.responseType = 'json';
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(xhr.response);
    } else {
      console.error(xhr.response);
    }
  }
  xhr.send(paramsToData(params));
}

/**
 * Find the requested URL parameter.  Returns undefined if not present.
 * E.g. ?foo=123&bar=456 getParam('foo') -> '123'
 * @param {string} name Name of parameter.
 * @returns {string|undefined} Value of parameter.
 */
export function getParam(name) {
  const params = window.location.search.substring(1).split('&');
  for (const param of params) {
    const tuple = param.split('=');
    if (tuple.length === 2) {
      if (name === decodeURIComponent(tuple[0])) {
        return decodeURIComponent(tuple[1]).replaceAll('+', ' ');
      }
    }
  }
  return undefined;
}

/**
 * Given a map of name-value pairs, build a URL-encoded query string.
 * E.g. {a: 1, b: 'foo bar'} -> 'a=1&b=foo+bar'
 * @param {!Object} params And object containing name-value pairs.
 * @returns {string} URL-encoded query string.
 */
function paramsToData(params) {
  const data = new FormData();
  for (let key in params) {
    data.append(key, params[key]);
  }
  return new URLSearchParams(data).toString();
}

/**
 * Escape potentially unsafe text for display as HTML.
 * @param {*} text Some potentially unsafe value.
 * @returns {string} The text with HTML special characters escaped.
 */
export function htmlEscape(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Display a temporary message at the top of the page.
 * @param {string} msg Plain text message to display
 */
export function butter(msg) {
  console.log(msg);
  const div = document.createElement('div');
  div.className = 'butter';
  const innerDiv = document.createElement('div');
  innerDiv.textContent = msg;
  div.appendChild(innerDiv);
  document.body.appendChild(div);
  setTimeout(function() {
    document.body.removeChild(div);
  }, 2000);
}

/**
 * The background element that prevents user-interaction when spinner is active.
 * @type Element
 */
let maskDiv = null;

/**
 * Show or hide the spinner to prevent user-interaction during XHR requests.
 * @param {boolean} active True to activate spinner, false to deactivate.
 */
export function spinner(active) {
  if (active && !maskDiv) {
    maskDiv = document.createElement('div');
    maskDiv.id = 'mask';
    const spinnerDiv = document.createElement('div');
    spinnerDiv.id = 'spinner';
    maskDiv.appendChild(spinnerDiv);
    document.body.appendChild(maskDiv);
  } else if (!active && maskDiv) {
    document.body.removeChild(maskDiv);
    maskDiv = null;
  }
}

/**
 * Delete an element from the DOM.
 * @param {!Element} element The element to delete.
 */
export function deleteElement(element) {
  element.parentNode.removeChild(element);
}

/**
 * Names of all 12 months.
 */
export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Names of the language levels.
 */
export const languageLevels = ['None', 'Beginner', 'Intermediate', 'Fluent'];
