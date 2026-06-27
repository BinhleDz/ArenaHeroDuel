const playS = (name) => {
    const audio = new Audio(`assets/sounds/sound_skill/sans/${name}.ogg`);
    audio.play().catch(e => console.log("Audio error:", e));
};
class SansBone extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 30, 10, '#ffffff', owner, 5, false);
        this.rotation = 0;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) this.trail.shift();
        this.x += this.vx;
        this.rotation += 0.5 * Math.sign(this.vx);
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        for (let i = 0; i < this.trail.length; i++) {
            let t = this.trail[i];
            ctx.fillRect(t.x, t.y, this.width, this.height);
        }
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(-this.width / 2 + 4, -this.height / 2, this.width - 8, this.height);
        ctx.beginPath();
        ctx.arc(-this.width / 2 + 4, -this.height / 2 + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.width / 2 + 4, this.height / 2 - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.width / 2 - 4, -this.height / 2 + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.width / 2 - 4, this.height / 2 - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (!this.hitTargets) this.hitTargets = [];
        if (!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            playS('basic_hit'); // Âm thanh đánh thường trúng đích
        }
    }
}

class SansBoneWave extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 1, 1, 'transparent', owner, 0, true);
        this.spawnTimer = 0;
        this.startY = y;
    }

    update() {
        this.x += this.vx;
        this.spawnTimer++;
        if (this.spawnTimer >= 4) {
            this.spawnTimer = 0;
            projectiles.push(new SansBonePillar(this.x, this.startY, this.owner));
            playS('c1_summon'); // Mỗi cột xương mọc lên
        }
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }

    draw() {}
}

class SansBonePillar extends Projectile {
    constructor(x, y, owner) {
        super(x - 10, y - 80, 0, 0, 20, 80, '#ffffff', owner, 25, true);
        this.timer = 60;
        this.hitTargets = [];
    }

    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.timer / 15);
        let popUpY = this.y + Math.max(0, (15 - (60 - this.timer)) * 5);
        if (60 - this.timer > 15) popUpY = this.y;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(this.x, popUpY, this.width, this.height);
        ctx.beginPath();
        ctx.arc(this.x + 5, popUpY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 15, popUpY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    applyEffect(target) {
        if (!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            playS('c1_hit'); // Chiêu 1 trúng đích
        }
    }
}

class SansBoneCage extends Projectile {
    constructor(target, owner) {
        super(target.x + target.width / 2, target.y + target.height / 2, 0, 0, 200, 200, 'transparent', owner, 0, true);
        this.target = target;
        this.lockTimer = 120;
        this.prepTimer = 15;
        this.centerX = target.x + target.width / 2;
        this.centerY = target.y + target.height / 2;
        this.radius = 100;
        this.caughtTarget = false;
        playS('c2_cast'); // Khi dùng chiêu 2
    }

