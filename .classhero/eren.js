// =======================================================
// CÁC LỚP KỸ NĂNG VÀ HIỆU ỨNG CỦA EREN YEAGER (ĐÃ CẬP NHẬT)
// =======================================================

// 1. ErenSlashArc: Nửa vòng tròn chém chấn động dưới đất (Chiêu 2 dạng Người)
class ErenSlashArc {
    constructor(x, y, radius, facingRight) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.facingRight = facingRight;
        this.timer = 15;
        this.active = true;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.timer / 15;
        ctx.strokeStyle = "rgba(255, 69, 0, 0.8)"; 
        ctx.lineWidth = 6;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff4500";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI, false);
        ctx.stroke();
        ctx.restore();
    }
}

// 2. ErenTitanLightning: Sấm sét đánh liên tục khi hóa Titan (Chiêu 3 Channeling)
class ErenTitanLightning {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.timer = 15;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.strokeStyle = "#ffeb3b"; 
        ctx.lineWidth = 4 + Math.random() * 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffeb3b";
        
        ctx.beginPath();
        ctx.moveTo(this.x, 0); 
        let curX = this.x;
        let curY = 0;
        while (curY < this.y) {
            curY += 20 + Math.random() * 15;
            curX += (Math.random() - 0.5) * 35;
            ctx.lineTo(curX, curY);
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
    }
}

// 3. ErenBoulder: Tảng đá khổng lồ 300x300 ném thẳng từ trên vai tới địch (Titan Chiêu 1)
class ErenBoulder {
    constructor(x, y, vx, vy, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 300;
        this.height = 300;
        this.owner = owner;
        this.damage = 35;
        this.active = true;
        this.hitTargets = [];
        this.preserve = true; // Bảo toàn sát thương không trúng người ném
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.25; 

        if (this.y + 150 > canvas.height - groundHeight) {
            this.active = false;
            effects.push(new Explosion(this.x + 150, this.y + 150, 150, "#8b4513"));
            for (let i = 0; i < 15; i++) {
                effects.push(new RockParticle(this.x + 150, this.y + 150, (Math.random() - 0.5) * 15, -Math.random() * 10, "#555"));
            }
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = "#5c4033"; 
        ctx.strokeStyle = "#2b1d0c";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.x + 150, this.y + 150, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#1a1005";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 60, this.y + 80);
        ctx.lineTo(this.x + 240, this.y + 220);
        ctx.moveTo(this.x + 240, this.y + 60);
        ctx.lineTo(this.x + 60, this.y + 240);
        ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        if (this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 150, this.y + 150, 180, "#8b4513"));
    }
}

// 4. ErenTitanSpike: Sóng gai đất Warden 2 hướng trước sau cùng lúc (Titan Chiêu 2)
class ErenTitanSpike {
    constructor(x, y, dir, owner) {
        this.x = x;
        this.y = y;
        this.dir = dir; 
        this.height = 160;
        this.width = 267;
        this.owner = owner;
        this.damage = 45;
        this.active = true;
        this.hitTargets = [];
        this.preserve = true; // Bảo toàn sát thương không trúng người ném

        this.elapsedTicks = 0;
        this.ticksPerFrame = 3;
        this.totalFrames = 7;
        this.maxLife = this.totalFrames * this.ticksPerFrame;

        this.spritePath = 'assets/skill_effect/warden/c2_warden.png';
        if (!skillImagesCache[this.spritePath]) {
            skillImagesCache[this.spritePath] = new Image();
            skillImagesCache[this.spritePath].src = this.spritePath;
        }
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
            ctx.save();
            ctx.fillStyle = "rgba(139, 69, 19, 0.8)";
            ctx.strokeStyle = "#ff4500";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
    applyEffect(target) {
        if (this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);
        target.takeDamage(this.damage);
        target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 45, 0, 60);
    }
}

// 5. ErenSonicWave: Sóng âm gầm rú tàn phá thẳng tới (Titan Chiêu 3)
class ErenSonicWave {
    constructor(x, y, vx, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = 0;
        this.width = 150;
        this.height = 150;
        this.owner = owner;
        this.damage = 35;
        this.active = true;
        this.timer = 60; 
        this.hitTargets = [];
        this.preserve = true; // Bảo toàn sát thương không trúng người ném
    }
    update() {
        this.x += this.vx;
        this.timer--;
        if (this.timer <= 0) this.active = false;

        effects.push(new OvalShockwave(this.x + 75, this.y + 75, this.vx > 0, '#ff4500', 0, {
            radiusY: 45,
            radiusX: 10,
            growthY: 10,
            growthX: 4,
            maxTimer: 15,
            lineWidth: 3
        }));
    }
    draw() {
        ctx.save();
        ctx.fillStyle = "rgba(255, 69, 0, 0.25)";
        ctx.beginPath();
        ctx.arc(this.x + 75, this.y + 75, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);
        target.takeDamage(this.damage);
        target.vx = (this.vx > 0 ? 1 : -1) * 22; 
    }
}