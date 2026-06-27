// --- PROJECTILES & EFFECTS FOR YUMIELLA ---

class YumiellaDarkNeedle extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 15, 4, '#4b0082', owner, 10, false);
    }
    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    applyEffect(target) {
        let dmg = this.damage;
        let stacks = this.owner.getStatusValue('darkbuff');
        // Sát thương scale theo stack nội tại
        dmg *= (1 + stacks / 100);
        target.takeDamage(dmg);
        // Đã bỏ dòng cộng aura tại đây vì đã chuyển sang khi Cast chiêu
        this.active = false;
    }
}

class YumiellaDarkSphere extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 20, 20, '#1a0033', owner, 15, false);
    }
    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4b0082';
        ctx.beginPath(); ctx.arc(this.x + 10, this.y + 10, 10, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        let dmg = this.damage;
        let stacks = this.owner.getStatusValue('darkbuff');
        dmg *= (1 + stacks / 100);
        target.takeDamage(dmg);
        effects.push(new YumiellaDarkZone(target.x + target.width/2, target.y + target.height/2, this.owner));
        this.active = false;
    }
}

class YumiellaDarkZone {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.timer = 120;
        this.radius = 250;
        this.active = true;
    }
    update() {
        this.timer--;
        let enemy = (this.owner === player1) ? player2 : player1;
        let dx = (this.x) - (enemy.x + enemy.width/2);
        let dy = (this.y) - (enemy.y + enemy.height/2);
        let dist = Math.hypot(dx, dy);
        if (dist < this.radius && !enemy.isDead) {
            let pull = 4.5;
            enemy.vx += (dx / dist) * pull * 0.15;
            enemy.vy += (dy / dist) * pull * 0.15;
        }
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#4b0082';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

class YumiellaPurpleSmoke {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 5 + Math.random() * 10;
        this.life = 30;
        this.active = true;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.size *= 0.95;
        this.life--;
        if (this.life <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / 30;
        ctx.fillStyle = '#8a2be2';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

class YumiellaGroundSpike {
    constructor(x, y, owner) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.timer = 100; 
        this.active = true;
        this.state = 'emerging'; 
        this.speedY = 0;
        this.width = 30;
        this.height = 80;
        this.hasHit = false; // Flag để kiểm soát gây dame 1 lần duy nhất
    }
    update() {
        this.timer--;
        let enemy = (this.owner === player1) ? player2 : player1;

        if (this.state === 'emerging') {
            if (this.timer < 80) { 
                this.state = 'shooting';
                this.speedY = -35; 
            }
        } else {
            this.y += this.speedY;
        }

        // LOGIC VA CHẠM: Gây sát thương 1 lần duy nhất
        if (!this.hasHit && checkCollision({x: this.x - 15, y: this.y - 80, width: 30, height: 80}, enemy)) {
            let baseDmg = 20; // 20 sát thương mỗi kim
            let stacks = this.owner.getStatusValue('darkbuff');
            
            // Gây dame
            enemy.takeDamage(baseDmg * (1 + stacks / 100));
            
            // Chắc chắn cộng 1 điểm nội tại
            this.owner.addStatus('darkbuff', 'buff', 'assets/icon/buff/darkbuff.png', 'inf', stacks + 1, 60);
            
            this.hasHit = true; // Khóa gây dame cho cây kim này
        }

        if (this.timer <= 0 || this.y < -1000) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#1a0033';
        ctx.shadowBlur = 15; ctx.shadowColor = '#4b0082';
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x, this.y - 80);
        ctx.lineTo(this.x + 15, this.y);
        ctx.fill();
        ctx.restore();
    }
}