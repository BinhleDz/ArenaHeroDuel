class KurumiBasicBullet extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 16, 6, '#ffff00', owner, 7, false);
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 6) this.trail.shift();
        super.update();
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffcc00';
        for(let t of this.trail) ctx.fillRect(t.x, t.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15; ctx.shadowColor = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ffffff'; // Lõi trắng sáng
        ctx.fillRect(this.x + (this.vx > 0 ? 10 : 0), this.y+1, 6, 4);
        ctx.restore();
    }
}

class KurumiTimeBullet extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 25, 8, '#ffaa00', owner, 17, false);
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 10) this.trail.shift();
        this.x += this.vx;
        if(this.x < -100 || this.x > canvas.width + 100) this.active = false;
        
        // Méo không khí effect
        if(Math.random()<0.5) effects.push(new Explosion(this.x + 10, this.y + 4, 15, 'rgba(255, 255, 0, 0.15)'));
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
        for(let t of this.trail) {
            ctx.beginPath(); ctx.ellipse(t.x+12, t.y+4, 12, 4, 0, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20; ctx.shadowColor = '#ffcc00';
        ctx.beginPath(); ctx.ellipse(this.x+12, this.y+4, 12, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        target.stunTimer = 120; // 2s đóng băng
        target.timeFrozen = true; // Kích hoạt Overlay đồng hồ trên người địch
        this.active = false;
        effects.push(new Explosion(this.x, this.y, 50, '#ffcc00'));

        // DỊCH CHUYỂN RA SAU LƯNG ĐỊCH
        let distBehind = 60;
        this.owner.x = target.x + (target.facingRight ? -distBehind : distBehind + target.width);
        this.owner.y = target.y; // Đưa về cùng cao độ
        this.owner.facingRight = (this.owner.x < target.x); // Tự động quay mặt về địch
        this.owner.kurumiNextAttackBig = true; // Kích hoạt đòn cường hóa kế tiếp
        effects.push(new Explosion(this.owner.x + 15, this.owner.y + 25, 40, '#ff0000')); // Hiệu ứng biến mất/xuất hiện
    }
}

class KurumiZafkielDomain extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 0, 0, 0, 'transparent', owner, 0, true);
        this.timer = 300; // 5s
        this.enemy = owner === player1 ? player2 : player1;
        this.frozenProjectiles = [];
        document.body.style.backgroundColor = '#0a0000'; // Đổi nền tối đỏ
    }
    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.active = false;
            this.enemy.timeFrozen = false;
            document.body.style.backgroundColor = '#111'; // Trả lại nền
            
            // Xóa băng, trả lại chuyển động cho các vật thể/đạn của địch
            for(let p of this.frozenProjectiles) {
                p.update = p.kurumiOldUpdate;
                p.isFrozen = false;
            }
            effects.push(new Explosion(canvas.width/2, canvas.height/2, 600, 'rgba(255, 215, 0, 0.3)')); // Vỡ kính
        } else {
            // Liên tục khóa chặt địch
            this.enemy.stunTimer = 10;
            this.enemy.timeFrozen = true;
            this.enemy.vx = 0; this.enemy.vy = 0;
            this.enemy.isDashing = false;
            
            // Tìm và ngưng đọng toàn bộ đạn/summons của địch mới sinh ra
            for(let p of projectiles) {
                if (p.owner === this.enemy && !p.isFrozen && p !== this) {
                    p.isFrozen = true;
                    p.kurumiOldUpdate = p.update;
                    // Ghi đè hàm update để ĐÓNG BĂNG TUYỆT ĐỐI không cho nó chạy
                    p.update = function() {}; 
                    this.frozenProjectiles.push(p);
                }
            }
        }
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        // Áp lực không gian tối
        ctx.fillStyle = `rgba(15, 0, 0, ${Math.min(0.7, this.timer/30)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let cx = canvas.width/2; let cy = canvas.height/2; let radius = 350;
        ctx.translate(cx, cy);
        
        // Vòng nền đồng hồ
        ctx.fillStyle = 'rgba(30, 0, 0, 0.5)';
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, radius - 20, 0, Math.PI*2); ctx.lineWidth = 2; ctx.stroke();
        
        // Số La Mã
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.font = 'bold 32px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const numerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
        for(let i=0; i<12; i++) {
            let angle = i * Math.PI/6 - Math.PI/2;
            ctx.fillText(numerals[i], Math.cos(angle) * (radius - 50), Math.sin(angle) * (radius - 50));
        }
        
        // Kim giây (quay theo timer 5s)
        let secondAngle = ((300 - this.timer) / 300) * Math.PI*2 - Math.PI/2;
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(secondAngle)*(radius-80), Math.sin(secondAngle)*(radius-80)); ctx.stroke();
        
        // Kim tĩnh (Giờ & Phút)
        ctx.strokeStyle = 'rgba(200, 150, 0, 0.5)';
        ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(Math.PI/3)*150, Math.sin(Math.PI/3)*150); ctx.stroke();
        ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(Math.PI*0.8)*250, Math.sin(Math.PI*0.8)*250); ctx.stroke();
        
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath(); ctx.arc(0,0, 10, 0, Math.PI*2); ctx.fill();
        
        // Vết nứt khi sắp vỡ (Dưới 0.5s)
        if (this.timer < 30) {
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(100, -150); ctx.lineTo(150, -120); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-120, 100); ctx.lineTo(-180, 80); ctx.stroke();
        }
        ctx.restore();
    }
}
// --- NEW: Cào bóng tối (Đánh gần khi bật C1) ---
class KurumiShadowClaw extends Projectile {
    constructor(x, y, facingRight, owner) {
        let w = 175; // Tầm xa 175px
        let h = 80;
        let px = facingRight ? x : x - w;
        super(px, y - 15, 0, 0, w, h, 'transparent', owner, 14, true);
        this.facingRight = facingRight;
        this.timer = 15; // Tồn tại 0.25s
        this.hitTargets = [];
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.facingRight ? this.x : this.x + this.width, this.y + this.height/2);
        if(!this.facingRight) ctx.scale(-1, 1);

        // Vẽ 3 đường cào
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#000000'; // Viền ngoài đen
        ctx.lineCap = 'round';
        for(let i=0; i<3; i++) {
            let yOffset = -25 + i*25;
            ctx.beginPath();
            ctx.moveTo(10, yOffset - 15);
            ctx.quadraticCurveTo(80, yOffset, 160, yOffset + 15);
            ctx.stroke();
        }

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#8b0000'; // Tâm đỏ sẫm
        for(let i=0; i<3; i++) {
            let yOffset = -25 + i*25;
            ctx.beginPath();
            ctx.moveTo(12, yOffset - 15);
            ctx.quadraticCurveTo(80, yOffset, 158, yOffset + 15);
            ctx.stroke();
        }
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            target.slowTimer = 120; // Giảm 50% tốc chạy trong 2s
            this.hitTargets.push(target);
            effects.push(new Explosion(target.x+15, target.y+25, 30, '#8b0000'));
        }
    }
}

// --- NEW: Đạn lớn cường hóa (Sau khi trúng C2) ---
class KurumiEmpoweredBullet extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 30, 16, '#ff0000', owner, 30, false); // Đạn lớn 25dame
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if(this.trail.length > 8) this.trail.shift();
        super.update();
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#cc0000';
        for(let t of this.trail) ctx.fillRect(t.x, t.y, this.width, this.height);
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + (this.vx > 0 ? 15 : 0), this.y+2, 10, 12);
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x, this.y, 60, '#ff0000'));
        // Tạo vùng nổ hình quạt phía sau đích
        projectiles.push(new KurumiFanExplosion(this.x, this.y, this.vx > 0, this.owner));
    }
}

// --- NEW: Vụ nổ hình quạt ---
class KurumiFanExplosion extends Projectile {
    constructor(x, y, facingRight, owner) {
        let w = 150; // Tầm xa 150px
        let h = 100; // Góc nổ
        let px = facingRight ? x + 15 : x - w - 15;
        super(px, y - h/2, 0, 0, w, h, 'transparent', owner, 17, true);
        this.facingRight = facingRight;
        this.timer = 15;
        this.hitTargets = [];
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.facingRight ? this.x : this.x + this.width, this.y + this.height/2);
        if(!this.facingRight) ctx.scale(-1, 1);

        ctx.fillStyle = 'rgba(255, 50, 0, 0.6)';
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(0, 0); 
        ctx.lineTo(150, -50); 
        ctx.lineTo(150, 50);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if(!this.hitTargets.includes(target) && target !== this.owner) {
            target.takeDamage(this.damage);
            this.hitTargets.push(target);
        }
    }
}