    class AllainSlash extends Projectile {
    constructor(x, y, facingRight, owner, isS1, s1Index) {
        let radius = isS1 ? 70 : 50; 
        super(x, y, 0, 0, radius*2, radius*2, 'transparent', owner, 0, true); // Base dmg truyền 0 vì sẽ tự tính lại
        this.isS1 = isS1;
        this.s1Index = s1Index;
        this.timer = 6; 
        this.facingRight = facingRight;
        this.hitTargets = [];
        this.slashColor = (s1Index % 2 === 0) ? '#ffffff' : '#ff0000';

        // TÍNH TOÁN SÁT THƯƠNG & CHÍ MẠNG TRƯỚC
        let baseDmg = this.isS1 ? 6 : 4;
        let isCrit = Math.random() < 0.25; // Tỉ lệ nổ chí mạng 25%

        if (isCrit) {
            this.finalDmg = this.isS1 ? (baseDmg * 2.5) : (baseDmg * 2);
            this.dmgColor = '#a020f0'; // Màu tím (Purple) cho chí mạng
        } else {
            this.finalDmg = baseDmg;
            this.dmgColor = '#ff4444'; // Màu đỏ mặc định cho đòn thường
        }
    }
    
    update() {
        this.x = this.owner.x + this.owner.width/2 + (this.facingRight ? 10 : -this.width - 10);
        this.y = this.owner.y + this.owner.height/2 - this.height/2;
        this.timer--;
        if(this.timer <= 0) this.active = false;
    }
    
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.strokeStyle = this.slashColor;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10; ctx.shadowColor = this.slashColor;
        ctx.beginPath();
        let cx = this.owner.x + this.owner.width/2 + (this.facingRight ? 15 : -15);
        let cy = this.owner.y + this.owner.height/2;
        let radius = this.width/2;
        if(this.facingRight) {
            ctx.arc(cx, cy, radius, -Math.PI/2, Math.PI/2);
        } else {
            ctx.arc(cx, cy, radius, Math.PI/2, Math.PI*1.5);
        }
        ctx.stroke();
        ctx.restore();
    }
    
    applyEffect(target) {
        if(this.hitTargets.includes(target)) return;
        this.hitTargets.push(target);
        
        // Gọi takeDamage với tham số màu sắc truyền vào
        target.takeDamage(this.finalDmg, this.dmgColor);
        
        // Hồi máu
        let healPercent = this.isS1 ? 0.006 : 0.004;
        let healAmount = Math.round(this.owner.maxHp * healPercent);
        if (healAmount < 1) healAmount = 1; 
        else if (healAmount > 10) healAmount = 10; 

        this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + healAmount);
        effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, "+" + healAmount, '#00ff00'));
        
        // Làm choáng ở nhát đầu tiên của chiêu 1
        if(this.isS1 && this.s1Index === 0 && !this.owner.allainHasStunned) {
            target.stunTimer = 60; 
            this.owner.allainHasStunned = true;
        }
    }
}
// ==========================================
// HIỆU ỨNG SAO BĂNG BAY NGƯỢC (REVERSE METEOR)
// ==========================================
class AllainReverseMeteor {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50 + Math.random() * 100; // Xuất phát từ dưới đáy màn hình
        
        // Cố định vx = 0 để sao băng bay thẳng đứng 90 độ, không xiên xẹo
        this.vx = 0; 
        this.vy = -10 - Math.random() * 25; // Tốc độ bay lên ngẫu nhiên
        
        this.length = 125; // Giữ nguyên chiều dài cũ
        this.headWidth = 5; // Đầu nhỏ lại thành 5px
        this.tailWidth = 1; // Đuôi nhọn 1px
        this.active = true;
        
