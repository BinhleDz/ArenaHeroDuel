class CheeseBasicProj extends Projectile {
    constructor(x, y, vx, owner, isButter) {
        super(x, y, vx, 0, 15, 15, isButter ? '#ffeba1' : '#ffd700', owner, isButter ? 10 : 7, false);
        this.isButter = isButter;
        this.rotation = 0;
    }
    update() {
        super.update();
        this.rotation += this.vx * 0.15;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        if (this.isButter) {
            ctx.fillRect(-8, -6, 16, 12); // Khối bơ vuông vức
        } else {
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 8); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill(); // Miếng phô mai tam giác
            ctx.fillStyle = '#ccaa00'; ctx.beginPath(); ctx.arc(-2, 2, 2, 0, Math.PI*2); ctx.fill(); // Lỗ phô mai
        }
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        if (this.isButter) {
            target.addStatus('stunbutter', 'debuff', 'assets/icon/debuff/stunbutter.png', 90, 0, 60); // 1,5s = 90 frames
        }
        this.active = false;
        effects.push(new Explosion(this.x, this.y, 25, this.color));
    }
}

class CheeseButterTrap extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 0, 25, 25, '#ffeba1', owner, 0, true);
        this.timer = 420; // Tồn tại 7 giây
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
        if (this.y < canvas.height - groundHeight - this.height) {
            this.vy += gravity * 0.5;
            this.y += this.vy;
        } else {
            this.vy = 0;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.timer / 30);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffffaa';
        ctx.beginPath(); ctx.ellipse(this.x + 12.5, this.y + 15, 12.5, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffdf00'; ctx.beginPath(); ctx.ellipse(this.x + 12.5, this.y + 10, 10, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return;
        target.addStatus('stunbutter', 'debuff', 'assets/icon/debuff/stunbutter.png', 60, 0, 60); // 1s
        this.active = false;
        effects.push(new Explosion(this.x + 12.5, this.y + 12.5, 30, '#ffeba1'));
    }
}

class CheeseC1Proj extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 35, 35, '#ffd700', owner, 25, false);
        this.rotation = 0;
    }
    update() {
        this.x += this.vx;
        this.rotation += this.vx * 0.1;
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 17.5, this.y + 17.5);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15; ctx.shadowColor = '#ffaa00';
        ctx.beginPath(); ctx.arc(0, 0, 17.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ccaa00';
        ctx.beginPath(); ctx.arc(-5, -5, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, 5, 5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 17.5, this.y + 17.5, 60, '#ffd700'));
        for(let i=0; i<5; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = 100 + Math.random() * 200;
            let trapX = this.x + Math.cos(angle) * dist;
            let trapY = this.y + Math.sin(angle) * dist;
            trapX = Math.max(0, Math.min(canvas.width - 25, trapX));
            projectiles.push(new CheeseButterTrap(trapX, trapY, this.owner));
        }
    }
}

class CheeseButterPath extends Projectile {
    constructor(x, y, owner) {
        super(x, y + 10, 0, 0, 60, 20, 'rgba(255, 235, 161, 0.6)', owner, 0, true);
        this.timer = 180; // Tồn tại 3s
    }
    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.active = false;
            return;
        }

        // TỰ ĐỘNG KIỂM TRA VA CHẠM VỚI BẢN THÂN CHỦ NHÂN (CHEESE)
        // Bắt buộc xử lý ở đây vì vòng lặp va chạm chính bỏ qua tương tác này do thuộc tính preserve = true
        if (this.owner && !this.owner.isDead) {
            if (checkCollision(this, this.owner)) {
                // Miễn khống (ironbody) trong 0.1s (tương đương 6 frames ở 60 FPS)
                this.owner.addStatus('ironbody', 'buff', 'assets/icon/buff/ironbody.png', 6, 0, 60);
                // Tăng 25% tốc chạy (hastesp) trong 0.1s (tương đương 6 frames ở 60 FPS)
                this.owner.addStatus('hastesp', 'buff', 'assets/icon/buff/hastesp.png', 6, 25, 60);
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.timer / 20);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return; // Đã được xử lý liên tục trong hàm update() phía trên
        
        // Kích hoạt đường bơ trơn cho đối thủ
        target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 5, 50, 60);
        target.addStatus('freeze', 'debuff', 'assets/icon/debuff/freeze.png', 5, 0, 60);
    }
}

class CheeseMinionBullet extends Projectile {
    constructor(x, y, vx, vy, owner, isButter) {
        super(x, y, vx, vy, 8, 8, isButter ? '#ffeba1' : '#ffd700', owner, 3, false);
        this.isButter = isButter;
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x+4, this.y+4, 4, 0, Math.PI*2); ctx.fill();
    }
    applyEffect(target) {
        if(target === this.owner.owner) return;
        target.takeDamage(this.damage);
        if (this.isButter) target.addStatus('stunbutter', 'debuff', 'assets/icon/debuff/stunbutter.png', 300, 0, 60);
        this.active = false;
    }
}

