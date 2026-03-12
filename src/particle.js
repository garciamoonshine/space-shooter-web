class Particle {
  constructor(x, y, color) {
    this.reset(x, y, color);
  }
  reset(x, y, color) {
    this.x = x; this.y = y;
    this.color = color || COLORS.particle[randInt(0, COLORS.particle.length - 1)];
    const angle = rand(0, Math.PI * 2);
    const speed = rand(1, 5);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = rand(0.02, 0.06);
    this.size = rand(2, 6);
    this.active = true;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life -= this.decay;
    this.vx *= 0.98;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() { this.pool = []; }
  emit(x, y, count = 12, color) {
    for (let i = 0; i < count; i++) {
      const dead = this.pool.find(p => !p.active);
      if (dead) dead.reset(x, y, color);
      else this.pool.push(new Particle(x, y, color));
    }
  }
  update() { this.pool.forEach(p => p.active && p.update()); }
  draw(ctx) { this.pool.forEach(p => p.active && p.draw(ctx)); }
}