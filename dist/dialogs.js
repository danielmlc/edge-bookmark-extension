(function() {
  const { isFolder } = window.BMData;
  function Overlay({ children, onClose, shake }) {
    return /* @__PURE__ */ React.createElement("div", { className: "overlay", onMouseDown: (e) => {
      if (e.target === e.currentTarget) onClose();
    } }, /* @__PURE__ */ React.createElement("div", { className: "dialog" + (shake ? " shake" : ""), onMouseDown: (e) => e.stopPropagation() }, children));
  }
  function TagInput({ tags, setTags }) {
    const [draft, setDraft] = React.useState("");
    const add = () => {
      const v = draft.trim();
      if (v && !tags.includes(v)) setTags([...tags, v]);
      setDraft("");
    };
    return /* @__PURE__ */ React.createElement("div", { className: "tag-edit", onClick: (e) => e.currentTarget.querySelector("input").focus() }, tags.map((t) => /* @__PURE__ */ React.createElement("span", { key: t, className: "tk" }, t, /* @__PURE__ */ React.createElement("b", { onClick: () => setTags(tags.filter((x) => x !== t)) }, "\xD7"))), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: draft,
        placeholder: tags.length ? "" : "\u8F93\u5165\u540E\u56DE\u8F66\u6DFB\u52A0\u6807\u7B7E\u2026",
        onChange: (e) => setDraft(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && tags.length) setTags(tags.slice(0, -1));
        },
        onBlur: add
      }
    ));
  }
  window.AddBookmarkDialog = function({ onClose, onSubmit, folderName }) {
    const [title, setTitle] = React.useState("");
    const [url, setUrl] = React.useState("");
    const [tags, setTags] = React.useState([]);
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current && ref.current.focus();
    }, []);
    const submit = () => {
      let u = url.trim();
      if (!u) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
        return;
      }
      if (!/^https?:\/\//i.test(u)) u = "https://" + u;
      onSubmit({ title: title.trim() || u.replace(/^https?:\/\//, ""), url: u, tags });
    };
    return /* @__PURE__ */ React.createElement(Overlay, { onClose, shake }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, "\u6DFB\u52A0\u4E66\u7B7E"), /* @__PURE__ */ React.createElement("p", { className: "dlg-sub" }, "\u4FDD\u5B58\u5230\u300C", folderName, "\u300D"), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u7F51\u5740"), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref,
        className: "input",
        value: url,
        placeholder: "example.com",
        onChange: (e) => setUrl(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u540D\u79F0"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        value: title,
        placeholder: "\u53EF\u9009\uFF0C\u7559\u7A7A\u81EA\u52A8\u53D6\u57DF\u540D",
        onChange: (e) => setTitle(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u6807\u7B7E"), /* @__PURE__ */ React.createElement(TagInput, { tags, setTags })), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, "\u6DFB\u52A0")));
  };
  window.FolderDialog = function({ onClose, onSubmit, folderName }) {
    const [name, setName] = React.useState("");
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current && ref.current.focus();
    }, []);
    const submit = () => {
      if (!name.trim()) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
        return;
      }
      onSubmit(name.trim());
    };
    return /* @__PURE__ */ React.createElement(Overlay, { onClose, shake }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, "\u65B0\u5EFA\u6587\u4EF6\u5939"), /* @__PURE__ */ React.createElement("p", { className: "dlg-sub" }, "\u521B\u5EFA\u4E8E\u300C", folderName, "\u300D"), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u6587\u4EF6\u5939\u540D\u79F0"), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref,
        className: "input",
        value: name,
        placeholder: "\u4F8B\u5982\uFF1A\u8BBE\u8BA1\u7075\u611F",
        onChange: (e) => setName(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, "\u521B\u5EFA")));
  };
  window.EditDialog = function({ node, onClose, onSubmit }) {
    const folder = isFolder(node);
    const [title, setTitle] = React.useState(node.title || "");
    const [url, setUrl] = React.useState(node.url || "");
    const [tags, setTags] = React.useState(node.tags || []);
    const [shake, setShake] = React.useState(false);
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current && ref.current.focus();
    }, []);
    const submit = () => {
      if (!title.trim()) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
        return;
      }
      const f = { title: title.trim() };
      if (!folder) {
        let u = url.trim();
        if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
        f.url = u;
        f.tags = tags;
      }
      onSubmit(f);
    };
    return /* @__PURE__ */ React.createElement(Overlay, { onClose, shake }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, "\u7F16\u8F91", folder ? "\u6587\u4EF6\u5939" : "\u4E66\u7B7E"), /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u540D\u79F0"), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref,
        className: "input",
        value: title,
        onChange: (e) => setTitle(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), !folder && /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u7F51\u5740"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "input",
        value: url,
        onChange: (e) => setUrl(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && submit()
      }
    )), !folder && /* @__PURE__ */ React.createElement("div", { className: "field" }, /* @__PURE__ */ React.createElement("label", null, "\u6807\u7B7E"), /* @__PURE__ */ React.createElement(TagInput, { tags, setTags })), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: submit }, "\u4FDD\u5B58")));
  };
  window.ConfirmDialog = function({ title, body, confirmLabel, danger, onClose, onConfirm }) {
    React.useEffect(() => {
      const h = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Enter") onConfirm();
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);
    return /* @__PURE__ */ React.createElement(Overlay, { onClose }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, title), /* @__PURE__ */ React.createElement("p", { className: "dlg-sub", style: { marginBottom: 0 } }, body), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { className: "btn " + (danger ? "danger" : "primary"), onClick: onConfirm }, confirmLabel || "\u786E\u5B9A")));
  };
  window.ImportExportDialog = function({ onClose, store, currentId }) {
    const [tab, setTab] = React.useState("export");
    const [text, setText] = React.useState("");
    const exportText = React.useMemo(() => store.exportJSON(), []);
    const copy = () => {
      navigator.clipboard && navigator.clipboard.writeText(exportText);
      window.toast("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F", "check");
    };
    const doImport = async () => {
      const ok = await store.importJSON(text, currentId);
      if (ok) {
        window.toast("\u5BFC\u5165\u6210\u529F", "check");
        onClose();
      } else window.toast("JSON \u683C\u5F0F\u6709\u8BEF", "close");
    };
    return /* @__PURE__ */ React.createElement(Overlay, { onClose }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, "\u5BFC\u5165 / \u5BFC\u51FA"), /* @__PURE__ */ React.createElement("div", { className: "set-tabs", style: { padding: "0 0 14px" } }, /* @__PURE__ */ React.createElement("button", { className: "set-tab" + (tab === "export" ? " on" : ""), onClick: () => setTab("export") }, "\u5BFC\u51FA"), /* @__PURE__ */ React.createElement("button", { className: "set-tab" + (tab === "import" ? " on" : ""), onClick: () => setTab("import") }, "\u5BFC\u5165")), tab === "export" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "dlg-sub" }, "\u590D\u5236\u4E0B\u65B9 JSON \u5907\u4EFD\u4F60\u7684\u5168\u90E8\u4E66\u7B7E\u3002"), /* @__PURE__ */ React.createElement("textarea", { className: "input", readOnly: true, value: exportText, style: { minHeight: 200 }, onFocus: (e) => e.target.select() }), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u5173\u95ED"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: copy }, "\u590D\u5236"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "dlg-sub" }, "\u7C98\u8D34 JSON\uFF0C\u5BFC\u5165\u5230\u5F53\u524D\u6587\u4EF6\u5939\u3002"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "input",
        value: text,
        placeholder: '[{"title":"\u793A\u4F8B","url":"https://example.com"}]',
        onChange: (e) => setText(e.target.value),
        style: { minHeight: 200 }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ React.createElement("button", { className: "btn primary", onClick: doImport }, "\u5BFC\u5165"))));
  };
  window.MoveDialog = function({ store, ids, onClose, onDone }) {
    const { isFolder: isFld } = window.BMData;
    const blocked = /* @__PURE__ */ new Set();
    ids.forEach((id) => {
      (function mark(n) {
        if (!n) return;
        blocked.add(n.id);
        (n.children || []).forEach(mark);
      })(store.node(id));
    });
    const rows = [];
    const root = store.node("1");
    if (root) {
      (function walk(n, depth) {
        if (isFld(n) && n.id !== "0" && !blocked.has(n.id)) rows.push({ node: n, depth });
        (n.children || []).forEach((c) => isFld(c) && walk(c, depth + 1));
      })(root, 0);
    }
    return /* @__PURE__ */ React.createElement(Overlay, { onClose }, /* @__PURE__ */ React.createElement("h3", { className: "dlg-title" }, "\u79FB\u52A8 ", ids.length, " \u9879\u5230\u2026"), /* @__PURE__ */ React.createElement("p", { className: "dlg-sub" }, "\u9009\u62E9\u76EE\u6807\u6587\u4EF6\u5939"), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: 280, overflowY: "auto", margin: "0 -6px" } }, rows.map(({ node, depth }) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: node.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          justifyContent: "flex-start",
          border: 0,
          background: "transparent",
          height: 42,
          paddingLeft: 10 + depth * 18,
          fontWeight: 500,
          cursor: "pointer",
          borderRadius: 8,
          color: "var(--text)",
          fontFamily: "inherit",
          fontSize: 13.5
        },
        onMouseEnter: (e) => e.currentTarget.style.background = "var(--card-hover)",
        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
        onClick: () => onDone(node.id, node.id === "1" ? "\u4E66\u7B7E\u680F" : node.title)
      },
      /* @__PURE__ */ React.createElement(window.Icon, { name: "folder", size: 18 }),
      node.id === "1" ? "\u4E66\u7B7E\u680F" : node.title
    ))), /* @__PURE__ */ React.createElement("div", { className: "dlg-actions" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onClose }, "\u53D6\u6D88")));
  };
})();
