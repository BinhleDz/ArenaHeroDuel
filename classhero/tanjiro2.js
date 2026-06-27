class Tanjiro2BasicSlash extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 50, 60, 'transparent', owner, 11, false); 
        this.trail = [];
        this.life = 12; // Tồn tại 0.2s
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 6) this.trail.shift();
        this.x += this.vx;
        
        // TỐI ƯU HÓA: Giảm từ 3 hạt xuống 1 hạt sinh ra mỗi frame để đỡ ngốn RAM, hiệu ứng vẫn mượt
        effects.push(new FireParticle(this.x + Math.random()*this.width, this.y + Math.random()*this.height, (Math.random()-0.5)*2 + this.vx*0.2, -Math.random()*4, 4+Math.random()*4, 20, Math.random()>0.5 ? '#ffcc00' : '#ff3300'));
        
        this.life--;
        if(this.life <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        let dir = this.vx > 0 ? 1 : -1;
        
        // Motion Blur Trail
        for (let i=0; i<this.trail.length; i++) {
            let t = this.trail[i];
            let alpha = (i / this.trail.length) * 0.5;
            ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
            ctx.beginPath(); ctx.ellipse(t.x + 25, t.y + 30, 20, 30, 0, 0, Math.PI*2); ctx.fill();
        }

        ctx.translate(this.x + 25, this.y + 30);
        if (dir < 0) ctx.scale(-1, 1);

        // Chém liềm lửa (Thick to thin)
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff3300';
        ctx.fillStyle = '#ffaa00'; // Lõi vàng
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.quadraticCurveTo(30, 0, 0, 30);
        ctx.quadraticCurveTo(15, 0, -10, -30);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff'; // Sáng chói ngay mép kiếm
        ctx.beginPath(); ctx.moveTo(0, -25); ctx.quadraticCurveTo(20, 0, 0, 25); ctx.quadraticCurveTo(10, 0, -5, -25); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        target.burnTimer = 180; // Gây cháy 3 giây
        effects.push(new Explosion(target.x + 15, target.y + 25, 40, '#ff4500'));
        this.active = false;
    }
}

