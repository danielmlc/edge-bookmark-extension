// 记录书签访问历史
function recordBookmarkVisit(bookmark) {
  try {
    // 获取当前存储的访问历史
    let visitHistory = localStorage.getItem('bookmark_visit_history');
    let bookmarks = visitHistory ? JSON.parse(visitHistory) : [];
    
    // 检查书签是否已存在于历史中
    const existingIndex = bookmarks.findIndex(item => item.id === bookmark.id);
    
    if (existingIndex !== -1) {
      // 如果存在，将其移除，稍后将其重新添加到最前面
      bookmarks.splice(existingIndex, 1);
    }
    
    // 添加到数组开头（最新的在前面）
    bookmarks.unshift({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      timestamp: Date.now()
    });
    
    // 获取存储的最大记录数
    const maxRecords = parseInt(localStorage.getItem('bookmark_recent_count') || 12) * 2; // 存储的记录数应比显示的多
    
    // 只保留最近的记录
    if (bookmarks.length > maxRecords) {
      bookmarks = bookmarks.slice(0, maxRecords);
    }
    
    // 保存回本地存储
    localStorage.setItem('bookmark_visit_history', JSON.stringify(bookmarks));
    
    // 更新显示
    displayRecentBookmarks();
  } catch (error) {
    console.error('记录书签访问历史时出错:', error);
  }
}

// 显示最近访问的书签
function displayRecentBookmarks() {
  const container = document.getElementById('recent-bookmarks');
  if (!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 添加标题
  const title = document.createElement('span');
  title.className = 'recent-title';
  title.textContent = '常用网站:';
  container.appendChild(title);
  
  try {
    // 获取访问历史
    const visitHistory = localStorage.getItem('bookmark_visit_history');
    
    if (visitHistory) {
      const bookmarks = JSON.parse(visitHistory);
      
      if (bookmarks.length === 0) {
        // 如果没有历史记录，显示提示
        const emptyMsg = document.createElement('span');
        emptyMsg.textContent = '暂无访问记录';
        emptyMsg.style.color = '#999';
        emptyMsg.style.fontStyle = 'italic';
        container.appendChild(emptyMsg);
        return;
      }
      
      // 获取设置的显示数量
      const maxDisplayCount = localStorage.getItem('bookmark_recent_count') || 12;
      
      // 显示最近访问的数量
      const displayCount = Math.min(bookmarks.length, parseInt(maxDisplayCount));
      
      // 添加每个书签
      for (let i = 0; i < displayCount; i++) {
        const bookmark = bookmarks[i];
        
        // 创建书签元素
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'recent-bookmark';
        bookmarkElement.title = bookmark.title; // 使用原生的title属性显示提示
        
        // 创建图标
        const icon = document.createElement('img');
        icon.src = getFaviconUrl(bookmark.url);
        icon.alt = bookmark.title;
        icon.onerror = function() {
          this.src = 'images/default-favicon.png';
        };
        
        // 点击事件 - 打开书签
        bookmarkElement.addEventListener('click', () => {
          window.open(bookmark.url, '_blank');
        });
        
        // 构建元素
        bookmarkElement.appendChild(icon);
        container.appendChild(bookmarkElement);
      }
    } else {
      // 如果没有历史记录，显示提示
      const emptyMsg = document.createElement('span');
      emptyMsg.textContent = '暂无访问记录';
      emptyMsg.style.color = '#999';
      emptyMsg.style.fontStyle = 'italic';
      container.appendChild(emptyMsg);
    }
  } catch (error) {
    console.error('显示最近访问书签时出错:', error);
    
    // 出错时显示错误消息
    const errorMsg = document.createElement('span');
    errorMsg.textContent = '加载历史记录失败';
    errorMsg.style.color = '#c00';
    container.appendChild(errorMsg);
  }
}// 搜索书签函数
function searchBookmarks(query) {
  // 确保搜索查询不为空
  if (!query || query.trim() === '') {
    hideSearchResults();
    return;
  }
  
  query = query.toLowerCase().trim();
  
  chrome.bookmarks.search(query, (results) => {
    displaySearchResults(results, query);
  });
}

// 显示搜索结果
function displaySearchResults(results, query) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '';
  
  // 如果没有结果，显示提示
  if (results.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = '没有找到匹配的书签';
    resultsContainer.appendChild(noResults);
    resultsContainer.classList.add('show');
    return;
  }
  
  // 最多显示10个结果
  const displayResults = results.slice(0, 10);
  
  // 创建结果列表
  displayResults.forEach(bookmark => {
    const resultItem = document.createElement('div');
    resultItem.className = `search-result-item ${bookmark.url ? '' : 'folder'}`;
    resultItem.dataset.id = bookmark.id;
    resultItem.dataset.url = bookmark.url || '';
    
    // 创建图标
    const icon = document.createElement('img');
    icon.className = 'search-result-icon';
    
    if (bookmark.url) {
      icon.src = getFaviconUrl(bookmark.url);
      icon.onerror = function() {
        this.src = 'images/default-favicon.png';
      };
    } else {
      icon.src = 'images/folder-icon.png';
    }
    
    // 创建内容容器
    const content = document.createElement('div');
    content.className = 'search-result-content';
    
    // 创建标题，高亮匹配关键词
    const title = document.createElement('p');
    title.className = 'search-result-title';
    
    // 简单的关键词高亮逻辑
    const titleText = bookmark.title;
    title.textContent = titleText;
    
    content.appendChild(title);
    
    // 获取并显示书签路径
    getBookmarkPath(bookmark.id, (path) => {
      const pathText = path.map(item => item.title).join(' > ');
      
      // 创建路径行
      const pathElement = document.createElement('p');
      pathElement.className = 'search-result-path';
      pathElement.textContent = pathText;
      content.appendChild(pathElement);
    });
    
    // 添加点击事件
    resultItem.addEventListener('click', () => {
      if (bookmark.url) {
        // 如果是书签，打开URL
        window.open(bookmark.url, '_blank');
        // 记录访问历史
        recordBookmarkVisit(bookmark);
      } else {
        // 如果是文件夹，导航到该文件夹
        loadBookmarks(bookmark.id);
      }
      
      // 隐藏搜索结果
      hideSearchResults();
      
      // 清空搜索框
      document.getElementById('bookmark-search').value = '';
    });
    
    resultItem.appendChild(icon);
    resultItem.appendChild(content);
    resultsContainer.appendChild(resultItem);
  });
  
  // 显示结果容器
  resultsContainer.classList.add('show');
}

