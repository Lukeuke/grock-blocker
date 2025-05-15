let settings = {
  grokEnabled: true,
  grokMode: 'blur'
};

// Load from storage at startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['grokEnabled', 'grokMode'], result => {
    settings.grokEnabled = result.grokEnabled ?? true;
    settings.grokMode = result.grokMode || 'blur';
  });
});

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    sendResponse(settings);
  }

  if (message.type === 'setSettings') {
    settings = { ...settings, ...message.data };
    chrome.storage.sync.set(settings);
    sendResponse({ success: true });

    // Broadcast to all tabs
    chrome.tabs.query({}, tabs => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'settingsUpdated',
          data: settings
        });
      }
    });
  }

  return true; // keep async channel open
});
