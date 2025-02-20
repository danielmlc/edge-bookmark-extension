chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({
    url: 'bookmarks.html'
  });
});