// 隐藏搜索结果
function hideSearchResults() {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.classList.remove('show');
}

// 获取书签路径（复用了导航路径的逻辑）
function getBookmarkPath(bookmarkId, callback) {
  const path = [];
  
  function getParentFolder(id) {
    chrome.bookmarks.get(id, (bookmarks) => {
      if (bookmarks && bookmarks.length > 0) {
        const bookmark = bookmarks[0];
        path.unshift({ id: bookmark.id, title: bookmark.title });
        
        // 如果还有父文件夹且不是根文件夹
        if (bookmark.parentId && bookmark.parentId !== '0' && bookmark.parentId !== '1') {
          getParentFolder(bookmark.parentId);
        } else {
          // 如果到达根文件夹，返回结果
          callback(path);
        }
      } else {
        // 如果出错，返回当前路径
        callback(path);
      }
    });
  }
  
  getParentFolder(bookmarkId);
}

// 获取完整导航路径
function getBreadcrumbPath(folderId, callback) {
  const path = [];
  
  function getParentFolder(id) {
    if (id === '0' || id === '1') {
      // 达到书签栏根节点，结束递归
      path.unshift({ id: '1', title: '书签栏' });
      callback(path);
      return;
    }
    
    chrome.bookmarks.get(id, (folder) => {
      if (folder && folder.length > 0) {
        path.unshift({ id: folder[0].id, title: folder[0].title });
        getParentFolder(folder[0].parentId);
      } else {
        // 如果存在问题，返回当前路径
        callback(path);
      }
    });
  }
  
  getParentFolder(folderId);
}

// 更新导航路径显示
function updateBreadcrumb(folderId) {
  const breadcrumbContainer = document.getElementById('bookmark-breadcrumb');
  
  // 先清空容器
  breadcrumbContainer.innerHTML = '';
  
  // 显示加载中状态
  breadcrumbContainer.textContent = '加载中...';
  
  // 获取完整路径
  getBreadcrumbPath(folderId, (path) => {
    breadcrumbContainer.innerHTML = '';
    
    path.forEach((folder, index) => {
      const item = document.createElement('span');
      item.className = 'breadcrumb-item';
      
      if (index < path.length - 1) {
        // 如果不是最后一项，可以点击
        const link = document.createElement('span');
        link.className = 'breadcrumb-link';
        link.textContent = folder.title;
        link.addEventListener('click', () => {
          loadBookmarks(folder.id);
        });
        item.appendChild(link);
      } else {
        // 当前文件夹不可点击
        item.textContent = folder.title;
      }
      
      breadcrumbContainer.appendChild(item);
      
      // 添加分隔符，除了最后一项
      if (index < path.length - 1) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '>';
        breadcrumbContainer.appendChild(separator);
      }
    });
  });
}// 默认的滤镜设置
const DEFAULT_FILTER_SETTINGS = {
  brightness: '1.05',
  contrast: '1.1',
  saturate: '1.2',
  blur: '0',
  'hue-rotate': '0'
};

// 默认的颜色叠加设置
const DEFAULT_COLOR_SETTINGS = {
  color: '#ffffff',
  opacity: '0'
};

