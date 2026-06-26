class GojoBlue extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 0, 10, 10, '#0055ff', owner, 15, true);
        this.timer = 200;
        this.radius = 2;
    }

    update() {
        // KIỂM TRA DUNG HỢP: Tìm GojoRed của cùng một chủ thể để kết hợp
        let red = projectiles.find(p => p instanceof GojoRed && p.owner === this.owner && p.active);
        if (red && checkCollision(this, red)) {
            let midX = (this.x + red.x) / 2;
            let midY = (this.y + red.y) / 2;

            // Tạo quả cầu tím dung hợp tại trung điểm
            projectiles.push(new GojoPurpleFusion(midX, midY, this.owner));
            this.active = false;
            red.active = false;
            
            // Âm thanh kích hoạt dung hợp
            playSkillSound('assets/sounds/sound_skill/gojo/c2_hit.ogg');
            return;
        }

        this.timer--;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;

        if (this.timer > 30) {
            if (this.radius < 30) this.radius += 1.5;
            let enemy = this.owner === player1 ? player2 : player1;
            if (!enemy.isDead) {
                let ex = enemy.x + enemy.width / 2;
                let ey = enemy.y + enemy.height / 2;
                let dx = cx - ex;
                let dy = cy - ey;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                enemy.x += dx * 0.04;
                if (dist < 150) enemy.y += dy * 0.02;
            }
        } else if (this.timer > 0) {
            this.radius *= 0.8;
        } else {
            this.active = false;
            effects.push(new Explosion(cx, cy, 350, 'rgba(0,100,255,0.8)'));
            let enemy = this.owner === player1 ? player2 : player1;
            let dist = Math.hypot((enemy.x + enemy.width / 2) - cx, (enemy.y + enemy.height / 2) - cy);
            if (dist < 340) {
                enemy.takeDamage(this.damage);
                playSkillSound('assets/sounds/sound_skill/gojo/c1_hit.ogg');
            }
        }
    }

    draw() {
        if (!this.active) return;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius + (this.timer % 15), 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius + 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    applyEffect(target) {
    }
}

class GojoRed extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y, 0, 0, 30, 30, '#ff0000', owner, 30, false);
        this.timer = 0;
        this.facingRight = facingRight;
        this.fired = false;
    }

    update() {
        this.timer++;
        if (!this.fired) {
            if (this.timer > 60) {
                this.fired = true;
                this.vx = this.facingRight ? 35 : -35;
            }
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let cx = this.x + 15;
        let cy = this.y + 15;
        let r = this.fired ? 15 : 10 + (this.timer % 6 < 3 ? 8 : 0);
        ctx.fillStyle = (this.timer % 4 < 2) ? '#ff0000' : '#ffaaaa';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        if (this.fired) {
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(this.facingRight ? cx - 60 : cx + 15, cy - 10, 50, 20);
        }
        ctx.restore();
    }

    applyEffect(target) {
        target.takeDamage(this.damage);
        playSkillSound('assets/sounds/sound_skill/gojo/c2_hit.ogg');
        target.vx = this.facingRight ? 25 : -25;
        target.vy = -8;
        target.stunTimer = 90; // Choáng 1.5s
        this.active = false;
        effects.push(new Explosion(this.x + 15, this.y + 15, 90, 'rgba(255,0,0,0.9)'));
    }
}

// LỚP DUNG HỢP TÍM (PURPLE FUSION SPHERE)
class GojoPurpleFusion extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 0, 20, 20, '#8a2be2', owner, 45, true);
        this.timer = 84; // 1s hút (60 frames) + 0.4s chờ kích nổ (24 frames) = 84 frames
        this.radius = 5;
    }

    update() {
        this.timer--;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;

        if (this.timer > 24) {
            // Giai đoạn 1: Hút kẻ địch mạnh mẽ trong 1 giây (60 frames)
            if (this.radius < 45) this.radius += 1.8;
            let enemy = this.owner === player1 ? player2 : player1;
            if (!enemy.isDead) {
                let ex = enemy.x + enemy.width / 2;
                let ey = enemy.y + enemy.height / 2;
                let dx = cx - ex;
                let dy = cy - ey;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                enemy.x += dx * 0.055; // Lực hút gia tăng nhẹ so với Blue gốc
                if (dist < 180) enemy.y += dy * 0.025;
            }
        } else if (this.timer > 0) {
            // Giai đoạn 2: Ngưng hút, rung chuyển cảnh báo kích nổ trong 0.4 giây (24 frames)
            this.radius = 45 + Math.sin(this.timer * 0.7) * 4;
        } else {
            // Giai đoạn 3: Phát nổ diện rộng màu tím khi bộ đếm cạn kiệt
            this.active = false;
            effects.push(new Explosion(cx, cy, 350, 'rgba(138,43,226,0.9)'));
            
            let enemy = this.owner === player1 ? player2 : player1;
            let dist = Math.hypot((enemy.x + enemy.width / 2) - cx, (enemy.y + enemy.height / 2) - cy);
            
            if (dist < 340) {
                enemy.takeDamage(this.damage);
                enemy.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 90, 0, 60); // Choáng 1.5 giây
                playSkillSound('assets/sounds/sound_skill/gojo/c1_hit.ogg');
            }
        }
    }

    draw() {
        if (!this.active) return;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#8a2be2';
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Vòng năng lượng tím lan tỏa nhấp nháy
        ctx.strokeStyle = '#cc00ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius + (this.timer % 12), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius + 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    applyEffect(target) {
    }
}

class GojoPurpleSphere extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y, 0, 0, 300, 300, '#8a2be2', owner, 125, false);
        this.facingRight = facingRight;
        this.vx = facingRight ? 18 : -18;
        this.y = y - 180;
        this.hitTargets = [];
        canvas.style.transform = `translate(${Math.random() * 15 - 7.5}px, ${Math.random() * 15 - 7.5}px) scale(1.02)`;
        setTimeout(() => {
            canvas.style.transform = `translate(${Math.random() * 15 - 7.5}px, ${Math.random() * 15 - 7.5}px) scale(1.01)`;
        }, 50);
        setTimeout(() => canvas.style.transform = 'none', 150);
    }

    update() {
        this.x += this.vx;
        if (Math.random() < 0.7) {
            let rockX = this.x + this.width / 2 + (Math.random() * 300 - 150);
            let rockY = canvas.height - groundHeight;
            let colors = ['#555', '#444', '#777', '#8a2be2', '#3a2e24'];
            let color = colors[Math.floor(Math.random() * colors.length)];
            let rockVx = (Math.random() - 0.5) * 10 + (this.facingRight ? 5 : -5);
            let rockVy = -Math.random() * 15 - 5;
            effects.push(new RockParticle(rockX, rockY, rockVx, rockVy, color));
        }
        if (this.x < -600 || this.x > canvas.width + 600) this.active = false;
    }

    draw() {
        if (!this.active) return;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(138, 43, 226, 0.4)';
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#8a2be2';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(25, 0, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 - 15 + Math.random() * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    applyEffect(target) {
        if (!this.hitTargets.includes(target)) {
            target.takeDamage(this.damage);
            target.vx = this.facingRight ? 20 : -20;
            target.vy = -12;
            this.hitTargets.push(target);
        }
    }
}