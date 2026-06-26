class ShinRock extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 15, 12, '#808080', owner, 6, false);
        this.rotation = 0;
    }
    update() {
        super.update();
        this.rotation += this.vx * 0.1;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5; ctx.shadowColor = '#000';
        ctx.beginPath();
        ctx.moveTo(-7, -4); ctx.lineTo(3, -6); ctx.lineTo(7, 2); ctx.lineTo(-2, 6); ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class ShinFartCloud extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 30, 30, 'rgba(150, 255, 100, 0.7)', owner, 2, true);
        this.hitCooldowns = new Map();
        this.initialVx = vx;
        this.life = 300;     // Tồn tại 5 giây (ở 60 fps)
        this.maxLife = 300;
    }
    update() {
        // Tốc độ to ra đã giảm xuống còn 10% (1.2 thay vì 12)
        this.width += 1.2;
        this.height += 1.2;
        // Chỉnh lại tọa độ x, y tương ứng để đám mây to đều từ tâm
        this.y -= 0.6; 
        this.x -= 0.6; 

        // Bay chậm dần nhưng không bao giờ về 0
        this.vx *= 0.92;
        if(Math.abs(this.vx) < 3) this.vx = Math.sign(this.initialVx) * 3;
        this.x += this.vx;

        for (let [t, cd] of this.hitCooldowns) {
            if (cd > 0) this.hitCooldowns.set(t, cd - 1);
        }

        // Giảm thời gian sống
        this.life--;
        if (this.life <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        
        // Tính toán độ mờ (Bắt đầu mờ dần đi ở 1 giây cuối = 60 frame)
        let alpha = 1;
        if (this.life < 60) {
            alpha = this.life / 60; // Giảm dần từ 1 về 0
        }
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20; ctx.shadowColor = '#96ff64';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if(target === this.owner) return;
        let cd = this.hitCooldowns.get(target) || 0;
        if(cd <= 0) {
            target.takeDamage(this.damage);
            // Gắn icon độc (debuff) lên đầu kẻ địch
            target.addStatus('poison', 'debuff', 'assets/icon/debuff/poison.png', 420, 2, 60); 
            this.hitCooldowns.set(target, 6); 
        }
    }
}

class ShinApplePeel extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 1000, 10, '#ff3333', owner, 3, true);
        this.hitCooldowns = new Map();
        this.waveOffset = 0;
        this.facingRight = vx > 0;
        if (!this.facingRight) this.x -= 1000; // Canh lại tọa độ ném trái
    }
    update() {
        this.x += this.vx;
        this.waveOffset += 0.3; // Chuyển động lồi lõm ngoằn ngoèo
        for (let [t, cd] of this.hitCooldowns) {
            if (cd > 0) this.hitCooldowns.set(t, cd - 1);
        }
        if(this.x > canvas.width + 1000 || this.x + this.width < -1500) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        // Vỏ ngoài táo (màu đỏ)
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 14;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for(let i=0; i<=this.width; i+=15) {
            let bumpY = this.y + Math.sin(i * 0.05 + this.waveOffset) * 12;
            if(i===0) ctx.moveTo(this.x + i, bumpY);
            else ctx.lineTo(this.x + i, bumpY);
        }
        ctx.stroke();

        // Ruột vỏ táo (màu vàng nhạt)
        ctx.strokeStyle = '#ffcc99'; 
        ctx.lineWidth = 6;
        ctx.beginPath();
        for(let i=0; i<=this.width; i+=15) {
            let bumpY = this.y + Math.sin(i * 0.05 + this.waveOffset) * 12;
            if(i===0) ctx.moveTo(this.x + i, bumpY);
            else ctx.lineTo(this.x + i, bumpY);
        }
        ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        if(target === this.owner) return;
        let cd = this.hitCooldowns.get(target) || 0;
        if(cd <= 0) {
            target.takeDamage(this.damage);
            this.hitCooldowns.set(target, 6); // Dính sát thương mỗi 0.1s
        }
    }
}

class ShinActionMask extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 45, 25, '#0000ff', owner, 35, false);
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        let dir = this.vx > 0 ? 1 : -1;
        ctx.scale(dir, 1);
        
        // Vẽ gấu Action Mask bay nằm úp, một tay giơ thẳng
        // Áo choàng
        ctx.fillStyle = '#ff0000'; 
        ctx.beginPath(); ctx.moveTo(-20, -5); ctx.lineTo(-45, -15); ctx.lineTo(-40, 10); ctx.fill();
        // Thân
        ctx.fillStyle = '#0000ff'; ctx.fillRect(-20, -10, 30, 16);
        // Đầu
        ctx.fillStyle = '#ffcc99'; ctx.fillRect(10, -12, 14, 14);
        // Mặt nạ
        ctx.fillStyle = '#0000ff'; ctx.fillRect(10, -12, 14, 7); ctx.fillRect(18, -5, 6, 6);
        ctx.fillStyle = '#ffff00'; ctx.fillRect(14, -10, 4, 4);
        // Cánh tay giơ ra trước
        ctx.fillStyle = '#0000ff'; ctx.fillRect(10, 0, 20, 6);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(30, 0, 6, 6); // Găng tay
        
        ctx.restore();
    }
    applyEffect(target) {
        if(target === this.owner) return;
        target.takeDamage(this.damage);
        target.stunTimer = 60; // Làm choáng 1 giây
        target.vx = Math.sign(this.vx) * 40; // Đẩy lùi xuyên suốt map
        target.vy = -5;
        
        // Nếu trúng địch -> Hồi 1 HP mỗi 0.25s trong 5s cho Shin
        // 5s = 300 frames. 0.25s = 15 frames.
        this.owner.addStatus('renge', 'buff', 'assets/icon/buff/renge.png', 300, 1, 15);
        
        this.active = false;
        effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 70, '#0000ff'));
        canvas.style.transform = `translate(${Math.random()*15 - 7.5}px, ${Math.random()*15 - 7.5}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
    }
}