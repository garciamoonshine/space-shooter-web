const POWERUP_TYPES = ['shield', 'rapidFire', 'multiShot', 'bomb'];

class PowerUp {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.type = POWERUP_TYPES[randInt(0, POWERUP_TYPES.length - 1)];
    this.w = 22; this.h = 22;
    this.vy = 2;
    this.angle = 0;
    this.active = true;
  }
  update() {
    this.y += this.vy;
    this.angle += 0.05;
  }
  offScreen(H) { return this.y > H + 30; }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    ctx.rotate(this.angle);
    const color = COLORS.powerup[this.type];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(-this.w/2, -this.h/2, this.w, this.h);
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { shield: 'S', rapidFire: 'R', multiShot: 'M', bomb: 'B' };
    ctx.fillText(icons[this.type], 0, 0);
    ctx.restore();
  }
}