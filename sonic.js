    class SonicRing extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 20, 20, '#ffd700', owner, 5, true); // preserve = true (xuyên thấu)
            this.rotation = 0;
            this.hitTargets = [];
        }
        update() {
            this.x += this.vx;
            this.rotation += this.vx * 0.1;
            if(this.x < -100 || this.x > canvas.width + 100) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.translate(this.x + 10, this.y + 10);
            ctx.scale(Math.max(0.2, Math.abs(Math.cos(this.rotation))), 1); // Hiệu ứng xoay 3D giả
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10; ctx.shadowColor = '#ffff00';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        }
        applyEffect(target) {
            if(!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(this.x + 10, this.y + 10, 15, '#ffff00'));
            }
        }
    }

    class SonicTornado extends Projectile {
        constructor(x, y, owner) {
            // Canh lốc xoáy ngay giữa nhân vật
            super(x - 75, y - 200, 0, 0, 150, 250, 'rgba(0, 150, 255, 0.6)', owner, 6, true);
            this.timer = 180; // Tồn tại trong 3 giây
            this.hitCooldowns = new Map();
        }
        update() {
            this.timer--;
            if(this.timer <= 0) this.active = false;
            
            // Giảm hồi chiêu cho từng hit
            for (let [target, cd] of this.hitCooldowns) {
                if (cd > 0) this.hitCooldowns.set(target, cd - 1);
            }

            // Hút kẻ địch vào tâm
            let enemy = this.owner === player1 ? player2 : player1;
            let cx = this.x + this.width / 2;
            let dx = cx - (enemy.x + enemy.width / 2);
            if (Math.abs(dx) < 300 && !enemy.isDead) { // Tầm hút rộng
                enemy.x += dx * 0.05; // Lực hút
            }
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            
            // Vẽ các tầng lốc xoáy chuyển động
            let shift = Math.sin(Date.now() / 50) * 15;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2 + shift, this.y + 30, 75, 20, 0, 0, Math.PI*2);
            ctx.ellipse(this.x + this.width/2 - shift, this.y + 100, 55, 15, 0, 0, Math.PI*2);
            ctx.ellipse(this.x + this.width/2 + shift, this.y + 170, 35, 10, 0, 0, Math.PI*2);
            ctx.ellipse(this.x + this.width/2, this.y + 230, 15, 5, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
        applyEffect(target) {
            let cd = this.hitCooldowns.get(target) || 0;
            if (cd <= 0) {
                target.takeDamage(this.damage);
                target.addStatus('arpenetration', 'debuff', 'assets/icon/debuff/arpenetration.png', 320, 15, 60); 
                this.hitCooldowns.set(target, 15); // Gây dame mỗi 0.25s (15 frame)
                effects.push(new Explosion(target.x + target.width/2, target.y + target.height/2, 20, 'rgba(0, 150, 255, 0.8)'));
            }
        }
    }
    class SonicNeedle extends Projectile {
        constructor(x, y, vx, vy, owner) {
            // Đã đổi false thành true ở thông số cuối cùng (preserve = true) để kim không đâm trúng Sonic
            super(x, y, vx, vy, 12, 4, 'transparent', owner, 10, true);
            this.angle = Math.atan2(vy, vx); // Tính góc xoay kim theo hướng bay
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            // Vẽ thân kim nhọn xanh dương
            ctx.fillStyle = '#0055ff';
            ctx.fillRect(-6, -2, 12, 4);
            // Mũi kim màu trắng sáng
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(6, -2); ctx.lineTo(12, 0); ctx.lineTo(6, 2); ctx.fill();
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            // Áp dụng hiệu ứng Chảy máu (Bleed): 1dame/s trong 10s (600 frame)
            target.addStatus('bleed', 'debuff', 'assets/icon/debuff/bleed.png', 600, 1, 60); 
            effects.push(new Explosion(this.x, this.y, 15, '#ff0000'));
            this.active = false;
        }
    }

    class SonicAxeKick extends Projectile {
        constructor(x, y, facingRight, owner) {
            // Projectile vô hình dính liền với Sonic
            super(x, y, 0, 0, 0, 0, 'transparent', owner, 45, true); 
            this.facingRight = facingRight;
            this.timer = 15; // Hoạt ảnh nổ cước sống trong 0.25s
            this.hitTargets = [];
            this.radius = 75; // Xa 75px
        }
        update() {
            this.timer--;
            if(this.timer <= 0) this.active = false;

            // Kiểm tra Hitbox hình quạt ngắm thẳng vào địch
            let enemy = this.owner === player1 ? player2 : player1;
            if (!this.hitTargets.includes(enemy) && !enemy.isDead) {
                let cx = this.x; let cy = this.y;
                let ex = enemy.x + enemy.width/2; let ey = enemy.y + enemy.height/2;
                let dist = Math.hypot(ex - cx, ey - cy);
                
                // Nếu địch nằm trong phạm vi 75px
                if (dist <= this.radius) {
                    let angleToEnemy = Math.atan2(ey - cy, ex - cx);
                    let aimAngle = this.facingRight ? 0 : Math.PI;
                    
                    let diff = Math.abs(angleToEnemy - aimAngle);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;

                    if (diff <= Math.PI / 2.5) { // Quét góc quạt
                        enemy.takeDamage(this.damage);
                        enemy.stunTimer = 30; // Choáng 0.5s
                        this.hitTargets.push(enemy);
                        
                        // Nổ VFX Lực đánh
                        effects.push(new Explosion(ex, ey, 60, 'rgba(0, 200, 255, 0.8)'));
                        effects.push(new DamageText(ex, ey - 30, "SONIC KICK!", '#00ffff'));
                        canvas.style.transform = `translate(${Math.random()*15 - 7.5}px, ${Math.random()*15 - 7.5}px)`;
                        setTimeout(() => canvas.style.transform = 'none', 100);
                    }
                }
            }
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            if (!this.facingRight) ctx.scale(-1, 1);
            
            // Vẽ quạt năng lượng (vệt gió cước)
            let alpha = this.timer / 15;
            ctx.globalAlpha = alpha;
            let currentRadius = this.radius * (1 - this.timer/15) + 20;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, currentRadius, -Math.PI/3, Math.PI/3);
            ctx.lineTo(0, 0);
            
            let grd = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
            grd.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            grd.addColorStop(1, 'rgba(0, 100, 255, 0)');
            
            ctx.fillStyle = grd; ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, currentRadius, -Math.PI/3, Math.PI/3); ctx.stroke();
            ctx.restore();
        }
    }