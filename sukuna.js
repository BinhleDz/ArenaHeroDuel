class SukunaSlash extends Projectile {
    constructor(x, y, facingRight, owner, isC1, isSlashUp) {
        let w = isC1 ? 180 : 120;
        let h = isC1 ? 100 : 60;
        // SỬA: Đánh thường giảm 2 dame (từ 15 xuống 13)
        super(x, y - h/4, facingRight ? 25 : -25, 0, w, h, 'transparent', owner, isC1 ? 0 : 13, true); 
        this.isC1 = isC1;
        this.isSlashUp = isSlashUp;
        this.facingRight = facingRight;
        this.timer = 10; 
        this.hitTargets = [];
    }
    update() {
        this.x += this.vx;
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        let scaleX = this.facingRight ? 1 : -1;
        let scaleY = this.isSlashUp ? -1 : 1;
        ctx.scale(scaleX, scaleY);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; 
        ctx.shadowBlur = this.isC1 ? 20 : 10; 
        ctx.shadowColor = '#ff0000'; 
        
        ctx.beginPath();
        ctx.moveTo(-this.width/2, -this.height/2);
        ctx.quadraticCurveTo(this.width/4, 0, -this.width/2, this.height/2);
        ctx.quadraticCurveTo(this.width/2, 0, -this.width/2, -this.height/2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-this.width/2 + 10, -this.height/4);
        ctx.quadraticCurveTo(this.width/4 - 10, 0, -this.width/2 + 10, this.height/4);
        ctx.quadraticCurveTo(this.width/2 - 20, 0, -this.width/2 + 10, -this.height/4);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return; // CHẶN SÁT THƯƠNG LÊN BẢN THÂN
        if (!this.hitTargets.includes(target)) {
            // SỬA: C1 gây 7 + 7% hp còn lại
            let dmg = this.isC1 ? (target.hp * 0.07 + 7) : this.damage;
            target.takeDamage(dmg);
            
            // THÊM MỚI: Đánh thường và C1 đều dính hiệu ứng bleed (1 dame/s trong 3s)
            target.addStatus('bleed', 'debuff', 'assets/icon/debuff/bleed.png', 180, 1, 60);

            if (this.isC1) {
                target.stunTimer = 30; 
                // THÊM MỚI: C1 dính thêm hiệu ứng xuyên giáp 10% trong 3s
                target.addStatus('arpenetration', 'debuff', 'assets/icon/debuff/arpenetration.png', 180, 10, 60);
                
                canvas.style.transform = `translate(${Math.random()*15-7.5}px, ${Math.random()*15-7.5}px) skewX(${(Math.random()-0.5)*10}deg)`;
                setTimeout(() => canvas.style.transform = 'none', 50);
            }
            this.hitTargets.push(target);
            for(let i=0; i< (this.isC1 ? 15 : 8); i++) {
                effects.push(new RockParticle(target.x+15, target.y+25, (Math.random()-0.5)*15, -Math.random()*10, '#8b0000'));
            }
        }
    }
}

class SukunaFireArrow extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y - 10, vx, 0, 80, 20, '#ff4500', owner, 26, false);
    }
    update() {
        this.x += this.vx;
        effects.push(new Explosion(this.x + (this.vx > 0 ? 0 : this.width), this.y + 10 + (Math.random()-0.5)*10, 8 + Math.random()*5, 'rgba(255, 69, 0, 0.7)'));
        if (this.x < -200 || this.x > canvas.width + 200) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        if (this.vx < 0) ctx.scale(-1, 1);
        
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 20; ctx.shadowColor = '#ffaa00';
        ctx.beginPath(); ctx.moveTo(-40, -5); ctx.lineTo(40, 0); ctx.lineTo(-40, 5); ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath(); ctx.moveTo(-30, -2); ctx.lineTo(30, 0); ctx.lineTo(-30, 2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return; // CHẶN SÁT THƯƠNG LÊN BẢN THÂN
        target.takeDamage(this.damage);
        target.stunTimer = 30; 
        this.active = false;
        effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 100, '#ff3300'));
        canvas.style.transform = `translate(${Math.random()*20-10}px, ${Math.random()*20-10}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
    }
}

class SukunaDomain extends Projectile {
    constructor(x, y, owner) {
        // SỬA: Giảm 1 dame của Domain (từ 4 xuống 3)
        super(x - 600, canvas.height - groundHeight - 1200, 0, 0, 1200, 1200, 'transparent', owner, 3, true);
        this.timer = 240; 
        this.hitCooldowns = new Map();
        this.centerX = x;
        this.centerY = canvas.height - groundHeight;
        effects.push(new Explosion(this.centerX, this.centerY, 800, 'rgba(0, 0, 0, 0.8)'));
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
        for (let [target, cd] of this.hitCooldowns) {
            if (cd > 0) this.hitCooldowns.set(target, cd - 1);
        }
        if (Math.random() < 0.8) {
            let randX = this.centerX + (Math.random() - 0.5) * 1200; // Phủ rộng 1200px
            let randY = this.centerY - Math.random() * 500;
            effects.push(new DecadeSwordSlashFX(randX, randY, 80, 80, Math.random() > 0.5)); 
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        let alpha = Math.min(0.5, this.timer / 30);
        ctx.fillStyle = `rgba(15, 0, 0, ${alpha})`;
        ctx.beginPath(); ctx.arc(this.centerX, this.centerY, 600, Math.PI, 0); ctx.fill();
        
        ctx.strokeStyle = `rgba(255, 0, 0, ${alpha + 0.2})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 10]);
        ctx.beginPath(); ctx.arc(this.centerX, this.centerY, 600, Math.PI, 0); ctx.stroke();
        
        ctx.fillStyle = `rgba(50, 0, 0, ${alpha})`;
        ctx.fillRect(this.centerX - 60, this.centerY - 100, 120, 100);
        ctx.fillStyle = `rgba(100, 0, 0, ${alpha})`;
        ctx.beginPath(); ctx.moveTo(this.centerX - 80, this.centerY - 100); ctx.lineTo(this.centerX + 80, this.centerY - 100); ctx.lineTo(this.centerX, this.centerY - 150); ctx.fill();
        
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return; // CHẶN TỰ SÁT THƯƠNG
        let cd = this.hitCooldowns.get(target) || 0;
        let dist = Math.hypot((target.x + target.width/2) - this.centerX, (target.y + target.height/2) - this.centerY);
        if (dist <= 600 && cd <= 0) { 
            target.takeDamage(this.damage);
            
            // THÊM MỚI: Mỗi lần nhận dame C3 sẽ bị làm chậm 25% trong 0.25s (15 frames)
            target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 15, 25, 60);

            this.hitCooldowns.set(target, 12); 
            effects.push(new RockParticle(target.x+15, target.y+25, (Math.random()-0.5)*8, -Math.random()*5, '#8b0000'));
        }
    }
}
