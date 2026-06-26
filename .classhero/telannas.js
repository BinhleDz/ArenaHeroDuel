class TelAnnasBasicArrow extends Projectile {
    constructor(x, y, vx, owner, target) {
        // Tích hợp buff Strength từ C1 vào sát thương gốc (10)
        super(x, y, vx, 0, 40, 8, '#32cd32', owner, 10, false);
        this.target = target;
        this.baseSpeed = 25; // Tốc độ tên bay
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 6) this.trail.shift();

        // Auto Tracking (Aim 100%) nếu có mục tiêu
        if (this.target && !this.target.isDead) {
            let tx = this.target.x + this.target.width/2;
            let ty = this.target.y + this.target.height/2;
            let angle = Math.atan2(ty - (this.y + this.height/2), tx - (this.x + this.width/2));
            this.vx = Math.cos(angle) * this.baseSpeed;
            this.vy = Math.sin(angle) * this.baseSpeed;
        }

        this.x += this.vx; 
        this.y += this.vy;
        
        // Hiệu ứng ánh sáng tinh linh liti
        if (Math.random() < 0.4) {
            effects.push(new Explosion(this.x + Math.random()*this.width, this.y + 4, 3, '#adff2f'));
        }
        
        if(this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        let angle = Math.atan2(this.vy, this.vx);
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(angle);

        // Đuôi sáng
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#98fb98';
        ctx.fillRect(-this.width, -this.height/2, this.width, this.height);
        ctx.globalAlpha = 1.0;

        // Mũi tên xanh ngọc
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = '#00ff00';
        ctx.beginPath(); ctx.moveTo(-this.width/2, -3); ctx.lineTo(this.width/2, 0); ctx.lineTo(-this.width/2, 3); ctx.fill();
        ctx.fillStyle = '#ffffff'; // Lõi phát sáng
        ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(this.width/2, 0); ctx.lineTo(0, 1); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 20, '#32cd32'));
    }
}

class TelAnnasS2Arrow extends Projectile {
    constructor(x, y, vx, owner) {
        // Chiều cao 300px để quét rộng, xuyên thấu (preserve = true)
        super(x, y - 150, vx, 0, 40, 300, 'transparent', owner, 4, true); 
        this.hitTargets = [];
    }
    update() {
        this.x += this.vx;
        if(this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        let dir = this.vx > 0 ? 1 : -1;
        ctx.scale(dir, 1);
        
        ctx.shadowBlur = 15; ctx.shadowColor = '#32cd32';
        ctx.fillStyle = 'rgba(50, 205, 50, 0.8)';
        
        // Vẽ 3 mũi tên lớn bay song song
        let offsets = [-100, 0, 100];
        for(let offY of offsets) {
            ctx.beginPath();
            ctx.moveTo(-20, offY - 4);
            ctx.lineTo(20, offY);
            ctx.lineTo(-20, offY + 4);
            ctx.fill();
            // Vệt kéo dài
            ctx.fillStyle = 'rgba(152, 251, 152, 0.4)';
            ctx.fillRect(-60, offY - 2, 40, 4);
            ctx.fillStyle = 'rgba(50, 205, 50, 0.8)';
        }
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            // Kẻ địch bị slow 50% trong 2.5s
            target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 150, 50, 60);
            // Tel'Annas nhận +50% tốc chạy trong 3s
            this.owner.addStatus('hastesp', 'buff', 'assets/icon/buff/hastesp.png', 180, 50, 60);
            
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x + 15, target.y + 25, 40, '#00fa9a'));
        }
    }
}

class TelAnnasUltArrow extends Projectile {
    constructor(x, y, vx, owner) {
        // Chiều cao 125px
        super(x, y - 62.5, vx, 0, 150, 125, 'transparent', owner, 40, false);
    }
    update() {
        this.x += this.vx;
        // Vòng sóng siêu âm văng ra sau đuôi
        if (this.x % 3 === 0) {
            effects.push(new OvalShockwave(this.vx > 0 ? this.x : this.x + this.width, this.y + 62.5, this.vx > 0, '#adff2f'));
        }
        if(this.x < -300 || this.x > canvas.width + 300) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        let dir = this.vx > 0 ? 1 : -1;
        ctx.scale(dir, 1);
        
        // Mũi tên chói lóa
        let grad = ctx.createLinearGradient(-75, 0, 75, 0);
        grad.addColorStop(0, 'rgba(50, 205, 50, 0)');
        grad.addColorStop(0.5, '#32cd32');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.shadowBlur = 30; ctx.shadowColor = '#adff2f';
        ctx.beginPath();
        ctx.moveTo(-75, -20); ctx.lineTo(75, 0); ctx.lineTo(-75, 20); ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(-25, -5); ctx.lineTo(75, 0); ctx.lineTo(-25, 5); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        target.stunTimer = 60; // Choáng 1s
        target.vx = this.vx > 0 ? 30 : -30; // Đẩy lùi mạnh (Knockback)
        target.vy = -5;
        this.active = false;
        
        effects.push(new Explosion(target.x + 15, target.y + 25, 120, '#adff2f'));
        canvas.style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
    }
}