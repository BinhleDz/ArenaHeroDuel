    class GenjiShuriken extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 20, 20, '#00ff99', owner, 19, false); // Không bảo toàn, 19 dame
            this.rotation = 0;
            this.trail = [];
        }
        update() {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 5) this.trail.shift();
            this.x += this.vx;
            this.rotation += this.vx * 0.2;
            if(this.x < -100 || this.x > canvas.width + 100) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = 'rgba(0, 255, 153, 0.3)';
            for(let t of this.trail) {
                ctx.beginPath(); ctx.arc(t.x + 10, t.y + 10, 8, 0, Math.PI*2); ctx.fill();
            }
            ctx.translate(this.x + 10, this.y + 10);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#cccccc'; // Kim loại bạc
            ctx.shadowBlur = 10; ctx.shadowColor = '#00ff99';
            // Ngôi sao 3 cánh sắc lẹm
            ctx.beginPath();
            for(let i=0; i<3; i++) {
                ctx.lineTo(0, -14);
                ctx.lineTo(3, -3);
                ctx.rotate(Math.PI*2 / 3);
            }
            ctx.fill();
            // Lõi phát sáng
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            effects.push(new OvalShockwave(this.x + 10, this.y + 10, this.vx > 0, '#00ff99'));
            this.active = false;
        }
    }

    class GenjiSlashWave extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 40, 70, '#00ff99', owner, 19, true); // Có bảo toàn để kéo địch
            this.caughtEnemy = null;
            this.tickTimer = 0;
            this.initialHit = false;
        }
        update() {
            this.x += this.vx;
            // Hiệu ứng tia điện xẹt xung quanh
            if (Math.random() < 0.6) {
                effects.push(new Explosion(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 4, '#ffffff'));
            }

            if (this.caughtEnemy && !this.caughtEnemy.isDead) {
                // Kéo địch đi theo nhát chém
                this.caughtEnemy.x = this.x + (this.vx > 0 ? -10 : 20); 
                this.caughtEnemy.y = this.y + 10;
                this.caughtEnemy.vx = 0;
                this.caughtEnemy.vy = 0;

                this.tickTimer++;
                if (this.tickTimer >= 9) { // 0.15s (9 frames)
                    this.caughtEnemy.takeDamage(1);
                    this.caughtEnemy.stunTimer = 12; // Choáng 0.2s liên tục
                    this.tickTimer = 0;
                    effects.push(new Explosion(this.caughtEnemy.x + 15, this.caughtEnemy.y + 25, 15, '#00ff99'));
                }
            }

            if (this.x < -100 || this.x > canvas.width + 100) {
                this.active = false;
                if (this.caughtEnemy) this.caughtEnemy.stunTimer = 0; // Thả địch khi ra khỏi map
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = 'rgba(0, 255, 153, 0.7)';
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ff99';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Lưỡi điện từ
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y); ctx.lineTo(this.x + 30, this.y + 20);
            ctx.lineTo(this.x + 10, this.y + 40); ctx.lineTo(this.x + 30, this.y + 70);
            ctx.stroke();
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.initialHit && !this.caughtEnemy) {
                target.takeDamage(this.damage); // 19 Sát thương ban đầu
                this.caughtEnemy = target;
                this.initialHit = true;
                target.stunTimer = 12;
            }
        }
    }