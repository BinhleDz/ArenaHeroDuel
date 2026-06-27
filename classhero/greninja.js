class NormalWaterShuriken extends Projectile {
    constructor(x, y, vx, vy, owner, damage) {
        super(x, y, vx, vy, 20, 20, '#00bfff', owner, damage, false);
        this.rotation = 0;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.4;
        if (Math.random() < 0.4) effects.push(new Explosion(this.x + 10, this.y + 10, 6, 'rgba(0, 191, 255, 0.5)'));
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 191, 255, 0.3)';
        for (let i = 0; i < this.trail.length; i++) {
            let t = this.trail[i];
            let size = (i / this.trail.length) * 10;
            ctx.beginPath();
            ctx.arc(t.x + 10, t.y + 10, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.translate(this.x + 10, this.y + 10);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ffff';
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(6, -3);
            ctx.lineTo(12, 0);
            ctx.lineTo(6, 3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        // --- THÊM ÂM THANH C1 HIT ---
        playSkillSound('assets/sounds/sound_skill/greninja/c1_hit.ogg');
    }
}

class WaterVortex extends Projectile {
    constructor(owner) {
        super(owner.x, owner.y, 0, 0, 140, 140, 'rgba(0, 150, 255, 0.4)', owner, 6, true);
        this.timer = 150;
        this.hitCooldowns = new Map();
    }

    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
        this.x = this.owner.x + this.owner.width / 2 - this.width / 2;
        this.y = this.owner.y + this.owner.height / 2 - this.height / 2;
        for (let [target, cd] of this.hitCooldowns) {
            if (cd > 0) this.hitCooldowns.set(target, cd - 1);
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.timer * 0.4);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00bfff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        let numShurikens = 6;
        for (let i = 0; i < numShurikens; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / numShurikens) * i + (this.timer * 0.1));
            ctx.translate(this.width / 2.5, 0);
            ctx.rotate(this.timer * 0.5);
            for (let j = 0; j < 4; j++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(8, -4);
                ctx.lineTo(16, 0);
                ctx.lineTo(8, 4);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    applyEffect(target) {
        let cd = this.hitCooldowns.get(target) || 0;
        if (cd <= 0) {
            target.takeDamage(this.damage);
            this.hitCooldowns.set(target, 15);
            effects.push(new Explosion(target.x + target.width / 2, target.y + target.height / 2, 15, 'rgba(0, 191, 255, 0.6)'));
            
            // --- THÊM ÂM THANH C2 HIT ---
            playSkillSound('assets/sounds/sound_skill/greninja/c2_hit.ogg');
        }
    }
}

class GiantWaterShuriken extends Projectile {
    constructor(x, y, vx, vy, owner, size, damage) {
        super(x, y, vx, vy, size, size, 'rgba(0, 200, 255, 0.8)', owner, damage, false);
        this.rotation = 0;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.3;
        if (Math.random() < 0.6) effects.push(new Explosion(this.x + this.width / 2, this.y + this.height / 2, 25, 'rgba(0, 150, 255, 0.4)'));
        if (this.x < -this.width || this.x > canvas.width + this.width || this.y < -this.height || this.y > canvas.height + this.height) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 200, 255, 0.2)';
        for (let i = 0; i < this.trail.length; i++) {
            let t = this.trail[i];
            let tsize = (i / this.trail.length) * (this.width / 3);
            ctx.beginPath();
            ctx.arc(t.x + this.width / 2, t.y + this.height / 2, tsize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ffff';
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.width / 4, -this.width / 8);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(this.width / 4, this.width / 8);
            ctx.closePath();
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ccffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    applyEffect(target) {
        target.takeDamage(this.damage);
        target.vx = this.vx > 0 ? 15 : -15;
        this.active = false;
        effects.push(new Explosion(this.x + this.width / 2, this.y + this.height / 2, this.width / 2.5, 'rgba(0, 255, 255, 0.8)'));
        
        // --- THÊM ÂM THANH C3 HIT ---
        playSkillSound('assets/sounds/sound_skill/greninja/c3_hit.ogg');
    }
}
class GreninjaWaterSlash extends Projectile {
    constructor(x, y, facingRight, owner) {
        // Hitbox rộng 150px, cao 100px. Sát thương 15, preserve = true để xuyên thấu không biến mất
        super(x, y, 0, 0, 150, 100, 'rgba(0, 191, 255, 0)', owner, 15, true);
        this.facingRight = facingRight;
        this.timer = 15; // Hoạt ảnh chém diễn ra trong 15 frames (~0.25s)
        this.maxTimer = 15;
        this.hitTargets = new Set(); // Dùng Set để đảm bảo mỗi địch chỉ ăn dame 1 lần cho 1 nhát chém
    }

    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
        
        // Cập nhật vị trí bám sát theo tay Greninja
        this.x = this.facingRight ? this.owner.x + this.owner.width : this.owner.x - this.width;
        this.y = this.owner.y - 20;

        // Tạo bọt nước li ti văng ra (Tối ưu: chỉ tạo 1 hạt mỗi frame để tránh lag)
        if (Math.random() < 0.7) {
            let pX = this.x + Math.random() * this.width;
            let pY = this.y + Math.random() * this.height;
            effects.push(new Explosion(pX, pY, 3 + Math.random() * 3, 'rgba(0, 255, 255, 0.6)'));
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        
        let progress = 1 - (this.timer / this.maxTimer); // Chạy từ 0 đến 1
        let cx = this.facingRight ? this.x : this.x + this.width;
        let cy = this.y + this.height / 2;

        ctx.translate(cx, cy);
        if (!this.facingRight) ctx.scale(-1, 1);

        // Hiệu ứng hình quạt
        let radius = 140 * progress; // Quạt nước lan rộng ra dần
        let startAngle = -Math.PI / 2.5; // Góc bắt đầu vung dao
        let endAngle = Math.PI / 2.5;    // Góc kết thúc

        // 1. Vệt chém nước chính (Màu xanh lam đậm)
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.lineWidth = 18 * (1 - progress); // Lưỡi dao mỏng dần khi kết thúc
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.9)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.stroke();

        // 2. Lưỡi dao phụ (Ánh sáng trắng chớp nhoáng giữa lưỡi nước)
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.85, startAngle, endAngle);
        ctx.lineWidth = 5 * (1 - progress);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 0; // Tắt glow để chống lag
        ctx.stroke();
        
        // 3. Màu nước loang bên trong (Nửa trong suốt)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 200, 255, ${0.4 * (1 - progress)})`;
        ctx.fill();

        ctx.restore();
    }

    applyEffect(target) {
        // Chỉ gây sát thương nếu mục tiêu chưa dính nhát chém này
        if (!this.hitTargets.has(target)) {
            target.takeDamage(this.damage);
            this.hitTargets.add(target);
            // Hiệu ứng chém trúng địch (Văng nước to)
            effects.push(new Explosion(target.x + target.width/2, target.y + target.height/2, 25, 'rgba(0, 255, 255, 0.8)'));
            // Đẩy lùi địch 1 chút xíu
            target.vx = this.facingRight ? 4 : -4;
        }
    }
}