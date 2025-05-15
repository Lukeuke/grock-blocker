const toggleButton = document.getElementById('toggleButton');
const modeSelector = document.getElementById('modeSelector');

// Load current settings
chrome.runtime.sendMessage({ type: 'getSettings' }, response => {
  toggleButton.textContent = response.grokEnabled ? 'Disable @grok filter' : 'Enable @grok filter';
  modeSelector.value = response.grokMode;
});

// Toggle on/off
toggleButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'getSettings' }, current => {
    const newState = !current.grokEnabled;
    chrome.runtime.sendMessage({ type: 'setSettings', data: { grokEnabled: newState } }, () => {
      toggleButton.textContent = newState ? 'Disable @grok filter' : 'Enable @grok filter';
    });
  });
});

// Change mode
modeSelector.addEventListener('change', () => {
  const newMode = modeSelector.value;
  chrome.runtime.sendMessage({ type: 'setSettings', data: { grokMode: newMode } });
});
