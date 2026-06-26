    class MarioShell extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 24, 24, '#00aa00', owner, 19, true); // preserve = true để xuyên thấu
            this.hitTargets = [];
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
            ctx.translate(this.x + 12, this.y + 12);
            ctx.rotate(this.rotation);

            ctx.fillStyle = '#00aa00'; // Mai xanh lá
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.fillRect(-4, -4, 8, 8); // Hoa văn
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(this.x + 12, this.y + 12, 15, '#00aa00'));
            }
        }
    }

    class BowserEntity extends Projectile {
        constructor(x, y, owner) {
            // Gọi là đạn nhưng đóng vai trò như thực thể
            super(x, y, 0, 0, 60, 60, '#ffaa00', owner, 0, true);
            this.hp = 75;
            this.maxHp = 75;
            this.fireTimer = 0;
        }
        takeDamage(amt) {
            this.hp -= amt;
            effects.push(new DamageText(this.x + 30, this.y - 10, `-${Math.floor(amt)}`, '#ff0000'));
            if (this.hp <= 0) {
                this.active = false;
                effects.push(new Explosion(this.x + 30, this.y + 30, 50, '#ff4400'));
            }
        }
        update() {
            // Rơi xuống đất
            this.vy += gravity;
            this.y += this.vy;
            if (this.y >= canvas.height - groundHeight - this.height) {
                this.y = canvas.height - groundHeight - this.height;
                this.vy = 0;
            }

            // Nhận sát thương từ đạn địch
            for (let p of projectiles) {
                if (p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                    this.takeDamage(p.damage);
                    if (!p.preserve) p.active = false;
                }
            }

            // Bắn HomingFireBall mỗi 1 giây (60 frames)
            this.fireTimer++;
            if (this.fireTimer >= 60) {
                this.fireTimer = 0;
                let enemy = this.owner === player1 ? player2 : player1;
                if (!enemy.isDead) {
                    let facingRight = (enemy.x > this.x);
                    let pX = facingRight ? this.x + this.width : this.x - 24;

                    // Tạo cầu lửa, gán sát thương riêng rồi mới đẩy vào mảng
                    let bowserFireball = new HomingFireBall(pX, this.y + 10, facingRight, this.owner, enemy);
                    bowserFireball.damage = 8; // <--- SỬA SÁT THƯƠNG TẠI ĐÂY (đang để ví dụ là 15)
                    projectiles.push(bowserFireball);
                }
            }
        }
        applyEffect(target) {} // Không gây sát thương khi địch chạm thân

        draw() {
            if (!this.active) return;
            ctx.save();
            // Thân rồng
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(this.x + 10, this.y + 20, 40, 40);
            // Mai rùa gai
            ctx.fillStyle = '#006600';
            ctx.beginPath(); ctx.arc(this.x + 30, this.y + 30, 25, 0, Math.PI); ctx.fill();
            ctx.fillStyle = '#ffffff'; // Gai
            ctx.beginPath(); ctx.moveTo(this.x+20, this.y+30); ctx.lineTo(this.x+25, this.y+15); ctx.lineTo(this.x+30, this.y+30); ctx.fill();
            ctx.beginPath(); ctx.moveTo(this.x+30, this.y+30); ctx.lineTo(this.x+35, this.y+15); ctx.lineTo(this.x+40, this.y+30); ctx.fill();
            // Tóc sừng
            ctx.fillStyle = '#ff0000'; ctx.fillRect(this.x + 20, this.y, 20, 10);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(this.x + 15, this.y + 5, 5, 10); ctx.fillRect(this.x + 40, this.y + 5, 5, 10);
            // Mắt đen
            ctx.fillStyle = '#000000'; ctx.fillRect(this.x + 20, this.y + 15, 5, 5); ctx.fillRect(this.x + 35, this.y + 15, 5, 5);

            // Thanh máu của rồng
            ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = '#00ff00'; ctx.fillRect(this.x, this.y - 10, this.width * (this.hp/this.maxHp), 5);
            ctx.restore();
        }
    }