class CheeseMinion extends Projectile {
    constructor(x, y, owner, targetEnemy) {
        super(x, y, 0, 0, 20, 20, '#ffd700', owner, 0, true);
        this.hp = 5;
        this.targetEnemy = targetEnemy;
        this.shootTimer = Math.random() * 60;
        this.life = 600;
    }
    takeDamage(amt) {
        this.hp -= amt;
        if(this.hp <= 0) {
            this.active = false;
            effects.push(new Explosion(this.x+10, this.y+10, 20, '#ffd700'));
        }
    }
    update() {
        this.life--;
        if (this.life <= 0) this.active = false;

        for (let p of projectiles) {
            if (p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                this.takeDamage(p.damage);
                if (!p.preserve) p.active = false;
            }
        }

        if (this.targetEnemy && !this.targetEnemy.isDead) {
            let dx = this.x - this.targetEnemy.x;
            let dy = this.y - this.targetEnemy.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 0 && dist < 400) {
                this.x += (dx/dist) * 0.3;
                this.y += (dy/dist) * 0.3;
            }
        }

        this.shootTimer++;
        if (this.shootTimer >= 90) {
            this.shootTimer = 0;
            if (this.targetEnemy && !this.targetEnemy.isDead) {
                let angle = Math.atan2((this.targetEnemy.y+25) - (this.y+10), (this.targetEnemy.x+15) - (this.x+10));
                let isButter = Math.random() < 0.025;
                projectiles.push(new CheeseMinionBullet(this.x+10, this.y+10, Math.cos(angle)*8, Math.sin(angle)*8, this, isButter));
            }
        }
    }
    applyEffect() {}
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.ellipse(this.x+10, this.y+10, 10, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + (this.x > this.targetEnemy.x ? 4 : 12), this.y + 6, 2, 2);
        ctx.restore();
    }
}

class CheeseC2Proj extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 40, 20, '#ffd700', owner, 30, false);
        this.trailTimer = 0;
    }
    update() {
        this.x += this.vx;
        this.trailTimer++;
        if (this.trailTimer >= 3) {
            projectiles.push(new CheeseButterPath(this.x, this.y, this.owner));
            this.trailTimer = 0;
        }
        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffeba1'; ctx.fillRect(this.x, this.y - 5, this.width, 5);
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 20, this.y + 10, 50, '#ffeba1'));
        
        for(let i=0; i<5; i++) {
            let angle = Math.random() * Math.PI * 2;
            let mx = target.x + Math.cos(angle) * 100;
            let my = target.y + Math.sin(angle) * 100;
            projectiles.push(new CheeseMinion(mx, my, this.owner, target));
        }
    }
}

class CheeseC3RainDrop extends Projectile {
    constructor(x, owner) {
        super(x, -50, 0, 10 + Math.random()*5, 20, 20, '#ffd700', owner, 17, false);
    }
    update() {
        this.y += this.vy;
        if (this.y > canvas.height) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ccaa00'; ctx.beginPath(); ctx.arc(this.x+6, this.y+6, 2, 0, Math.PI*2); ctx.fill();
    }
    applyEffect(target) {
        if (target === this.owner) {
            let lostHp = target.maxHp - target.hp;
            let healAmt = Math.floor(lostHp * 0.07);
            if (healAmt > 0) {
                target.hp = Math.min(target.maxHp, target.hp + healAmt);
                effects.push(new DamageText(target.x + 15, target.y - 20, `+${healAmt} HP`, '#00ff00'));
            }
            target.isInvincible = true;
            target.actionQueue.push({
                delay: 3,
                action: () => { target.isInvincible = false; }
            });
        } else {
            target.takeDamage(this.damage);
            target.addStatus('stunbutter', 'debuff', 'assets/icon/debuff/stunbutter.png', 180, 0, 60);
        }
        this.active = false;
        effects.push(new Explosion(this.x+10, this.y+10, 20, '#ffd700'));
    }
}

class CheeseC3Spawner extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, -15, 60, 60, '#ffd700', owner, 0, true);
        this.state = 'up';
        this.timer = 0;
    }
    update() {
        if (this.state === 'up') {
            this.y += this.vy;
            if (this.y < -100) {
                this.state = 'raining';
                this.vy = 0;
            }
        } else if (this.state === 'raining') {
            this.timer++;
            if (this.timer % 9 === 0) {
                for(let i=0; i<2; i++) {
                    projectiles.push(new CheeseC3RainDrop(Math.random() * canvas.width, this.owner));
                }
            }
            if (this.timer >= 240) this.active = false;
        }
    }
    draw() {
        if (!this.active || this.state === 'raining') return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 30; ctx.shadowColor = '#ffd700';
        ctx.beginPath(); ctx.arc(this.x+30, this.y+30, 30, 0, Math.PI*2); ctx.fill();
    }
    applyEffect() {}
}