// 获取必应每日图片
async function setBingDailyBackground() {
  try {
    // 首先检查并应用已保存的滤镜设置到页面上
    // 这样即使在影响新创建的滤镜控件前，背景也将应用相应的滤镜效果
    let filterConfig = {
      filters: null,
      colorSettings: null
    };
    
    try {
      // 加载滤镜设置
      const storedFilters = localStorage.getItem('bookmark_filter_settings');
      filterConfig.filters = storedFilters ? JSON.parse(storedFilters) : DEFAULT_FILTER_SETTINGS;
      
      // 加载颜色叠加设置
      const storedColorSettings = localStorage.getItem('bookmark_color_settings');
      filterConfig.colorSettings = storedColorSettings ? JSON.parse(storedColorSettings) : DEFAULT_COLOR_SETTINGS;
      
      console.log('在setBingDailyBackground中加载的滤镜配置:', filterConfig);
      
      // 在DOM上设置滤镜默认效果
      let filterString = '';
      Object.entries(filterConfig.filters).forEach(([type, value]) => {
        const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
        filterString += `${type}(${value}${unit}) `;
      });
      document.documentElement.style.setProperty('--background-filter', filterString);
      
      // 如果有颜色设置，应用颜色叠加
      if (parseFloat(filterConfig.colorSettings.opacity) > 0) {
        document.documentElement.style.setProperty('--overlay-color', filterConfig.colorSettings.color);
        document.documentElement.style.setProperty('--overlay-opacity', filterConfig.colorSettings.opacity);
        document.body.classList.add('color-overlay');
      }
    } catch (err) {
      console.error('在setBingDailyBackground中加载滤镜设置出错:', err);
      filterConfig.filters = DEFAULT_FILTER_SETTINGS;
      filterConfig.colorSettings = DEFAULT_COLOR_SETTINGS;
    }

    // 获取必应每日图片
    const response = await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1');
    const data = await response.json();
    const imageUrl = 'https://www.bing.com' + data.images[0].url;
    document.body.style.backgroundImage = `url(${imageUrl})`;
    
    // 添加设置面板界面
    createSettingsPanel();
    
    // 将滤镜设置应用到新创建的滤镜控件上
    applyFilterSettingsToDOM(filterConfig);
    
  } catch (error) {
    console.error('Failed to fetch Bing daily image:', error);
    document.body.style.backgroundColor = '#f0f0f0';
    
    // 即使图像加载失败仍需要应用滤镜设置
    try {
      // 加载滤镜设置
      const storedFilters = localStorage.getItem('bookmark_filter_settings');
      const filters = storedFilters ? JSON.parse(storedFilters) : DEFAULT_FILTER_SETTINGS;
      
      // 加载颜色叠加设置
      const storedColorSettings = localStorage.getItem('bookmark_color_settings');
      const colorSettings = storedColorSettings ? JSON.parse(storedColorSettings) : DEFAULT_COLOR_SETTINGS;
      
      // 创建设置面板
      createSettingsPanel();
      
      // 应用滤镜设置
      applyFilterSettingsToDOM({
        filters: filters,
        colorSettings: colorSettings
      });
    } catch (err) {
      console.error('应用滤镜设置时出错:', err);
      // 出错时仍创建控件但使用默认设置
      createFilterControls();
    }
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

// 创建上下文菜单
function createContextMenu() {
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.innerHTML = `
    <div class="menu-item edit">
      <img src="images/edit-icon.png" alt="edit" class="menu-icon">
      <span>编辑</span>
    </div>
    <div class="menu-item delete">
      <img src="images/delete-icon.png" alt="delete" class="menu-icon">
      <span>删除</span>
    </div>
  `;
  return menu;
}

// 显示上下文菜单
function showContextMenu(e, bookmark) {
  e.preventDefault();
  
  // 移除任何已存在的上下文菜单
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  const menu = createContextMenu();
  document.body.appendChild(menu);
  
  // 调整菜单位置
  const x = e.clientX;
  const y = e.clientY;
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  
  // 编辑选项点击事件
  menu.querySelector('.edit').addEventListener('click', () => {
    menu.remove();
    showEditDialog(bookmark, bookmark.url ? 'bookmark' : 'folder');
  });
  
  // 删除选项点击事件
  menu.querySelector('.delete').addEventListener('click', () => {
    menu.remove();
    deleteBookmark(bookmark);
  });
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

// 删除书签或文件夹
function deleteBookmark(bookmark) {
  if (confirm(`确定要删除 "${bookmark.title}" ${bookmark.url ? '书签' : '文件夹'} 吗？`)) {
    chrome.bookmarks.removeTree(bookmark.id, () => {
      loadBookmarks(bookmark.parentId);
    });
  }
}

// 创建书签元素 - 添加拖拽功能
function createBookmarkElement(bookmark) {
  const div = document.createElement('div');
  div.className = `bookmark-item ${bookmark.url ? '' : 'folder'}`;
  div.setAttribute('draggable', 'true');
  div.dataset.id = bookmark.id;
  div.dataset.parentId = bookmark.parentId;
  div.dataset.index = bookmark.index;
  
  if (bookmark.url) {
    const img = document.createElement('img');
    img.className = 'bookmark-icon';
    img.src = getFaviconUrl(bookmark.url);
    img.alt = 'icon';
    
    // 如果获取不到网站图标，使用本地默认图标
    img.onerror = function() {
      this.src = 'images/default-favicon.png';
    };
    
    const p = document.createElement('p');
    p.className = 'bookmark-title';
    p.textContent = bookmark.title;
    
    div.appendChild(img);
    div.appendChild(p);
    
    div.addEventListener('click', () => {
      // 打开书签链接
      window.open(bookmark.url, '_blank');
      
      // 记录访问历史
      recordBookmarkVisit(bookmark);
    });
    
    // 更新右键菜单事件
    div.addEventListener('contextmenu', (e) => {
      showContextMenu(e, bookmark);
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
    
    // 更新右键菜单事件
    div.addEventListener('contextmenu', (e) => {
      showContextMenu(e, bookmark);
    });
  }
  
  // 添加拖拽事件监听器
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragenter', handleDragEnter);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);
  div.addEventListener('dragend', handleDragEnd);
  
  return div;
}

// 拖拽变量
let draggedItem = null;

// 处理拖拽开始
function handleDragStart(e) {
  // 如果是左键单击事件，我们忽略它，让正常的点击事件处理
  if (e.button === 0 && e.type === 'click') {
    return;
  }
  
  draggedItem = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
  
  // 添加拖拽样式
  setTimeout(() => {
    this.classList.add('dragging');
  }, 0);
}

// 处理拖拽经过
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // 允许放置
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

// 处理拖拽进入
function handleDragEnter(e) {
  this.classList.add('drag-over');
  
  // 如果目标是文件夹，添加特殊的文件夹拖拽样式
  if (this.classList.contains('folder')) {
    this.classList.add('folder-drop-target');
  }
}

// 处理拖拽离开
function handleDragLeave(e) {
  this.classList.remove('drag-over');
  this.classList.remove('folder-drop-target');
}

// 处理"返回上级"按钮的拖拽进入
function handleBackButtonDragEnter(e) {
  this.classList.add('drag-over');
  this.classList.add('back-button-drop-target');
}

// 处理"返回上级"按钮的拖拽离开
function handleBackButtonDragLeave(e) {
  this.classList.remove('drag-over');
  this.classList.remove('back-button-drop-target');
}

// 处理"返回上级"按钮的放置
function handleBackButtonDrop(e) {
  e.stopPropagation(); // 阻止事件冒泡
  e.preventDefault(); // 阻止默认行为
  
  if (draggedItem) {
    const draggedId = e.dataTransfer.getData('text/plain');
    const parentId = this.dataset.parentId; // 获取上级文件夹ID
    
    if (draggedId && parentId) {
      // 将书签移动到上级文件夹
      chrome.bookmarks.move(draggedId, {
        parentId: parentId,
        index: 0 // 放在文件夹的最前面
      }, () => {
        // 移动成功，显示提示信息
        showToast('已将书签移动到上级文件夹');
        
        // 重新加载当前文件夹的内容
        loadBookmarks(currentViewingFolderId);
      });
    }
  }
  
  // 移除所有拖拽相关的样式
  this.classList.remove('drag-over');
  this.classList.remove('back-button-drop-target');
  
  return false;
}

// 全局变量存储当前文件夹ID
let currentViewingFolderId = '1'; // 默认为根文件夹

// 处理放置
function handleDrop(e) {
  e.stopPropagation(); // 阻止浏览器默认行为
  
  if (draggedItem !== this) {
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = this.dataset.id;
    
    // 检查目标是否是文件夹
    const isTargetFolder = this.classList.contains('folder');
    
    if (isTargetFolder) {
      // 如果目标是文件夹，将拖拽项移动到该文件夹中
      chrome.bookmarks.move(draggedId, {
        parentId: targetId,
        index: 0 // 放在文件夹的最前面，也可以设为其他位置
      }, () => {
        // 移动成功，显示提示信息
        showToast(`已将书签移动到「${this.querySelector('.bookmark-title').textContent}」文件夹`);
        
        // 使用全局变量中保存的当前文件夹ID
        // 重新加载当前文件夹的内容
        loadBookmarks(currentViewingFolderId);
      });
    } else {
      // 如果目标不是文件夹，按原来的逻辑处理（重新排序）
      const parentId = this.dataset.parentId;
      let newIndex = parseInt(this.dataset.index);
      
      // 使用Chrome bookmarks API移动书签
      chrome.bookmarks.move(draggedId, {
        parentId: parentId,
        index: newIndex
      }, () => {
        // 重新加载书签以反映新顺序
        loadBookmarks(parentId);
      });
    }
  }
  
  return false;
}

// 处理拖拽结束
function handleDragEnd(e) {
  // 移除所有拖拽相关的样式
  const items = document.querySelectorAll('.bookmark-item');
  items.forEach(item => {
    item.classList.remove('dragging');
    item.classList.remove('drag-over');
    item.classList.remove('folder-drop-target');
  });
}

// 创建新文件夹对话框
function showCreateFolderDialog(parentId) {
  // 移除任何已存在的对话框
  const existingOverlay = document.querySelector('.dialog-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';

  // 创建对话框
  const dialog = document.createElement('div');
  dialog.className = 'edit-dialog';
  
  // 创建标题
  const title = document.createElement('h3');
  title.textContent = '创建新文件夹';
  title.style.margin = '0 0 15px 0';
  title.style.fontSize = '16px';
  dialog.appendChild(title);
  
  // 创建输入框
  const folderNameInput = document.createElement('input');
  folderNameInput.type = 'text';
  folderNameInput.placeholder = '文件夹名称';
  folderNameInput.className = 'edit-input';
  dialog.appendChild(folderNameInput);
  
  // 按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'dialog-buttons';
  
  // 创建按钮
  const createButton = document.createElement('button');
  createButton.textContent = '创建';
  createButton.className = 'dialog-button save-button';
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.className = 'dialog-button cancel-button';
  
  buttonContainer.appendChild(createButton);
  buttonContainer.appendChild(cancelButton);
  dialog.appendChild(buttonContainer);
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // 自动聚焦输入框
  setTimeout(() => folderNameInput.focus(), 100);
  
  // 处理创建按钮点击
  createButton.addEventListener('click', () => {
    const folderName = folderNameInput.value.trim();
    if (folderName) {
      // 使用 Chrome Bookmarks API 创建文件夹
      chrome.bookmarks.create({
        title: folderName,
        parentId: parentId
      }, (newFolder) => {
        // 创建成功，显示提示并刷新当前文件夹
        showToast(`已创建「${folderName}」文件夹`);
        loadBookmarks(parentId);
        overlay.remove();
      });
    } else {
      // 提示用户输入文件夹名称
      folderNameInput.classList.add('input-error');
      setTimeout(() => folderNameInput.classList.remove('input-error'), 500);
    }
  });
  
  // 处理取消按钮点击
  cancelButton.addEventListener('click', () => {
    overlay.remove();
  });
  
  // 点击遮罩层关闭对话框
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // 处理回车键确认
  folderNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      createButton.click();
    }
  });
}

// 创建添加文件夹按钮
function createAddFolderButton(parentId) {
  const button = document.createElement('div');
  button.className = 'bookmark-item add-folder-button';
  button.innerHTML = `
    <img class="bookmark-icon" src="images/add-folder-icon.svg" alt="add folder" onerror="this.src='images/folder-icon.png'">
    <p class="bookmark-title">新建文件夹</p>
  `;
  
  button.addEventListener('click', () => {
    showCreateFolderDialog(parentId);
  });
  
  return button;
}

// 加载书签
function loadBookmarks(folderId = '1') {
  // 更新当前查看的文件夹ID
  currentViewingFolderId = folderId;
  
  // 更新导航路径显示
  updateBreadcrumb(folderId);
  
  chrome.bookmarks.getChildren(folderId, (bookmarks) => {
    const container = document.getElementById('bookmarks-grid');
    container.innerHTML = '';
    
    if (folderId !== '1') {
      const backButton = document.createElement('div');
      backButton.className = 'bookmark-item back-button';
      backButton.innerHTML = `
        <img class="bookmark-icon" src="images/back-icon.png" alt="back">
        <p class="bookmark-title">返回上级</p>
      `;
      backButton.setAttribute('draggable', 'false'); // 不可拖拽，但可以接收拖拽
      backButton.dataset.id = folderId; // 设置当前文件夹ID
      
      // 保存父文件夹ID到数据属性，以便于拖拽处理
      chrome.bookmarks.get(folderId, (folder) => {
        const parentId = folder[0].parentId;
        backButton.dataset.parentId = parentId;
        
        // 点击事件 - 返回上级
        backButton.addEventListener('click', () => {
          loadBookmarks(parentId);
        });
      });
      
      // 添加拖拽相关事件
      backButton.addEventListener('dragover', handleDragOver);
      backButton.addEventListener('dragenter', handleBackButtonDragEnter);
      backButton.addEventListener('dragleave', handleBackButtonDragLeave);
      backButton.addEventListener('drop', handleBackButtonDrop);
      
      container.appendChild(backButton);
      
      // 添加新建文件夹按钮
      container.appendChild(createAddFolderButton(folderId));
    } else {
      // 在根目录也添加新建文件夹按钮
      container.appendChild(createAddFolderButton(folderId));
    }
    
    bookmarks.forEach(bookmark => {
      container.appendChild(createBookmarkElement(bookmark));
    });
  });
}

// 显示提示信息
function showToast(message) {
  // 移除任何已存在的提示
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // 创建新提示
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 提示显示动画
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // 3秒后自动隐藏
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// 创建设置面板界面
function createSettingsPanel() {
  // 移除现有的控制器
  const existingControl = document.getElementById('settings-panel');
  if (existingControl) {
    existingControl.remove();
  }
  
  // 创建折叠面板外层
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  settingsPanel.className = 'settings-panel collapsed';
  
  // 创建折叠头部
  const panelHeader = document.createElement('div');
  panelHeader.className = 'panel-header';
  
  // 创建标题
  const title = document.createElement('span');
  title.textContent = '设置';
  title.className = 'panel-title';
  
  // 添加设置图标
  const settingsIcon = document.createElement('span');
  settingsIcon.className = 'settings-icon';
  settingsIcon.innerHTML = '&#9881;'; // 齿轮图标
  
  panelHeader.appendChild(settingsIcon);
  panelHeader.appendChild(title);
  
  // 点击头部切换折叠状态
  panelHeader.addEventListener('click', () => {
    settingsPanel.classList.toggle('collapsed');
  });
  
  // 创建设置面板内容
  const settingsContent = document.createElement('div');
  settingsContent.className = 'settings-content';
  
  // 创建标签栏
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'settings-tabs';
  
  // 创建标签
  const filterTab = document.createElement('div');
  filterTab.className = 'settings-tab active';
  filterTab.dataset.tab = 'filter';
  filterTab.textContent = '背景滤镜';
  
  const generalTab = document.createElement('div');
  generalTab.className = 'settings-tab';
  generalTab.dataset.tab = 'general';
  generalTab.textContent = '常规设置';
  
  const aboutTab = document.createElement('div');
  aboutTab.className = 'settings-tab';
  aboutTab.dataset.tab = 'about';
  aboutTab.textContent = '关于';
  
  tabsContainer.appendChild(filterTab);
  tabsContainer.appendChild(generalTab);
  tabsContainer.appendChild(aboutTab);
  
  // 添加标签切换事件
  const tabs = [filterTab, generalTab, aboutTab];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有标签的活动状态
      tabs.forEach(t => t.classList.remove('active'));
      // 添加当前标签的活动状态
      tab.classList.add('active');
      
      // 切换对应的内容区域
      const tabContents = settingsContent.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === tab.dataset.tab) {
          content.classList.add('active');
        }
      });
    });
  });
  
  // 创建标签内容容器
  
  // 1. 滤镜设置标签内容
  const filterContent = document.createElement('div');
  filterContent.className = 'tab-content active';
  filterContent.dataset.tab = 'filter';
  
  // 创建滤镜控制内容 - 复用现有的滤镜控制逻辑
  const filterControls = createFilterControls();
  filterContent.appendChild(filterControls);
  
  // 2. 常规设置标签内容
  const generalContent = document.createElement('div');
  generalContent.className = 'tab-content';
  generalContent.dataset.tab = 'general';
  generalContent.innerHTML = `
    <div class="filter-control">
      <label>布局设置</label>
      <div class="slider-container">
        <select class="settings-select" id="layout-select">
          <option value="normal">标准布局</option>
          <option value="compact">紧凑布局</option>
          <option value="comfortable">宽松布局</option>
        </select>
      </div>
    </div>
    <div class="filter-control">
      <label>最近访问显示项目数</label>
      <div class="slider-container">
        <input type="range" min="6" max="30" step="1" value="12" id="recent-count-slider">
        <span class="slider-value" id="recent-count-value">12</span>
      </div>
    </div>
  `;
  
  // 3. 关于标签内容
  const aboutContent = document.createElement('div');
  aboutContent.className = 'tab-content';
  aboutContent.dataset.tab = 'about';
  aboutContent.innerHTML = `
    <div style="text-align: center; padding: 10px 0;">
      <h3 style="margin-top: 0;">书签管理器</h3>
      <p>版本: 1.0.0</p>
      <p>一个简洁、美观的Edge书签管理扩展</p>
      <div class="sponsor-section">
        <h4 style="margin-top: 15px; margin-bottom: 10px;">赞助商</h4>
        <img src="images/zanzhu.jpg" alt="赞助图片" class="sponsor-image">
      </div>
    </div>
  `;
  
  // 添加所有标签内容到设置内容区域
  settingsContent.appendChild(tabsContainer);
  settingsContent.appendChild(filterContent);
  settingsContent.appendChild(generalContent);
  settingsContent.appendChild(aboutContent);
  
  // 构建最终面板
  settingsPanel.appendChild(panelHeader);
  settingsPanel.appendChild(settingsContent);
  
  // 添加到页面
  document.body.appendChild(settingsPanel);
  
  // 初始化布局选择器
  setTimeout(() => {
    initLayoutSelector();
    initRecentCountSlider();
  }, 500);
  
  return settingsPanel;
}

