let grokEnabled = true;

// Safely load the setting once
if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
  chrome.storage.sync.get(['grokEnabled'], result => {
    grokEnabled = result.grokEnabled ?? true;
    runTweetFilter();
  });
} else {
  console.warn('[GrokBlocker] chrome.storage unavailable, running with default settings.');
  runTweetFilter();
}

function runTweetFilter() {
  getRidOfAnnoyingTweets();

  const observer = new MutationObserver(() => {
    getRidOfAnnoyingTweets();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Support Twitter SPA URL change
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      getRidOfAnnoyingTweets();
    }
  });
  urlObserver.observe(document, { subtree: true, childList: true });
}

function getRidOfAnnoyingTweets() {
  if (!grokEnabled) return;

  chrome.storage.sync.get(['grokMode'], result => {
    const mode = result.grokMode || 'blur';

    const tweets = document.querySelectorAll('article');
    tweets.forEach(tweet => {
      if (tweet.innerText.toLowerCase().includes('@grok')) {
        if (mode === 'remove') {
          hardRemove(tweet);
        } else {
          blur(tweet);
        }
      }
    });
  });
}

function blur(tweet){
  if (tweet.classList.contains('grok-blurred')) return;

  tweet.classList.add('grok-blurred');
  tweet.style.filter = 'blur(5px) brightness(0.7)';
  tweet.style.transition = 'filter 0.3s ease';

  tweet.addEventListener('click', () => {
    tweet.style.filter = 'none';
    tweet.classList.remove('grok-blurred');
  }, { once: true });
}

function hardRemove(tweet){
  tweet.remove();
}