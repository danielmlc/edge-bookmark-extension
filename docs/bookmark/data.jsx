// data.jsx — mock bookmark tree, brand colors, helpers. Exposed on window.
// The tree mirrors chrome.bookmarks shape: nodes have id, title, url?, children?, tags?, parentId.

(function () {
  // ---- Brand color map for favicon letter-tiles (offline-safe, no network) ----
  const BRAND = {
    'github.com': ['#1f2328', '#fff'],
    'figma.com': ['#0d99ff', '#fff'],
    'youtube.com': ['#ff0033', '#fff'],
    'twitter.com': ['#1d9bf0', '#fff'],
    'x.com': ['#0f1419', '#fff'],
    'notion.so': ['#0f0f0f', '#fff'],
    'linear.app': ['#5e6ad2', '#fff'],
    'vercel.com': ['#0a0a0a', '#fff'],
    'stripe.com': ['#635bff', '#fff'],
    'figma': ['#0d99ff', '#fff'],
    'dribbble.com': ['#ea4c89', '#fff'],
    'behance.net': ['#0057ff', '#fff'],
    'medium.com': ['#000', '#fff'],
    'arxiv.org': ['#b31b1b', '#fff'],
    'wikipedia.org': ['#101418', '#fff'],
    'news.ycombinator.com': ['#ff6600', '#fff'],
    'reddit.com': ['#ff4500', '#fff'],
    'spotify.com': ['#1db954', '#fff'],
    'apple.com': ['#1d1d1f', '#fff'],
    'google.com': ['#4285f4', '#fff'],
    'gmail.com': ['#ea4335', '#fff'],
    'maps.google.com': ['#34a853', '#fff'],
    'docs.google.com': ['#1a73e8', '#fff'],
    'openai.com': ['#10a37f', '#fff'],
    'claude.ai': ['#d97757', '#fff'],
    'anthropic.com': ['#d97757', '#fff'],
    'tailwindcss.com': ['#06b6d4', '#fff'],
    'developer.mozilla.org': ['#000', '#fff'],
    'stackoverflow.com': ['#f48024', '#fff'],
    'css-tricks.com': ['#ff7a18', '#fff'],
    'unsplash.com': ['#111', '#fff'],
    'pinterest.com': ['#e60023', '#fff'],
    'awwwards.com': ['#0f0f0f', '#fff'],
    'producthunt.com': ['#da552f', '#fff'],
    'bilibili.com': ['#fb7299', '#fff'],
    'zhihu.com': ['#0084ff', '#fff'],
    'douban.com': ['#2e963f', '#fff'],
    'weibo.com': ['#e6162d', '#fff'],
    'taobao.com': ['#ff4400', '#fff'],
    'sspline.design': ['#ff5c00', '#fff'],
    'framer.com': ['#0055ff', '#fff'],
    'codepen.io': ['#0f0f0f', '#fff'],
    'are.na': ['#0a0a0a', '#fff'],
    'fonts.google.com': ['#1a73e8', '#fff'],
    'coolors.co': ['#111', '#fff'],
  };
  const PALETTE = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6','#f97316','#3b82f6'];

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }
  function brandFor(url) {
    const h = hostOf(url);
    if (BRAND[h]) return BRAND[h];
    // hash to palette
    let s = 0; for (let i = 0; i < h.length; i++) s = (s * 31 + h.charCodeAt(i)) >>> 0;
    return [PALETTE[s % PALETTE.length], '#fff'];
  }
  function letterFor(node) {
    const t = (node.title || hostOf(node.url) || '?').trim();
    return t.charAt(0).toUpperCase();
  }

  // ---- Mock tree ----
  let _id = 100;
  const nid = () => 'n' + (_id++);
  function bm(title, url, tags) { return { id: nid(), title, url, tags: tags || [] }; }
  function fd(title, children) { return { id: nid(), title, children: children || [] }; }

  const TREE = {
    id: '0', title: 'root', children: [
      {
        id: '1', title: '书签栏', children: [
          fd('设计灵感', [
            bm('Dribbble', 'https://dribbble.com', ['设计','灵感']),
            bm('Behance', 'https://behance.net', ['设计']),
            bm('Awwwards', 'https://awwwards.com', ['设计','网页']),
            bm('Are.na', 'https://are.na', ['灵感','收藏']),
            bm('Unsplash', 'https://unsplash.com', ['图库']),
            bm('Pinterest', 'https://pinterest.com', ['灵感']),
            fd('配色工具', [
              bm('Coolors', 'https://coolors.co', ['配色']),
              bm('Google Fonts', 'https://fonts.google.com', ['字体']),
            ]),
          ]),
          fd('开发', [
            bm('GitHub', 'https://github.com', ['代码','工作']),
            bm('MDN Web Docs', 'https://developer.mozilla.org', ['文档']),
            bm('Stack Overflow', 'https://stackoverflow.com', ['问答']),
            bm('CSS-Tricks', 'https://css-tricks.com', ['文档','网页']),
            bm('Tailwind CSS', 'https://tailwindcss.com', ['文档','网页']),
            bm('CodePen', 'https://codepen.io', ['代码']),
            bm('Vercel', 'https://vercel.com', ['部署','工作']),
          ]),
          fd('工具', [
            bm('Figma', 'https://figma.com', ['设计','工作']),
            bm('Linear', 'https://linear.app', ['工作']),
            bm('Notion', 'https://notion.so', ['笔记','工作']),
            bm('Framer', 'https://framer.com', ['设计']),
            bm('Spline', 'https://spline.design', ['3D','设计']),
          ]),
          fd('阅读', [
            bm('Hacker News', 'https://news.ycombinator.com', ['科技','阅读']),
            bm('Medium', 'https://medium.com', ['阅读']),
            bm('arXiv', 'https://arxiv.org', ['论文','阅读']),
            bm('Wikipedia', 'https://wikipedia.org', ['百科']),
            bm('知乎', 'https://zhihu.com', ['阅读','中文']),
          ]),
          bm('Claude', 'https://claude.ai', ['AI','工作']),
          bm('YouTube', 'https://youtube.com', ['视频']),
          bm('Spotify', 'https://spotify.com', ['音乐']),
          bm('Product Hunt', 'https://producthunt.com', ['科技']),
          bm('哔哩哔哩', 'https://bilibili.com', ['视频','中文']),
          fd('稍后看 (空)', []),
        ],
      },
    ],
  };

  // set parentIds
  (function link(node, parent) {
    node.parentId = parent ? parent.id : null;
    (node.children || []).forEach((c) => link(c, node));
  })(TREE, null);

  // ---- index by id ----
  const INDEX = {};
  (function idx(n) { INDEX[n.id] = n; (n.children || []).forEach(idx); })(TREE);

  window.BMData = {
    TREE, INDEX, BRAND, PALETTE,
    hostOf, brandFor, letterFor, nid,
    isFolder: (n) => !!n && Array.isArray(n.children),
  };
})();