// 初始化布局选择器
function initLayoutSelector() {
  const layoutSelect = document.getElementById('layout-select');
  if (!layoutSelect) return;
  
  // 读取存储的布局设置
  const storedLayout = localStorage.getItem('bookmark_layout_setting');
  if (storedLayout) {
    layoutSelect.value = storedLayout;
    applyLayoutSetting(storedLayout);
  }
  
  // 监听选择变化
  layoutSelect.addEventListener('change', () => {
    const selectedLayout = layoutSelect.value;
    applyLayoutSetting(selectedLayout);
    saveLayoutSetting(selectedLayout);
  });
}

// 应用布局设置
function applyLayoutSetting(layout) {
  // 先移除所有布局类
  document.body.classList.remove('normal-layout', 'compact-layout', 'comfortable-layout');
  
  // 添加选中的布局类
  if (layout !== 'normal') {
    document.body.classList.add(`${layout}-layout`);
  }
  
  // 显示通知
  showToast(`已切换到${layout === 'normal' ? '标准' : (layout === 'compact' ? '紧凑' : '宽松')}布局`);
}

// 保存布局设置
function saveLayoutSetting(layout) {
  localStorage.setItem('bookmark_layout_setting', layout);
}

// 初始化最近访问数量滑块
function initRecentCountSlider() {
  const recentCountSlider = document.getElementById('recent-count-slider');
  const recentCountValue = document.getElementById('recent-count-value');
  
  if (!recentCountSlider || !recentCountValue) return;
  
  // 读取存储的值
  const storedCount = localStorage.getItem('bookmark_recent_count');
  if (storedCount) {
    recentCountSlider.value = storedCount;
    recentCountValue.textContent = storedCount;
  } else {
    // 设置默认值为12
    localStorage.setItem('bookmark_recent_count', '12');
  }
  
  // 监听滑块变化
  recentCountSlider.addEventListener('input', () => {
    const count = recentCountSlider.value;
    recentCountValue.textContent = count;
    localStorage.setItem('bookmark_recent_count', count);
    
    // 更新显示
    displayRecentBookmarks();
    
    // 显示通知
    showToast(`已设置最近访问显示项目数为 ${count}`);
  });
}



