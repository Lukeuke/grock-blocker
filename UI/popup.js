const toggleButton = document.getElementById('toggleButton');
const modeSelector = document.getElementById('modeSelector');

chrome.storage.sync.get(['grokEnabled', 'grokMode'], result => {
  const enabled = result.grokEnabled ?? true;
  const mode = result.grokMode || 'blur';

  toggleButton.textContent = enabled ? 'Disable @grok filter' : 'Enable @grok filter';
  modeSelector.value = mode;
});

toggleButton.addEventListener('click', () => {
  chrome.storage.sync.get(['grokEnabled'], result => {
    const current = result.grokEnabled ?? true;
    const newState = !current;

    chrome.storage.sync.set({ grokEnabled: newState }, () => {
      toggleButton.textContent = newState ? 'Enable @grok filter' : 'Disable @grok filter';
    });
  });
});

modeSelector.addEventListener('change', () => {
  const newMode = modeSelector.value;
  chrome.storage.sync.set({ grokMode: newMode });
});