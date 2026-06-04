// app.js — main orchestrator. window.App
import React from 'react';
  const { isFolder, hostOf, INDEX } = window.BMData;

  function useClock() {
    const [now, setNow] = React.useState(new Date());
    React.useEffect(() => {
      const t = setInterval(() => setNow(new Date()), 1000 * 20);
      return () => clearInterval(t);
    }, []);
    return now;
  }
  function greeting(h) {
    if (h < 5) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 13) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  // ---------- Search ----------
  function Search({ store, onOpenBookmark, onEnterFolder }) {
    const [q, setQ] = React.useState('');
    const [active, setActive] = React.useState(-1);
    const [show, setShow] = React.useState(false);
    const results = React.useMemo(() => store.search(q), [q, store]);
    const wrapRef = React.useRef();
    React.useEffect(() => {
      const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false); };
      window.addEventListener('mousedown', h);
      return () => window.removeEventListener('mousedown', h);
    }, []);
    const pick = (n) => {
      if (isFolder(n)) onEnterFolder(n); else onOpenBookmark(n);
      setQ(''); setShow(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setQ(''); setShow(false); e.target.blur(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(results.length - 1, i + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
      else if (e.key === 'Enter' && results[active]) pick(results[active]);
    };
    const open = show && q.trim().length >= 2;
    return (
      <div className="searchwrap" ref={wrapRef}>
        <div className="search glass">
          <span className="ic"><window.Icon name="search" size={20} /></span>
          <input value={q} placeholder="搜索书签与文件夹…"
            onChange={(e) => { setQ(e.target.value); setShow(true); setActive(0); }}
            onFocus={() => setShow(true)} onKeyDown={onKey} />
          {results.length > 0 && <span className="kbd">{results.length}</span>}
        </div>
        {open && (
          <div className="results glass">
            {results.length === 0
              ? <div className="res-empty">没有找到匹配的书签</div>
              : results.map((n, i) => (
                <div key={n.id} className={'res-item' + (i === active ? ' active' : '')}
                  onMouseEnter={() => setActive(i)} onClick={() => pick(n)}>
                  <window.Favicon node={n} size={34} />
                  <div className="res-meta">
                    <div className={'res-title' + (isFolder(n) ? ' folder' : '')}>{n.title}</div>
                    <div className="res-path">
                      {isFolder(n) ? '文件夹' : hostOf(n.url || '')} · {store.pathString(n.id)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- Recents ----------
  function Recents({ store, onOpen }) {
    const items = store.recents();
    return (
      <div className="recents">
        <div className="rec-head">常用网站</div>
        {items.length === 0
          ? <div className="rec-empty">暂无访问记录 · 打开书签后这里会出现你的常用站点</div>
          : <div className="rec-row">
            {items.map((n) => (
              <div key={n.id} className="rec-item" onClick={() => onOpen(n)}>
                <window.Favicon node={n} size={42} />
                <div className="lbl">{n.title}</div>
              </div>
            ))}
          </div>}
      </div>
    );
  }

  // ---------- App ----------
  window.App = function App() {
    const store = window.useStore();
    const now = useClock();
    const [ready, setReady] = React.useState(false);
    const [currentId, setCurrentId] = React.useState(null);
    const [activeTag, setActiveTag] = React.useState(null);
    const [selectMode, setSelectMode] = React.useState(false);
    const [selected, setSelected] = React.useState([]);
    const [dialog, setDialog] = React.useState(null);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [pop, setPop] = React.useState(null);

    React.useEffect(() => {
      store.init().then(() => { setCurrentId(store.rootId()); setReady(true); });
    }, []);

    const theme = store.theme(), density = store.layout(), accent = store.accent();
    const wp = store.wallpaper(), f = store.filter(), col = store.color();
    const radius = store.read('bookmark_radius', 18);
    const gblur = store.read('bookmark_glassblur', null);

    // Apply CSS variables
    React.useEffect(() => {
      const el = document.documentElement;
      el.dataset.theme = theme;
      el.dataset.density = density;
      el.dataset.select = selectMode ? 'on' : 'off';
      el.style.setProperty('--accent', accent);
      el.style.setProperty('--r-card', radius + 'px');
      if (gblur != null && theme !== 'light') el.style.setProperty('--panel-blur', gblur + 'px');
      else el.style.removeProperty('--panel-blur');
    }, [theme, density, accent, selectMode, radius, gblur]);

    // Apply wallpaper + filter
    React.useEffect(() => {
      const wall = document.getElementById('wall');
      const hexA = (hex, a) => {
        const h = hex.replace('#', '');
        const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
      };
      const flat = (c) => `linear-gradient(0deg, ${c}, ${c})`;
      const layers = [];
      if (col.alpha > 0) layers.push(flat(hexA(col.color, col.alpha)));
      if (theme === 'dark') layers.push(flat('rgba(8,9,12,.62)'));
      else if (theme === 'light') { wall.style.backgroundImage = flat('#eef1f6'); wall.style.filter = ''; return; }
      const wpBg = window.WALLPAPERS[wp] || window.WALLPAPERS[0];
      layers.push(wpBg);
      wall.style.backgroundImage = layers.join(', ');
      wall.style.filter = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate}) blur(${f.blur}px) hue-rotate(${f.hue}deg)`;
    }, [theme, wp, f.brightness, f.contrast, f.saturate, f.blur, f.hue, col.color, col.alpha]);

    if (!ready) {
      return (
        <div className="loading-screen">
          <div className="loading-spinner" />
        </div>
      );
    }

    const current = store.node(currentId) || store.node(store.rootId());
    if (!current) return null;
    const crumbs = store.breadcrumb(currentId);
    const isRoot = currentId === store.rootId();

    let items;
    if (activeTag) {
      items = Object.values(window.BMData.INDEX).filter((n) => n.url && (n.tags || []).includes(activeTag));
    } else {
      items = store.children(currentId).slice();
    }

    const goFolder = (n) => { setActiveTag(null); setCurrentId(n.id); setSelected([]); };
    const goBack = () => { const p = current.parentId; if (p && p !== '0') setCurrentId(p); setSelected([]); };
    const openBookmark = (n) => { store.recordVisit(n.id); window.open(n.url, '_blank'); window.toast('已在新标签页打开', 'check'); };
    const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

    const onMore = (e, node) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPop({ x: r.right, y: r.bottom + 4, node });
    };
    const menuItems = (node) => ([
      { icon: 'edit', label: '编辑', onClick: () => setDialog({ type: 'edit', node }) },
      {
        icon: isFolder(node) ? 'folder' : 'upload',
        label: isFolder(node) ? '打开文件夹' : '在新标签页打开',
        onClick: () => isFolder(node) ? goFolder(node) : openBookmark(node),
      },
      { sep: true },
      { icon: 'trash', label: '删除', danger: true, onClick: () => setDialog({ type: 'confirm', node }) },
    ]);

    const tags = store.allTags();
    const currentFolderName = isRoot ? '书签栏' : (current.title || '书签栏');

    const submitAdd = ({ title, url, tags }) => {
      store.addBookmark(currentId, title, url, tags);
      setDialog(null);
      window.toast('书签已添加', 'check');
    };
    const submitFolder = (name) => {
      store.addFolder(currentId, name);
      setDialog(null);
      window.toast('文件夹已创建', 'folderPlus');
    };
    const submitEdit = (fields) => {
      store.update(dialog.node.id, fields);
      setDialog(null);
      window.toast('已保存', 'check');
    };
    const doDelete = () => {
      const n = dialog.node;
      store.remove(n.id);
      setDialog(null);
      window.toast((isFolder(n) ? '文件夹' : '书签') + '已删除', 'trash');
    };
    const batchDelete = () => {
      store.removeMany(selected);
      window.toast('已删除 ' + selected.length + ' 项', 'trash');
      setSelected([]);
      setSelectMode(false);
    };

    return (
      <div className="app">
        <div className="wrap">
          <div className="hero fade-in">
            <div className="clock">
              {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
            </div>
            <div className="greet">{greeting(now.getHours())}，整理一下今天的灵感吧</div>
            <Search store={store} onOpenBookmark={openBookmark} onEnterFolder={goFolder} />
          </div>

          <Recents store={store} onOpen={openBookmark} />

          <div className="toolbar">
            <div className="crumbs">
              {activeTag ? (
                <>
                  <span className="crumb" onClick={() => setActiveTag(null)}>书签栏</span>
                  <span className="crumb-sep">›</span>
                  <span className="crumb current"><window.Icon name="tag" size={13} /> {activeTag}</span>
                </>
              ) : crumbs.map((n, i) => (
                <React.Fragment key={n.id}>
                  {i > 0 && <span className="crumb-sep">›</span>}
                  <span className={'crumb' + (i === crumbs.length - 1 ? ' current' : '')}
                    onClick={() => i < crumbs.length - 1 && setCurrentId(n.id)}>
                    {i === 0 ? '书签栏' : n.title}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <div className="tool-actions">
              <button className={'iconbtn' + (selectMode ? ' active' : '')}
                onClick={() => { setSelectMode((s) => !s); setSelected([]); }} title="多选">
                <window.Icon name="select" size={16} />{selectMode ? '完成' : '选择'}
              </button>
              <button className="iconbtn icon-only" style={{ width: 38 }}
                onClick={() => setDialog({ type: 'io' })} title="导入 / 导出">
                <window.Icon name="download" size={17} />
              </button>
              <button className="iconbtn icon-only" style={{ width: 38 }}
                onClick={() => setSettingsOpen(true)} title="设置">
                <window.Icon name="gear" size={18} />
              </button>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="tagbar">
              <span className="chip-lead"><window.Icon name="tag" size={13} /></span>
              {tags.map((t) => (
                <span key={t} className={'chip' + (activeTag === t ? ' on' : '')}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}>{t}</span>
              ))}
            </div>
          )}

          <window.Grid
            store={store} currentId={currentId} items={items}
            isRoot={isRoot || !!activeTag} hideAdd={!!activeTag}
            selectMode={selectMode} selectedIds={selected} onToggleSelect={toggleSel}
            onOpenBookmark={openBookmark} onEnterFolder={goFolder} onBack={goBack}
            onAddBookmark={() => setDialog({ type: 'add' })}
            onNewFolder={() => setDialog({ type: 'folder' })}
            onMore={onMore} density={density} />
        </div>

        {selectMode && selected.length > 0 && (
          <div className="selbar glass">
            <span className="sel-n">{selected.length} 项已选</span>
            <button className="iconbtn" onClick={() => setDialog({ type: 'move' })}>
              <window.Icon name="move" size={16} />移动
            </button>
            <button className="iconbtn" onClick={batchDelete}>
              <window.Icon name="trash" size={16} />删除
            </button>
            <button className="iconbtn" onClick={() => { setSelectMode(false); setSelected([]); }}>
              <window.Icon name="close" size={16} />
            </button>
          </div>
        )}

        {pop && <window.PopMenu x={pop.x} y={pop.y} items={menuItems(pop.node)} onClose={() => setPop(null)} />}

        {dialog && dialog.type === 'add' && (
          <window.AddBookmarkDialog folderName={currentFolderName} onClose={() => setDialog(null)} onSubmit={submitAdd} />
        )}
        {dialog && dialog.type === 'folder' && (
          <window.FolderDialog folderName={currentFolderName} onClose={() => setDialog(null)} onSubmit={submitFolder} />
        )}
        {dialog && dialog.type === 'edit' && (
          <window.EditDialog node={dialog.node} onClose={() => setDialog(null)} onSubmit={submitEdit} />
        )}
        {dialog && dialog.type === 'confirm' && (
          <window.ConfirmDialog
            title={'删除' + (isFolder(dialog.node) ? '文件夹' : '书签') + '？'}
            body={isFolder(dialog.node)
              ? `「${dialog.node.title}」及其包含的全部子项都会被删除，此操作无法撤销。`
              : `「${dialog.node.title}」将被删除。`}
            confirmLabel="删除" danger
            onClose={() => setDialog(null)} onConfirm={doDelete} />
        )}
        {dialog && dialog.type === 'io' && (
          <window.ImportExportDialog store={store} currentId={currentId} onClose={() => setDialog(null)} />
        )}
        {dialog && dialog.type === 'move' && (
          <window.MoveDialog store={store} ids={selected} onClose={() => setDialog(null)}
            onDone={(targetId, nm) => {
              store.moveMany(selected, targetId);
              window.toast('已移动 ' + selected.length + ' 项到「' + nm + '」', 'move');
              setSelected([]); setSelectMode(false); setDialog(null);
            }} />
        )}

        <window.SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}
          store={store} />
        <window.ToastHost />
      </div>
    );
  };
