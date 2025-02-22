// 添加事件监听
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('bookmarks.html')
  });
});