    update() {
        if (this.prepTimer > 0) {
            this.prepTimer--;
            if (this.prepTimer === 0) {
                let dx = (this.target.x + this.target.width / 2) - this.centerX;
                let dy = (this.target.y + this.target.height / 2) - this.centerY;
                let dist = Math.hypot(dx, dy);
                effects.push(new Explosion(this.centerX, this.centerY, 100, 'rgba(0, 255, 255, 0.5)'));
                canvas.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
                setTimeout(() => canvas.style.transform = 'none', 50);
                if (dist <= this.radius) {
                    this.caughtTarget = true;
                    playS('c2_hit'); // Chiêu 2 trúng đích (bắt được mục tiêu)
                } else {
                    this.caughtTarget = false;
                    this.active = false;
                }
            }
        } else {
            if (!this.caughtTarget) return;
            this.lockTimer--;
            if (this.lockTimer <= 0) this.active = false;
            let dx = (this.target.x + this.target.width / 2) - this.centerX;
            let dy = (this.target.y + this.target.height / 2) - this.centerY;
            let dist = Math.hypot(dx, dy);
            let targetRadius = Math.max(this.target.width, this.target.height) / 2;
            
            if (dist > this.radius - targetRadius) {
                let pull = this.radius - targetRadius;
                this.target.x = this.centerX + (dx / dist) * pull - this.target.width / 2;
                this.target.y = this.centerY + (dy / dist) * pull - this.target.height / 2;
                this.target.vx = 0;
                this.target.vy = 0;
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        if (this.prepTimer > 0) {
            let t = this.prepTimer / 15;
            let dist = 100 + t * 50;
            let tx = this.centerX;
            let ty = this.centerY;
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tx, ty, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(tx - 30, ty - dist, 60, 20);
            ctx.fillRect(tx - 25, ty - dist + 20, 10, 20);
            ctx.fillRect(tx - 5, ty - dist + 20, 10, 25);
            ctx.fillRect(tx + 15, ty - dist + 20, 10, 20);
            ctx.fillRect(tx - 30, ty + dist, 60, 20);
            ctx.fillRect(tx - 25, ty + dist - 20, 10, 20);
            ctx.fillRect(tx - 5, ty + dist - 25, 10, 25);
            ctx.fillRect(tx + 15, ty + dist - 20, 10, 20);
        } else {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fill();
            let shakeX = (Math.random() - 0.5) * 4;
            let shakeY = (Math.random() - 0.5) * 4;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.centerX + shakeX, this.centerY + shakeY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(this.centerX - 30, this.centerY - 20, 60, 40);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.centerX - 5, this.centerY - 5, 10, 10);
        }
        ctx.restore();
    }

    applyEffect(target) {}
}

class GasterBlaster extends Projectile {
    constructor(x, y, targetX, targetY, delay, owner) {
        super(x, y, 0, 0, 60, 60, '#ffffff', owner, 40, true);
        this.targetX = targetX;
        this.targetY = targetY;
        this.delay = delay;
        this.fireTimer = 0;
        this.state = 'charging';
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.hitTargets = [];
        playS('c3_cast'); // Khi dùng chiêu 3 (đang sạc)
    }

    update() {
        if (this.state === 'charging') {
            this.delay--;
            if (Math.random() < 0.4) {
                let px = this.x + (Math.random() - 0.5) * 120;
                let py = this.y + (Math.random() - 0.5) * 120;
                let a = Math.atan2(this.y - py, this.x - px);
                effects.push(new RockParticle(px, py, Math.cos(a) * 6, Math.sin(a) * 6, '#00ffff'));
            }
            if (this.delay <= 0) {
                this.state = 'firing';
                playS('c3_pank');
                this.fireTimer = 45;
                canvas.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
                setTimeout(() => canvas.style.transform = 'none', 100);
                if (Math.random() < 0.5) effects.push(new Explosion(this.x, this.y, 250, 'rgba(255, 255, 255, 0.4)'));
                
                // Thêm vòng Oval ngay miệng rồng, xoay đúng góc bắn của tia laser
                effects.push(new OvalShockwave(this.x, this.y, true, '#00ffff', this.angle));
            }
        } else if (this.state === 'firing') {
            this.fireTimer--;
            let checkLaserHit = (target) => {
                if (target === this.owner || target.isDead || this.hitTargets.includes(target)) return;
                let tx = target.x + target.width / 2;
                let ty = target.y + target.height / 2;
                let dx = tx - this.x;
                let dy = ty - this.y;
                let cosA = Math.cos(this.angle);
                let sinA = Math.sin(this.angle);
                let localX = dx * cosA + dy * sinA;
                let localY = -dx * sinA + dy * cosA;
                
                if (localX > 0 && localX < 2500 && Math.abs(localY) < 40 + Math.max(target.width, target.height) / 2) {
                    target.takeDamage(this.damage);
                    this.hitTargets.push(target);
                }
            };
            checkLaserHit(player1);
            checkLaserHit(player2);
            if (this.fireTimer <= 0) this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.state === 'charging') {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(-20, -20, 40, 40);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, -10, 8, 8);
            ctx.fillRect(0, 2, 8, 8);
            let intensity = 1 - (this.delay / 75);
            ctx.fillStyle = `rgba(0, 255, 255, ${intensity})`;
            ctx.beginPath();
            ctx.arc(4, -6, 4 + intensity * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(0, 255, 255, ${intensity})`;
            ctx.beginPath();
            ctx.arc(20, 0, intensity * 15, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'firing') {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(-20, -30, 40, 25);
            ctx.fillRect(-20, 5, 40, 25);
            let alpha = Math.min(1, this.fireTimer / 10);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(20, -30, 2500, 60);
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
            ctx.fillRect(20, -40, 2500, 80);
        }
        ctx.restore();
    }

    applyEffect(target) {
    }
}