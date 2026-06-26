// ==========================================
// CLASS KỸ NĂNG CỦA RICARDO (MEME VŨ CÔNG)
// ==========================================

// 1. ĐÁNH THƯỜNG: ĐẤM KÉP (THẬT + BÓNG MỜ)
class RicardoBasicHitbox {
    constructor(x, y, facingRight, owner) {
        this.facingRight = facingRight; 
        this.owner = owner;
        this.active = true; 
        this.timer = 8; // Tồn tại 8 frames
        
        // Nhát đấm chính (50x15)
        this.mainHitbox = {
            x: facingRight ? x + owner.width : x - 50,
            y: y + owner.height/2 - 7.5,
            width: 50, height: 15
        };
        
        // Bóng đấm (250x75)
        this.ghostHitbox = {
            x: facingRight ? x + owner.width : x - 250,
            y: y + owner.height/2 - 37.5,
            width: 250, height: 75
        };
    }
    update() {
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    draw() {
        if(!this.active) return;
        let ctx = document.getElementById('gameCanvas').getContext('2d');
        ctx.save();
        
        // Vẽ bóng mờ ảo (Đỏ mờ)
        ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
        ctx.fillRect(this.ghostHitbox.x, this.ghostHitbox.y, this.ghostHitbox.width, this.ghostHitbox.height);
        
        // Vẽ đấm chính (Màu da ngăm / Đỏ đậm)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(this.mainHitbox.x, this.mainHitbox.y, this.mainHitbox.width, this.mainHitbox.height);
        
        ctx.restore();
    }
    applyEffect(target) {
        // Ưu tiên check đấm chính trước
        if (checkCollision(this.mainHitbox, target)) {
            target.takeDamage(15);
            this.active = false; // Trúng đấm chính thì hủy luôn, không tính bóng mờ
        } 
        // Nếu trượt đấm chính nhưng dính bóng mờ
        else if (checkCollision(this.ghostHitbox, target)) {
            target.takeDamage(7);
            this.active = false;
        }
    }
}

// 2. CHIÊU 1: ĐẤM NỔ KHỔNG LỒ
class RicardoFistC1 {
    constructor(x, y, vx, owner) {
        this.x = x; this.y = y; this.vx = vx; this.owner = owner;
        this.width = 250; this.height = 250;
        this.startX = x;
        this.active = true;
    }
    update() {
        this.x += this.vx;
        let traveled = Math.abs(this.x - this.startX);
        
        // Chạm tường hoặc bay hết 750px thì nổ
        if (traveled >= 750 || this.x <= 0 || this.x + this.width >= document.getElementById('gameCanvas').width) {
            this.explode();
        }
    }
    draw() {
        if(!this.active) return;
        let ctx = document.getElementById('gameCanvas').getContext('2d');
        ctx.save();
        
        // Vẽ nắm đấm khổng lồ
        ctx.fillStyle = '#8b5a2b'; // Da ngăm
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Aura đỏ
        ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        
        // Biểu tượng cơ bắp trên nắm đấm
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 60px Arial';
        ctx.fillText("💪", this.x + this.width/2 - 30, this.y + this.height/2 + 20);
        
        ctx.restore();
    }
    applyEffect(target) {
        // Chạm địch cũng nổ luôn
        this.explode();
    }
    explode() {
        this.active = false;
        let cx = this.x + this.width/2;
        let cy = this.y + this.height/2;
        
        // Hiệu ứng nổ
        effects.push(new Explosion(cx, cy, 350, 'rgba(255, 69, 0, 0.8)'));
        effects.push(new DamageText(cx, cy - 50, "BÙM!", '#ff4500'));
        let canvas = document.getElementById('gameCanvas');
        canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
        setTimeout(() => canvas.style.transform = 'none', 100);
        
        // Xét sát thương AOE bán kính 350px
        let enemy = this.owner === player1 ? player2 : player1;
        let dist = Math.hypot((enemy.x + enemy.width/2) - cx, (enemy.y + enemy.height/2) - cy);
        if (dist <= 350 && !enemy.isDead) {
            enemy.takeDamage(30);
            enemy.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 300, 50, 60); // Chậm 50% trong 5s (300 frames)
        }
    }
}

