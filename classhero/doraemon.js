// --- HÀM TIỆN ÍCH DÙNG CHUNG CHO DORAEMON ---
function applyDoraeHit(target, baseDamage) {
    let currentStacks = target.getStatusValue('dorae_hit') || 0;
    // Tăng 2.5% sát thương mỗi cộng dồn
    let bonusDamage = baseDamage * (currentStacks * 0.025);
    let finalDamage = baseDamage + bonusDamage;
    
    target.takeDamage(finalDamage);
    // Cộng thêm 1 stack (Vô hạn thời gian)
    target.addStatus('dorae_hit', 'debuff', 'assets/icon/debuff/dorae_hit.png', 'inf', currentStacks + 1, 60);
}

class AirCannonBall extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 25, 25, 'rgba(200, 255, 255, 0.6)', owner, 20, false);
    }
    update() {
        super.update();
        if(Math.random() < 0.5) effects.push(new Explosion(this.x+12.5, this.y+12.5, 5, 'rgba(255,255,255,0.5)'));
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = 'white';
        ctx.beginPath(); ctx.arc(this.x + 12.5, this.y + 12.5, 12.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 2; 
        ctx.beginPath(); ctx.arc(this.x + 12.5, this.y + 12.5, 15 + Math.random()*3, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        // Gây 20 dame gốc + sát thương từ cộng dồn dorae_hit
        applyDoraeHit(target, 20);
        target.stunTimer = 6; // Choáng 0.1s (6 frames)
        
        this.active = false;
        effects.push(new Explosion(this.x+12.5, this.y+12.5, 30, 'rgba(255,255,255,0.8)'));
    }
}

// ==========================================
// 2. CHIÊU 1: SÚNG LASER (TỰ NGẮM 10 ĐỘ)
// ==========================================
class DoraemonLaser extends Projectile {
    constructor(x, y, angle, owner) {
        super(x, y, Math.cos(angle)*40, Math.sin(angle)*40, 30, 8, '#00ffff', owner, 45, false);
        this.angle = angle;
    }
    update() {
        super.update();
        // Hiệu ứng hạt năng lượng dọc đường bay
        effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 4, '#ffffff'));
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y + this.height/2);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
        ctx.fillRect(0, -this.height/2, 50, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, -this.height/4, 30, this.height/2); // Lõi trắng
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(30);
        this.active = false;
        effects.push(new Explosion(this.x, this.y, 40, '#00ffff'));
    }
}

// ==========================================
// 3. CHIÊU 2: CỬA THẦN KỲ (CHẶN ĐẠN)
// ==========================================
class AnywhereDoor extends Projectile {
    constructor(x, y, owner) {
        super(x, y - 20, 0, 0, 20, 70, '#ff66b2', owner, 0, true);
        this.timer = 180; // Tồn tại 3 giây
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
        
        // Quét và xóa toàn bộ đạn địch bay vào
        for(let p of projectiles) {
            if(p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                p.active = false;
                effects.push(new Explosion(p.x + p.width/2, p.y + p.height/2, 15, '#ff66b2'));
            }
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.timer / 15); // Mờ dần khi hết hạn
        ctx.fillStyle = '#ff66b2'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#cc0066'; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffd1dc'; ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        ctx.fillStyle = 'silver'; ctx.beginPath(); ctx.arc(this.x + 15, this.y + 35, 3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {} // Cửa không trực tiếp gây sát thương
}

// ==========================================
// 4. CHIÊU 3: THỰC THỂ MINI-DORA & ĐẠN CỦA NÓ
// ==========================================
class MiniDoraCannonBall extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 15, 15, 'rgba(200, 255, 255, 0.6)', owner, 10, false);
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5; ctx.shadowColor = 'white';
        ctx.beginPath(); ctx.arc(this.x + 7.5, this.y + 7.5, 7.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        // Đạn của Mini-Dora gây 10 dame gốc + dorae_hit
        applyDoraeHit(target, 10);
        this.active = false;
        effects.push(new Explosion(this.x+7.5, this.y+7.5, 20, 'rgba(255,255,255,0.8)'));
    }
}

class MiniDoraEntity extends Projectile {
    constructor(x, y, color, owner) {
        // Khởi tạo kích thước nhỏ (15x25)
        super(x, y, 0, 0, 15, 25, color, owner, 0, true);
        this.baseColor = color;
        this.shootTimer = Math.floor(Math.random() * 30); // Lệch nhịp bắn giữa 3 con
        this.isGiant = false;
    }
    
    makeGiant() {
        this.isGiant = true;
        this.width = 150; 
        this.height = 250;
        this.x -= 67.5; 
        this.y -= 225;
    }

    update() {
        if (!this.active) return;
        
        if (this.isGiant) {
            for(let p of projectiles) {
                if(p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                    p.active = false;
                    effects.push(new Explosion(p.x, p.y, 20, this.baseColor));
                }
            }
        } else {
            this.shootTimer--;
            if (this.shootTimer <= 0) {
                this.shootTimer = 30;
                this.shoot();
            }
        }
    }
    
    shoot() {
        let enemy = this.owner.heroType === player1.heroType ? player2 : player1;
        let dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
        let dy = (enemy.y + enemy.height/2) - (this.y + 5);
        let angle = Math.atan2(dy, dx);
        let speed = 15;
        projectiles.push(new MiniDoraCannonBall(this.x + this.width/2 - 7.5, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, this.owner));
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;
        let w = this.width; let h = this.height;

        // Thân & Đầu bằng màu base (Đỏ, Vàng, Xanh)
        ctx.fillStyle = this.baseColor;
        ctx.beginPath(); ctx.ellipse(cx, cy, w/2, h/2, 0, 0, Math.PI*2); ctx.fill();
        
        // Bụng & Mặt trắng
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(cx, cy + h*0.1, w*0.4, h*0.35, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx, cy - h*0.2, w*0.4, h*0.25, 0, 0, Math.PI*2); ctx.fill();

        // Mắt đơn giản
        ctx.fillStyle = '#000000';
        let eyeOffset = w * 0.15;
        ctx.beginPath(); ctx.arc(cx - eyeOffset, cy - h*0.3, w*0.05, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eyeOffset, cy - h*0.3, w*0.05, 0, Math.PI*2); ctx.fill();

        // Nòng súng không khí cầm trên tay đưa lên trời
        if (!this.isGiant) {
            ctx.fillStyle = '#555';
            ctx.fillRect(cx - 3, this.y - 10, 6, 15);
            ctx.fillStyle = 'rgba(200, 255, 255, 0.8)';
            ctx.beginPath(); ctx.arc(cx, this.y - 10, 5, 0, Math.PI*2); ctx.fill();
        }

        ctx.restore();
    }
    applyEffect(target) {} // Bản thân Mini-Dora không gây sát thương khi chạm
}