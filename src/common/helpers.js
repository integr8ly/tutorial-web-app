/**
 * Common helper to generate unique DOM id's
 */
export const generateId = prefix => `${prefix || 'generatedid'}-${Math.ceil(1e5 * Math.random())}`;

/**
 * Environment constants
 */
export const DEV_MODE = process.env.REACT_APP_ENV === 'development';
export const OC_MODE = process.env.REACT_APP_ENV === 'oc';
export const UI_COMMIT_HASH = process.env.REACT_APP_UI_COMMIT_HASH;

/**
 * Copy Clipboard
 */
export const copyClipboard = text => {
  let successful;

  try {
    window.getSelection().removeAllRanges();

    const newTextarea = document.createElement('pre');
    newTextarea.appendChild(document.createTextNode(text));
    newTextarea.style.position = 'absolute';
    newTextarea.style.top = '-1000px';
    newTextarea.style.left = '-1000px';
    newTextarea.style.overflow = 'hidden';
    newTextarea.style.width = '1px';
    newTextarea.style.height = '1px';

    const range = document.createRange();
    window.document.body.appendChild(newTextarea);
    range.selectNode(newTextarea);
    window.getSelection().addRange(range);
    successful = window.document.execCommand('copy');

    window.document.body.removeChild(newTextarea);
    window.getSelection().removeAllRanges();
  } catch (e) {
    successful = false;
    console.warn('Copy to clipboard failed.', e.message);
  }

  return successful;
};
