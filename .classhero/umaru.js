class UmaruSnack extends Projectile {
    constructor(x, y, vx, vy, owner, angle) {
        // preserve = true (tham số cuối) để đạn không tự động hủy khi chạm địch (Xuyên thấu)
        super(x, y, vx, vy, 18, 4, '#ffcc00', owner, 10, true); 
        this.angle = angle;
        this.state = 'flying'; // 'flying' (bay ra), 'stuck' (cắm tường), 'recalling' (bay về)
        this.hitEnemies = new Set(); // Bộ nhớ lưu các địch đã trúng để không gây dame liên tục nhiều lần mỗi frame
        
        if (!this.owner.umaruSnacks) this.owner.umaruSnacks = [];
    }

    update() {
        if (this.state === 'flying') {
            this.x += this.vx;
            this.y += this.vy;

            // Kiểm tra va chạm với viền map hoặc mặt đất
            let hitWall = (this.x < 0 || this.x + this.width > canvas.width || this.y + this.height > canvas.height - groundHeight);
            
            // Kiểm tra va chạm với các bục đá (platforms)
            if (!hitWall && typeof platforms !== 'undefined') {
                for (let plat of platforms) {
                    if (this.x < plat.x + plat.w && this.x + this.width > plat.x &&
                        this.y < plat.y + plat.h && this.y + this.height > plat.y) {
                        hitWall = true;
                        break;
                    }
                }
            }

            // Nếu cắm vào tường/đất -> Đứng yên
            if (hitWall) {
                this.state = 'stuck';
                this.vx = 0;
                this.vy = 0;
                
                // Thêm vào danh sách snack đã cắm của Umaru
                this.owner.umaruSnacks.push(this);
                
                // Cơ chế tối đa 10 miếng, nếu hơn thì xóa miếng cũ nhất
                if (this.owner.umaruSnacks.length > 10) {
                    let oldestSnack = this.owner.umaruSnacks.shift();
                    oldestSnack.active = false; // Xóa khỏi game
                }
            }
        } 
        else if (this.state === 'recalling') {
            // Tính toán bay ngược về Umaru
            let targetX = this.owner.x + this.owner.width / 2;
            let targetY = this.owner.y + this.owner.height / 2;
            let dx = targetX - this.x;
            let dy = targetY - this.y;
            let dist = Math.hypot(dx, dy);

            // Nếu đã bay về chạm tới Umaru
            if (dist < 25) {
                this.active = false;
                
                // Hồi 1 HP
                this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + 1);
                effects.push(new DamageText(this.owner.x + 15 + (Math.random()-0.5)*20, this.owner.y - 20, "+1", '#00ff00'));
                
                // Cập nhật lại UI máu ảo/thật nếu cần (tránh lỗi thanh máu lùi)
                return;
            }

            // Di chuyển tốc độ cao về phía Umaru
            let speed = 35; 
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            this.angle = Math.atan2(dy, dx);
            
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Vẽ miếng Snack dài và nhọn
        ctx.fillStyle = '#ffd700'; // Vàng cam
        ctx.shadowBlur = 5; ctx.shadowColor = '#ff9900';
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(18, 0); // Đầu nhọn
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    applyEffect(target) {
        // Snack cắm tường không gây dame
        if (this.state === 'stuck') return; 
        
        // Chống lỗi gây dame 60 lần/giây khi đạn đang xuyên qua người địch
        if (this.hitEnemies.has(target)) return; 
        
        this.hitEnemies.add(target);
        target.takeDamage(this.damage); 
        effects.push(new Explosion(target.x + target.width/2, target.y + target.height/2, 20, '#ffcc00'));
    }
    
    startRecall() {
        if (this.state === 'stuck') {
            this.state = 'recalling';
            this.hitEnemies.clear(); // Reset bộ nhớ va chạm để đạn có thể gây dame tiếp lúc bay về
            this.damage = 15; // Set lại sát thương bay về là 15
        }
    }
}