        // Chỉnh màu duy nhất là trắng mờ 50%
        this.color = 'rgba(255, 255, 255, 0.5)';
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -200) this.active = false;
    }
    draw() {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Tính góc xoay dựa theo hướng di chuyển (vx = 0, vy < 0 sẽ tự động tạo góc -90 độ thẳng đứng lên trên)
        let angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Vẽ sao băng ngược: Đầu hướng ngược lại, đuôi nhọn nằm phía trước
        ctx.beginPath();
        ctx.moveTo(this.length, -this.tailWidth/2); // Mũi nhọn phía trước
        ctx.lineTo(this.length, this.tailWidth/2);
        ctx.lineTo(0, this.headWidth/2); // Đầu phía sau
        
        
        ctx.quadraticCurveTo(-5, 0, 0, -this.headWidth/2); //5-0 px
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// ==========================================
// HIỆU ỨNG CUT-IN ANIME CHIÊU CUỐI ALLAIN
// ==========================================
class AllainUltCutin {
    constructor(owner) {
        this.owner = owner;
        this.timer = 0;
        this.active = true;
        this.img1_x = 0;
        this.img2_x = 0;
        this.isExiting = false;
    }
    update() {
        this.timer++;
        
        // Chiêu cuối vận 90 frames (1.5s). Hết 90 frame sẽ chuyển sang giai đoạn phóng thoát ra ngoài
        if (this.timer > 90 && !this.isExiting) {
            this.isExiting = true;
        }

        if (this.isExiting) {
            // Phóng vụt ra khỏi màn hình theo 2 hướng
            this.img1_x -= 80;
            this.img2_x += 80;
            if (this.timer > 105) this.active = false; // Xóa hẳn hiệu ứng sau khi phóng
        } else {
            // Từ frame thứ 20, bắt đầu di chuyển 2 ảnh chậm sang 2 bên
            if (this.timer >= 20) {
                // Tốc độ 100px/s chia cho 60 frames/s = ~1.66 px mỗi frame
                this.img1_x -= 1.66;
                this.img2_x += 1.66;
            }
            
            // Liên tục tạo sao băng bay ngược trong suốt 1.5s vận chiêu
            if (Math.random() < 0.4) {
                effects.push(new AllainReverseMeteor());
            }
        }
    }
    draw() {
        if (!this.active) return;
        let w = canvas.width;
        let h = canvas.height;

        if (this.timer >= 1 && this.timer <= 5) {
            let img1 = loadedImages['assets/skill_effect/allain/un_1.png'];
            if (img1) ctx.drawImage(img1, 0, 0, w, h);
        } else if (this.timer > 5 && this.timer <= 10) {
            let img2 = loadedImages['assets/skill_effect/allain/un_2.png'];
            if (img2) ctx.drawImage(img2, 0, 0, w, h);
        } else if (this.timer > 10) {
            // 1. Vẽ Background (un_3_bg.png)
            let bg = loadedImages['assets/skill_effect/allain/un_3_bg.png'];
            if (bg && !this.isExiting) { 
                ctx.save();
                if (this.timer <= 15) {
                    // Hiệu ứng mờ 0% -> 100% và thu hẹp tỷ lệ kéo dài
                    let progress = (this.timer - 10) / 5; // Tiến trình từ 0 -> 1
                    ctx.globalAlpha = progress;
                    let scaleX = 1.5 - (0.5 * progress); // Bắt đầu ở mức 1.5 (kéo dài ngang) và thu về 1.0
                    
                    ctx.translate(w/2, h/2);
                    ctx.scale(scaleX, 1);
                    ctx.drawImage(bg, -w/2, -h/2, w, h);
                } else {
                    // Frame 16 trở đi vẽ tĩnh 100%
                    ctx.drawImage(bg, 0, 0, w, h);
                }
                ctx.restore();
            }

            // 2. Vẽ 2 lớp nhân vật (un_3_1 và un_3_2) đè lên trên bg
            let img3_1 = loadedImages['assets/skill_effect/allain/un_3_1.png'];
            let img3_2 = loadedImages['assets/skill_effect/allain/un_3_2.png'];
            if (img3_1) ctx.drawImage(img3_1, this.img1_x, 0, w, h);
            if (img3_2) ctx.drawImage(img3_2, this.img2_x, 0, w, h);
        }
    }
}