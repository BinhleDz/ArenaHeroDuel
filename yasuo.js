class YasuoBasicSlash extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y, 0, 0, 70, 50, 'transparent', owner, 7, true);
        this.facingRight = facingRight;
        this.timer = 8; 
        this.hitTargets = [];
    }
    update() {
        this.x = this.owner.x + (this.facingRight ? this.owner.width : -this.width);
        this.y = this.owner.y;
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        if(this.facingRight) {
            ctx.arc(this.x, this.y + 25, 40, -Math.PI/2, Math.PI/2);
        } else {
            ctx.arc(this.x + this.width, this.y + 25, 40, Math.PI/2, Math.PI*1.5);
        }
        ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x + 15, target.y + 25, 20, '#ffffff'));
        }
    }
}

class YasuoSteelTempest extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y, 0, 0, 100, 20, 'transparent', owner, 10, true);
        this.facingRight = facingRight;
        this.timer = 10; 
        this.hitTargets = [];
    }
    update() {
        this.x = this.owner.x + (this.facingRight ? this.owner.width : -this.width);
        this.y = this.owner.y + 15;
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + (this.facingRight ? 0 : this.width), this.y + 10);
        if (!this.facingRight) ctx.scale(-1, 1);
        
        ctx.fillStyle = '#87ceeb';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00bfff';
        ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(100, 0); ctx.lineTo(0, 5); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(80, 0); ctx.lineTo(0, 2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x + 15, target.y + 25, 25, '#87ceeb'));
            // Tích stack Q nếu trúng
            if (this.owner.yasuoQStacks < 2) {
                this.owner.yasuoQStacks++;
                effects.push(new DamageText(this.owner.x, this.owner.y - 20, "TÍCH GIÓ!", '#87ceeb'));
            }
        }
    }
}

class YasuoTornado extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 80, 120, 'transparent', owner, 17, true);
        this.timer = 180; 
        this.hitTargets = [];
    }
    update() {
        this.x += this.vx;
        this.timer--;
        if(this.timer <= 0 || this.x < -200 || this.x > canvas.width + 200) this.active = false;
        
        if (Math.random() < 0.5) {
            effects.push(new RockParticle(this.x + Math.random()*this.width, this.y + this.height, (Math.random()-0.5)*5, -Math.random()*5, '#aaaaaa'));
        }
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height);
        
        ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
        ctx.shadowBlur = 20; ctx.shadowColor = '#87ceeb';
        
        let shift = Math.sin(Date.now() / 50) * 10;
        ctx.beginPath();
        ctx.ellipse(shift, -20, 40, 10, 0, 0, Math.PI*2);
        ctx.ellipse(-shift, -60, 30, 8, 0, 0, Math.PI*2);
        ctx.ellipse(shift, -100, 15, 5, 0, 0, Math.PI*2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-30+shift, -20); ctx.lineTo(30-shift, -60); ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            
            // CHỈNH SỬA TẠI ĐÂY: Tăng lực hất tung để đạt độ cao ~500px
            target.vy = -22.5; 
            target.onGround = false;
            
            // CHỈNH SỬA TẠI ĐÂY: Tăng thời gian choáng lên 90 frames (1.5s) để khớp với thời gian bay
            target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 90, 0, 60); 
            
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x + 15, target.y + 25, 60, '#87ceeb'));
        }
    }
}

class YasuoWindWall extends Projectile {
    constructor(x, y, owner) {
        super(x, y - 70, 0, 0, 40, 140, 'transparent', owner, 0, true);
        this.timer = 180; // 3 giây
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
        
        // Chặn và xóa đạn của địch
        for(let p of projectiles) {
            if(p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                p.active = false;
                effects.push(new Explosion(p.x + p.width/2, p.y + p.height/2, 15, '#87ceeb'));
                for(let i=0; i<3; i++) effects.push(new BubbleParticle(p.x, p.y, (Math.random()-0.5)*5, -Math.random()*5)); // Văng gió
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.timer / 20);
        ctx.fillStyle = 'rgba(135, 206, 235, 0.4)';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00bfff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Hiệu ứng luồng gió thổi lên
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 2;
        let windY1 = this.y + (Date.now() % 140);
        let windY2 = this.y + ((Date.now() + 70) % 140);
        ctx.beginPath(); ctx.moveTo(this.x + 10, windY1); ctx.lineTo(this.x + 10, windY1 - 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.x + 30, windY2); ctx.lineTo(this.x + 30, windY2 - 20); ctx.stroke();
        ctx.restore();
    }
    applyEffect() {} // Tường gió không gây sát thương
}