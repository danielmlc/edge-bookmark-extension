(function() {
  const BRAND = {
    "github.com": ["#1f2328", "#fff"],
    "figma.com": ["#0d99ff", "#fff"],
    "youtube.com": ["#ff0033", "#fff"],
    "twitter.com": ["#1d9bf0", "#fff"],
    "x.com": ["#0f1419", "#fff"],
    "notion.so": ["#0f0f0f", "#fff"],
    "linear.app": ["#5e6ad2", "#fff"],
    "vercel.com": ["#0a0a0a", "#fff"],
    "stripe.com": ["#635bff", "#fff"],
    "dribbble.com": ["#ea4c89", "#fff"],
    "behance.net": ["#0057ff", "#fff"],
    "medium.com": ["#000", "#fff"],
    "arxiv.org": ["#b31b1b", "#fff"],
    "wikipedia.org": ["#101418", "#fff"],
    "news.ycombinator.com": ["#ff6600", "#fff"],
    "reddit.com": ["#ff4500", "#fff"],
    "spotify.com": ["#1db954", "#fff"],
    "apple.com": ["#1d1d1f", "#fff"],
    "google.com": ["#4285f4", "#fff"],
    "gmail.com": ["#ea4335", "#fff"],
    "docs.google.com": ["#1a73e8", "#fff"],
    "openai.com": ["#10a37f", "#fff"],
    "claude.ai": ["#d97757", "#fff"],
    "anthropic.com": ["#d97757", "#fff"],
    "tailwindcss.com": ["#06b6d4", "#fff"],
    "developer.mozilla.org": ["#000", "#fff"],
    "stackoverflow.com": ["#f48024", "#fff"],
    "bilibili.com": ["#fb7299", "#fff"],
    "zhihu.com": ["#0084ff", "#fff"],
    "weibo.com": ["#e6162d", "#fff"],
    "taobao.com": ["#ff4400", "#fff"],
    "framer.com": ["#0055ff", "#fff"],
    "codepen.io": ["#0f0f0f", "#fff"],
    "producthunt.com": ["#da552f", "#fff"]
  };
  const PALETTE = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#3b82f6"];
  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }
  function brandFor(url) {
    const h = hostOf(url);
    if (BRAND[h]) return BRAND[h];
    let s = 0;
    for (let i = 0; i < h.length; i++) s = s * 31 + h.charCodeAt(i) >>> 0;
    return [PALETTE[s % PALETTE.length], "#fff"];
  }
  function letterFor(node) {
    const t = (node.title || hostOf(node.url || "") || "?").trim();
    return t.charAt(0).toUpperCase();
  }
  window.BMData = {
    INDEX: {},
    // populated by store.js
    BRAND,
    PALETTE,
    hostOf,
    brandFor,
    letterFor,
    isFolder: (n) => !!n && Array.isArray(n.children)
  };
})();
