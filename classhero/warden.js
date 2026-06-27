class WardenSoundParticle {
    constructor(startX, startY, targetPlayer) {
        this.x = startX;
        this.y = startY;
        this.target = targetPlayer;
        this.speed = 2;
        this.active = true;
    }
    update() {
        if (!this.target || this.target.isDead) {
            this.active = false;
            return;
        }
        let tx = this.target.x + this.target.width / 2;
        let ty = this.target.y + this.target.height / 2;
        let dx = tx - this.x;
        let dy = ty - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist < 15) {
            // Nhận 75% tốc chạy trong 3.5s (210 frames)
            this.target.addStatus('hastesp', 'buff', 'assets/icon/buff/hastesp.png', 210, 75, 60);
            // Giảm 1s hồi chiêu 3 (60 frames)
            this.target.cds.c3 = Math.max(0, this.target.cds.c3 - 60);
            
            this.active = false;
        } else {
            this.speed += 0.4;
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#00ffcc';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#003333';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5 + Math.sin(Date.now() / 80) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class WardenEarthSpike {
    constructor(x, y, dir, owner) {
        this.x = x;
        this.y = y;
        this.dir = dir; // Hướng mặt: 1 (phải), -1 (trái)
        this.height = 160; // Giữ nguyên chiều cao cũ
        this.width = 267;  // Cập nhật chiều rộng theo tỉ lệ mới (558/334) của khung hình
        this.owner = owner;
        this.damage = 45; // Sát thương mỗi đợt gai
        this.active = true;
        
        this.elapsedTicks = 0;
        this.ticksPerFrame = 3; 
        this.totalFrames = 7;   
        this.maxLife = this.totalFrames * this.ticksPerFrame; 
        this.hitTargets = [];   

        this.spritePath = 'assets/skill_effect/warden/c2_warden.png';
        if (!skillImagesCache[this.spritePath]) {
            skillImagesCache[this.spritePath] = new Image();
            skillImagesCache[this.spritePath].src = this.spritePath;
        }

        // Rung nhẹ màn hình khi mỗi đợt gai mọc lên
        canvas.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 4}px)`;
        setTimeout(() => canvas.style.transform = 'none', 80);
    }
    update() {
        this.elapsedTicks++;
        if (this.elapsedTicks >= this.maxLife) {
            this.active = false;
        }
    }
    draw() {
        let img = skillImagesCache[this.spritePath];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();

            let frameIndex = Math.floor(this.elapsedTicks / this.ticksPerFrame);
            if (frameIndex >= this.totalFrames) frameIndex = this.totalFrames - 1;

            // Cập nhật toạ độ cắt ảnh theo kích thước 558x334 mới
            let sx = frameIndex * 558; 
            let sy = 0;
            let sw = 558;
            let sh = 334;

            if (this.dir === -1) {
                ctx.translate(this.x + this.width / 2, this.y + 25 + this.height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(img, sx, sy, sw, sh, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.drawImage(img, sx, sy, sw, sh, this.x, this.y + 25, this.width, this.height);
            }

            ctx.restore();
        } else {
            ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1.5;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    applyEffect(target) {
        if (this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);

        target.takeDamage(this.damage);
        target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 45, 0, 60); 
    }
}

class WardenSonicBoom {
    constructor(x, y, vx, vy, angle, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.angle = angle;
        this.width = 400; // Hitbox bán kính 200px -> Kích thước 400x400
        this.height = 400;
        this.owner = owner;
        this.damage = 50;
        this.active = true;
        this.timer = 40;
        this.preserve = true;
        this.hitTargets = []; 
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.timer--;
        if (this.timer <= 0) {
            this.active = false;
        }
        // Tạo các Oval nối liền có kích thước gấp đôi để khớp hoàn hảo với hitbox 400x400
        effects.push(new OvalShockwave(this.x + 200, this.y + 200, true, '#00ffcc', this.angle, {
            radiusY: 15,    // Kích thước dọc ban đầu
            radiusX: 5,     // Kích thước ngang ban đầu
            growthY: 13,    // Lan tỏa cực rộng theo chiều dọc (đầu sóng âm)
            growthX: 5,     // Lan tỏa vừa phải theo chiều ngang
            maxTimer: 20,   // Tăng thời gian tồn tại của hạt sóng âm lên 20 frames
            lineWidth: 4    // Nét sóng âm dày dặn hơn
        }));
    }
    draw() {
        // Vẽ thông qua các Oval nối liền sinh ra ở hàm update()
    }
    applyEffect(target) {
        if (this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);

        target.takeDamage(this.damage);
    }
}