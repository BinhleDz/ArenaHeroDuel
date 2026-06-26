// --- Đạn Tinh Thể Ma Thuật (Basic) ---
class EverettCrystal extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 12, 12, '#00fbff', owner, 15);
        this.angle = Math.random() * Math.PI * 2;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 6, this.y + 6);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#00fbff';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00fbff';
        // Vẽ hình thoi tinh thể
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.lineTo(5, 0); ctx.lineTo(0, 8); ctx.lineTo(-5, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}

// --- Vòng Ma Pháp & Laser (S1, S2, S3) ---
class EverettMagicCircle {
    // Sửa width từ 350 xuống 175 để tia laser nhỏ lại một nửa
    constructor(x, y, type, maxTimer, owner, width = 225) { 
        this.x = x; // Tâm vòng tròn
        this.y = y;
        this.type = type; // 'vertical' hoặc 'horizontal'
        this.maxTimer = maxTimer;
        this.timer = maxTimer;
        this.owner = owner;
        this.active = true;
        this.triggered = false; // Đã bắn laser chưa
        this.laserDuration = 15;
        this.width = width;
        this.laserAlpha = 0;
        this.color = '#4da6ff';
    }

    update() {
        if (this.timer > 0) {
            this.timer--;
        } else {
            if (!this.triggered) {
                this.triggered = true;
                this.fireLaser();
            }
            this.laserDuration--;
            if (this.laserDuration <= 0) this.active = false;
        }
    }

    fireLaser() {
        let enemy = (this.owner === player1) ? player2 : player1;
        let hit = false;
        // Logic check va chạm tự động tính toán theo this.width mới nên không cần sửa gì thêm ở đây
        if (this.type === 'vertical') {
            if (enemy.x + enemy.width > this.x - this.width/2 && enemy.x < this.x + this.width/2) hit = true;
        } else {
            if (enemy.y + enemy.height > this.y - this.width/2 && enemy.y < this.y + this.width/2) hit = true;
        }
        if (hit) {
            enemy.takeDamage(75);
            effects.push(new Explosion(enemy.x + 15, enemy.y + 25, 60, this.color));
        }
    }

    draw() {
        ctx.save();
        let progress = 1 - (this.timer / this.maxTimer);
        
        // Vẽ Vòng Ma Pháp Oval
        ctx.translate(this.x, this.y);
        if (this.type === 'vertical') ctx.scale(1, 0.3); // Bẹp theo trục Y (nằm trên sàn)
        else ctx.scale(0.3, 1); // Bẹp theo trục X (áp trên tường)

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        
        // Vòng tròn ngoài
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.stroke();

        this.drawStar(progress);

        ctx.restore();

        if (this.timer <= 0) {
            let opacity = (this.laserDuration / 15);
            
            ctx.save(); // Bảo vệ trạng thái canvas
            ctx.globalAlpha = opacity;

            // --- Tầng 1: Outer Glow (Hào quang xanh) ---
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            if (this.type === 'vertical') {
                ctx.fillRect(this.x - this.width/2, 0, this.width, canvas.height);
            } else {
                ctx.fillRect(0, this.y - this.width/2, canvas.width, this.width);
            }

            // --- Tầng 2: White Core & Glow (Lõi trắng phát sáng) ---
            let coreWidth = this.width * 0.3; // Lõi trắng nhỏ
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = "#ffffff";
            if (this.type === 'vertical') {
                ctx.fillRect(this.x - coreWidth/2, 0, coreWidth, canvas.height);
            } else {
                ctx.fillRect(0, this.y - coreWidth/2, canvas.width, coreWidth);
            }

            // --- QUAN TRỌNG: RESET SHADOW ---
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
            
            ctx.restore(); // Khôi phục trạng thái ban đầu để không ảnh hưởng vật thể khác
        }
    }


    drawStar(progress) {
        const points = 5;
        const radius = 90;
        const coords = [];
        for (let i = 0; i < points; i++) {
            let angle = (i * Math.PI * 2 / points) - Math.PI / 2;
            coords.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        }

        const sequence = [0, 2, 4, 1, 3, 0];
        ctx.beginPath();
        let totalLines = sequence.length - 1;
        let currentProgress = progress * totalLines;

        for (let i = 0; i < totalLines; i++) {
            if (currentProgress < i) break;
            let start = coords[sequence[i]];
            let end = coords[sequence[i + 1]];
            
            ctx.moveTo(start.x, start.y);
            if (currentProgress >= i + 1) {
                ctx.lineTo(end.x, end.y);
            } else {
                let partial = currentProgress - i;
                ctx.lineTo(start.x + (end.x - start.x) * partial, start.y + (end.y - start.y) * partial);
            }
        }
        ctx.stroke();
    }
}

class EverettTrap {
    constructor(x, owner) {
        this.x = x;
        this.owner = owner;
        this.active = true;
        this.triggered = false;
        this.triggerRange = 175;
    }
    update() {
        if (this.triggered) return;
        let enemy = (this.owner === player1) ? player2 : player1;
        if (Math.abs(enemy.x + 15 - this.x) < this.triggerRange) {
            this.triggered = true;
            projectiles.push(new EverettMagicCircle(this.x, canvas.height - groundHeight, 'vertical', 60, this.owner));
        }
    }
}