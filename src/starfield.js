class Starfield {
  constructor(W, H, count = 120) {
    this.W = W; this.H = H;
    this.layers = [
      Array.from({length: count/3}, () => ({ x: rand(0,W), y: rand(0,H), s: 0.5, v: 0.4, a: 0.4 })),
      Array.from({length: count/3}, () => ({ x: rand(0,W), y: rand(0,H), s: 1.0, v: 0.9, a: 0.6 })),
      Array.from({length: count/3}, () => ({ x: rand(0,W), y: rand(0,H), s: 1.8, v: 1.6, a: 0.9 }))
    ];
  }
  update() {
    this.layers.forEach(layer => {
      layer.forEach(s => {
        s.y += s.v;
        if (s.y > this.H) { s.y = 0; s.x = rand(0, this.W); }
      });
    });
  }
  draw(ctx) {
    this.layers.forEach(layer => {
      layer.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      });
    });
  }
}