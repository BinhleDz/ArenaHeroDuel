// Hạt Aura gồng Ki của Goku
class SaiyanAuraParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 30;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -2 - Math.random() * 3; // Bay ngược lên trên
        this.size = 5 + Math.random() * 10;
        this.life = 20;
        this.maxLife = 20;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size *= 0.9;
        this.life--;
        if (this.life <= 0) this.active = false;
        else this.active = true;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = '#ffff00'; // Vàng rực
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        // Hình giọt nước lộn ngược (lửa cháy)
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.fill();
        ctx.restore();
    }
}

// Ki Blast Cơ bản (Đánh thường)
class GokuBasicKi extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 15, 15, '#ff0000', owner, 10);
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#ffcccc';
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff0000';
        ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
        
        if (Math.random() < 0.3) effects.push(new Explosion(this.x, this.y, 4, '#ff0000'));
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        effects.push(new Explosion(target.x + 15, target.y + 25, 40, '#ff0000'));
        this.active = false;
    }
}

// Spawner bắn cầu Ki cho Chiêu 2
class GokuOrbSpawner {
    constructor(owner, totalOrbs) {
        this.owner = owner;
        this.totalOrbs = totalOrbs;
        this.orbsSpawned = 0;
        this.timer = 0;
        this.active = true;
        this.preserve = true; // Không bị vỡ khi chạm địch
    }
    update() {
        this.timer--;
        if (this.timer <= 0 && this.orbsSpawned < this.totalOrbs) {
            // Spawn orb ngẫu nhiên trong khoảng 400px trước mặt
            let dir = this.owner.facingRight ? 1 : -1;
            let spawnX = this.owner.x + (dir * (50 + Math.random() * 350));
            let spawnY = this.owner.y - 150 + Math.random() * 300;
            
            // Push quả cầu vào mảng projectiles
            projectiles.push(new GokuBigOrb(spawnX, spawnY, dir * 25, this.owner));
            
            this.orbsSpawned++;
            this.timer = 10; // 10 frames / 1 quả
        }
        if (this.orbsSpawned >= this.totalOrbs) this.active = false;
    }
    draw() {} // Không cần vẽ
}

// Quả Cầu năng lượng (C2)
class GokuBigOrb extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 40, 40, '#00ffff', owner, 50); 
        this.hitboxRadius = 125; // Hitbox ảo cực to theo yêu cầu
        effects.push(new Explosion(this.x, this.y, 50, '#00ffff')); // Bùng nổ khi xuất hiện
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 25; ctx.shadowColor = '#00aaff';
        ctx.beginPath(); ctx.arc(this.x, this.y, 20, 0, Math.PI*2); ctx.fill(); // Vẽ nhỏ hơn hitbox cho đỡ chắn màn hình
        // Vòng năng lượng bên ngoài
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]); ctx.rotate(Date.now()/100);
        ctx.beginPath(); ctx.arc(this.x, this.y, 35, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        // Tái tạo hàm check Collision dạng hình tròn
        let dist = Math.hypot((target.x + target.width/2) - this.x, (target.y + target.height/2) - this.y);
        if (dist <= this.hitboxRadius) {
            target.takeDamage(this.damage);
            effects.push(new Explosion(target.x + 15, target.y + 25, 125, 'rgba(0, 255, 255, 0.8)'));
            this.active = false;
        }
    }
}

// Tia Kamehameha (C3)
class GokuKameBeam {
    constructor(x, y, angle, owner) {
        this.owner = owner;
        this.x = x; this.y = y;
        this.angle = angle;
        this.active = true;
        this.preserve = true; // Xuyên thấu
        this.beamLength = 1500; // Dài quá màn hình
        
        // SỬA LỖI 3: Tăng x3 Hitbox, từ 40 lên 120 (Chiều rộng của tia quét)
        this.width = 120; 
    }
    update() {
        // Bám theo tay chủ nhân
        this.x = this.owner.facingRight ? this.owner.x + this.owner.width : this.owner.x;
        this.y = this.owner.y + 15;
        
        // Gây sát thương mỗi frame (1 dame/frame) lên kẻ địch nằm trong vùng Rect xoay
        let enemy = this.owner === player1 ? player2 : player1;
        if (!enemy.isDead && checkRotatedRectCollision(this.x, this.y, this.beamLength, this.width, this.angle, enemy)) {
            enemy.takeDamage(2);
            effects.push(new Explosion(enemy.x + 15, enemy.y + 25, 20, '#00ffff'));
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // SỬA LỖI 3: Điều chỉnh hình ảnh lõi trắng (chiếm 1/2 độ dày của tia)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -this.width/4, this.beamLength, this.width/2);

        // SỬA LỖI 3: Điều chỉnh viền năng lượng (Vẽ bao trọn toàn bộ Hitbox mới 120px)
        ctx.fillStyle = 'rgba(0, 170, 255, 0.6)';
        ctx.shadowBlur = 30; ctx.shadowColor = '#00ffff';
        ctx.fillRect(0, -this.width/2, this.beamLength, this.width);

        // Quả cầu tụ lực ở tay (Tăng nhẹ để cân xứng với tia mới)
        ctx.beginPath(); ctx.arc(0, 0, 45 + Math.sin(Date.now()/50)*5, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }
}

// Hàm hỗ trợ tính toán va chạm cho tia Kame xoay
function checkRotatedRectCollision(rx, ry, rw, rh, angle, target) {
    let tx = target.x + target.width/2;
    let ty = target.y + target.height/2;

    // Đưa tọa độ địch về hệ tọa độ của tia (Xoay ngược lại)
    let cosA = Math.cos(-angle);
    let sinA = Math.sin(-angle);
    let dx = tx - rx;
    let dy = ty - ry;
    
    let localX = dx * cosA - dy * sinA;
    let localY = dx * sinA + dy * cosA;

    // Kiểm tra xem hình chữ nhật (target) nằm trong tia hay không
    return (localX >= 0 && localX <= rw && localY >= -rh/2 && localY <= rh/2);
}