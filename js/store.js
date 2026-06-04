// store.js — bookmark store backed by chrome.bookmarks API.
// Tags are stored in localStorage since chrome doesn't natively support them.
(function () {
  const { isFolder } = window.BMData;
  const INDEX = window.BMData.INDEX; // shared reference

  const LS = {
    visit: 'bookmark_visit_history',
    recentCount: 'bookmark_recent_count',
    filter: 'bookmark_filter_settings',
    color: 'bookmark_color_settings',
    layout: 'bookmark_layout_setting',
    theme: 'bookmark_theme_setting',
    wallpaper: 'bookmark_wallpaper_idx',
    tags: 'bookmark_tags_map',
  };
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  function buildIndex(node, parent) {
    node.parentId = parent ? parent.id : null;
    if (!node.children) {
      // attach tags from localStorage to bookmark nodes
      node.tags = (read(LS.tags, {}))[node.id] || [];
    }
    INDEX[node.id] = node;
    (node.children || []).forEach((c) => buildIndex(c, node));
  }

  async function reload() {
    const tree = await chrome.bookmarks.getTree();
    // clear index
    for (const k in INDEX) delete INDEX[k];
    buildIndex(tree[0], null);
    emit();
  }

  // sync with external bookmark changes (e.g., from browser bookmark manager)
  ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered'].forEach((ev) => {
    if (chrome.bookmarks[ev]) chrome.bookmarks[ev].addListener(() => reload());
  });

  const Store = {
    LS, read, write,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    node: (id) => INDEX[id],
    children: (id) => (INDEX[id] && INDEX[id].children) || [],
    breadcrumb(id) {
      const path = []; let n = INDEX[id];
      while (n && n.id !== '0') { path.unshift(n); n = INDEX[n.parentId]; }
      return path;
    },
    pathString(id) {
      return Store.breadcrumb(id).slice(0, -1).map((n) => n.title).join(' › ') || '书签栏';
    },

    search(q) {
      q = (q || '').trim().toLowerCase(); if (q.length < 2) return [];
      const out = [];
      (function walk(n) {
        if (n.id !== '0' && n.id !== '1') {
          const hay = ((n.title || '') + ' ' + (n.url || '') + ' ' + (n.tags || []).join(' ')).toLowerCase();
          if (hay.includes(q)) out.push(n);
        }
        (n.children || []).forEach(walk);
      })(INDEX['1'] || INDEX['0'] || Object.values(INDEX)[0] || {});
      return out.slice(0, 10);
    },

    // ---- write ops (async) ----
    async addBookmark(parentId, title, url, tags) {
      const node = await chrome.bookmarks.create({ parentId, title: title || url, url });
      if (tags && tags.length) {
        const map = read(LS.tags, {}); map[node.id] = tags; write(LS.tags, map);
      }
      await reload();
    },
    async addFolder(parentId, title) {
      await chrome.bookmarks.create({ parentId, title });
      await reload();
    },
    async update(id, fields) {
      const updates = {};
      if (fields.title !== undefined) updates.title = fields.title;
      if (fields.url !== undefined) updates.url = fields.url;
      if (Object.keys(updates).length) await chrome.bookmarks.update(id, updates);
      if (fields.tags !== undefined) {
        const map = read(LS.tags, {}); map[id] = fields.tags; write(LS.tags, map);
      }
      await reload();
    },
    async remove(id) {
      const n = INDEX[id]; if (!n) return;
      if (isFolder(n)) await chrome.bookmarks.removeTree(id);
      else await chrome.bookmarks.remove(id);
      // remove tags for deleted node(s)
      const map = read(LS.tags, {});
      (function clean(node) { delete map[node.id]; (node.children || []).forEach(clean); })(n);
      write(LS.tags, map);
      await reload();
    },
    async removeMany(ids) {
      const map = read(LS.tags, {});
      for (const id of ids) {
        const n = INDEX[id]; if (!n) continue;
        try {
          if (isFolder(n)) await chrome.bookmarks.removeTree(id);
          else await chrome.bookmarks.remove(id);
          (function clean(node) { delete map[node.id]; (node.children || []).forEach(clean); })(n);
        } catch (e) {}
      }
      write(LS.tags, map);
      await reload();
    },
    async move(id, targetParentId, index) {
      if (id === targetParentId) return;
      // prevent moving into own descendant
      let cur = INDEX[targetParentId];
      while (cur) { if (cur.id === id) return; cur = INDEX[cur.parentId]; }
      const info = { parentId: targetParentId };
      if (index != null) info.index = index;
      await chrome.bookmarks.move(id, info);
      await reload();
    },
    async moveMany(ids, targetParentId) {
      for (const id of ids) {
        try { await chrome.bookmarks.move(id, { parentId: targetParentId }); } catch (e) {}
      }
      await reload();
    },
    async reorder(id, beforeId) {
      const n = INDEX[id]; const before = INDEX[beforeId];
      if (!n || !before || n.parentId !== before.parentId) return;
      const siblings = INDEX[n.parentId].children || [];
      const beforeIdx = siblings.findIndex((c) => c.id === beforeId);
      if (beforeIdx === -1) return;
      await chrome.bookmarks.move(id, { parentId: n.parentId, index: beforeIdx });
      await reload();
    },

    // ---- tags ----
    allTags() {
      const map = read(LS.tags, {});
      const set = new Set();
      Object.values(map).forEach((tags) => (tags || []).forEach((t) => set.add(t)));
      return [...set].sort();
    },

    // ---- visit history ----
    recordVisit(id) {
      const cap = Store.recentCount() * 2;
      let h = read(LS.visit, []).filter((x) => x !== id);
      h.unshift(id); h = h.slice(0, cap); write(LS.visit, h); emit();
    },
    recents() {
      const n = Store.recentCount();
      return read(LS.visit, []).map((id) => INDEX[id]).filter(Boolean).slice(0, n);
    },
    recentCount: () => read(LS.recentCount, 12),
    setRecentCount: (v) => { write(LS.recentCount, v); emit(); },

    // ---- settings ----
    filter: () => read(LS.filter, { brightness: 1.05, contrast: 1.1, saturate: 1.2, blur: 0, hue: 0 }),
    setFilter: (v) => { write(LS.filter, v); emit(); },
    color: () => read(LS.color, { color: '#ffffff', alpha: 0 }),
    setColor: (v) => { write(LS.color, v); emit(); },
    layout: () => read(LS.layout, 'normal'),
    setLayout: (v) => { write(LS.layout, v); emit(); },
    theme: () => read(LS.theme, 'glass'),
    setTheme: (v) => { write(LS.theme, v); emit(); },
    accent: () => read('bookmark_accent', '#6366f1'),
    setAccent: (v) => { write('bookmark_accent', v); emit(); },
    setMisc: (k, v) => { write(k, v); emit(); },
    wallpaper: () => read(LS.wallpaper, 0),
    setWallpaper: (v) => { write(LS.wallpaper, v); emit(); },

    // ---- import / export ----
    exportJSON() {
      function clean(n) {
        const o = { title: n.title };
        if (n.url) o.url = n.url;
        const tags = (n.tags || []);
        if (tags.length) o.tags = tags;
        if (n.children) o.children = n.children.map(clean);
        return o;
      }
      const root = INDEX['1'];
      return JSON.stringify(root ? root.children.map(clean) : [], null, 2);
    },
    async importJSON(text, parentId) {
      let data; try { data = JSON.parse(text); } catch (e) { return false; }
      if (!Array.isArray(data)) data = [data];
      const targetId = parentId || '1';
      const map = read(LS.tags, {});
      async function build(o, pid) {
        if (o.children !== undefined) {
          const folder = await chrome.bookmarks.create({ parentId: pid, title: o.title || '文件夹' });
          for (const c of (o.children || [])) await build(c, folder.id);
        } else {
          const bm = await chrome.bookmarks.create({ parentId: pid, title: o.title || o.url, url: o.url });
          if (o.tags && o.tags.length) map[bm.id] = o.tags;
        }
      }
      for (const o of data) await build(o, targetId);
      write(LS.tags, map);
      await reload();
      return true;
    },

    init: reload,
  };

  // React hook — subscribes to store changes
  window.useStore = function useStore() {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => Store.subscribe(force), []);
    return Store;
  };
  window.BMStore = Store;
})();