class Tanjiro2Tornado extends Projectile {
    constructor(x, y, owner) {
        super(x, y - 50, 0, 0, 80, 150, 'transparent', owner, 20, true);
        this.timer = 20; 
        this.hitTargets = [];
    }
    update() {
        this.x = this.owner.x + this.owner.width/2 - this.width/2;
        this.y = this.owner.y + this.owner.height/2 - this.height/2;
        this.timer--;
        if(this.timer <= 0) this.active = false;

        // TỐI ƯU HÓA: Giảm từ 4 xuống 2 hạt bắn ra mỗi frame
        for(let i=0; i<2; i++) {
            effects.push(new FireParticle(this.x + Math.random()*this.width, this.y + Math.random()*this.height, (Math.random()-0.5)*10, -Math.random()*8, 4+Math.random()*5, 25, '#ff3300'));
        }
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        let cx = this.x + this.width/2;
        
        // TỐI ƯU HÓA: Tắt shadowBlur bên trong vòng lặp for
        for (let i = 0; i < 6; i++) {
            let phase = (Date.now() / 50) + i * 1.5;
            let w = 40 + Math.sin(phase) * 15;
            let h = 15 + Math.cos(phase) * 5;
            let cy = this.y + this.height - (i * 25);
            
            ctx.fillStyle = (i%2===0) ? 'rgba(255, 170, 0, 0.8)' : 'rgba(255, 51, 0, 0.8)';
            ctx.beginPath(); ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#ffffff'; 
            ctx.beginPath(); ctx.ellipse(cx, cy, w*0.4, h*0.4, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            target.burnTimer = 180;
            this.hitTargets.push(target);
            canvas.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`;
            setTimeout(() => canvas.style.transform = 'none', 50);
        }
    }
}

class Tanjiro2FireWheelSlash extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y - 50, 0, 0, 100, 120, 'transparent', owner, 15, true);
        this.facingRight = facingRight;
        this.timer = 15;
        this.hitTargets = [];
        
        // Vừa tạo ra là bùng nổ lửa từ mặt đất
        effects.push(new OvalShockwave(this.x + 50, this.y + 120, this.facingRight, '#ff3300'));
        for(let i=0; i<20; i++) {
            effects.push(new FireParticle(this.x + Math.random()*100, this.y + 120, (Math.random()-0.5)*8, -10 - Math.random()*15, 6+Math.random()*8, 30, '#ffaa00'));
        }
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(this.x + 50, this.y + 60);
        if(!this.facingRight) ctx.scale(-1, 1);
        
        ctx.fillStyle = '#ffaa00'; ctx.shadowBlur = 30; ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(-20, -60);
        ctx.quadraticCurveTo(80, 0, -20, 60);
        ctx.quadraticCurveTo(40, 0, -50, -60);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(-15, -50); ctx.quadraticCurveTo(60, 0, -15, 50); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            target.stunTimer = 90; // Choáng 1.5s
            target.burnTimer = 180;
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x+15, target.y+25, 80, '#ff4500'));
            canvas.style.transform = `translate(${Math.random()*20-10}px, ${Math.random()*20-10}px)`;
            setTimeout(() => canvas.style.transform = 'none', 100);
        }
    }
}

class Tanjiro2FlameDance extends Projectile {
    constructor(x, y, facingRight, owner, isVertical) {
        let w = isVertical ? 60 : 120;
        let h = isVertical ? 120 : 60;
        super(x, y - (isVertical ? 40 : 0), 0, 0, w, h, 'transparent', owner, isVertical ? 20 : 15, true);
        this.facingRight = facingRight;
        this.isVertical = isVertical;
        this.timer = 12;
        this.hitTargets = [];
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
        
        // Sinh 1 hạt lửa thay vì 2 để giảm tải
        effects.push(new FireParticle(this.x + Math.random()*this.width, this.y + Math.random()*this.height, (Math.random()-0.5)*5, (Math.random()-0.5)*5, 4+Math.random()*5, 20, '#ff3300'));
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        ctx.fillStyle = '#ffaa00';
        // Vẫn giữ lại 1 bóng ở chiêu này vì nó chỉ vẽ 1 lần, không lặp
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        if (this.isVertical) {
            ctx.ellipse(0, 0, 20, 60, (this.facingRight ? 1 : -1) * Math.PI/8, 0, Math.PI*2);
        } else {
            ctx.ellipse(0, 0, 60, 20, (this.facingRight ? 1 : -1) * Math.PI/12, 0, Math.PI*2);
        }
        ctx.fill();
        
        ctx.shadowBlur = 0; // Tắt ngay bóng để tránh áp dụng lên lõi trắng
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (this.isVertical) ctx.ellipse(0, 0, 5, 50, (this.facingRight ? 1 : -1) * Math.PI/8, 0, Math.PI*2);
        else ctx.ellipse(0, 0, 50, 5, (this.facingRight ? 1 : -1) * Math.PI/12, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            target.burnTimer = 180;
            if(this.isVertical) target.stunTimer = 60; 
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x+15, target.y+25, 60, '#ffaa00'));
        }
    }
}
class Tanjiro2Afterimage {
    constructor(x, y, w, h, facingRight, life) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.facingRight = facingRight;
        this.life = life; this.maxLife = life; this.active = true;
    }
    update() {
        this.life--;
        if (this.life <= 0) this.active = false;
        // Tàn lửa bay ra từ ảo ảnh
        if (Math.random() < 0.4) {
            effects.push(new FireParticle(this.x + Math.random()*this.w, this.y + Math.random()*this.h, (Math.random()-0.5)*2, -Math.random()*3, 3+Math.random()*3, 15, '#ff4500'));
        }
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (this.life / this.maxLife) * 0.5;
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(this.x, this.y, this.w, this.h); // Vẽ body đỏ mờ
        ctx.restore();
    }
}