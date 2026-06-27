// --- Hạt khí Gas ODM (Đã fix lỗi nháy sáng) ---
class LeviGasParticle {
    constructor(x, y, vx, vy) {
        this.x = x; this.y = y;
        // Chỉnh vận tốc khí bay ra ngẫu nhiên một chút cho tự nhiên
        this.vx = vx + (Math.random() - 0.5) * 1.5;
        this.vy = vy + (Math.random() - 0.5) * 1.5;
        this.radius = 2 + Math.random() * 3;
        this.alpha = 0.5; // Bắt đầu ở 50% độ rõ
        this.active = true;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // GIẢM DẦN alpha nhưng KHÔNG để nó nhỏ hơn 0
        this.alpha = Math.max(0, this.alpha - 0.015); 
        
        // Khí gas nở ra một chút khi bay xa
        this.radius += 0.2; 

        // Nếu alpha chạm 0 thì hủy hạt ngay
        if (this.alpha <= 0) {
            this.active = false;
        }
    }
    draw() {
        // CHỐNG NHÁY: Nếu alpha <= 0 thì không vẽ gì cả
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#ffffff"; // Màu trắng khói
        
        // Thêm hiệu ứng nhòe nhẹ cho hạt khí trông giống hơi nước hơn
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#ffffff";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
// --- Hiệu ứng xoay kiếm tốc độ cao (C2) ---
class LeviSpinBlur {
    constructor(owner) {
        this.owner = owner;
        this.rotation = 0;
        this.active = true;
        this.timer = 30; // Tồn tại trong lúc xoay
    }
    update() {
        this.rotation += 0.8; // Xoay cực nhanh
        this.timer--;
        if (this.timer <= 0 || this.owner.isDead) this.active = false;
    }
    draw() {
        let cx = this.owner.x + this.owner.width / 2;
        let cy = this.owner.y + this.owner.height / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);
        
        // Vẽ các vệt kiếm mờ dần tạo thành hình khối tròn
        for(let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            // Hình cung vát nhọn tạo cảm giác chuyển động
            ctx.arc(0, 0, 100, 0, Math.PI / 3);
            ctx.stroke();
            
            ctx.strokeStyle = "rgba(100, 150, 255, 0.3)"; // Ánh xanh kim loại
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(0, 0, 95, 0, Math.PI / 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// --- Vết chém dấu X (C1) ---
class LeviSlashX {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.timer = 20;
        this.active = true;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "cyan";
        ctx.globalAlpha = this.timer / 20;
        ctx.beginPath();
        // Đường chéo 1
        ctx.moveTo(this.x - 40, this.y - 40); ctx.lineTo(this.x + 70, this.y + 90);
        // Đường chéo 2
        ctx.moveTo(this.x + 70, this.y - 40); ctx.lineTo(this.x - 40, this.y + 90);
        ctx.stroke();
        ctx.restore();
    }
}

// --- Bóng ma khi Dash/C3 ---
class LeviDashAfterimage {
    constructor(x, y, facingRight) {
        this.x = x; this.y = y;
        this.facingRight = facingRight;
        this.timer = 10;
        this.active = true;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.timer / 25;
        ctx.fillStyle = "#4a5d4e"; // Màu áo choàng
        ctx.fillRect(this.x, this.y, 30, 50);
        ctx.restore();
    }
}
class LeviSpeedLine {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        // Vận tốc của vệt line (ngược hướng di chuyển hoặc đứng im để tạo cảm giác lướt qua)
        this.vx = vx * 0.5; 
        this.vy = vy * 0.5;
        this.life = 10 + Math.random() * 5;
        this.maxLife = this.life;
        this.active = true;
        this.length = 15 + Math.random() * 20;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = (this.life / this.maxLife) * 0.4;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        // Vẽ một đường thẳng mỏng theo hướng di chuyển
        ctx.lineTo(this.x + this.vx * 2, this.y + this.vy * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// --- Nâng cấp LeviC2Animation (Fix hướng và Lật ảnh) ---
class LeviC2Animation {
    constructor(owner) {
        this.owner = owner;
        this.active = true;
        this.totalFrames = 8;
        this.currentFrame = 0;
        this.tick = 0;
        this.ticksPerFrame = 4; 
        this.drawSize = 384;
        this.img = loadedImages['assets/skill_effect/levi/c2_levi.png'];
        
        // QUAN TRỌNG: Khóa hướng nhìn ngay từ frame đầu tiên
        this.fixedFacing = owner.facingRight;
        this.owner.isInvisibleC2 = true;
    }

    update() {
        this.tick++;
        if (this.tick >= this.ticksPerFrame) {
            this.tick = 0;
            this.currentFrame++;
            if (this.currentFrame >= 7) this.owner.isInvisibleC2 = false;
            if (this.currentFrame >= this.totalFrames) {
                this.active = false;
                this.owner.isInvisibleC2 = false;
            }
        }
        if (this.owner.isDead) {
            this.active = false;
            this.owner.isInvisibleC2 = false;
        }
    }

    draw() {
        if (!this.img) return;
        ctx.save();
        let cx = this.owner.x + this.owner.width / 2;
        let cy = this.owner.y + this.owner.height / 2;
        ctx.translate(cx, cy);

        // Lật ảnh nếu lúc cast chiêu đang nhìn bên trái
        if (!this.fixedFacing) {
            ctx.scale(-1, 1);
        }

        let half = this.drawSize / 2;
        ctx.drawImage(
            this.img,
            this.currentFrame * 512, 0, 512, 512,
            -half, -half, this.drawSize, this.drawSize
        );
        ctx.restore();
    }
}
// --- Hiệu ứng Chiêu 3 Levi (Sprite 4 frames - Tốc độ cực nhanh) ---
class LeviC3Animation {
    constructor(owner) {
        this.owner = owner;
        this.active = true;
        this.totalFrames = 4;
        this.currentFrame = 0;
        this.tick = 0;
        this.ticksPerFrame = 4; // 4 khung hình/frame
        this.drawSize = 384;
        this.img = loadedImages['assets/skill_effect/levi/c3_levi.png'];
        
        // Xác định hướng lật ảnh: Nếu vx > 1 là hướng phải (mặc định), ngược lại lật ngang
        // Lưu ý: Sử dụng vận tốc lúc vừa cast chiêu để cố định hướng cho toàn bộ animation
        this.fixedFacingRight = this.owner.vx >= 0; 
        
        // Ẩn nhân vật trong lúc thực hiện animation chiêu 3 (tùy chọn theo phong cách C2)
        this.owner.isInvisibleC3 = false;
    }

    update() {
        this.tick++;
        if (this.tick >= this.ticksPerFrame) {
            this.tick = 0;
            this.currentFrame++;
            
            // Kết thúc animation sau khi chạy hết frame
            if (this.currentFrame >= this.totalFrames) {
                this.active = false;
            }
        }
        
        // Nếu nhân vật chết thì hủy ngay hiệu ứng
        if (this.owner.isDead) {
            this.active = false;
        }
    }

    draw() {
        if (!this.img || !this.active) return;

        ctx.save();
        
        // Tọa độ tâm nhân vật
        let cx = this.owner.x + this.owner.width / 2;
        let cy = this.owner.y + this.owner.height / 2;

        // TÍNH TOÁN ĐỘ LỆCH (OFFSET):
        // Nếu nhìn phải (fixedFacingRight = true) -> +50px
        // Nếu nhìn trái (fixedFacingRight = false) -> -50px
        let offsetX = this.fixedFacingRight ? 50 : -50;

        // Dịch chuyển canvas đến vị trí nhân vật + độ lệch
        ctx.translate(cx + offsetX, cy);

        // Lật ảnh nếu đang lướt qua trái
        if (!this.fixedFacingRight) {
            ctx.scale(-1, 1);
        }

        let half = this.drawSize / 2;
        
        ctx.drawImage(
            this.img,
            this.currentFrame * 384, 0, 384, 384, // Cắt đúng kích thước 384x384
            -half, -half, this.drawSize, this.drawSize
        );
        
        ctx.restore();
    }
}




