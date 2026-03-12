class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    this.state = 'idle';
    this.score = 0;
    this.best = parseInt(localStorage.getItem('shooter-best') || '0');
    this.level = 1;
    this.player = new Player(W/2 - 16, H - 80);
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerups = [];
    this.particles = new ParticleSystem();
    this.keys = {};
    this.shootTimer = 0;
    this.shootRate = 18;
    this.stars = Array.from({length:80}, () => ({ x: rand(0,W), y: rand(0,H), s: rand(0.5,2.5), v: rand(0.5,2) }));
    this.animId = null;
    this.lastTime = 0;
    this.formationDir = 1;
    this.formationX = 0;
  }

  spawnEnemies() {
    this.enemies = [];
    if (this.level % 5 === 0) {
      const boss = new Enemy(W/2 - 40, 60, 'boss', this.level);
      boss.vx = 1.5 + this.level * 0.2;
      this.enemies.push(boss);
      return;
    }
    const types = ['A','A','A','B','B','C'];
    for (let r = 0; r < ENEMY_ROWS; r++) {
      for (let c = 0; c < ENEMY_COLS; c++) {
        const type = types[Math.min(r * 2, types.length - 1)];
        const e = new Enemy(60 + c * 48, 60 + r * 48, type, this.level);
        e.vx = this.formationDir * (0.5 + this.level * 0.1);
        e.vy = 0;
        this.enemies.push(e);
      }
    }
  }

  start() {
    this.state = 'playing';
    this.score = 0;
    this.level = 1;
    this.player = new Player(W/2 - 16, H - 80);
    this.bullets = []; this.enemyBullets = []; this.powerups = [];
    this.particles = new ParticleSystem();
    this.spawnEnemies();
    document.getElementById('overlay').classList.remove('visible');
    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(t) {
    const dt = Math.min((t - this.lastTime) / 16.67, 3);
    this.lastTime = t;
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(ts => this.loop(ts));
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.updateStars();
    this.player.update(this.keys, W);
    this.handleShooting();
    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => !b.offScreen());
    this.enemyBullets.forEach(b => b.update(dt));
    this.enemyBullets = this.enemyBullets.filter(b => !b.offScreen(H));
    this.updateEnemies(dt);
    this.powerups.forEach(p => p.update());
    this.powerups = this.powerups.filter(p => !p.offScreen(H));
    this.particles.update();
    this.checkCollisions();
    this.updateUI();
    if (this.enemies.length === 0) { this.level++; this.spawnEnemies(); }
    if (this.player.lives <= 0) this.gameOver();
  }

  updateStars() {
    this.stars.forEach(s => { s.y += s.v; if (s.y > H) { s.y = 0; s.x = rand(0, W); } });
  }

  handleShooting() {
    if (this.shootTimer > 0) { this.shootTimer--; return; }
    if (this.keys['Space'] || this.keys['KeyZ']) {
      this.player.getBulletOrigins().forEach(o => this.bullets.push(new Bullet(o.x, o.y)));
      this.shootTimer = this.player.rapidFire ? 6 : this.shootRate;
    }
  }

  updateEnemies(dt) {
    let hitWall = false;
    this.enemies.forEach(e => {
      const shoot = e.update(dt, this.player.x, W);
      if (shoot) {
        e.resetShootTimer();
        const cx = e.x + e.w/2, cy = e.y + e.h;
        if (e.type === 'boss') {
          for (let i = -2; i <= 2; i++) this.enemyBullets.push(new EnemyBullet(cx, cy, i * 1.2, 4));
        } else {
          this.enemyBullets.push(new EnemyBullet(cx, cy, 0, 3 + this.level * 0.2));
        }
      }
      if (e.type !== 'boss' && (e.x <= 0 || e.x + e.w >= W)) hitWall = true;
    });
    if (hitWall) {
      this.formationDir *= -1;
      this.enemies.forEach(e => { if (e.type !== 'boss') { e.vx *= -1; e.y += 12; } });
    }
  }

  checkCollisions() {
    this.bullets.forEach(b => {
      this.enemies.forEach(e => {
        if (!b.active || !rectHit(b, e)) return;
        b.active = false;
        if (e.hit()) {
          this.score += e.points;
          this.particles.emit(e.x + e.w/2, e.y + e.h/2, e.type === 'boss' ? 40 : 15);
          e.hp = -1;
          if (Math.random() < 0.2) this.powerups.push(new PowerUp(e.x + e.w/2, e.y + e.h/2));
        } else {
          this.particles.emit(e.x + e.w/2, e.y + e.h/2, 5);
        }
      });
    });
    this.bullets = this.bullets.filter(b => b.active);
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.enemyBullets.forEach(b => {
      if (rectHit(b, this.player)) { b.vy = 999; this.player.hit(); }
    });
    this.powerups.forEach(p => {
      if (rectHit(p, this.player)) { this.player.applyPowerup(p.type); p.active = false; }
    });
    this.powerups = this.powerups.filter(p => p.active !== false);
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.player.lives;
    document.getElementById('level').textContent = this.level;
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    this.stars.forEach(s => { ctx.fillStyle = `rgba(255,255,255,${s.s/3})`; ctx.fillRect(s.x, s.y, s.s, s.s); });
    this.powerups.forEach(p => p.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));
    this.bullets.forEach(b => b.draw(ctx));
    this.enemyBullets.forEach(b => b.draw(ctx));
    this.particles.draw(ctx);
    this.player.draw(ctx);
  }

  gameOver() {
    this.state = 'gameover';
    if (this.score > this.best) { this.best = this.score; localStorage.setItem('shooter-best', this.best); }
    const overlay = document.getElementById('overlay');
    document.getElementById('overlay-sub').textContent = `SCORE: ${this.score} | BEST: ${this.best}`;
    document.querySelector('#overlay h1').textContent = 'GAME OVER';
    overlay.classList.add('visible');
  }
}