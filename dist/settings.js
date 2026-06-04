(function() {
  function Slider({ label, value, min, max, step, unit, fmt, onChange }) {
    return /* @__PURE__ */ React.createElement("div", { className: "ctrl" }, /* @__PURE__ */ React.createElement("div", { className: "ctrl-head" }, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, label), /* @__PURE__ */ React.createElement("span", { className: "val" }, fmt ? fmt(value) : value, unit || "")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value))
      }
    ));
  }
  const ACCENTS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#f97316"];
  window.SettingsPanel = function SettingsPanel({ open, onClose, store }) {
    const [tab, setTab] = React.useState("filter");
    const f = store.filter(), c = store.color();
    const theme = store.theme(), layout = store.layout(), wp = store.wallpaper();
    const setF = (k, v) => store.setFilter({ ...f, [k]: v });
    const wallpaperLabels = ["\u9ECE\u660E", "\u68EE\u6797", "\u9EC4\u660F", "\u6781\u5730", "\u4F59\u70EC"];
    const wallpaperBgs = window.WALLPAPERS;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, open && /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "overlay",
        style: { background: "transparent", backdropFilter: "none", zIndex: 65 },
        onMouseDown: onClose
      }
    ), /* @__PURE__ */ React.createElement("aside", { className: "settings" + (open ? " open" : "") }, /* @__PURE__ */ React.createElement("div", { className: "set-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u8BBE\u7F6E"), /* @__PURE__ */ React.createElement("button", { className: "xbtn", onClick: onClose }, /* @__PURE__ */ React.createElement(window.Icon, { name: "close", size: 18 }))), /* @__PURE__ */ React.createElement("div", { className: "set-tabs" }, /* @__PURE__ */ React.createElement("button", { className: "set-tab" + (tab === "filter" ? " on" : ""), onClick: () => setTab("filter") }, "\u80CC\u666F\u6EE4\u955C"), /* @__PURE__ */ React.createElement("button", { className: "set-tab" + (tab === "general" ? " on" : ""), onClick: () => setTab("general") }, "\u5E38\u89C4"), /* @__PURE__ */ React.createElement("button", { className: "set-tab" + (tab === "about" ? " on" : ""), onClick: () => setTab("about") }, "\u5173\u4E8E")), /* @__PURE__ */ React.createElement("div", { className: "set-body" }, tab === "filter" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u80CC\u666F\u56FE\u8C03\u8282"), /* @__PURE__ */ React.createElement(Slider, { label: "\u4EAE\u5EA6", value: f.brightness, min: 0.5, max: 2, step: 0.05, onChange: (v) => setF("brightness", v) }), /* @__PURE__ */ React.createElement(Slider, { label: "\u5BF9\u6BD4\u5EA6", value: f.contrast, min: 0.5, max: 2, step: 0.05, onChange: (v) => setF("contrast", v) }), /* @__PURE__ */ React.createElement(Slider, { label: "\u9971\u548C\u5EA6", value: f.saturate, min: 0, max: 2, step: 0.05, onChange: (v) => setF("saturate", v) }), /* @__PURE__ */ React.createElement(Slider, { label: "\u6A21\u7CCA", value: f.blur, min: 0, max: 10, step: 0.5, unit: "px", onChange: (v) => setF("blur", v) }), /* @__PURE__ */ React.createElement(Slider, { label: "\u8272\u8C03\u65CB\u8F6C", value: f.hue, min: 0, max: 360, step: 10, unit: "\xB0", onChange: (v) => setF("hue", v) })), /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u989C\u8272\u53E0\u52A0"), /* @__PURE__ */ React.createElement("div", { className: "ctrl" }, /* @__PURE__ */ React.createElement("div", { className: "color-row" }, /* @__PURE__ */ React.createElement("input", { type: "color", value: c.color, onChange: (e) => store.setColor({ ...c, color: e.target.value }) }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(
      Slider,
      {
        label: "\u53E0\u52A0\u900F\u660E\u5EA6",
        value: c.alpha,
        min: 0,
        max: 1,
        step: 0.05,
        fmt: (v) => Math.round(v * 100),
        unit: "%",
        onChange: (v) => store.setColor({ ...c, alpha: v })
      }
    ))))), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { width: "100%" }, onClick: () => {
      store.setFilter({ brightness: 1.05, contrast: 1.1, saturate: 1.2, blur: 0, hue: 0 });
      store.setColor({ color: "#ffffff", alpha: 0 });
      window.toast("\u5DF2\u91CD\u7F6E\u6EE4\u955C", "check");
    } }, "\u91CD\u7F6E\u6EE4\u955C"), theme === "light" && /* @__PURE__ */ React.createElement("p", { className: "dlg-sub", style: { marginTop: 14, marginBottom: 0, fontSize: 12.5 } }, "\u63D0\u793A\uFF1A\u6D45\u8272\u4E3B\u9898\u4E0D\u663E\u793A\u58C1\u7EB8\uFF0C\u5207\u6362\u5230\u300C\u73BB\u7483\u300D\u6216\u300C\u6697\u8272\u300D\u4E3B\u9898\u540E\u751F\u6548\u3002")), tab === "general" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u4E3B\u9898"), /* @__PURE__ */ React.createElement("div", { className: "theme-cards" }, [
      ["glass", "\u73BB\u7483", "linear-gradient(150deg,#fbc7d4,#9796f0)"],
      ["light", "\u6D45\u8272", "#eef1f6"],
      ["dark", "\u6697\u8272", "linear-gradient(150deg,#3a3f4c,#0e1014)"]
    ].map(([k, nm, sw]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "theme-card" + (theme === k ? " on" : ""), onClick: () => store.setTheme(k) }, /* @__PURE__ */ React.createElement("div", { className: "swatch", style: { background: sw } }), /* @__PURE__ */ React.createElement("div", { className: "nm" }, nm))))), /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u4E3B\u8272"), /* @__PURE__ */ React.createElement("div", { className: "swatches" }, ACCENTS.map((a) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: a,
        className: "sw" + (store.accent() === a ? " on" : ""),
        style: { background: a },
        onClick: () => store.setAccent(a)
      }
    )))), /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u58C1\u7EB8"), /* @__PURE__ */ React.createElement("div", { className: "swatches" }, wallpaperBgs.map((bg, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        title: wallpaperLabels[i],
        className: "sw" + (wp === i ? " on" : ""),
        style: { background: bg, backgroundSize: "cover", backgroundPosition: "center", width: 44, height: 30, borderRadius: 7 },
        onClick: () => store.setWallpaper(i)
      }
    )))), /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u5E03\u5C40\u5BC6\u5EA6"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, [["compact", "\u7D27\u51D1"], ["normal", "\u6807\u51C6"], ["comfort", "\u5BBD\u677E"]].map(([k, nm]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: k,
        className: layout === k ? "on" : "",
        onClick: () => {
          store.setLayout(k);
          window.toast("\u5E03\u5C40\uFF1A" + nm, "grid");
        }
      },
      nm
    )))), /* @__PURE__ */ React.createElement("div", { className: "set-group" }, /* @__PURE__ */ React.createElement("h3", null, "\u5E38\u7528\u7F51\u7AD9"), /* @__PURE__ */ React.createElement(
      Slider,
      {
        label: "\u5C55\u793A\u6570\u91CF",
        value: store.recentCount(),
        min: 6,
        max: 30,
        step: 1,
        unit: " \u4E2A",
        onChange: (v) => {
          store.setRecentCount(v);
          window.toast("\u5C55\u793A " + v + " \u4E2A", "star");
        }
      }
    ))), tab === "about" && /* @__PURE__ */ React.createElement("div", { className: "about" }, /* @__PURE__ */ React.createElement("div", { className: "about-logo" }, /* @__PURE__ */ React.createElement(window.Icon, { name: "star", size: 30 })), /* @__PURE__ */ React.createElement("h4", null, "\u4E66\u7B7E\u7BA1\u7406\u5668"), /* @__PURE__ */ React.createElement("div", { className: "ver" }, "Manifest V3 \xB7 v2.0"), /* @__PURE__ */ React.createElement("p", null, "\u628A\u6D4F\u89C8\u5668\u539F\u751F\u4E66\u7B7E\u4EE5\u7F8E\u89C2\u7684\u6574\u9875\u7F51\u683C\u5448\u73B0\uFF0C\u652F\u6301\u6D4F\u89C8\u3001\u641C\u7D22\u3001\u6574\u7406\u4E0E\u4E2A\u6027\u5316\u80CC\u666F\u3002"), /* @__PURE__ */ React.createElement("div", { className: "sponsor" }, /* @__PURE__ */ React.createElement("div", { className: "s-lbl" }, "\u8D5E\u52A9\u5546"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: "var(--field)", display: "grid", placeItems: "center", color: "var(--text-dim)" } }, /* @__PURE__ */ React.createElement(window.Icon, { name: "star", size: 20 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, "\u4F60\u7684\u54C1\u724C"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-dim)" } }, "\u8FD9\u91CC\u53EF\u653E\u7F6E\u8D5E\u52A9\u56FE\u7247"))))))));
  };
})();
