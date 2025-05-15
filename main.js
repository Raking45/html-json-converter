// Utility function to sanitize attribute values and text
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// --- Drag and Drop Handlers ---
function setupDropZone(dropZoneId, fileInputId, handleFile) {
  const zone = document.getElementById(dropZoneId);
  const input = document.getElementById(fileInputId);

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('hover');
  });
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('hover');
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('hover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      handleFile(input.files[0]);
    }
  });
}

// --- HTML to JSON ---
document.getElementById('htmlToJsonBtn').addEventListener('click', () => {
  const htmlStr = document.getElementById('htmlInput').value;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    if (doc.body) {
      const json = elementToJson(doc.body);
      document.getElementById('jsonOutput').textContent = JSON.stringify(json, null, 2);
    } else {
      throw new Error('Invalid HTML');
    }
  } catch (e) {
    document.getElementById('jsonOutput').textContent = 'Error parsing HTML: ' + e.message;
  }
});

// --- JSON to HTML ---
document.getElementById('jsonToHtmlBtn').addEventListener('click', () => {
  const jsonStr = document.getElementById('jsonInput').value;
  try {
    const json = JSON.parse(jsonStr);
    const html = jsonToHtml(json);
    document.getElementById('htmlOutput').innerHTML = html;
  } catch (e) {
    document.getElementById('htmlOutput').textContent = 'Invalid JSON: ' + e.message;
  }
});

// --- Clear buttons ---
document.getElementById('clearHtmlInput').addEventListener('click', () => {
  document.getElementById('htmlInput').value = '';
});
document.getElementById('clearJsonInput').addEventListener('click', () => {
  document.getElementById('jsonInput').value = '';
});
document.getElementById('clearJsonOutput').addEventListener('click', () => {
  document.getElementById('jsonOutput').textContent = '';
});
document.getElementById('clearHtmlOutput').addEventListener('click', () => {
  document.getElementById('htmlOutput').innerHTML = '';
});

// --- Copy to clipboard ---
function copyToClipboard(elementId) {
  let text = '';
  if (elementId === 'jsonOutput') {
    text = document.getElementById(elementId).textContent;
  } else if (elementId === 'htmlOutput') {
    text = document.getElementById(elementId).innerHTML;
  } else {
    text = document.getElementById(elementId).value;
  }
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  });
}

document.getElementById('copyJsonOutput').addEventListener('click', () => {
  copyToClipboard('jsonOutput');
});
document.getElementById('copyHtmlOutput').addEventListener('click', () => {
  copyToClipboard('htmlOutput');
});
document.getElementById('copyHtmlInput').addEventListener('click', () => {
  copyToClipboard('htmlInput');
});
document.getElementById('copyJsonInput').addEventListener('click', () => {
  copyToClipboard('jsonInput');
});

// --- View HTML code modal ---
const modal = document.getElementById('htmlModal');
const modalContent = document.getElementById('modalHtmlContent');
const btnView = document.getElementById('viewHtmlBtn');
const spanClose = document.getElementById('closeModal');
const btnCopyModal = document.getElementById('copyModalHtml');

btnView.addEventListener('click', () => {
  const html = document.getElementById('htmlOutput').innerHTML;
  modalContent.textContent = html;
  modal.style.display = 'block';
});

spanClose.onclick = () => {
  modal.style.display = 'none';
};

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

btnCopyModal.addEventListener('click', () => {
  const html = document.getElementById('modalHtmlContent').textContent;
  navigator.clipboard.writeText(html).then(() => {
    alert('HTML code copied!');
  });
});

// --- Convert JSON to HTML ---
function elementToJson(element) {
  if (!element || !(element instanceof Element)) return null;

  const obj = {
    tag: element.tagName.toLowerCase(),
    attributes: {},
    children: []
  };

  for (let attr of element.attributes) {
    obj.attributes[attr.name] = attr.value;
  }

  for (let child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) {
        obj.children.push({ text });
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childJson = elementToJson(child);
      if (childJson) {
        obj.children.push(childJson);
      }
    }
  }
  return obj;
}

function jsonToHtml(json) {
  if (!json || typeof json !== 'object') return '';

  if (json.text) {
    return sanitizeHTML(json.text);
  }

  const attrs = Object.entries(json.attributes || {})
    .map(([k, v]) => `${k}="${sanitizeHTML(v)}"`)
    .join(' ');

  const childrenHtml = (json.children || []).map(jsonToHtml).join('');

  const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
  if (selfClosingTags.includes(json.tag) && !childrenHtml) {
    return `<${json.tag} ${attrs} />`;
  }

  return `<${json.tag} ${attrs}>${childrenHtml}</${json.tag}>`;
}