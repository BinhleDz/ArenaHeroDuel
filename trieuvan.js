class TrieuVanSpearThrust extends Projectile {
    constructor(x, y, vx, owner) {
        // Tầm xa (width) là 125px, thời gian tồn tại rất ngắn (5 frames) để tạo cảm giác chọc giáo
        super(x, y, vx, 0, 125, 20, 'transparent', owner, 7 + (owner.hasStatus('strength') ? owner.getStatusValue('strength') : 0), true);
        this.timer = 5; 
        this.hitTargets = [];
        this.startX = x;
    }
    update() {
        // Giữ vị trí theo chủ thể để tạo cảm giác cầm giáo chọc
        this.x = this.owner.facingRight ? this.owner.x + this.owner.width : this.owner.x - this.width;
        this.y = this.owner.y + 15;
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + (this.owner.facingRight ? 0 : this.width), this.y + 10);
        if (!this.owner.facingRight) ctx.scale(-1, 1);
        
        // Vẽ mũi tên năng lượng chọc về phía trước
        let grad = ctx.createLinearGradient(0, 0, 125, 0);
        grad.addColorStop(0, 'rgba(0, 204, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ccff';
        
        // Hình mũi tên năng lượng
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(125, 0);
        ctx.lineTo(0, 10);
        ctx.fill();
        
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
            
            if (this.owner.hasStatus('vamp')) {
                let heal = this.owner.getStatusValue('vamp');
                this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + heal);
                effects.push(new DamageText(this.owner.x, this.owner.y - 20, "+" + heal, '#00ff00'));
            }
            effects.push(new Explosion(target.x + 15, target.y + 25, 20, '#00ccff'));
        }
    }
}

class TrieuVanS2Sweep extends Projectile {
    constructor(cx, cy, owner) {
        // Tăng chiều rộng lên 220px và cao 100px để quét rộng hơn
        super(cx - 110, cy - 50, 0, 0, 220, 100, 'transparent', owner, 7, true);
        this.timer = 15;
        this.hitTargets = [];
    }
    update() {
        this.x = this.owner.x + this.owner.width/2 - this.width/2;
        this.y = this.owner.y + this.owner.height/2 - this.height/2;
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.scale(1, 0.45); 
        ctx.rotate((15 - this.timer) * 0.6);
        
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 20 * (this.timer / 15);
        ctx.shadowBlur = 25; ctx.shadowColor = '#0055ff';
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2); // Vẽ vòng tròn đầy đủ cho uy lực
        ctx.stroke();
        ctx.restore();
    }
}