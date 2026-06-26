class WukongBasicStrike extends Projectile {
    constructor(x, y, dir, owner) {
        // Tầm đánh 125px
        super(x, y, 0, 0, 125, 50, 'transparent', owner, 10, true);
        this.timer = 10; // Tồn tại 0.16s
        this.hitTargets = [];
        this.dir = dir;
    }
    update() {
        this.x = this.owner.x + (this.dir > 0 ? this.owner.width : -this.width);
        this.y = this.owner.y;
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.fillRect(this.x, this.y + 20, this.width, 10); // Vệt gậy quét ngang
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x + 15, target.y + 25, 30, '#ffd700'));
        }
    }
}

class WukongUltStaff extends Projectile {
    constructor(x, y, owner) {
        let targetY = canvas.height - groundHeight - 150;
        // Bắt đầu rơi từ rất cao, vận tốc 60px/frame
        super(x - 250, targetY - 800, 0, 60, 500, 150 + 800, 'transparent', owner, 15, true); 
        this.targetY = targetY;
        this.landed = false;
        this.timer = 15; // Tồn tại trên mặt đất 0.25s
    }
    update() {
        if (!this.landed) {
            this.y += this.vy;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.landed = true;
                this.vy = 0;
                this.height = 150; // Thu gọn hitbox vừa bằng mặt đất
                
                // Hiệu ứng nứt đất và rùng màn hình
                effects.push(new OvalShockwave(this.x + 250, this.y + 150, true, '#ffd700', 0));
                canvas.style.transform = `translate(${Math.random()*20-10}px, ${Math.random()*20-10}px)`;
                setTimeout(() => canvas.style.transform = 'none', 150);
                
                // Quét sát thương
                let checkHit = (target) => {
                    if (target !== this.owner && !target.isDead && checkCollision(this, target)) {
                        target.takeDamage(this.damage);
                        target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 60, 0, 60); // Choáng 1s
                        effects.push(new Explosion(target.x + 15, target.y + 25, 60, '#ff0000'));
                    }
                };
                checkHit(player1); checkHit(player2);
            }
        } else {
            this.timer--;
            if (this.timer <= 0) this.active = false;
        }
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff8c00';
        
        // Vẽ cột gậy siêu to khổng lồ cắm xuống
        ctx.fillRect(this.x + 200, this.y - 800, 100, 800 + 150);
        ctx.fillStyle = '#ff0000'; // Hai đầu gậy bọc đỏ
        ctx.fillRect(this.x + 200, this.y + 100, 100, 50);
        ctx.fillRect(this.x + 200, this.y - 800, 100, 50);
        
        // Vùng hitbox 500x150
        if (this.landed) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
    applyEffect() { } // Xử lý thủ công trong update
}
