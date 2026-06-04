// tweaks-config.jsx — design-exploration Tweaks panel driving the store. window.Tweaks
(function () {
  const ACCENTS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

  window.Tweaks = function Tweaks({ store }) {
    const theme = store.theme(), density = store.layout(), accent = store.accent();
    const wp = store.wallpaper();
    const radius = store.read('bookmark_radius', 18);
    const gblur = store.read('bookmark_glassblur', 22);

    return (
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="主题" />
        <window.TweakRadio label="外观" value={theme}
          options={[{ value: 'glass', label: '玻璃' }, { value: 'light', label: '浅色' }, { value: 'dark', label: '暗色' }]}
          onChange={(v) => store.setTheme(v)} />
        <window.TweakColor label="主色" value={accent} options={ACCENTS} onChange={(v) => store.setAccent(v)} />

        <window.TweakSection label="背景" />
        <window.TweakRow label="壁纸">
          <div style={{ display: 'flex', gap: 6 }}>
            {window.WALLPAPERS.map((w, i) => (
              <button key={i} onClick={() => store.setWallpaper(i)}
                style={{ flex: 1, height: 30, borderRadius: 6, cursor: 'pointer', background: w, backgroundSize: 'cover',
                  border: wp === i ? '2px solid #29261b' : '.5px solid rgba(0,0,0,.15)' }} />
            ))}
          </div>
        </window.TweakRow>

        <window.TweakSection label="布局" />
        <window.TweakRadio label="密度" value={density}
          options={[{ value: 'compact', label: '紧凑' }, { value: 'normal', label: '标准' }, { value: 'comfort', label: '宽松' }]}
          onChange={(v) => store.setLayout(v)} />
        <window.TweakSlider label="卡片圆角" value={radius} min={6} max={28} step={1} unit="px"
          onChange={(v) => store.setMisc('bookmark_radius', v)} />
        <window.TweakSlider label="玻璃模糊" value={gblur} min={0} max={40} step={1} unit="px"
          onChange={(v) => store.setMisc('bookmark_glassblur', v)} />

        <window.TweakSection label="常用网站" />
        <window.TweakSlider label="展示数量" value={store.recentCount()} min={6} max={30} step={1} unit=" 个"
          onChange={(v) => store.setRecentCount(v)} />
      </window.TweaksPanel>
    );
  };
})();
