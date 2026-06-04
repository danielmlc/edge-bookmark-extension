// cards.js — bookmark grid, tiles, drag & drop. window.Grid
(function () {
  const { isFolder, hostOf } = window.BMData;

  function Tile({ node, onOpen, onMore, selectMode, selected, onToggle, drag, favSize }) {
    const folder = isFolder(node);
    const cls = ['tile', folder ? 'folder' : '', selected ? 'selected' : '',
      drag.dragId === node.id ? 'dragging' : '',
      drag.overId === node.id ? (folder ? 'folder drop-into' : 'drop-target') : ''].filter(Boolean).join(' ');
    return (
      <div className={cls} draggable={!selectMode}
        onClick={() => { if (selectMode) { onToggle(node.id); } else onOpen(node); }}
        onDragStart={(e) => drag.start(e, node)}
        onDragEnd={drag.end}
        onDragOver={(e) => drag.over(e, node)}
        onDragLeave={drag.leave}
        onDrop={(e) => drag.drop(e, node)}
      >
        <div className="checkmark" onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>
          {selected && <window.Icon name="check" size={14} />}
        </div>
        {!selectMode && (
          <button className="t-more" onClick={(e) => { e.stopPropagation(); onMore(e, node); }}>
            <window.Icon name="more" size={16} />
          </button>
        )}
        <window.Favicon node={node} size={favSize} />
        <div className="t-title">{node.title}</div>
        {folder
          ? <div className="t-count">{(node.children || []).length} 项</div>
          : <div className="t-host">{hostOf(node.url || '')}</div>}
        {!folder && node.tags && node.tags.length > 0 && (
          <div className="t-tags">{node.tags.slice(0, 2).map((t) => <span key={t} className="t-tagdot">{t}</span>)}</div>
        )}
      </div>
    );
  }

  const FAV_SIZE = { compact: 36, normal: 44, comfort: 56 };

  window.Grid = function Grid({ store, currentId, items, isRoot, selectMode, selectedIds, onToggleSelect,
    onOpenBookmark, onEnterFolder, onBack, onAddBookmark, onNewFolder, onMore, density, hideAdd }) {
    const favSize = FAV_SIZE[density] || 44;
    const [drag, setDrag] = React.useState({ dragId: null, overId: null });
    const dragRef = React.useRef({ id: null });

    const handlers = {
      dragId: drag.dragId, overId: drag.overId,
      start: (e, node) => {
        dragRef.current.id = node.id;
        setDrag({ dragId: node.id, overId: null });
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', node.id); } catch (x) {}
      },
      end: () => { dragRef.current.id = null; setDrag({ dragId: null, overId: null }); },
      over: (e, node) => {
        if (!dragRef.current.id || dragRef.current.id === node.id) return;
        e.preventDefault();
        if (drag.overId !== node.id) setDrag((d) => ({ ...d, overId: node.id }));
      },
      leave: () => {},
      drop: (e, node) => {
        e.preventDefault(); e.stopPropagation();
        const id = dragRef.current.id; dragRef.current.id = null;
        if (!id || id === node.id) { setDrag({ dragId: null, overId: null }); return; }
        if (isFolder(node)) {
          store.move(id, node.id, null);
          window.toast('已移入「' + node.title + '」', 'move');
        } else {
          store.reorder(id, node.id);
        }
        setDrag({ dragId: null, overId: null });
      },
    };

    const backDrop = {
      over: (e) => {
        if (!dragRef.current.id) return;
        e.preventDefault();
        if (drag.overId !== '__back') setDrag((d) => ({ ...d, overId: '__back' }));
      },
      drop: (e) => {
        e.preventDefault();
        const id = dragRef.current.id; dragRef.current.id = null;
        if (id) {
          const parent = store.node(currentId);
          const grand = parent && parent.parentId;
          if (grand && grand !== '0') {
            store.move(id, grand, null);
            window.toast('已移到上级', 'arrowUp');
          }
        }
        setDrag({ dragId: null, overId: null });
      },
    };

    return (
      <div className="grid">
        {!isRoot && (
          <div className={'tile back action' + (drag.overId === '__back' ? ' drop-target' : '')}
            onClick={onBack}
            onDragOver={backDrop.over}
            onDragLeave={handlers.leave}
            onDrop={backDrop.drop}>
            <window.Icon name="arrowUp" size={26} />
            <div className="t-title">返回上级</div>
          </div>
        )}

        {items.length === 0 && (
          <div className="empty">
            <div className="e-ic"><window.Icon name="inbox" size={32} /></div>
            <div className="e-title">这个文件夹还是空的</div>
            <div className="e-sub">添加一个书签，或把别的卡片拖进来。</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="iconbtn accent" onClick={onAddBookmark}><window.Icon name="plus" size={16} />添加书签</button>
              <button className="iconbtn" onClick={onNewFolder}><window.Icon name="folderPlus" size={16} />新建文件夹</button>
            </div>
          </div>
        )}

        {items.map((node) => (
          <Tile key={node.id} node={node}
            onOpen={(n) => isFolder(n) ? onEnterFolder(n) : onOpenBookmark(n)}
            onMore={onMore} selectMode={selectMode}
            selected={selectedIds.includes(node.id)} onToggle={onToggleSelect}
            drag={handlers} favSize={favSize} />
        ))}

        {items.length > 0 && !selectMode && !hideAdd && (
          <>
            <div className="tile action" onClick={onAddBookmark}>
              <window.Icon name="plus" size={26} />
              <div className="t-title">添加书签</div>
            </div>
            <div className="tile action" onClick={onNewFolder}>
              <window.Icon name="folderPlus" size={26} />
              <div className="t-title">新建文件夹</div>
            </div>
          </>
        )}
      </div>
    );
  };
})();