// 创建滤镜控制界面 - 作为设置面板的一个标签页
function createFilterControls() {
  // 创建控制面板内容
  const controlContent = document.createElement('div');
  controlContent.className = 'filter-controls';
  
  // 亮度滤镜
  createSlider(controlContent, '亮度', 'brightness', 0.5, 2, 1.05, 0.05, (value) => {
    updateFilter('brightness', value);
  });
  
  // 对比度滤镜
  createSlider(controlContent, '对比度', 'contrast', 0.5, 2, 1.1, 0.05, (value) => {
    updateFilter('contrast', value);
  });
  
  // 饱和度滤镜
  createSlider(controlContent, '饱和度', 'saturate', 0, 2, 1.2, 0.05, (value) => {
    updateFilter('saturate', value);
  });
  
  // 模糊滤镜
  createSlider(controlContent, '模糊', 'blur', 0, 10, 0, 0.5, (value) => {
    updateFilter('blur', value, 'px');
  });
  
  // 色调滤镜
  createSlider(controlContent, '色调旋转', 'hue-rotate', 0, 360, 0, 10, (value) => {
    updateFilter('hue-rotate', value, 'deg');
  });
  
  // 色彩选择器 - 颜色叠加
  const colorDiv = document.createElement('div');
  colorDiv.className = 'filter-control';
  
  const colorLabel = document.createElement('label');
  colorLabel.textContent = '颜色叠加';
  
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = '#ffffff';
  colorInput.addEventListener('input', () => {
    updateColorFilter(colorInput.value, colorOpacitySlider.value);
  });
  
  // 颜色透明度
  const colorOpacityDiv = document.createElement('div');
  colorOpacityDiv.className = 'slider-container';
  
  const colorOpacitySlider = document.createElement('input');
  colorOpacitySlider.type = 'range';
  colorOpacitySlider.min = '0';
  colorOpacitySlider.max = '1';
  colorOpacitySlider.step = '0.05';
  colorOpacitySlider.value = '0';
  colorOpacitySlider.addEventListener('input', () => {
    updateColorFilter(colorInput.value, colorOpacitySlider.value);
  });
  
  const colorOpacityValue = document.createElement('span');
  colorOpacityValue.className = 'slider-value';
  colorOpacityValue.textContent = '0';
  
  colorOpacityDiv.appendChild(colorOpacitySlider);
  colorOpacityDiv.appendChild(colorOpacityValue);
  
  colorDiv.appendChild(colorLabel);
  colorDiv.appendChild(colorInput);
  colorDiv.appendChild(colorOpacityDiv);
  
  controlContent.appendChild(colorDiv);
  
  // 重置按钮
  const resetButton = document.createElement('button');
  resetButton.textContent = '重置滤镜';
  resetButton.className = 'reset-button';
  resetButton.addEventListener('click', resetFilters);
  controlContent.appendChild(resetButton);
  
  return controlContent;
}

