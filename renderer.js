const { ipcRenderer } = require('electron');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

let currentFilePath = null;
let isModified = false;

// DOM elements
const editor = document.getElementById('editor');
const filePathDisplay = document.getElementById('file-path');
const wordCountDisplay = document.getElementById('word-count');

// Toolbar buttons
const btnNew = document.getElementById('btn-new');
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');
const btnBold = document.getElementById('btn-bold');
const btnItalic = document.getElementById('btn-italic');
const btnUnderline = document.getElementById('btn-underline');
const fontSizeSelect = document.getElementById('font-size');
const btnAlignLeft = document.getElementById('btn-align-left');
const btnAlignCenter = document.getElementById('btn-align-center');
const btnAlignRight = document.getElementById('btn-align-right');

// Initialize
updateWordCount();
updateFilePathDisplay();

// Event listeners for toolbar buttons
btnNew.addEventListener('click', newDocument);
btnOpen.addEventListener('click', openDocument);
btnSave.addEventListener('click', saveDocument);
btnBold.addEventListener('click', () => formatText('bold'));
btnItalic.addEventListener('click', () => formatText('italic'));
btnUnderline.addEventListener('click', () => formatText('underline'));
fontSizeSelect.addEventListener('change', changeFontSize);
btnAlignLeft.addEventListener('click', () => alignText('left'));
btnAlignCenter.addEventListener('click', () => alignText('center'));
btnAlignRight.addEventListener('click', () => alignText('right'));

// Editor event listeners
editor.addEventListener('input', () => {
  isModified = true;
  updateWordCount();
  updateFilePathDisplay();
});

editor.addEventListener('keydown', (e) => {
  // Handle keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch(e.key.toLowerCase()) {
      case 'b':
        e.preventDefault();
        formatText('bold');
        break;
      case 'i':
        e.preventDefault();
        formatText('italic');
        break;
      case 'u':
        e.preventDefault();
        formatText('underline');
        break;
    }
  }
});

// IPC listeners
ipcRenderer.on('file-new', newDocument);
ipcRenderer.on('file-save', saveDocument);
ipcRenderer.on('file-save-as', saveDocumentAs);
ipcRenderer.on('file-opened', (event, filePath) => {
  loadFile(filePath);
});

// Functions
function newDocument() {
  if (isModified) {
    const response = confirm('当前文档已修改，是否保存？');
    if (response) {
      saveDocument();
    }
  }
  editor.innerHTML = '<p><br></p>';
  currentFilePath = null;
  isModified = false;
  updateFilePathDisplay();
  updateWordCount();
}

function openDocument() {
  // This will trigger the file dialog in main process
  ipcRenderer.send('open-file-dialog');
}

async function loadFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.docx') {
      // Load .docx file using mammoth
      const result = await ipcRenderer.invoke('read-file', filePath);
      if (result.success) {
        const arrayBuffer = result.data.buffer;
        const converted = await mammoth.convertToHtml({ arrayBuffer });
        editor.innerHTML = converted.value || '<p><br></p>';
      } else {
        alert('打开文件失败: ' + result.error);
        return;
      }
    } else if (ext === '.txt' || ext === '.doc') {
      // Load text files
      const result = await ipcRenderer.invoke('read-file', filePath);
      if (result.success) {
        const content = result.data.toString('utf8');
        // Convert plain text to HTML paragraphs
        const paragraphs = content.split('\n').map(line => 
          `<p>${line || '<br>'}</p>`
        ).join('');
        editor.innerHTML = paragraphs || '<p><br></p>';
      } else {
        alert('打开文件失败: ' + result.error);
        return;
      }
    } else {
      alert('不支持的文件格式');
      return;
    }
    
    currentFilePath = filePath;
    isModified = false;
    updateFilePathDisplay();
    updateWordCount();
  } catch (error) {
    alert('打开文件时出错: ' + error.message);
  }
}

async function saveDocument() {
  if (!currentFilePath) {
    return saveDocumentAs();
  }
  
  try {
    const content = getEditorTextContent();
    const result = await ipcRenderer.invoke('save-file', currentFilePath, content);
    
    if (result.success) {
      isModified = false;
      updateFilePathDisplay();
    } else {
      alert('保存文件失败: ' + result.error);
    }
  } catch (error) {
    alert('保存文件时出错: ' + error.message);
  }
}

async function saveDocumentAs() {
  try {
    const result = await ipcRenderer.invoke('save-file-dialog');
    
    if (!result.canceled && result.filePath) {
      const content = getEditorTextContent();
      const saveResult = await ipcRenderer.invoke('save-file', result.filePath, content);
      
      if (saveResult.success) {
        currentFilePath = result.filePath;
        isModified = false;
        updateFilePathDisplay();
      } else {
        alert('保存文件失败: ' + saveResult.error);
      }
    }
  } catch (error) {
    alert('保存文件时出错: ' + error.message);
  }
}

function getEditorTextContent() {
  // Get plain text content from editor
  const clone = editor.cloneNode(true);
  const paragraphs = clone.querySelectorAll('p');
  const lines = Array.from(paragraphs).map(p => p.textContent || '');
  return lines.join('\n');
}

function formatText(command) {
  document.execCommand(command, false, null);
  editor.focus();
}

function changeFontSize() {
  const size = fontSizeSelect.value;
  document.execCommand('fontSize', false, '7');
  const fontElements = editor.querySelectorAll('font[size="7"]');
  fontElements.forEach(element => {
    element.removeAttribute('size');
    element.style.fontSize = size + 'px';
  });
  editor.focus();
}

function alignText(alignment) {
  if (alignment === 'left') {
    document.execCommand('justifyLeft', false, null);
  } else if (alignment === 'center') {
    document.execCommand('justifyCenter', false, null);
  } else if (alignment === 'right') {
    document.execCommand('justifyRight', false, null);
  }
  editor.focus();
}

function updateWordCount() {
  const text = editor.textContent || '';
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const chars = text.replace(/\s/g, '').length;
  wordCountDisplay.textContent = `字数: ${chars} | 词数: ${words.length}`;
}

function updateFilePathDisplay() {
  if (currentFilePath) {
    const fileName = path.basename(currentFilePath);
    filePathDisplay.textContent = fileName + (isModified ? ' *' : '');
  } else {
    filePathDisplay.textContent = '未命名文档' + (isModified ? ' *' : '');
  }
}
