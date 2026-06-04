// dialogs.jsx — modal dialogs. Exposed on window.
(function () {
  const { isFolder } = window.BMData;

  function Overlay({ children, onClose, shake }) {
    return (
      <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className={'dialog' + (shake ? ' shake' : '')} onMouseDown={(e) => e.stopPropagation()}>{children}</div>
      </div>
    );
  }

  function TagInput({ tags, setTags }) {
    const [draft, setDraft] = React.useState('');
    const add = () => { const v = draft.trim(); if (v && !tags.includes(v)) setTags([...tags, v]); setDraft(''); };
    return (
      <div className="tag-edit" onClick={(e) => e.currentTarget.querySelector('input').focus()}>
        {tags.map((t) => (
          <span key={t} className="tk">{t}<b onClick={() => setTags(tags.filter((x) => x !== t))}>×</b></span>
        ))}
        <input value={draft} placeholder={tags.length ? '' : '输入后回车添加标签…'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !draft && tags.length) setTags(tags.slice(0, -1)); }}
          onBlur={add} />
      </div>
    );
  }

  // ---- Add bookmark ----
  window.AddBookmarkDialog = function ({ onClose, onSubmit, folderName }) {
    const [title, setTitle] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [tags, setTags] = React.useState([]);
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => { ref.current && ref.current.focus(); }, []);
    const submit = () => {
      let u = url.trim(); if (!u) { setShake(true); setTimeout(() => setShake(false), 420); return; }
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      onSubmit({ title: title.trim() || u.replace(/^https?:\/\//, ''), url: u, tags });
    };
    return (
      <Overlay onClose={onClose} shake={shake}>
        <h3 className="dlg-title">添加书签</h3>
        <p className="dlg-sub">保存到「{folderName}」</p>
        <div className="field"><label>网址</label>
          <input ref={ref} className="input" value={url} placeholder="example.com"
            onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        <div className="field"><label>名称</label>
          <input className="input" value={title} placeholder="可选，留空自动取域名"
            onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        <div className="field"><label>标签</label><TagInput tags={tags} setTags={setTags} /></div>
        <div className="dlg-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={submit}>添加</button>
        </div>
      </Overlay>
    );
  };

  // ---- New folder ----
  window.FolderDialog = function ({ onClose, onSubmit, folderName }) {
    const [name, setName] = React.useState('');
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => { ref.current && ref.current.focus(); }, []);
    const submit = () => { if (!name.trim()) { setShake(true); setTimeout(() => setShake(false), 420); return; } onSubmit(name.trim()); };
    return (
      <Overlay onClose={onClose} shake={shake}>
        <h3 className="dlg-title">新建文件夹</h3>
        <p className="dlg-sub">创建于「{folderName}」</p>
        <div className="field"><label>文件夹名称</label>
          <input ref={ref} className="input" value={name} placeholder="例如：设计灵感"
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        <div className="dlg-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={submit}>创建</button>
        </div>
      </Overlay>
    );
  };

  // ---- Edit ----
  window.EditDialog = function ({ node, onClose, onSubmit }) {
    const folder = isFolder(node);
    const [title, setTitle] = React.useState(node.title || '');
    const [url, setUrl] = React.useState(node.url || '');
    const [tags, setTags] = React.useState(node.tags || []);
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => { ref.current && ref.current.focus(); }, []);
    const submit = () => {
      if (!title.trim()) { setShake(true); setTimeout(() => setShake(false), 420); return; }
      const f = { title: title.trim() };
      if (!folder) { let u = url.trim(); if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u; f.url = u; f.tags = tags; }
      onSubmit(f);
    };
    return (
      <Overlay onClose={onClose} shake={shake}>
        <h3 className="dlg-title">编辑{folder ? '文件夹' : '书签'}</h3>
        <div className="field"><label>名称</label>
          <input ref={ref} className="input" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        {!folder && <div className="field"><label>网址</label>
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>}
        {!folder && <div className="field"><label>标签</label><TagInput tags={tags} setTags={setTags} /></div>}
        <div className="dlg-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={submit}>保存</button>
        </div>
      </Overlay>
    );
  };

  // ---- Custom confirm (replaces native confirm) ----
  window.ConfirmDialog = function ({ title, body, confirmLabel, danger, onClose, onConfirm }) {
    React.useEffect(() => {
      const h = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter') onConfirm(); };
      window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    }, []);
    return (
      <Overlay onClose={onClose}>
        <h3 className="dlg-title">{title}</h3>
        <p className="dlg-sub" style={{ marginBottom: 0 }}>{body}</p>
        <div className="dlg-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onConfirm}>{confirmLabel || '确定'}</button>
        </div>
      </Overlay>
    );
  };

  // ---- Import / Export ----
  window.ImportExportDialog = function ({ onClose, store, currentId, onDone }) {
    const [tab, setTab] = React.useState('export');
    const [text, setText] = React.useState('');
    const exportText = React.useMemo(() => store.exportJSON(), []);
    const copy = () => { navigator.clipboard && navigator.clipboard.writeText(exportText); window.toast('已复制到剪贴板', 'check'); };
    const doImport = () => {
      const ok = store.importJSON(text, currentId);
      if (ok) { window.toast('导入成功', 'check'); onDone && onDone(); onClose(); }
      else window.toast('JSON 格式有误', 'close');
    };
    return (
      <Overlay onClose={onClose}>
        <h3 className="dlg-title">导入 / 导出</h3>
        <div className="set-tabs" style={{ padding: '0 0 14px' }}>
          <button className={'set-tab' + (tab === 'export' ? ' on' : '')} onClick={() => setTab('export')}>导出</button>
          <button className={'set-tab' + (tab === 'import' ? ' on' : '')} onClick={() => setTab('import')}>导入</button>
        </div>
        {tab === 'export' ? (
          <>
            <p className="dlg-sub">复制下方 JSON 备份你的全部书签。</p>
            <textarea className="input" readOnly value={exportText} style={{ minHeight: 200 }} onFocus={(e) => e.target.select()} />
            <div className="dlg-actions"><button className="btn" onClick={onClose}>关闭</button><button className="btn primary" onClick={copy}>复制</button></div>
          </>
        ) : (
          <>
            <p className="dlg-sub">粘贴 JSON，导入到当前文件夹。</p>
            <textarea className="input" value={text} placeholder='[{"title":"示例","url":"https://example.com"}]' onChange={(e) => setText(e.target.value)} style={{ minHeight: 200 }} />
            <div className="dlg-actions"><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={doImport}>导入</button></div>
          </>
        )}
      </Overlay>
    );
  };
  // ---- Move (batch) ----
  window.MoveDialog = function ({ store, ids, onClose, onDone }) {
    // build flat folder list with depth, excluding selected folders & their descendants
    const blocked = new Set();
    ids.forEach((id) => { (function mark(n) { if (!n) return; blocked.add(n.id); (n.children || []).forEach(mark); })(store.node(id)); });
    const rows = [];
    (function walk(n, depth) {
      if (isFolder(n) && n.id !== '0' && !blocked.has(n.id)) rows.push({ node: n, depth });
      (n.children || []).forEach((c) => isFolder(c) && walk(c, depth + 1));
    })(store.node('1'), 0);
    return (
      <Overlay onClose={onClose}>
        <h3 className="dlg-title">移动 {ids.length} 项到…</h3>
        <p className="dlg-sub">选择目标文件夹</p>
        <div style={{ maxHeight: 280, overflowY: 'auto', margin: '0 -6px' }}>
          {rows.map(({ node, depth }) => (
            <button key={node.id} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'flex-start', border: 0, background: 'transparent', height: 42, paddingLeft: 10 + depth * 18, fontWeight: 500 }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => onDone(node.id, node.id === '1' ? '书签栏' : node.title)}>
              <window.Icon name="folder" size={18} /> {node.id === '1' ? '书签栏' : node.title}
            </button>
          ))}
        </div>
        <div className="dlg-actions"><button className="btn" onClick={onClose}>取消</button></div>
      </Overlay>
    );
  };
})();
