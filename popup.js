document.addEventListener('DOMContentLoaded', function() {
  // 获取书签树
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    // 获取根书签文件夹
    const rootNode = bookmarkTreeNodes[0];
    // 获取一级文件夹
    const topFolders = rootNode.children || [];
    
    // 创建标签页
    createTabs(topFolders);
    // 显示第一个标签页的内容
    if (topFolders.length > 0) {
      showTab(topFolders[0].id);
    }
  });
});

function createTabs(folders) {
  const tabsContainer = document.getElementById('tabs');
  const tabContents = document.getElementById('tab-contents');

  folders.forEach((folder) => {
    // 创建标签按钮
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = folder.title;
    tab.dataset.folderId = folder.id;
    tab.onclick = () => showTab(folder.id);
    tabsContainer.appendChild(tab);

    // 创建标签内容区域
    const content = document.createElement('div');
    content.className = 'tab-content';
    content.id = `content-${folder.id}`;
    tabContents.appendChild(content);

    // 显示文件夹内容
    showBookmarks(folder.children || [], content);
  });

  // 默认激活第一个标签
  const firstTab = tabsContainer.firstChild;
  if (firstTab) {
    firstTab.classList.add('active');
    const firstContent = tabContents.firstChild;
    if (firstContent) {
      firstContent.classList.add('active');
    }
  }
}

function showTab(folderId) {
  // 移除所有活动状态
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // 激活选中的标签
  document.querySelector(`.tab[data-folder-id="${folderId}"]`).classList.add('active');
  document.getElementById(`content-${folderId}`).classList.add('active');
}

function showBookmarks(bookmarkNodes, container, level = 0) {
  const wrapper = document.createElement('div');
  wrapper.className = level > 0 ? 'nested-bookmarks' : '';
  
  bookmarkNodes.forEach(function(node) {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item';

    if (node.children) {
      // 如果有子节点，说明是文件夹
      const folderTitle = document.createElement('div');
      folderTitle.className = 'bookmark-folder';
      
      // 添加文件夹图标
      const folderIcon = document.createElement('img');
      folderIcon.className = 'favicon';
      folderIcon.src = 'images/folder.png';
      folderTitle.appendChild(folderIcon);
      
      const titleText = document.createElement('span');
      titleText.textContent = node.title || '未命名文件夹';
      folderTitle.appendChild(titleText);
      
      bookmarkItem.appendChild(folderTitle);

      // 递归显示子书签
      showBookmarks(node.children, bookmarkItem, level + 1);
    } else {
      // 如果没有子节点，说明是书签链接
      const link = document.createElement('a');
      link.className = 'bookmark-link';
      link.href = node.url;
      
      // 添加网站图标
      const favicon = document.createElement('img');
      favicon.className = 'favicon';
      favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(node.url).hostname}`;
      favicon.onerror = function() {
        favicon.src = 'images/default-favicon.png';
      };
      
      link.appendChild(favicon);
      
      const titleText = document.createElement('span');
      titleText.textContent = node.title || node.url;
      link.appendChild(titleText);
      
      link.target = '_blank';
      bookmarkItem.appendChild(link);
    }

    wrapper.appendChild(bookmarkItem);
  });

  container.appendChild(wrapper);
} 