    class GeminiBit extends Projectile {
        constructor(x, y, vx, vy, owner) {
            super(x, y, vx, vy, 10, 10, '#00ffcc', owner, 6, false);
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class PeaProjectile extends Projectile {
        constructor(x, y, vx, owner, isBoosted, isGatling) {
            let w = isBoosted ? 16 : 10;
            let h = isBoosted ? 16 : 10;
            let dmg = isBoosted ? 17 : (isGatling ? 7 : 5);
            let color = isBoosted ? '#7fff00' : '#32cd32';
            // preserve = false (Không bảo toàn)
            super(x, y, vx, 0, w, h, color, owner, dmg, false);
            this.isBoosted = isBoosted;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            if (this.isBoosted) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#7fff00';
            }
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
    }

    class GeminiFirewall extends Projectile {
        constructor(x, y, owner) {
            super(x, y, 0, 0, 20, 150, 'rgba(0, 255, 204, 0.6)', owner, 2, true);
            this.timer = 180;
        }
        update() {
            this.timer--;
            if(this.timer <= 0) this.active = false;
            let enemy = this.owner === player1 ? player2 : player1;
            if(checkCollision(this, enemy)) {
                enemy.takeDamage(0.5);
                enemy.vx = (enemy.x > this.x) ? 10 : -10; // Đẩy lùi
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }
    }

    class GeminiEcho {
        constructor(x, y, owner) {
            this.x = x; this.y = y; this.owner = owner;
            this.timer = 60; this.active = true;
        }
        update() {
            this.timer--;
            if(this.timer === 0) {
                this.active = false;
                effects.push(new Explosion(this.x + 15, this.y + 25, 100, '#00ffcc'));
                let enemy = this.owner === player1 ? player2 : player1;
                let dist = Math.hypot((enemy.x+15)-(this.x+15), (enemy.y+25)-(this.y+25));
                if(dist < 100) enemy.takeDamage(30);
            }
        }
        draw() {
            ctx.globalAlpha = this.timer / 60;
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(this.x, this.y, 30, 50);
            ctx.globalAlpha = 1.0;
        }
    }

    class GeminiSingularity extends Projectile {
        constructor(x, y, owner) {
            super(x, y, 0, 0, 10, 10, '#000', owner, 80, true);
            this.timer = 120;
            this.radius = 0;
        }
        update() {
            this.timer--;
            if(this.radius < 200) this.radius += 4;
            let enemy = this.owner === player1 ? player2 : player1;
            let dx = this.x - (enemy.x + 15);
            let dy = this.y - (enemy.y + 25);
            let dist = Math.hypot(dx, dy);
            if(dist < this.radius) {
                enemy.x += dx * 0.05; // Hút vào tâm
                enemy.y += dy * 0.05;
            }
            if(this.timer <= 0) {
                this.active = false;
                effects.push(new Explosion(this.x, this.y, 300, 'white'));
                if(dist < 150) enemy.takeDamage(this.damage);
            }
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, 'black');
            grad.addColorStop(0.8, '#00ffcc');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
    }