// store.jsx — mutable bookmark store with subscribe + localStorage. Exposed as window.BMStore.
(function () {
  const { TREE, INDEX, isFolder, nid } = window.BMData;

  const LS = {
    visit: 'bookmark_visit_history',
    recentCount: 'bookmark_recent_count',
    filter: 'bookmark_filter_settings',
    color: 'bookmark_color_settings',
    layout: 'bookmark_layout_setting',
    theme: 'bookmark_theme_setting',
    wallpaper: 'bookmark_wallpaper_idx',
  };
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  function reindex() {
    for (const k in INDEX) delete INDEX[k];
    (function idx(n, parent) { n.parentId = parent ? parent.id : null; INDEX[n.id] = n; (n.children || []).forEach((c) => idx(c, n)); })(TREE, null);
  }

  const Store = {
    LS, read, write,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    node: (id) => INDEX[id],
    children: (id) => (INDEX[id] && INDEX[id].children) || [],
    breadcrumb(id) {
      const path = []; let n = INDEX[id];
      while (n && n.id !== '0') { path.unshift(n); n = INDEX[n.parentId]; }
      return path; // [书签栏, ...]
    },

    addBookmark(parentId, title, url, tags) {
      const p = INDEX[parentId]; if (!p) return null;
      const node = { id: nid(), title: title || url, url, tags: tags || [], parentId };
      p.children.unshift(node); reindex(); emit(); return node;
    },
    addFolder(parentId, title) {
      const p = INDEX[parentId]; if (!p) return null;
      const node = { id: nid(), title, children: [], parentId };
      p.children.push(node); reindex(); emit(); return node;
    },
    update(id, fields) {
      const n = INDEX[id]; if (!n) return; Object.assign(n, fields); emit();
    },
    remove(id) {
      const n = INDEX[id]; if (!n) return; const p = INDEX[n.parentId]; if (!p) return;
      p.children = p.children.filter((c) => c.id !== id); reindex(); emit();
    },
    removeMany(ids) {
      ids.forEach((id) => { const n = INDEX[id]; if (!n) return; const p = INDEX[n.parentId]; if (p) p.children = p.children.filter((c) => c.id !== id); });
      reindex(); emit();
    },
    // move node into folder (prepend) or to a sibling index
    move(id, targetParentId, index) {
      const n = INDEX[id]; if (!n) return; const op = INDEX[n.parentId]; const np = INDEX[targetParentId];
      if (!op || !np) return;
      if (id === targetParentId) return;
      // prevent moving folder into its own descendant
      let cur = np; while (cur) { if (cur.id === id) return; cur = INDEX[cur.parentId]; }
      op.children = op.children.filter((c) => c.id !== id);
      if (index == null) np.children.unshift(n); else np.children.splice(index, 0, n);
      reindex(); emit();
    },
    moveMany(ids, targetParentId) {
      ids.forEach((id) => Store.move(id, targetParentId, null));
    },
    reorder(id, beforeId) {
      const n = INDEX[id]; const before = INDEX[beforeId];
      if (!n || !before || n.parentId !== before.parentId) return;
      const p = INDEX[n.parentId];
      p.children = p.children.filter((c) => c.id !== id);
      const i = p.children.findIndex((c) => c.id === beforeId);
      p.children.splice(i, 0, n); reindex(); emit();
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
      })(TREE);
      return out.slice(0, 10);
    },
    pathString(id) {
      return Store.breadcrumb(id).slice(0, -1).map((n) => n.title).join(' › ') || '书签栏';
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

    // ---- all tags ----
    allTags() {
      const set = new Set();
      Object.values(INDEX).forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
      return [...set].sort();
    },

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
      function clean(n) { const o = { title: n.title }; if (n.url) o.url = n.url; if (n.tags && n.tags.length) o.tags = n.tags; if (n.children) o.children = n.children.map(clean); return o; }
      return JSON.stringify(clean(INDEX['1']).children, null, 2);
    },
    importJSON(text, parentId) {
      let data; try { data = JSON.parse(text); } catch (e) { return false; }
      if (!Array.isArray(data)) data = [data];
      const p = INDEX[parentId] || INDEX['1'];
      function build(o, parent) {
        const node = o.children ? { id: nid(), title: o.title || '文件夹', children: [], parentId: parent.id }
                                 : { id: nid(), title: o.title || o.url, url: o.url, tags: o.tags || [], parentId: parent.id };
        parent.children.push(node);
        if (o.children) o.children.forEach((c) => build(c, node));
      }
      data.forEach((o) => build(o, p));
      reindex(); emit(); return true;
    },
  };

  // React hook
  window.useStore = function useStore() {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => Store.subscribe(force), []);
    return Store;
  };
  window.BMStore = Store;
})();