// 3. CHIÊU 2: BÀN TAY KẸP
class RicardoClapC2 {
    constructor(cx, cy, owner) {
        this.cx = cx; this.cy = cy; this.owner = owner;
        this.active = true;
        this.timer = 20; // 12 frames mở, 8 frames kẹp nhanh
        this.handWidth = 50; this.handHeight = 75;
        this.dist = 150; // Khoảng cách khởi tạo
        this.hit = false;
    }
    update() {
        this.timer--;
        
        // Sau 12 frames (0.2s) thì bắt đầu kẹp mạnh vào giữa
        if (this.timer < 8) {
            this.dist -= 25; 
            if (this.dist <= 0) this.dist = 0;
        }
        
        if (this.timer <= 0) {
            this.active = false;
            let enemy = this.owner === player1 ? player2 : player1;
            let ex = enemy.x + enemy.width/2;
            let ey = enemy.y + enemy.height/2;
            
            // Nếu kẻ địch nằm trong khu vực kẹp (giữa 2 tay)
            if (Math.abs(ex - this.cx) <= 80 && Math.abs(ey - this.cy) <= 100 && !this.hit && !enemy.isDead) {
                this.hit = true;
                enemy.takeDamage(25);
                enemy.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 30, 0, 60); // Choáng 0.5s
                
                // Kéo về vị trí Ricardo
                enemy.x = this.owner.x + (this.owner.facingRight ? 30 : -30);
                enemy.y = this.owner.y; 
                
                effects.push(new Explosion(this.cx, this.cy, 120, '#ffffff'));
                effects.push(new DamageText(this.cx, this.cy - 50, "CLAP!", '#ff0000'));
            }
        }
    }
    draw() {
        if(!this.active) return;
        let ctx = document.getElementById('gameCanvas').getContext('2d');
        ctx.save();
        
        ctx.fillStyle = '#8b5a2b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Vẽ Tay Trái
        ctx.fillRect(this.cx - this.dist - this.handWidth, this.cy - this.handHeight/2, this.handWidth, this.handHeight);
        ctx.strokeRect(this.cx - this.dist - this.handWidth, this.cy - this.handHeight/2, this.handWidth, this.handHeight);
        
        // Vẽ Tay Phải
        ctx.fillRect(this.cx + this.dist, this.cy - this.handHeight/2, this.handWidth, this.handHeight);
        ctx.strokeRect(this.cx + this.dist, this.cy - this.handHeight/2, this.handWidth, this.handHeight);
        
        ctx.restore();
    }
    applyEffect(target) { } // Logic xét trúng đã làm trong update()
}

// 4. CHIÊU 3: ULTI BÙNG CƠ BẮP
class RicardoUltC3 {
    constructor(cx, cy, owner) {
        this.cx = cx; this.cy = cy; this.owner = owner;
        this.active = true;
        
        // Hiệu ứng nổ ngay lập tức
        effects.push(new Explosion(cx, cy, 500, 'rgba(255, 0, 0, 0.7)')); // Bán kính 500px
        effects.push(new OvalShockwave(cx, cy, true, '#ff0000', Math.PI/2)); // Dọc
        effects.push(new OvalShockwave(cx, cy, true, '#ff0000', 0));         // Ngang
        effects.push(new DamageText(cx, cy - 80, "FLEX CƠ BẮP!", '#ff0000'));
        
        // Rung màn hình cực mạnh
        let canvas = document.getElementById('gameCanvas');
        canvas.style.transform = `translate(${Math.random()*40 - 20}px, ${Math.random()*40 - 20}px)`;
        setTimeout(() => canvas.style.transform = 'none', 300);

        // Tính damage diện rộng
        let enemy = this.owner === player1 ? player2 : player1;
        let ex = enemy.x + enemy.width/2;
        let ey = enemy.y + enemy.height/2;
        let dist = Math.hypot(ex - cx, ey - cy);
        
        if (dist <= 500 && !enemy.isDead) {
            // Sát thương giảm dần từ 115 -> 0
            let dmg = Math.floor(115 * (1 - (dist / 500)));
            if (dmg < 0) dmg = 0;
            
            if (dmg > 0) {
                enemy.takeDamage(dmg);
                enemy.vy = -15; // Hất văng lên không
                enemy.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 45, 0, 60); // Kèm choáng 0.75s 
            }
        }
        
        this.active = false; // Xử lý xong biến mất luôn
    }
    update() {}
    draw() {}
    applyEffect(target) {}
}