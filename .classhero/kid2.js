class Kid2YellowBullet extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 16, 6, '#00bfff', owner, 15, false); // 15 Dame
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 6) this.trail.shift();
        super.update();
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#0055ff'; // Đã đổi từ vàng (#ffaa00) sang xanh dương
        for(let t of this.trail) ctx.fillRect(t.x, t.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15; ctx.shadowColor = '#00bfff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ffffff'; // Lõi trắng
        ctx.fillRect(this.x + (this.vx > 0 ? 10 : 0), this.y+1, 6, 4);
        ctx.restore();
    }
    applyEffect(target) {
        if (typeof playSkillSound === 'function') {
            playSkillSound('assets/sounds/sound_skill/kid2/basic_hit.ogg');
        }
        super.applyEffect(target);
    }
}

class Kid2RedSphere extends Projectile {
    constructor(x, y, vy, owner) {
        // Bắn hướng xuống dưới nên vx = 0
        super(x, y, 0, vy, 40, 40, '#ff0000', owner, 35, true); 
        this.exploded = false;
    }
    update() {
        if (this.exploded) return;
        this.y += this.vy;
        let enemy = this.owner === player1 ? player2 : player1;
        
        // Nổ khi chạm đất hoặc chạm địch
        if (this.y + this.height >= canvas.height - groundHeight || checkCollision(this, enemy)) {
            if (this.y + this.height >= canvas.height - groundHeight) {
                this.y = canvas.height - groundHeight - this.height;
            }
            this.explode();
        }
    }
    explode() {
        if (this.exploded) return;

        // THÊM DÒNG NÀY: Âm thanh nổ C2
        if (typeof playSkillSound === 'function') {
            playSkillSound('assets/sounds/sound_skill/kid2/c2_explosion.ogg'); 
        }

        this.exploded = true;
        this.active = false;
        
        // Nổ siêu to bán kính 230px
        effects.push(new Explosion(this.x + 20, this.y + 20, 230, 'rgba(255, 0, 0, 0.8)'));
        let enemy = this.owner === player1 ? player2 : player1;
        
        if (Math.hypot(enemy.x + enemy.width/2 - (this.x + 20), enemy.y + enemy.height/2 - (this.y + 20)) <= 230) {
            enemy.takeDamage(this.damage);
        }
        
        // Rung màn hình
        canvas.style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
    }
    applyEffect(target) {
        this.explode();
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 30; ctx.shadowColor = '#ff0000';
        ctx.beginPath(); ctx.arc(this.x + 20, this.y + 20, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffffff'; // Lõi trắng chói
        ctx.beginPath(); ctx.arc(this.x + 20, this.y + 20, 8, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

class Kid2SpinBullet extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 10, 10, '#00bfff', owner, 7, true); // Có bảo toàn (xuyên qua địch)
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 4) this.trail.shift();
        this.x += this.vx; this.y += this.vy;
        if(this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0,100,255,0.5)'; // Đã đổi đuôi từ vàng sang xanh dương
        for(let t of this.trail) {
            ctx.beginPath(); ctx.arc(t.x+5, t.y+5, 5, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00bfff';
        ctx.beginPath(); ctx.arc(this.x+5, this.y+5, 5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
    }
}