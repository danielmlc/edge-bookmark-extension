(function() {
  const { isFolder, hostOf, INDEX } = window.BMData;
  function useClock() {
    const [now, setNow] = React.useState(/* @__PURE__ */ new Date());
    React.useEffect(() => {
      const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3 * 20);
      return () => clearInterval(t);
    }, []);
    return now;
  }
  function greeting(h) {
    if (h < 5) return "\u591C\u6DF1\u4E86";
    if (h < 11) return "\u65E9\u4E0A\u597D";
    if (h < 13) return "\u4E2D\u5348\u597D";
    if (h < 18) return "\u4E0B\u5348\u597D";
    return "\u665A\u4E0A\u597D";
  }
  function Search({ store, onOpenBookmark, onEnterFolder }) {
    const [q, setQ] = React.useState("");
    const [active, setActive] = React.useState(-1);
    const [show, setShow] = React.useState(false);
    const results = React.useMemo(() => store.search(q), [q, store]);
    const wrapRef = React.useRef();
    React.useEffect(() => {
      const h = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
      };
      window.addEventListener("mousedown", h);
      return () => window.removeEventListener("mousedown", h);
    }, []);
    const pick = (n) => {
      if (isFolder(n)) onEnterFolder(n);
      else onOpenBookmark(n);
      setQ("");
      setShow(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setQ("");
        setShow(false);
        e.target.blur();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && results[active]) pick(results[active]);
    };
    const open = show && q.trim().length >= 2;
    return /* @__PURE__ */ React.createElement("div", { className: "searchwrap", ref: wrapRef }, /* @__PURE__ */ React.createElement("div", { className: "search glass" }, /* @__PURE__ */ React.createElement("span", { className: "ic" }, /* @__PURE__ */ React.createElement(window.Icon, { name: "search", size: 20 })), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: q,
        placeholder: "\u641C\u7D22\u4E66\u7B7E\u4E0E\u6587\u4EF6\u5939\u2026",
        onChange: (e) => {
          setQ(e.target.value);
          setShow(true);
          setActive(0);
        },
        onFocus: () => setShow(true),
        onKeyDown: onKey
      }
    ), results.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "kbd" }, results.length)), open && /* @__PURE__ */ React.createElement("div", { className: "results glass" }, results.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "res-empty" }, "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u4E66\u7B7E") : results.map((n, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: n.id,
        className: "res-item" + (i === active ? " active" : ""),
        onMouseEnter: () => setActive(i),
        onClick: () => pick(n)
      },
      /* @__PURE__ */ React.createElement(window.Favicon, { node: n, size: 34 }),
      /* @__PURE__ */ React.createElement("div", { className: "res-meta" }, /* @__PURE__ */ React.createElement("div", { className: "res-title" + (isFolder(n) ? " folder" : "") }, n.title), /* @__PURE__ */ React.createElement("div", { className: "res-path" }, isFolder(n) ? "\u6587\u4EF6\u5939" : hostOf(n.url || ""), " \xB7 ", store.pathString(n.id)))
    ))));
  }
  function Recents({ store, onOpen }) {
    const items = store.recents();
    return /* @__PURE__ */ React.createElement("div", { className: "recents" }, /* @__PURE__ */ React.createElement("div", { className: "rec-head" }, "\u5E38\u7528\u7F51\u7AD9"), items.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "rec-empty" }, "\u6682\u65E0\u8BBF\u95EE\u8BB0\u5F55 \xB7 \u6253\u5F00\u4E66\u7B7E\u540E\u8FD9\u91CC\u4F1A\u51FA\u73B0\u4F60\u7684\u5E38\u7528\u7AD9\u70B9") : /* @__PURE__ */ React.createElement("div", { className: "rec-row" }, items.map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: "rec-item", onClick: () => onOpen(n) }, /* @__PURE__ */ React.createElement(window.Favicon, { node: n, size: 42 }), /* @__PURE__ */ React.createElement("div", { className: "lbl" }, n.title)))));
  }
  window.App = function App() {
    const store = window.useStore();
    const now = useClock();
    const [ready, setReady] = React.useState(false);
    const [currentId, setCurrentId] = React.useState("1");
    const [activeTag, setActiveTag] = React.useState(null);
    const [selectMode, setSelectMode] = React.useState(false);
    const [selected, setSelected] = React.useState([]);
    const [dialog, setDialog] = React.useState(null);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [pop, setPop] = React.useState(null);
    React.useEffect(() => {
      store.init().then(() => setReady(true));
    }, []);
    const theme = store.theme(), density = store.layout(), accent = store.accent();
    const wp = store.wallpaper(), f = store.filter(), col = store.color();
    const radius = store.read("bookmark_radius", 18);
    const gblur = store.read("bookmark_glassblur", null);
    React.useEffect(() => {
      const el = document.documentElement;
      el.dataset.theme = theme;
      el.dataset.density = density;
      el.dataset.select = selectMode ? "on" : "off";
      el.style.setProperty("--accent", accent);
      el.style.setProperty("--r-card", radius + "px");
      if (gblur != null && theme !== "light") el.style.setProperty("--panel-blur", gblur + "px");
      else el.style.removeProperty("--panel-blur");
    }, [theme, density, accent, selectMode, radius, gblur]);
    React.useEffect(() => {
      const wall = document.getElementById("wall");
      const hexA = (hex, a) => {
        const h = hex.replace("#", "");
        const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
        return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${a})`;
      };
      const flat = (c) => `linear-gradient(0deg, ${c}, ${c})`;
      const layers = [];
      if (col.alpha > 0) layers.push(flat(hexA(col.color, col.alpha)));
      if (theme === "dark") layers.push(flat("rgba(8,9,12,.62)"));
      else if (theme === "light") {
        wall.style.backgroundImage = flat("#eef1f6");
        wall.style.filter = "";
        return;
      }
      const wpBg = window.WALLPAPERS[wp] || window.WALLPAPERS[0];
      layers.push(wpBg);
      wall.style.backgroundImage = layers.join(", ");
      wall.style.filter = `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate}) blur(${f.blur}px) hue-rotate(${f.hue}deg)`;
    }, [theme, wp, f.brightness, f.contrast, f.saturate, f.blur, f.hue, col.color, col.alpha]);
    if (!ready) {
      return /* @__PURE__ */ React.createElement("div", { className: "loading-screen" }, /* @__PURE__ */ React.createElement("div", { className: "loading-spinner" }));
    }
    const current = store.node(currentId) || store.node("1");
    if (!current) return null;
    const crumbs = store.breadcrumb(currentId);
    const isRoot = currentId === "1";
    let items;
    if (activeTag) {
      items = Object.values(window.BMData.INDEX).filter((n) => n.url && (n.tags || []).includes(activeTag));
    } else {
      items = store.children(currentId).slice();
    }
    const goFolder = (n) => {
      setActiveTag(null);
      setCurrentId(n.id);
      setSelected([]);
    };
    const goBack = () => {
      const p = current.parentId;
      if (p && p !== "0") setCurrentId(p);
      setSelected([]);
    };
    const openBookmark = (n) => {
      store.recordVisit(n.id);
      window.open(n.url, "_blank");
      window.toast("\u5DF2\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00", "check");
    };
    const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    const onMore = (e, node) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPop({ x: r.right, y: r.bottom + 4, node });
    };
    const menuItems = (node) => [
      { icon: "edit", label: "\u7F16\u8F91", onClick: () => setDialog({ type: "edit", node }) },
      {
        icon: isFolder(node) ? "folder" : "upload",
        label: isFolder(node) ? "\u6253\u5F00\u6587\u4EF6\u5939" : "\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00",
        onClick: () => isFolder(node) ? goFolder(node) : openBookmark(node)
      },
      { sep: true },
      { icon: "trash", label: "\u5220\u9664", danger: true, onClick: () => setDialog({ type: "confirm", node }) }
    ];
    const tags = store.allTags();
    const currentFolderName = isRoot ? "\u4E66\u7B7E\u680F" : current.title || "\u4E66\u7B7E\u680F";
    const submitAdd = ({ title, url, tags: tags2 }) => {
      store.addBookmark(currentId, title, url, tags2);
      setDialog(null);
      window.toast("\u4E66\u7B7E\u5DF2\u6DFB\u52A0", "check");
    };
    const submitFolder = (name) => {
      store.addFolder(currentId, name);
      setDialog(null);
      window.toast("\u6587\u4EF6\u5939\u5DF2\u521B\u5EFA", "folderPlus");
    };
    const submitEdit = (fields) => {
      store.update(dialog.node.id, fields);
      setDialog(null);
      window.toast("\u5DF2\u4FDD\u5B58", "check");
    };
    const doDelete = () => {
      const n = dialog.node;
      store.remove(n.id);
      setDialog(null);
      window.toast((isFolder(n) ? "\u6587\u4EF6\u5939" : "\u4E66\u7B7E") + "\u5DF2\u5220\u9664", "trash");
    };
    const batchDelete = () => {
      store.removeMany(selected);
      window.toast("\u5DF2\u5220\u9664 " + selected.length + " \u9879", "trash");
      setSelected([]);
      setSelectMode(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "app" }, /* @__PURE__ */ React.createElement("div", { className: "wrap" }, /* @__PURE__ */ React.createElement("div", { className: "hero fade-in" }, /* @__PURE__ */ React.createElement("div", { className: "clock" }, now.getHours().toString().padStart(2, "0"), ":", now.getMinutes().toString().padStart(2, "0")), /* @__PURE__ */ React.createElement("div", { className: "greet" }, greeting(now.getHours()), "\uFF0C\u6574\u7406\u4E00\u4E0B\u4ECA\u5929\u7684\u7075\u611F\u5427"), /* @__PURE__ */ React.createElement(Search, { store, onOpenBookmark: openBookmark, onEnterFolder: goFolder })), /* @__PURE__ */ React.createElement(Recents, { store, onOpen: openBookmark }), /* @__PURE__ */ React.createElement("div", { className: "toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "crumbs" }, activeTag ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "crumb", onClick: () => setActiveTag(null) }, "\u4E66\u7B7E\u680F"), /* @__PURE__ */ React.createElement("span", { className: "crumb-sep" }, "\u203A"), /* @__PURE__ */ React.createElement("span", { className: "crumb current" }, /* @__PURE__ */ React.createElement(window.Icon, { name: "tag", size: 13 }), " ", activeTag)) : crumbs.map((n, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: n.id }, i > 0 && /* @__PURE__ */ React.createElement("span", { className: "crumb-sep" }, "\u203A"), /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "crumb" + (i === crumbs.length - 1 ? " current" : ""),
        onClick: () => i < crumbs.length - 1 && setCurrentId(n.id)
      },
      i === 0 ? "\u4E66\u7B7E\u680F" : n.title
    )))), /* @__PURE__ */ React.createElement("div", { className: "tool-actions" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "iconbtn" + (selectMode ? " active" : ""),
        onClick: () => {
          setSelectMode((s) => !s);
          setSelected([]);
        },
        title: "\u591A\u9009"
      },
      /* @__PURE__ */ React.createElement(window.Icon, { name: "select", size: 16 }),
      selectMode ? "\u5B8C\u6210" : "\u9009\u62E9"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "iconbtn icon-only",
        style: { width: 38 },
        onClick: () => setDialog({ type: "io" }),
        title: "\u5BFC\u5165 / \u5BFC\u51FA"
      },
      /* @__PURE__ */ React.createElement(window.Icon, { name: "download", size: 17 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "iconbtn icon-only",
        style: { width: 38 },
        onClick: () => setSettingsOpen(true),
        title: "\u8BBE\u7F6E"
      },
      /* @__PURE__ */ React.createElement(window.Icon, { name: "gear", size: 18 })
    ))), tags.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tagbar" }, /* @__PURE__ */ React.createElement("span", { className: "chip-lead" }, /* @__PURE__ */ React.createElement(window.Icon, { name: "tag", size: 13 })), tags.map((t) => /* @__PURE__ */ React.createElement(
      "span",
      {
        key: t,
        className: "chip" + (activeTag === t ? " on" : ""),
        onClick: () => setActiveTag(activeTag === t ? null : t)
      },
      t
    ))), /* @__PURE__ */ React.createElement(
      window.Grid,
      {
        store,
        currentId,
        items,
        isRoot: isRoot || !!activeTag,
        hideAdd: !!activeTag,
        selectMode,
        selectedIds: selected,
        onToggleSelect: toggleSel,
        onOpenBookmark: openBookmark,
        onEnterFolder: goFolder,
        onBack: goBack,
        onAddBookmark: () => setDialog({ type: "add" }),
        onNewFolder: () => setDialog({ type: "folder" }),
        onMore,
        density
      }
    )), selectMode && selected.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "selbar glass" }, /* @__PURE__ */ React.createElement("span", { className: "sel-n" }, selected.length, " \u9879\u5DF2\u9009"), /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: () => setDialog({ type: "move" }) }, /* @__PURE__ */ React.createElement(window.Icon, { name: "move", size: 16 }), "\u79FB\u52A8"), /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: batchDelete }, /* @__PURE__ */ React.createElement(window.Icon, { name: "trash", size: 16 }), "\u5220\u9664"), /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: () => {
      setSelectMode(false);
      setSelected([]);
    } }, /* @__PURE__ */ React.createElement(window.Icon, { name: "close", size: 16 }))), pop && /* @__PURE__ */ React.createElement(window.PopMenu, { x: pop.x, y: pop.y, items: menuItems(pop.node), onClose: () => setPop(null) }), dialog && dialog.type === "add" && /* @__PURE__ */ React.createElement(window.AddBookmarkDialog, { folderName: currentFolderName, onClose: () => setDialog(null), onSubmit: submitAdd }), dialog && dialog.type === "folder" && /* @__PURE__ */ React.createElement(window.FolderDialog, { folderName: currentFolderName, onClose: () => setDialog(null), onSubmit: submitFolder }), dialog && dialog.type === "edit" && /* @__PURE__ */ React.createElement(window.EditDialog, { node: dialog.node, onClose: () => setDialog(null), onSubmit: submitEdit }), dialog && dialog.type === "confirm" && /* @__PURE__ */ React.createElement(
      window.ConfirmDialog,
      {
        title: "\u5220\u9664" + (isFolder(dialog.node) ? "\u6587\u4EF6\u5939" : "\u4E66\u7B7E") + "\uFF1F",
        body: isFolder(dialog.node) ? `\u300C${dialog.node.title}\u300D\u53CA\u5176\u5305\u542B\u7684\u5168\u90E8\u5B50\u9879\u90FD\u4F1A\u88AB\u5220\u9664\uFF0C\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002` : `\u300C${dialog.node.title}\u300D\u5C06\u88AB\u5220\u9664\u3002`,
        confirmLabel: "\u5220\u9664",
        danger: true,
        onClose: () => setDialog(null),
        onConfirm: doDelete
      }
    ), dialog && dialog.type === "io" && /* @__PURE__ */ React.createElement(window.ImportExportDialog, { store, currentId, onClose: () => setDialog(null) }), dialog && dialog.type === "move" && /* @__PURE__ */ React.createElement(
      window.MoveDialog,
      {
        store,
        ids: selected,
        onClose: () => setDialog(null),
        onDone: (targetId, nm) => {
          store.moveMany(selected, targetId);
          window.toast("\u5DF2\u79FB\u52A8 " + selected.length + " \u9879\u5230\u300C" + nm + "\u300D", "move");
          setSelected([]);
          setSelectMode(false);
          setDialog(null);
        }
      }
    ), /* @__PURE__ */ React.createElement(
      window.SettingsPanel,
      {
        open: settingsOpen,
        onClose: () => setSettingsOpen(false),
        store
      }
    ), /* @__PURE__ */ React.createElement(window.ToastHost, null));
  };
})();