// 创建滤镜滑块
function createSlider(container, labelText, filterId, min, max, defaultValue, step, onChange) {
  const div = document.createElement('div');
  div.className = 'filter-control';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = defaultValue;
  slider.setAttribute('data-filter', filterId);
  slider.setAttribute('data-default', defaultValue);
  
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value';
  valueDisplay.textContent = defaultValue;
  
  slider.addEventListener('input', () => {
    valueDisplay.textContent = slider.value;
    onChange(slider.value);
  });
  
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(valueDisplay);
  
  div.appendChild(label);
  div.appendChild(sliderContainer);
  
  container.appendChild(div);
}

// 更新滤镜值
function updateFilter(type, value, unit = '') {
  const filters = getCurrentFilters();
  filters[type] = `${value}${unit}`;
  
  // 应用滤镜
  applyFilters(filters);
  
  // 存储滤镜设置
  saveFiltersToStorage();
}

// 更新颜色叠加滤镜
function updateColorFilter(color, opacity) {
  const filters = getCurrentFilters();
  
  // 更新颜色设置
  if (opacity > 0) {
    document.documentElement.style.setProperty('--overlay-color', color);
    document.documentElement.style.setProperty('--overlay-opacity', opacity);
    document.body.classList.add('color-overlay');
  } else {
    document.body.classList.remove('color-overlay');
  }
  
  // 应用滤镜
  applyFilters(filters);
  
  // 存储颜色叠加设置
  saveColorSettings(color, opacity);
}

