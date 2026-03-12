class Enemy {
  constructor(x, y, type, level) {
    this.x = x; this.y = y;
    this.type = type; // 'A','B','C','boss'
    this.level = level;
    this.w = type === 'boss' ? 80 : 32;
    this.h = type === 'boss' ? 50 : 28;
    const hp = { A: 1, B: 2, C: 3, boss: 20 + level * 5 };
    this.hp = hp[type];
    this.maxHp = this.hp;
    this.shootTimer = randInt(60, 180);
    this.shootInterval = Math.max(30, 120 - level * 8);
    this.vx = 0; this.vy = 0;
    this.angle = 0;
    this.points = { A: 10, B: 20, C: 40, boss: 500 }[type];
  }

  update(dt, playerX, W) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += 0.04;
    if (this.type === 'boss') {
      if (this.x <= 0 || this.x + this.w >= W) this.vx *= -1;
    }
    this.shootTimer--;
    return this.shootTimer <= 0;
  }

  resetShootTimer() {
    this.shootTimer = this.shootInterval + randInt(0, 40);
  }

  hit(dmg = 1) {
    this.hp -= dmg;
    return this.hp <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    if (this.type !== 'boss') ctx.rotate(Math.sin(this.angle) * 0.1);
    const colors = { A: COLORS.enemyA, B: COLORS.enemyB, C: COLORS.enemyC, boss: COLORS.boss };
    ctx.fillStyle = colors[this.type];
    if (this.type === 'boss') {
      // draw boss shape
      ctx.beginPath();
      ctx.moveTo(0, -this.h/2);
      ctx.lineTo(this.w/2, 0);
      ctx.lineTo(this.w/3, this.h/2);
      ctx.lineTo(-this.w/3, this.h/2);
      ctx.lineTo(-this.w/2, 0);
      ctx.closePath();
      ctx.fill();
      // hp bar
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.w/2, -this.h/2 - 10, this.w, 6);
      ctx.fillStyle = '#f00';
      ctx.fillRect(-this.w/2, -this.h/2 - 10, this.w * (this.hp / this.maxHp), 6);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, this.h/2);
      ctx.lineTo(-this.w/2, -this.h/2);
      ctx.lineTo(0, -this.h/4);
      ctx.lineTo(this.w/2, -this.h/2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

class EnemyBullet {
  constructor(x, y, vx, vy) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.w = 4; this.h = 10;
    this.color = '#f88';
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; }
  offScreen(H) { return this.y > H + 20; }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.w/2, this.y, this.w, this.h);
  }
}