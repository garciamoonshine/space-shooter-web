window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);

  // keyboard
  document.addEventListener('keydown', e => {
    game.keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    if ((e.code === 'Space' || e.code === 'Enter') && game.state !== 'playing') game.start();
  });
  document.addEventListener('keyup', e => { game.keys[e.code] = false; });

  // touch
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (game.state !== 'playing') { game.start(); return; }
    const t = e.touches[0];
    const bx = canvas.getBoundingClientRect();
    const tx = t.clientX - bx.left;
    if (tx < W * 0.35) game.keys['ArrowLeft'] = true;
    else if (tx > W * 0.65) game.keys['ArrowRight'] = true;
    else game.keys['Space'] = true;
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    game.keys['ArrowLeft'] = false;
    game.keys['ArrowRight'] = false;
    game.keys['Space'] = false;
  }, { passive: false });

  // show best score on overlay
  const best = localStorage.getItem('shooter-best');
  if (best && parseInt(best) > 0) {
    document.getElementById('best-display').textContent = `BEST: ${best}`;
  }

  // start idle draw
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
});