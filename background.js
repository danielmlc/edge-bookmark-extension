// 后台脚本 - 处理扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  // 查找是否已经打开了书签管理器标签页
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find(tab => 
      tab.url && tab.url.includes('bookmarks.html')
    );
    
    if (existingTab) {
      // 如果已存在，则切换到该标签页
      chrome.tabs.update(existingTab.id, { active: true });
    } else {
      // 否则打开新的书签管理器标签页
      chrome.tabs.create({
        url: 'bookmarks.html'
      });
    }
  });
});

// 记录扩展加载时间
console.log('书签管理器扩展已加载，时间:', new Date().toLocaleString());

// 扩展安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('书签管理器扩展首次安装');
  } else if (details.reason === 'update') {
    console.log('书签管理器扩展已更新到版本:', chrome.runtime.getManifest().version);
  }
});
