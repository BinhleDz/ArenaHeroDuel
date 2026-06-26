class SakuraParticle {
    constructor(x, y, isRaining = false) {
        this.x = x; 
        this.y = y;
        this.vx = isRaining ? (1 + Math.random() * 2) : (Math.random() - 0.5) * 4; 
        this.vy = isRaining ? (1 + Math.random() * 2) : (Math.random() - 0.5) * 4;
        this.size = 3 + Math.random() * 3;
        this.life = isRaining ? 300 : 30 + Math.random() * 20;
        this.maxLife = this.life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.active = true;
        this.isRaining = isRaining;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        
        // Hiệu ứng bay lượn nhẹ
        if (this.isRaining) {
            this.x += Math.sin(Date.now() / 500 + this.y) * 1; 
        }

        this.life--;
        if (this.life <= 0 || (this.isRaining && this.y > canvas.height - 50)) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#ffb7c5';
        ctx.shadowBlur = 5; ctx.shadowColor = '#ff69b4';
        // Vẽ cánh hoa giọt nước
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size, -this.size, this.size, this.size);
        ctx.quadraticCurveTo(0, this.size * 0.5, -this.size, this.size);
        ctx.quadraticCurveTo(-this.size, -this.size, 0, -this.size);
        ctx.fill();
        ctx.restore();
    }
}

class MahiruPetalBullet extends Projectile {
    constructor(x, y, vx, vy, owner, isHoming = false, target = null) {
        super(x, y, vx, vy, 12, 12, '#ffb7c5', owner, Math.floor(isHoming ? 3 : 6), false);
        this.rotation = Math.atan2(vy, vx);
        this.life = 90; // Tồn tại 1,5 giây
        this.isHoming = isHoming;
        this.target = target;
    }
    update() {
        this.life--;
        if (this.life <= 0) this.active = false;

        if (this.isHoming && this.target && !this.target.isDead) {
            // Bay lệch nhẹ nhưng hướng về mục tiêu (Aim bot nhẹ)
            let tx = this.target.x + this.target.width/2;
            let ty = this.target.y + this.target.height/2;
            let angleToTarget = Math.atan2(ty - this.y, tx - this.x);
            let currentAngle = Math.atan2(this.vy, this.vx);
            
            // Nội suy góc quay
            let diff = angleToTarget - currentAngle;
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            currentAngle += diff * 0.05; // Bẻ lái 5% mỗi frame
            let speed = Math.hypot(this.vx, this.vy);
            this.vx = Math.cos(currentAngle) * speed;
            this.vy = Math.sin(currentAngle) * speed;
            this.rotation = currentAngle;
        } else {
            // Đánh thường Dạng 1: Nhanh rồi chậm dần
            this.vx *= 0.96;
            this.vy *= 0.96;
        }
        
        this.x += this.vx;
        this.y += this.vy;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.life / 30); // Mờ dần khi sắp biến mất
        ctx.translate(this.x + 6, this.y + 6);
        ctx.rotate(this.rotation + Math.PI/2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8; ctx.shadowColor = '#ff1493';
        // Vẽ cánh hoa cong lõm đầu
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(6, -2, 6, 4);
        ctx.quadraticCurveTo(2, 8, 0, 4); // Lõm ở đít
        ctx.quadraticCurveTo(-2, 8, -6, 4);
        ctx.quadraticCurveTo(-6, -2, 0, -8);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        for(let i=0; i<3; i++) effects.push(new SakuraParticle(this.x, this.y));
    }
}

class MahiruBigFlower extends Projectile {
    constructor(x, y, vx, owner, isUltimate = false) {
        super(x, y, vx, 0, isUltimate ? 40 : 25, isUltimate ? 40 : 25, '#ff69b4', owner, isUltimate ? 0 : 11, false);
        this.rotation = 0;
        this.isUltimate = isUltimate;
    }
    update() {
        this.x += this.vx;
        this.rotation += this.vx * 0.05;
        if (Math.random() < 0.3) effects.push(new SakuraParticle(this.x + this.width/2, this.y + this.height/2));
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#ffb7c5';
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff1493';
        // Vẽ 5 cánh hoa lớn
        for(let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(0, -this.width/2.5, this.width/4, this.width/2, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.rotate((Math.PI * 2) / 5);
        }
        ctx.fillStyle = '#ffffaa'; // Nhụy hoa
        ctx.beginPath(); ctx.arc(0, 0, this.width/5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (this.isUltimate) {
            target.takeDamage(35); // Burst damage của Ultimate
            target.stunTimer = 60; // Cứng ngắc 1s
            canvas.style.transform = `translate(${Math.random()*15 - 7.5}px, ${Math.random()*15 - 7.5}px)`;
            setTimeout(() => canvas.style.transform = 'none', 100);
            
            // Nổ mưa anh đào cục bộ
            for(let i=0; i<30; i++) {
                let sp = new SakuraParticle(this.x + this.width/2, this.y + this.height/2);
                sp.vx = (Math.random() - 0.5) * 15;
                sp.vy = (Math.random() - 0.5) * 15;
                effects.push(sp);
            }
        } else {
            target.takeDamage(this.damage);
            // Hiệu ứng nổ ra 5 cánh hoa (chỉ là visual)
            for(let i=0; i<5; i++) effects.push(new SakuraParticle(this.x + this.width/2, this.y + this.height/2));
        }
        this.active = false;
        effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, this.isUltimate ? 80 : 40, 'rgba(255, 183, 197, 0.8)'));
    }
}

class MahiruShieldFX extends Projectile {
    constructor(owner) {
        super(owner.x, owner.y, 0, 0, 60, 60, 'transparent', owner, 0, true);
        this.timer = 150; // 2.5s
        this.rotation = 0;
    }
    update() {
        this.x = this.owner.x + this.owner.width/2 - this.width/2;
        this.y = this.owner.y + this.owner.height/2 - this.height/2;
        this.timer--;
        this.rotation += 0.2;
        
        // Clear đạn địch chạm vào (Hiệu ứng "vết cắt" chém bay đạn)
        for (let p of projectiles) {
            if (p.owner !== this.owner && p.active && !p.preserve && checkCollision(this, p)) {
                p.active = false;
                effects.push(new Explosion(p.x, p.y, 15, '#ffb7c5'));
                for(let i=0; i<3; i++) effects.push(new SakuraParticle(p.x, p.y));
            }
        }
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = '#ffb7c5';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff69b4';
        
        // Vẽ 3 quỹ đạo xoáy
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI);
            ctx.stroke();
            
            // Vẽ 1 cánh hoa đang bay trên quỹ đạo
            ctx.fillStyle = '#ffb7c5';
            ctx.beginPath(); ctx.ellipse(45, 0, 8, 4, 0, 0, Math.PI*2); ctx.fill();
            
            ctx.rotate((Math.PI * 2) / 3);
        }
        ctx.restore();
    }
    applyEffect() {} // C2 Không gây sát thương trực tiếp
}