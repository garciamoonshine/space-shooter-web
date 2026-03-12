class Bullet {
  constructor(x, y, vy = -BULLET_SPEED, color = COLORS.bullet) {
    this.x = x; this.y = y;
    this.vy = vy; this.vx = 0;
    this.w = 4; this.h = 14;
    this.color = color;
    this.active = true;
  }
  update() { this.y += this.vy; this.x += this.vx; }
  offScreen() { return this.y < -20 || this.y > 700; }
  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.w/2, this.y - this.h, this.w, this.h);
    ctx.restore();
  }
}