// settings.js — slide-in settings panel. window.SettingsPanel
import React from 'react';
  function Slider({ label, value, min, max, step, unit, fmt, onChange }) {
    return (
      <div className="ctrl">
        <div className="ctrl-head">
          <span className="lbl">{label}</span>
          <span className="val">{fmt ? fmt(value) : value}{unit || ''}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))} />
      </div>
    );
  }

  const ACCENTS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

  window.SettingsPanel = function SettingsPanel({ open, onClose, store }) {
    const [tab, setTab] = React.useState('filter');
    const f = store.filter(), c = store.color();
    const theme = store.theme(), layout = store.layout(), wp = store.wallpaper();

    const setF = (k, v) => store.setFilter({ ...f, [k]: v });

    const wallpaperLabels = ['黎明', '森林', '黄昏', '极地', '余烬'];
    const wallpaperBgs = window.WALLPAPERS;

    return (
      <>
        {open && (
          <div className="overlay" style={{ background: 'transparent', backdropFilter: 'none', zIndex: 65 }}
            onMouseDown={onClose} />
        )}
        <aside className={'settings' + (open ? ' open' : '')}>
          <div className="set-head">
            <h2>设置</h2>
            <button className="xbtn" onClick={onClose}><window.Icon name="close" size={18} /></button>
          </div>
          <div className="set-tabs">
            <button className={'set-tab' + (tab === 'filter' ? ' on' : '')} onClick={() => setTab('filter')}>背景滤镜</button>
            <button className={'set-tab' + (tab === 'general' ? ' on' : '')} onClick={() => setTab('general')}>常规</button>
            <button className={'set-tab' + (tab === 'about' ? ' on' : '')} onClick={() => setTab('about')}>关于</button>
          </div>

          <div className="set-body">
            {tab === 'filter' && (
              <>
                <div className="set-group">
                  <h3>背景图调节</h3>
                  <Slider label="亮度" value={f.brightness} min={0.5} max={2} step={0.05} onChange={(v) => setF('brightness', v)} />
                  <Slider label="对比度" value={f.contrast} min={0.5} max={2} step={0.05} onChange={(v) => setF('contrast', v)} />
                  <Slider label="饱和度" value={f.saturate} min={0} max={2} step={0.05} onChange={(v) => setF('saturate', v)} />
                  <Slider label="模糊" value={f.blur} min={0} max={10} step={0.5} unit="px" onChange={(v) => setF('blur', v)} />
                  <Slider label="色调旋转" value={f.hue} min={0} max={360} step={10} unit="°" onChange={(v) => setF('hue', v)} />
                </div>
                <div className="set-group">
                  <h3>颜色叠加</h3>
                  <div className="ctrl">
                    <div className="color-row">
                      <input type="color" value={c.color} onChange={(e) => store.setColor({ ...c, color: e.target.value })} />
                      <div style={{ flex: 1 }}>
                        <Slider label="叠加透明度" value={c.alpha} min={0} max={1} step={0.05}
                          fmt={(v) => Math.round(v * 100)} unit="%"
                          onChange={(v) => store.setColor({ ...c, alpha: v })} />
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn" style={{ width: '100%' }} onClick={() => {
                  store.setFilter({ brightness: 1.05, contrast: 1.1, saturate: 1.2, blur: 0, hue: 0 });
                  store.setColor({ color: '#ffffff', alpha: 0 });
                  window.toast('已重置滤镜', 'check');
                }}>重置滤镜</button>
                {theme === 'light' && (
                  <p className="dlg-sub" style={{ marginTop: 14, marginBottom: 0, fontSize: 12.5 }}>
                    提示：浅色主题不显示壁纸，切换到「玻璃」或「暗色」主题后生效。
                  </p>
                )}
              </>
            )}

            {tab === 'general' && (
              <>
                <div className="set-group">
                  <h3>主题</h3>
                  <div className="theme-cards">
                    {[
                      ['glass', '玻璃', 'linear-gradient(150deg,#fbc7d4,#9796f0)'],
                      ['light', '浅色', '#eef1f6'],
                      ['dark', '暗色', 'linear-gradient(150deg,#3a3f4c,#0e1014)'],
                    ].map(([k, nm, sw]) => (
                      <div key={k} className={'theme-card' + (theme === k ? ' on' : '')} onClick={() => store.setTheme(k)}>
                        <div className="swatch" style={{ background: sw }} />
                        <div className="nm">{nm}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="set-group">
                  <h3>主色</h3>
                  <div className="swatches">
                    {ACCENTS.map((a) => (
                      <div key={a} className={'sw' + (store.accent() === a ? ' on' : '')}
                        style={{ background: a }} onClick={() => store.setAccent(a)} />
                    ))}
                  </div>
                </div>
                <div className="set-group">
                  <h3>壁纸</h3>
                  <div className="swatches">
                    {wallpaperBgs.map((bg, i) => (
                      <div key={i} title={wallpaperLabels[i]}
                        className={'sw' + (wp === i ? ' on' : '')}
                        style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center', width: 44, height: 30, borderRadius: 7 }}
                        onClick={() => store.setWallpaper(i)} />
                    ))}
                  </div>
                </div>
                <div className="set-group">
                  <h3>布局密度</h3>
                  <div className="seg">
                    {[['compact', '紧凑'], ['normal', '标准'], ['comfort', '宽松']].map(([k, nm]) => (
                      <button key={k} className={layout === k ? 'on' : ''}
                        onClick={() => { store.setLayout(k); window.toast('布局：' + nm, 'grid'); }}>
                        {nm}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="set-group">
                  <h3>常用网站</h3>
                  <Slider label="展示数量" value={store.recentCount()} min={6} max={30} step={1} unit=" 个"
                    onChange={(v) => { store.setRecentCount(v); window.toast('展示 ' + v + ' 个', 'star'); }} />
                </div>
              </>
            )}

            {tab === 'about' && (
              <div className="about">
                <div className="about-logo"><window.Icon name="star" size={30} /></div>
                <h4>书签管理器</h4>
                <div className="ver">Manifest V3 · v2.0</div>
                <p>把浏览器原生书签以美观的整页网格呈现，支持浏览、搜索、整理与个性化背景。</p>
                <div className="sponsor">
                  <div className="s-lbl">赞助商</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--field)', display: 'grid', placeItems: 'center', color: 'var(--text-dim)' }}>
                      <window.Icon name="star" size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>你的品牌</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>这里可放置赞助图片</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  };
