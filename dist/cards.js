(function() {
  const { isFolder, hostOf } = window.BMData;
  function Tile({ node, onOpen, onMore, selectMode, selected, onToggle, drag, favSize }) {
    const folder = isFolder(node);
    const cls = [
      "tile",
      folder ? "folder" : "",
      selected ? "selected" : "",
      drag.dragId === node.id ? "dragging" : "",
      drag.overId === node.id ? folder ? "folder drop-into" : "drop-target" : ""
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cls,
        draggable: !selectMode,
        onClick: () => {
          if (selectMode) {
            onToggle(node.id);
          } else onOpen(node);
        },
        onDragStart: (e) => drag.start(e, node),
        onDragEnd: drag.end,
        onDragOver: (e) => drag.over(e, node),
        onDragLeave: drag.leave,
        onDrop: (e) => drag.drop(e, node)
      },
      /* @__PURE__ */ React.createElement("div", { className: "checkmark", onClick: (e) => {
        e.stopPropagation();
        onToggle(node.id);
      } }, selected && /* @__PURE__ */ React.createElement(window.Icon, { name: "check", size: 14 })),
      !selectMode && /* @__PURE__ */ React.createElement("button", { className: "t-more", onClick: (e) => {
        e.stopPropagation();
        onMore(e, node);
      } }, /* @__PURE__ */ React.createElement(window.Icon, { name: "more", size: 16 })),
      /* @__PURE__ */ React.createElement(window.Favicon, { node, size: favSize }),
      /* @__PURE__ */ React.createElement("div", { className: "t-title" }, node.title),
      folder ? /* @__PURE__ */ React.createElement("div", { className: "t-count" }, (node.children || []).length, " \u9879") : /* @__PURE__ */ React.createElement("div", { className: "t-host" }, hostOf(node.url || "")),
      !folder && node.tags && node.tags.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "t-tags" }, node.tags.slice(0, 2).map((t) => /* @__PURE__ */ React.createElement("span", { key: t, className: "t-tagdot" }, t)))
    );
  }
  const FAV_SIZE = { compact: 36, normal: 44, comfort: 56 };
  window.Grid = function Grid({
    store,
    currentId,
    items,
    isRoot,
    selectMode,
    selectedIds,
    onToggleSelect,
    onOpenBookmark,
    onEnterFolder,
    onBack,
    onAddBookmark,
    onNewFolder,
    onMore,
    density,
    hideAdd
  }) {
    const favSize = FAV_SIZE[density] || 44;
    const [drag, setDrag] = React.useState({ dragId: null, overId: null });
    const dragRef = React.useRef({ id: null });
    const handlers = {
      dragId: drag.dragId,
      overId: drag.overId,
      start: (e, node) => {
        dragRef.current.id = node.id;
        setDrag({ dragId: node.id, overId: null });
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", node.id);
        } catch (x) {
        }
      },
      end: () => {
        dragRef.current.id = null;
        setDrag({ dragId: null, overId: null });
      },
      over: (e, node) => {
        if (!dragRef.current.id || dragRef.current.id === node.id) return;
        e.preventDefault();
        if (drag.overId !== node.id) setDrag((d) => ({ ...d, overId: node.id }));
      },
      leave: () => {
      },
      drop: (e, node) => {
        e.preventDefault();
        e.stopPropagation();
        const id = dragRef.current.id;
        dragRef.current.id = null;
        if (!id || id === node.id) {
          setDrag({ dragId: null, overId: null });
          return;
        }
        if (isFolder(node)) {
          store.move(id, node.id, null);
          window.toast("\u5DF2\u79FB\u5165\u300C" + node.title + "\u300D", "move");
        } else {
          store.reorder(id, node.id);
        }
        setDrag({ dragId: null, overId: null });
      }
    };
    const backDrop = {
      over: (e) => {
        if (!dragRef.current.id) return;
        e.preventDefault();
        if (drag.overId !== "__back") setDrag((d) => ({ ...d, overId: "__back" }));
      },
      drop: (e) => {
        e.preventDefault();
        const id = dragRef.current.id;
        dragRef.current.id = null;
        if (id) {
          const parent = store.node(currentId);
          const grand = parent && parent.parentId;
          if (grand && grand !== "0") {
            store.move(id, grand, null);
            window.toast("\u5DF2\u79FB\u5230\u4E0A\u7EA7", "arrowUp");
          }
        }
        setDrag({ dragId: null, overId: null });
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "grid" }, !isRoot && /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "tile back action" + (drag.overId === "__back" ? " drop-target" : ""),
        onClick: onBack,
        onDragOver: backDrop.over,
        onDragLeave: handlers.leave,
        onDrop: backDrop.drop
      },
      /* @__PURE__ */ React.createElement(window.Icon, { name: "arrowUp", size: 26 }),
      /* @__PURE__ */ React.createElement("div", { className: "t-title" }, "\u8FD4\u56DE\u4E0A\u7EA7")
    ), items.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement("div", { className: "e-ic" }, /* @__PURE__ */ React.createElement(window.Icon, { name: "inbox", size: 32 })), /* @__PURE__ */ React.createElement("div", { className: "e-title" }, "\u8FD9\u4E2A\u6587\u4EF6\u5939\u8FD8\u662F\u7A7A\u7684"), /* @__PURE__ */ React.createElement("div", { className: "e-sub" }, "\u6DFB\u52A0\u4E00\u4E2A\u4E66\u7B7E\uFF0C\u6216\u628A\u522B\u7684\u5361\u7247\u62D6\u8FDB\u6765\u3002"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("button", { className: "iconbtn accent", onClick: onAddBookmark }, /* @__PURE__ */ React.createElement(window.Icon, { name: "plus", size: 16 }), "\u6DFB\u52A0\u4E66\u7B7E"), /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: onNewFolder }, /* @__PURE__ */ React.createElement(window.Icon, { name: "folderPlus", size: 16 }), "\u65B0\u5EFA\u6587\u4EF6\u5939"))), items.map((node) => /* @__PURE__ */ React.createElement(
      Tile,
      {
        key: node.id,
        node,
        onOpen: (n) => isFolder(n) ? onEnterFolder(n) : onOpenBookmark(n),
        onMore,
        selectMode,
        selected: selectedIds.includes(node.id),
        onToggle: onToggleSelect,
        drag: handlers,
        favSize
      }
    )), items.length > 0 && !selectMode && !hideAdd && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "tile action", onClick: onAddBookmark }, /* @__PURE__ */ React.createElement(window.Icon, { name: "plus", size: 26 }), /* @__PURE__ */ React.createElement("div", { className: "t-title" }, "\u6DFB\u52A0\u4E66\u7B7E")), /* @__PURE__ */ React.createElement("div", { className: "tile action", onClick: onNewFolder }, /* @__PURE__ */ React.createElement(window.Icon, { name: "folderPlus", size: 26 }), /* @__PURE__ */ React.createElement("div", { className: "t-title" }, "\u65B0\u5EFA\u6587\u4EF6\u5939"))));
  };
})();
