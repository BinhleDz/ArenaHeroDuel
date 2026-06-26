// --- CÁC CLASS KỸ NĂNG CỦA SHADOW PEASHOOTER ---

class ShadowPeaBullet {
    constructor(x, y, vx, owner) {
        this.x = x; this.y = y; this.vx = vx; this.vy = 0;
        this.width = 15; this.height = 15;
        this.color = '#4b0082'; // Tím đậm
        this.owner = owner;
        this.damage = 8 + (owner.hasStatus('strength') ? owner.getStatusValue('strength') : 0);
        this.active = true;
    }
    update() {
        this.x += this.vx;
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = '#8a2be2';
        ctx.beginPath(); ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.triggerVamp();
        effects.push(new Explosion(this.x, this.y, 25, '#8a2be2'));
        this.active = false;
    }
    triggerVamp() {
        if (this.owner.hasStatus('vamp')) {
            let vampAmount = this.owner.getStatusValue('vamp');
            this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + vampAmount);
            effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, `+${vampAmount}`, '#00ff00'));
        }
    }
}

class ShadowBomb {
    constructor(x, y, targetX, targetY, owner, isDarkForm) {
        this.x = x; this.y = y;
        this.targetX = targetX; this.targetY = targetY;
        this.owner = owner;
        this.isDarkForm = isDarkForm;

        // Tính toán hướng bay tới vị trí địch lúc tung chiêu
        let dx = targetX - x;
        let dy = targetY - y;
        let dist = Math.hypot(dx, dy);
        let speed = 15;
        this.vx = dist > 0 ? (dx / dist) * speed : 0;
        this.vy = dist > 0 ? (dy / dist) * speed : 0;

        this.width = 30; this.height = 30;
        this.active = true;
        
        // DÒNG THÊM VÀO: Bỏ qua va chạm với bản thân (xuyên qua người)
        this.preserve = true; 
    }
    update() {
        this.x += this.vx; this.y += this.vy;

        // Nổ khi bay tới vị trí chỉ định hoặc chạm rìa map
        let distToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (distToTarget < 15 || this.x < 0 || this.x > canvas.width || this.y > canvas.height) {
            this.explode();
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#050505';
        ctx.shadowBlur = 15; 
        ctx.shadowColor = this.isDarkForm ? '#ff00ff' : '#8a2be2'; // Màu viền thay đổi theo Form
        ctx.beginPath(); ctx.arc(this.x, this.y, 18 + Math.sin(Date.now()/100)*4, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        this.explode();
    }
    explode() {
        if (!this.active) return;
        this.active = false;
        
        // Tìm kẻ địch (Hỗ trợ 2 người chơi)
        let enemy = this.owner === player1 ? player2 : player1;
        let ex = enemy.x + enemy.width/2;
        let ey = enemy.y + enemy.height/2;
        let dist = Math.hypot(ex - this.x, ey - this.y);

        if (!this.isDarkForm) {
            // Basic Form: Bán kính 125px, 50 dame
            effects.push(new Explosion(this.x, this.y, 250, 'rgba(75, 0, 130, 0.8)'));
            if (dist <= 250 && !enemy.isDead) {
                enemy.takeDamage(50);
                this.triggerVamp();
            }
        } else {
            // Dark Form: Core 125px (75dame), lan ra ngoài 450px (giảm dần xuống 10dame)
            effects.push(new Explosion(this.x, this.y, 575, 'rgba(75, 0, 130, 0.4)'));
            effects.push(new Explosion(this.x, this.y, 250, 'rgba(255, 0, 255, 0.9)'));
            
            if (!enemy.isDead) {
                if (dist <= 250) {
                    enemy.takeDamage(75);
                    this.triggerVamp();
                } else if (dist <= 575) {
                    let damage = 75 - ((dist - 125) / (450 - 125)) * (75 - 10);
                    enemy.takeDamage(Math.floor(damage));
                    this.triggerVamp();
                }
            }
        }
        // Rung màn hình
        canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
    }
    triggerVamp() {
        if (this.owner.hasStatus('vamp')) {
            let vampAmount = this.owner.getStatusValue('vamp');
            this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + vampAmount);
            effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, `+${vampAmount}`, '#00ff00'));
        }
    }
}

class ShadowLaser {
    constructor(x, y, facingRight, owner) {
        this.x = x; this.y = y;
        this.facingRight = facingRight;
        this.owner = owner;
        this.timer = 15; // Tồn tại 15 frame (0.25s)
        this.active = true;

        let enemy = this.owner === player1 ? player2 : player1;
        
        // Check Hitbox (Tia lazer ngang vô tận)
        let hit = false;
        if (facingRight && enemy.x > this.x && enemy.y + enemy.height > this.y - 25 && enemy.y < this.y + 25) hit = true;
        if (!facingRight && enemy.x + enemy.width < this.x && enemy.y + enemy.height > this.y - 25 && enemy.y < this.y + 25) hit = true;

        if (hit && !enemy.isDead) {
            let baseDmg = 17 + (owner.hasStatus('strength') ? owner.getStatusValue('strength') : 0);
            enemy.takeDamage(baseDmg);
            enemy.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 30, 50, 60); // Chậm 50% trong 0.5s (30 frames)
            enemy.addStatus('silence', 'debuff', 'assets/icon/debuff/silence.png', 30, 30, 60);
            enemy.addStatus('freeze', 'debuff', 'assets/icon/debuff/freeze.png', 60, 0, 60);

            if (this.owner.hasStatus('vamp')) {
                let vampAmount = this.owner.getStatusValue('vamp');
                this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + vampAmount);
                effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, `+${vampAmount}`, '#00ff00'));
            }
            effects.push(new Explosion(enemy.x + 15, enemy.y + 25, 50, '#ff00ff'));
        }
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.timer / 15;
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 20; ctx.shadowColor = '#8a2be2';
        let laserLength = canvas.width;
        if (this.facingRight) {
            ctx.fillRect(this.x, this.y - 10, laserLength, 20);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(this.x, this.y - 3, laserLength, 6); // Lõi lazer
        } else {
            ctx.fillRect(this.x - laserLength, this.y - 10, laserLength, 20);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(this.x - laserLength, this.y - 3, laserLength, 6);
        }
        ctx.restore();
    }
}

class ShadowZoneFX {
    constructor(x, y, radius) {
        this.x = x; this.y = y; this.radius = radius;
        this.timer = 45; // Tồn tại 0.75s
        this.active = true;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = (this.timer / 45) * 0.7;
        ctx.fillStyle = '#050505';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#8a2be2'; ctx.lineWidth = 4; ctx.stroke();
        ctx.restore();
    }
}