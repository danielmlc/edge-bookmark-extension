// ui.js — icons, favicon tiles, wallpapers (Bing + gradients), toast, popover.
(function () {
  const { brandFor, letterFor, isFolder } = window.BMData;

  // ---------- icons ----------
  const P = {
    search: 'M11 4a7 7 0 1 0 4.2 12.6l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
    plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
    folderPlus: 'M4 5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8l-2-2H4zm9 6h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2z',
    folder: 'M4 5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8l-2-2H4z',
    gear: 'M3 4h2v2H3zM11 4h10v2H11zM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM3 11h10v2H3zM19 11h2v2h-2zM19 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM3 18h2v2H3zM11 18h10v2H11zM11 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    close: 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z',
    more: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    check: 'M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z',
    trash: 'M9 3v1H4v2h16V4h-5V3H9zM6 8v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8H6zm3 3h2v7H9v-7zm4 0h2v7h-2v-7z',
    edit: 'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    back: 'M14 7l-5 5 5 5V7z',
    arrowUp: 'M12 5l7 7h-4v6h-6v-6H5z',
    tag: 'M21.4 11.6 12.4 2.6A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .6 1.4l9 9a2 2 0 0 0 2.8 0l7-7a2 2 0 0 0 0-2.8zM6.5 8A1.5 1.5 0 1 1 6.5 5a1.5 1.5 0 0 1 0 3z',
    download: 'M12 3v10.6l3.3-3.3 1.4 1.4-5.7 5.7-5.7-5.7 1.4-1.4 3.3 3.3V3h2zM4 19h16v2H4z',
    upload: 'M12 21V10.4L8.7 13.7 7.3 12.3 13 6.6l5.7 5.7-1.4 1.4L14 10.4V21h-2zM4 5h16V3H4z',
    select: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm12.5 1.1L20 17.6 18.6 19l-3.5-3.5 1.4-1.4z',
    grid: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
    move: 'M12 2 8 6h3v5H6V8l-4 4 4 4v-3h5v5H8l4 4 4-4h-3v-5h5v3l4-4-4-4v3h-5V6h3z',
    inbox: 'M4 4h16v9h-5l-1 2h-4l-1-2H4V4zm0 11v5h16v-5h-3.5l-1 2h-7l-1-2H4z',
    star: 'M12 2l2.9 6.2 6.8.7-5 4.6 1.4 6.7L12 17l-6.1 3.2 1.4-6.7-5-4.6 6.8-.7z',
    image: 'M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zm-7-7 4 5H6l3-4 2 3z',
  };
  window.Icon = function Icon({ name, size = 20 }) {
    const d = P[name] || '';
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>;
  };

  // ---------- favicon tile ----------
  window.Favicon = function Favicon({ node, size = 44, radius }) {
    const r = radius != null ? radius : Math.round(size * .32);
    if (isFolder(node)) {
      return (
        <div className="fav folder" style={{ width: size, height: size, borderRadius: r }}>
          <window.Icon name="folder" size={Math.round(size * .5)} />
        </div>
      );
    }
    const [bg, fg] = brandFor(node.url || '');
    const letter = letterFor(node);
    return (
      <div className="fav" style={{ width: size, height: size, borderRadius: r, background: bg, color: fg, fontSize: Math.round(size * .42) }}>
        {letter}
      </div>
    );
  };

  // ---------- wallpapers ----------
  window.WALLPAPERS = [
    'radial-gradient(120% 90% at 78% 12%, #ffd9a8 0%, transparent 46%), radial-gradient(120% 100% at 10% 8%, #ffb3c8 0%, transparent 42%), radial-gradient(140% 120% at 50% 100%, #6a8dff 0%, transparent 55%), linear-gradient(160deg, #fbc7d4 0%, #9796f0 100%)',
    'radial-gradient(110% 90% at 20% 18%, #a8e6cf 0%, transparent 48%), radial-gradient(120% 110% at 88% 24%, #c7f0d8 0%, transparent 42%), radial-gradient(140% 130% at 60% 100%, #2c7a5b 0%, transparent 60%), linear-gradient(155deg, #56ab8e 0%, #1f5e44 100%)',
    'radial-gradient(120% 100% at 82% 16%, #ff9a8b 0%, transparent 44%), radial-gradient(120% 100% at 8% 20%, #a18cd1 0%, transparent 46%), radial-gradient(150% 130% at 50% 100%, #2a2a72 0%, transparent 62%), linear-gradient(160deg, #cc6b8e 0%, #251b46 100%)',
    'radial-gradient(120% 100% at 80% 14%, #e0f2ff 0%, transparent 46%), radial-gradient(120% 110% at 14% 14%, #bcd9ff 0%, transparent 44%), radial-gradient(150% 130% at 50% 100%, #4a6fa5 0%, transparent 60%), linear-gradient(160deg, #9fc7f0 0%, #3a5a8c 100%)',
    'radial-gradient(110% 90% at 24% 16%, #ffd194 0%, transparent 46%), radial-gradient(120% 110% at 84% 22%, #ffb88c 0%, transparent 44%), radial-gradient(150% 130% at 50% 100%, #70163c 0%, transparent 62%), linear-gradient(160deg, #f0a15c 0%, #45122e 100%)',
  ];

  // ---------- toast singleton ----------
  let _tid = 0;
  const tListeners = new Set();
  let _toasts = [];
  function pushToast(msg, icon) {
    const id = ++_tid; _toasts = [..._toasts, { id, msg, icon }];
    tListeners.forEach((f) => f());
    setTimeout(() => {
      _toasts = _toasts.map((t) => t.id === id ? { ...t, out: true } : t); tListeners.forEach((f) => f());
      setTimeout(() => { _toasts = _toasts.filter((t) => t.id !== id); tListeners.forEach((f) => f()); }, 320);
    }, 2200);
  }
  window.toast = pushToast;

  window.ToastHost = function ToastHost() {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => { tListeners.add(force); return () => tListeners.delete(force); }, []);
    return (
      <div className="toast-host">
        {_toasts.map((t) => (
          <div key={t.id} className={'toast' + (t.out ? ' out' : '')}>
            {t.icon && <window.Icon name={t.icon} size={16} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    );
  };

  // ---------- popover menu ----------
  window.PopMenu = function PopMenu({ x, y, items, onClose }) {
    const ref = React.useRef(null);
    const [pos, setPos] = React.useState({ left: x, top: y });
    React.useEffect(() => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      let left = x, top = y;
      if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8;
      if (top + r.height > window.innerHeight - 8) top = y - r.height;
      setPos({ left, top });
    }, []);
    React.useEffect(() => {
      const h = () => onClose();
      window.addEventListener('click', h); window.addEventListener('scroll', h, true);
      return () => { window.removeEventListener('click', h); window.removeEventListener('scroll', h, true); };
    }, []);
    return (
      <div ref={ref} className="popmenu glass" style={{ left: pos.left, top: pos.top }} onClick={(e) => e.stopPropagation()}>
        {items.map((it, i) => it.sep
          ? <div key={i} className="sep" />
          : <button key={i} className={it.danger ? 'danger' : ''} onClick={() => { onClose(); it.onClick(); }}>
              <window.Icon name={it.icon} size={16} /> {it.label}
            </button>
        )}
      </div>
    );
  };
})();
