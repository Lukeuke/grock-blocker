let grokEnabled = true;
let grokMode = 'blur';

function init() {
  chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
    if (response) {
      grokEnabled = response.grokEnabled;
      grokMode = response.grokMode;
      runTweetFilter();
    }
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'settingsUpdated') {
    grokEnabled = message.data.grokEnabled;
    grokMode = message.data.grokMode;
    applyFilter();
  }
});

let observer = null;
let urlObserver = null;

function runTweetFilter() {
  applyFilter();

  if (observer) observer.disconnect();
  observer = new MutationObserver(applyFilter);
  observer.observe(document.body, { childList: true, subtree: true });

  let lastUrl = location.href;

  if (urlObserver) urlObserver.disconnect();

  urlObserver = new MutationObserver(() => {
    try {
      if (typeof location !== 'undefined' && location.href) {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          applyFilter();
        }
      }
    } catch (e) {
      console.warn('[GrokBlocker] Failed to access location.href', e);
    }
  });


  urlObserver.observe(document, { childList: true, subtree: true });
}

function applyFilter() {
  if (!grokEnabled) return;

  const tweets = document.querySelectorAll('article');

  tweets.forEach(tweet => {
    if (tweet.innerText.toLowerCase().includes('@grok')) {
      if (grokMode === 'remove') {
        hardRemove(tweet);
      } else {
        blur(tweet);
      }
    }
  });
}

function blur(tweet) {
  if (tweet.classList.contains('grok-blurred')) return;

  tweet.classList.add('grok-blurred');
  tweet.style.filter = 'blur(5px) brightness(0.7)';
  tweet.style.transition = 'filter 0.3s ease';

  tweet.addEventListener('click', () => {
    tweet.style.filter = 'none';
    tweet.classList.remove('grok-blurred');
  }, { once: true });
}

function hardRemove(tweet) {
  tweet.remove();
}

window.addEventListener('beforeunload', () => {
  if (observer) observer.disconnect();
  if (urlObserver) urlObserver.disconnect();
});

init();