// 获取当前所有滤镜设置
function getCurrentFilters() {
  const filters = {};
  document.querySelectorAll('#settings-panel input[type="range"][data-filter]').forEach(slider => {
    const type = slider.getAttribute('data-filter');
    const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
    filters[type] = `${slider.value}${unit}`;
  });
  return filters;
}

// 应用滤镜设置
function applyFilters(filters) {
  let filterString = '';
  for (const [type, value] of Object.entries(filters)) {
    filterString += `${type}(${value}) `;
  }
  document.documentElement.style.setProperty('--background-filter', filterString);
}

// 重置所有滤镜
function resetFilters() {
  document.querySelectorAll('#settings-panel input[type="range"][data-filter]').forEach(slider => {
    const defaultValue = slider.getAttribute('data-default');
    slider.value = defaultValue;
    
    // 更新显示的数值
    const valueDisplay = slider.nextElementSibling;
    if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
      valueDisplay.textContent = defaultValue;
    }
    
    // 更新滤镜
    const type = slider.getAttribute('data-filter');
    const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
    updateFilter(type, defaultValue, unit);
  });
  
  // 重置颜色叠加
  const colorOpacitySlider = document.querySelector('#settings-panel input[type="range"][min="0"][max="1"]');
  if (colorOpacitySlider) {
    colorOpacitySlider.value = 0;
    const valueDisplay = colorOpacitySlider.nextElementSibling;
    if (valueDisplay) {
      valueDisplay.textContent = '0';
    }
  }
  document.body.classList.remove('color-overlay');
  
  // 清除 localStorage 中的滤镜设置
  clearStoredFilters();
}

// 存储滤镜设置到 localStorage
function saveFiltersToStorage() {
  try {
    const filters = {};
    document.querySelectorAll('#settings-panel input[type="range"][data-filter]').forEach(slider => {
      const type = slider.getAttribute('data-filter');
      filters[type] = slider.value;
    });
    
    localStorage.setItem('bookmark_filter_settings', JSON.stringify(filters));
    console.log('滤镜设置已保存到 localStorage');
  } catch (error) {
    console.error('存储滤镜设置时出错:', error);
  }
}

// 存储颜色叠加设置到 localStorage
function saveColorSettings(color, opacity) {
  try {
    const colorSettings = {
      color: color,
      opacity: opacity
    };
    
    localStorage.setItem('bookmark_color_settings', JSON.stringify(colorSettings));
    console.log('颜色叠加设置已保存到 localStorage');
  } catch (error) {
    console.error('存储颜色叠加设置时出错:', error);
  }
}

// 清除存储的滤镜设置
function clearStoredFilters() {
  try {
    localStorage.removeItem('bookmark_filter_settings');
    localStorage.removeItem('bookmark_color_settings');
    console.log('已清除所有存储的滤镜设置');
  } catch (error) {
    console.error('清除滤镜设置时出错:', error);
  }
}

// 从 localStorage 异步加载滤镜设置
async function loadFilterSettingsAsync() {
  console.log('正在加载滤镜设置...');
  
  // 先获取存储的滤镜设置
  let filterConfig = {
    filters: null,
    colorSettings: null
  };
  
  try {
    // 加载滤镜设置
    const storedFilters = localStorage.getItem('bookmark_filter_settings');
    filterConfig.filters = storedFilters ? JSON.parse(storedFilters) : DEFAULT_FILTER_SETTINGS;
    
    // 加载颜色叠加设置
    const storedColorSettings = localStorage.getItem('bookmark_color_settings');
    filterConfig.colorSettings = storedColorSettings ? JSON.parse(storedColorSettings) : DEFAULT_COLOR_SETTINGS;
    
    console.log('滤镜设置数据加载成功:', filterConfig);
    
    // 在DOM上设置滤镜默认效果
    let filterString = '';
    Object.entries(filterConfig.filters).forEach(([type, value]) => {
      const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
      filterString += `${type}(${value}${unit}) `;
    });
    document.documentElement.style.setProperty('--background-filter', filterString);
    
    // 如果有颜色设置，应用颜色叠加
    if (parseFloat(filterConfig.colorSettings.opacity) > 0) {
      document.documentElement.style.setProperty('--overlay-color', filterConfig.colorSettings.color);
      document.documentElement.style.setProperty('--overlay-opacity', filterConfig.colorSettings.opacity);
      document.body.classList.add('color-overlay');
    }
    
    return filterConfig;
  } catch (error) {
    console.error('加载滤镜设置数据时出错:', error);
    return {
      filters: DEFAULT_FILTER_SETTINGS,
      colorSettings: DEFAULT_COLOR_SETTINGS
    };
  }
}

