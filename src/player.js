class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 32; this.h = 36;
    this.speed = PLAYER_SPEED;
    this.lives = 3;
    this.shield = false;
    this.shieldTimer = 0;
    this.rapidFire = false;
    this.rapidTimer = 0;
    this.multiShot = false;
    this.multiTimer = 0;
    this.bombs = 1;
    this.invincible = false;
    this.invTimer = 0;
    this.thrustAnim = 0;
    this.vx = 0;
  }

  update(keys, W) {
    if (keys['ArrowLeft'] || keys['KeyA']) this.vx = -this.speed;
    else if (keys['ArrowRight'] || keys['KeyD']) this.vx = this.speed;
    else this.vx = 0;
    this.x = clamp(this.x + this.vx, 0, W - this.w);
    this.thrustAnim = (this.thrustAnim + 0.3) % (Math.PI * 2);
    if (this.shieldTimer > 0 && --this.shieldTimer === 0) this.shield = false;
    if (this.rapidTimer > 0 && --this.rapidTimer === 0) this.rapidFire = false;
    if (this.multiTimer > 0 && --this.multiTimer === 0) this.multiShot = false;
    if (this.invTimer > 0) { this.invTimer--; this.invincible = this.invTimer > 0; }
  }

  hit() {
    if (this.invincible || this.shield) { this.shield = false; this.shieldTimer = 0; return false; }
    this.lives--;
    this.invincible = true;
    this.invTimer = 120;
    return true;
  }

  applyPowerup(type) {
    if (type === 'shield') { this.shield = true; this.shieldTimer = 300; }
    if (type === 'rapidFire') { this.rapidFire = true; this.rapidTimer = 300; }
    if (type === 'multiShot') { this.multiShot = true; this.multiTimer = 300; }
    if (type === 'bomb') { this.bombs = Math.min(this.bombs + 1, 3); }
  }

  draw(ctx) {
    if (this.invincible && Math.floor(this.invTimer / 6) % 2 === 0) return;
    ctx.save();
    // thrust flame
    const flameH = 10 + Math.sin(this.thrustAnim) * 6;
    const grad = ctx.createLinearGradient(this.x + this.w/2, this.y + this.h, this.x + this.w/2, this.y + this.h + flameH);
    grad.addColorStop(0, '#ff8c00'); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(this.x + this.w/2 - 5, this.y + this.h, 10, flameH);
    // ship body
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(this.x + this.w/2, this.y);
    ctx.lineTo(this.x + this.w, this.y + this.h);
    ctx.lineTo(this.x + this.w * 0.7, this.y + this.h * 0.75);
    ctx.lineTo(this.x + this.w * 0.3, this.y + this.h * 0.75);
    ctx.lineTo(this.x, this.y + this.h);
    ctx.closePath();
    ctx.fill();
    // shield bubble
    if (this.shield) {
      ctx.strokeStyle = 'rgba(0,255,255,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
  }

  getBulletOrigins() {
    const cx = this.x + this.w / 2;
    if (this.multiShot) return [cx - 12, cx, cx + 12].map(x => ({ x, y: this.y }));
    return [{ x: cx, y: this.y }];
  }
}