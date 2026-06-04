const PAGE_URL = chrome.runtime.getURL('bookmarks.html');

chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: PAGE_URL });
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: PAGE_URL });
  }
});