// 将滤镜设置应用到DOM元素
function applyFilterSettingsToDOM(filterConfig) {
  try {
    console.log('开始将滤镜设置应用到DOM:', filterConfig);
    
    if (!filterConfig || !filterConfig.filters) {
      console.warn('滤镜配置为空，使用默认设置');
      filterConfig = {
        filters: DEFAULT_FILTER_SETTINGS,
        colorSettings: DEFAULT_COLOR_SETTINGS
      };
    }
    
    // 应用滤镜设置到滤镜控件
    Object.entries(filterConfig.filters).forEach(([type, value]) => {
      const slider = document.querySelector(`#settings-panel input[type="range"][data-filter="${type}"]`);
      if (slider) {
        slider.value = value;
        
        // 更新显示的数值
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
          valueDisplay.textContent = value;
        }
      } else {
        console.warn(`无法找到滤镜控件: ${type}`);
      }
    });
    
    // 应用滤镜到页面背景
    let filterString = '';
    Object.entries(filterConfig.filters).forEach(([type, value]) => {
      const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
      filterString += `${type}(${value}${unit}) `;
    });
    document.documentElement.style.setProperty('--background-filter', filterString);
    
    // 设置颜色选择器
    const colorInput = document.querySelector('#settings-panel input[type="color"]');
    if (colorInput && filterConfig.colorSettings) {
      colorInput.value = filterConfig.colorSettings.color;
    }
    
    // 设置不透明度
    const opacitySlider = document.querySelector('#settings-panel input[type="range"][min="0"][max="1"]');
    if (opacitySlider && filterConfig.colorSettings) {
      opacitySlider.value = filterConfig.colorSettings.opacity;
      
      // 更新显示的数值
      const valueDisplay = opacitySlider.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = filterConfig.colorSettings.opacity;
      }
    }
    
    // 应用颜色叠加
    if (filterConfig.colorSettings && parseFloat(filterConfig.colorSettings.opacity) > 0) {
      document.documentElement.style.setProperty('--overlay-color', filterConfig.colorSettings.color);
      document.documentElement.style.setProperty('--overlay-opacity', filterConfig.colorSettings.opacity);
      document.body.classList.add('color-overlay');
    }
    
    console.log('滤镜设置已成功应用到DOM');
  } catch (error) {
    console.error('应用滤镜设置到DOM时出错:', error);
  }
}

// 兼容原有函数调用
function loadFilterSettings() {
  console.log('使用同步方式加载滤镜设置...');
  
  try {
    // 先创建设置面板
    createSettingsPanel();
    
    // 加载滤镜设置
    const storedFilters = localStorage.getItem('bookmark_filter_settings');
    const filters = storedFilters ? JSON.parse(storedFilters) : DEFAULT_FILTER_SETTINGS;
    
    // 应用滤镜设置
    Object.entries(filters).forEach(([type, value]) => {
      const slider = document.querySelector(`#settings-panel input[type="range"][data-filter="${type}"]`);
      if (slider) {
        slider.value = value;
        
        // 更新显示的数值
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
          valueDisplay.textContent = value;
        }
        
        // 更新滤镜显示
        const unit = type === 'blur' ? 'px' : (type === 'hue-rotate' ? 'deg' : '');
        const filter = `${value}${unit}`;
        document.documentElement.style.setProperty(`--${type}`, filter);
      }
    });
    
    // 应用滤镜
    applyFilters(filters);
    
    // 加载颜色叠加设置
    const storedColorSettings = localStorage.getItem('bookmark_color_settings');
    if (storedColorSettings) {
      const colorSettings = JSON.parse(storedColorSettings);
      
      // 设置颜色选择器
      const colorInput = document.querySelector('#settings-panel input[type="color"]');
      if (colorInput) {
        colorInput.value = colorSettings.color;
      }
      
      // 设置不透明度
      const opacitySlider = document.querySelector('#settings-panel input[type="range"][min="0"][max="1"]');
      if (opacitySlider) {
        opacitySlider.value = colorSettings.opacity;
        
        // 更新显示的数值
        const valueDisplay = opacitySlider.nextElementSibling;
        if (valueDisplay) {
          valueDisplay.textContent = colorSettings.opacity;
        }
      }
      
      // 应用颜色叠加
      if (parseFloat(colorSettings.opacity) > 0) {
        document.documentElement.style.setProperty('--overlay-color', colorSettings.color);
        document.documentElement.style.setProperty('--overlay-opacity', colorSettings.opacity);
        document.body.classList.add('color-overlay');
      }
    }
    
    console.log('滤镜设置加载完成');
  } catch (error) {
    console.error('加载滤镜设置时出错:', error);
    
    // 出错时使用默认设置
    createSettingsPanel();
  }
}

// 初始化

// 主前台页面初始化
function initUI() {
  // 初始化搜索功能
  initSearchFeature();
  
  // 初始化最近访问区域
  displayRecentBookmarks();
  
  // 应用保存的布局设置
  applyInitialLayoutSetting();
  
  // 确保最近访问数量有默认值
  if (!localStorage.getItem('bookmark_recent_count')) {
    localStorage.setItem('bookmark_recent_count', '12');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('页面加载完成，开始初始化组件');
  
  // 初始化用户界面
  initUI();
  
  // 先加载滤镜设置，然后初始化其他组件
  loadFilterSettingsAsync().then((filterConfig) => {
    console.log('滤镜配置加载完成:', filterConfig);
    setBingDailyBackground();
    loadBookmarks();
  }).catch(error => {
    console.error('加载滤镜配置出错:', error);
    // 出错时仍然初始化页面
    setBingDailyBackground();
    loadBookmarks();
  });
});

// 应用初始布局设置
function applyInitialLayoutSetting() {
  const storedLayout = localStorage.getItem('bookmark_layout_setting');
  if (storedLayout && storedLayout !== 'normal') {
    document.body.classList.add(`${storedLayout}-layout`);
  }
}

// 初始化搜索功能
function initSearchFeature() {
  const searchInput = document.getElementById('bookmark-search');
  const searchResults = document.getElementById('search-results');
  
  // 添加输入事件
  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length >= 2) {
      // 至少2个字符才开始搜索
      searchBookmarks(query);
    } else {
      hideSearchResults();
    }
  });
  
  // 外部点击事件隐藏搜索结果
  document.addEventListener('click', function(e) {
    // 如果点击的不是搜索框和搜索结果区域，隐藏搜索结果
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideSearchResults();
    }
  });
  
  // ESC键隐藏搜索结果
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideSearchResults();
    }
  });
  
  // 输入框聚焦时，如果有内容，显示搜索结果
  searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) {
      searchBookmarks(this.value.trim());
    }
  });
}