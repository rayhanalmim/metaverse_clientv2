export const useEvent = () => {
  const useClickEvent = (cb) => {
    let moved;
    const downListener = () => {
      moved = false;
    };
    window.addEventListener('mousedown', downListener);
    const moveListener = () => {
      moved = true;
    };
    window.addEventListener('mousemove', moveListener);
    const upListener = (ev) => {
      if (moved) return;
      if (ev.target.nodeName !== 'CANVAS') return;
      cb(ev);
    };
    window.addEventListener('mouseup', upListener);
  };

  const useMoveEvent = (cb) => {
    window.addEventListener('mousemove', cb);
  };

  return {
    useClickEvent,
    useMoveEvent,
  };
};
