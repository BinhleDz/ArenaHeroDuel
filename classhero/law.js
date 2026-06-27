
class LawRoom {
        constructor(x, y, owner) {
            this.x = x; this.y = y; this.owner = owner;
            this.radius = 0; this.maxRadius = 750;
            this.timer = 420; this.active = true;
            effects.push(new DamageText(this.x, this.y - 50, "ROOM!", '#00ffff'));

            // Âm thanh Vòng Room lặp lại
            this.roomAudio = new Audio('assets/sounds/sound_skill/law/c1_room.ogg');
            this.roomAudio.loop = true;
            if (appSettings.sfxOn) {
                this.roomAudio.volume = appSettings.sfxVol / 100;
                this.roomAudio.play().catch(e => {});
            }
        }

        update() {
            if (this.radius < this.maxRadius) this.radius += 15;
            this.timer--;
            if (this.timer <= 0) {
                this.active = false;
                // Tắt nhạc vòng, bật nhạc nổ vòng
                this.roomAudio.pause();
                playSkillSound('assets/sounds/sound_skill/law/c1_roomoff.ogg');
            }
        }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = 0.15 + (Math.sin(this.timer * 0.1) * 0.05);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    contains(target) {
        let tx = target.x + target.width / 2;
        let ty = target.y + target.height / 2;
        return Math.hypot(tx - this.x, ty - this.y) <= this.radius;
    }
}

class LawRoomSlashFX {
    constructor(x, y, facingRight) {
        this.x = x; 
        this.y = y;
        this.facingRight = facingRight;
        this.timer = 12; // Tồn tại trong thời gian ngắn (0.2s) tạo cảm giác chém nhanh
        this.active = true;
        // Góc xoay ngẫu nhiên một chút để các nhát chém chéo/ngang khác nhau
        this.angle = (Math.random() - 0.5) * 1.5; 
    }
    
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    
    draw() {
        if (!this.active) return;
        ctx.save();
        
        // Mờ dần theo thời gian
        ctx.globalAlpha = this.timer / 12; 
        
        ctx.translate(this.x, this.y);
        
        // Lật nhát chém dựa theo hướng Law đang đứng
        if (!this.facingRight) ctx.scale(-1, 1);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#ffffff'; // Lõi chém màu trắng chói
        ctx.shadowBlur = 20; 
        ctx.shadowColor = '#00ffff'; // Phát sáng viền xanh Cyan đặc trưng của Law

        // Vẽ hình trăng khuyết: 2 đầu sắc nhọn, bụng phình to
        ctx.beginPath();
        ctx.moveTo(-40, -80); // Điểm nhọn phía trên
        ctx.quadraticCurveTo(60, 0, -40, 80); // Đường cong lồi ra ngoài (lưỡi chém)
        ctx.quadraticCurveTo(10, 0, -40, -80); // Đường cong lõm vào trong (sống chém)
        ctx.fill();

        ctx.restore();
    }
}

class KikokuSlash extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 45, 10, '#ffffff', owner, 15, false);
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}