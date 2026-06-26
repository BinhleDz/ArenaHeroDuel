    class ArisuBasicBullet extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 20, 10, '#00ffff', owner, 20, false); // 20 Damage
        }
        update() {
            super.update();
            // Tia điện siêu nhỏ bắn ra khi bay
            if (Math.random() < 0.4) {
                effects.push(new Explosion(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 2 + Math.random()*2, '#ffffff'));
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = '#ffffff'; // Lõi trắng chói
            ctx.shadowBlur = 10; ctx.shadowColor = '#00bfff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + (this.vx > 0 ? -5 : 5), this.y - 2, 25, 14); // Vỏ năng lượng xanh
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            target.stunTimer = 30; // Choáng 0.5s (6 frames)
            this.active = false;
            effects.push(new OvalShockwave(this.x + 10, this.y + 5, this.vx > 0, '#00bfff')); // Vòng oval khi trúng
        }
    }

    class ArisuLaser extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 100, 6, '#00ffff', owner, 54, true); // Xuyên thấu, siêu dài
        }
        update() {
            this.x += this.vx;
            if (this.x < -200 || this.x > canvas.width + 200) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = '#ffffff'; // Lõi laser trắng
            ctx.shadowBlur = 15; ctx.shadowColor = '#00ffff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
        applyEffect(target) {
            // Laser cực mỏng, chạm là ăn đòn
            target.takeDamage(this.damage);
        }
    }

    class ArisuSnipeBullet extends Projectile {
        constructor(x, y, vx, owner, target) {
            super(x, y, vx, 0, 30, 8, '#00ffff', owner, 54, false); 
            this.baseSpeed = Math.abs(vx); // Lưu lại tốc độ siêu nhanh
            
            // SỬA MỚI: Khóa ngắm (chỉ tính toán góc bay 1 lần lúc xuất chiêu)
            if (target && !target.isDead) {
                let tx = target.x + target.width / 2;
                let ty = target.y + target.height / 2;
                let angle = Math.atan2(ty - (y + 4), tx - (x + 15));
                this.vx = Math.cos(angle) * this.baseSpeed;
                this.vy = Math.sin(angle) * this.baseSpeed;
            }
        }
        update() {
            // Loại bỏ code bẻ lái liên tục, giờ đạn sẽ bay thẳng với vận tốc cực nhanh
            this.x += this.vx;
            this.y += this.vy;

            // Để lại vệt khói xám dài
            effects.push(new Explosion(this.x + 15, this.y + 4, 8, 'rgba(150, 150, 150, 0.5)'));
            
            // Xóa đạn nếu lỡ bay ra ngoài map quá xa
            if (this.x < -1000 || this.x > canvas.width + 1000 || this.y < -1000 || this.y > canvas.height + 1000) {
                this.active = false;
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = '#ffffff'; 
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            
            // Căn chỉnh viên đạn nghiêng theo hướng bay
            let angle = Math.atan2(this.vy, this.vx);
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(angle);
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            this.active = false;
            effects.push(new Explosion(this.x, this.y, 60, '#00ffff')); // Nổ to
        }
    }

    class ArisuChargeSphere extends Projectile {
        constructor(x, y, vx, owner, chargePercent) {
            let radius = 20 + (280 * (chargePercent / 100)); // 20px -> 300px
            let damage = 10 + (90 * (chargePercent / 100)); // 10 -> 100
            super(x, y, vx, 0, radius, radius, '#00bfff', owner, damage, true);
            this.chargePercent = chargePercent;
            this.rotation = 0;
            this.hitTargets = [];
        }
        update() {
            this.x += this.vx;
            this.rotation += 0.2;
            if (this.x < -300 || this.x > canvas.width + 300) this.active = false;
            
            // Tia điện xoay quanh cầu
            if (Math.random() < (this.chargePercent / 100)) {
                effects.push(new Explosion(this.x + this.width/2 + (Math.random()-0.5)*this.width, 
                                           this.y + this.height/2 + (Math.random()-0.5)*this.height, 
                                           5, '#ffffff'));
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.rotation);
            
            ctx.fillStyle = 'rgba(0, 191, 255, 0.8)'; // Vỏ xanh
            ctx.shadowBlur = this.width / 4; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.arc(0, 0, this.width/2, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#002244'; // Lõi sẫm màu
            ctx.beginPath(); ctx.arc(0, 0, this.width/4, 0, Math.PI*2); ctx.fill();
            
            // Dải sóng năng lượng
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, this.width/2 + 5, 0, Math.PI); ctx.stroke();
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, this.width/2, 'rgba(0, 255, 255, 0.5)'));
                canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
                setTimeout(() => canvas.style.transform = 'none', 50);
            }
        }
    }