// 获取必应每日图片
async function setBingDailyBackground() {
  try {
    const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1');
    const data = await response.json();
    const imageUrl = 'https://www.bing.com' + data.images[0].url;
    document.body.style.backgroundImage = `url(${imageUrl})`;
  } catch (error) {
    console.error('Failed to fetch Bing daily image:', error);
    document.body.style.backgroundColor = '#f0f0f0';
  }
}

// 获取书签图标
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain=${urlObj.hostname}`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return 'images/default-favicon.png';
  }
}

// 创建编辑对话框
function createEditDialog(type) {
  const dialog = document.createElement('div');
  dialog.className = 'edit-dialog';
  
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = '名称';
  titleInput.className = 'edit-input';
  dialog.appendChild(titleInput);
  
  let urlInput;
  if (type === 'bookmark') {
    urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'URL';
    urlInput.className = 'edit-input';
    dialog.appendChild(urlInput);
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'dialog-buttons';
  
  const saveButton = document.createElement('button');
  saveButton.textContent = '保存';
  saveButton.className = 'dialog-button save-button';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.className = 'dialog-button cancel-button';
  
  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(cancelButton);
  dialog.appendChild(buttonContainer);
  
  return {
    dialog,
    titleInput,
    urlInput,
    saveButton,
    cancelButton
  };
}

// 显示编辑对话框
function showEditDialog(bookmark, type) {
  // 移除任何已存在的对话框和遮罩
  const existingOverlay = document.querySelector('.dialog-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';

  const { dialog, titleInput, urlInput, saveButton, cancelButton } = createEditDialog(type);

  titleInput.value = bookmark.title;
  if (type === 'bookmark' && urlInput) {
    urlInput.value = bookmark.url;
  }

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // 处理保存
  saveButton.addEventListener('click', () => {
    const updates = {
      title: titleInput.value
    };
    
    if (type === 'bookmark' && urlInput) {
      updates.url = urlInput.value;
    }
    
    chrome.bookmarks.update(bookmark.id, updates, () => {
      overlay.remove();
      loadBookmarks(bookmark.parentId);
    });
  });

  // 处理取消
  cancelButton.addEventListener('click', () => {
    overlay.remove();
  });

  // 点击遮罩层关闭对话框
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// 创建书签元素
function createBookmarkElement(bookmark) {
  const div = document.createElement('div');
  div.className = `bookmark-item ${bookmark.url ? '' : 'folder'}`;
  
  if (bookmark.url) {
    const img = document.createElement('img');
    img.className = 'bookmark-icon';
    img.src = getFaviconUrl(bookmark.url);
    img.alt = 'icon';
    img.onerror = function() {
      this.src = 'images/default-favicon.png';
    };
    
    const p = document.createElement('p');
    p.className = 'bookmark-title';
    p.textContent = bookmark.title;
    
    div.appendChild(img);
    div.appendChild(p);
    
    div.addEventListener('click', () => {
      window.open(bookmark.url, '_blank');
    });
    
    // 添加右键菜单
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showEditDialog(bookmark, 'bookmark');
    });
  } else {
    const img = document.createElement('img');
    img.className = 'bookmark-icon';
    img.src = 'images/folder-icon.png';
    img.alt = 'folder';
    
    const p = document.createElement('p');
    p.className = 'bookmark-title';
    p.textContent = bookmark.title;
    
    div.appendChild(img);
    div.appendChild(p);
    
    div.addEventListener('click', () => {
      loadBookmarks(bookmark.id);
    });
    
    // 添加右键菜单
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showEditDialog(bookmark, 'folder');
    });
  }
  
  return div;
}

// 加载书签
function loadBookmarks(folderId = '1') {
  chrome.bookmarks.getChildren(folderId, (bookmarks) => {
    const container = document.getElementById('bookmarks-grid');
    container.innerHTML = '';
    
    if (folderId !== '1') {
      const backButton = document.createElement('div');
      backButton.className = 'bookmark-item';
      backButton.innerHTML = `
        <img class="bookmark-icon" src="images/back-icon.png" alt="back">
        <p class="bookmark-title">返回上级</p>
      `;
      backButton.addEventListener('click', () => {
        chrome.bookmarks.get(folderId, (folder) => {
          loadBookmarks(folder[0].parentId);
        });
      });
      container.appendChild(backButton);
    }
    
    bookmarks.forEach(bookmark => {
      container.appendChild(createBookmarkElement(bookmark));
    });
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  setBingDailyBackground();
  loadBookmarks();
});