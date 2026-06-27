class SoccerBall extends Projectile {
    constructor(x, y, vx, owner) {
        // Sát thương khởi điểm là 25
        super(x, y, vx, 0, 16, 16, '#ffffff', owner, 35, false);
        this.rotation = 0;
        this.startX = x; // Lưu lại vị trí ban đầu để tính khoảng cách bay
    }

    update() {
        super.update();
        this.rotation += this.vx * 0.05;
        
        // Tính khoảng cách quả bóng đã bay
        let dist = Math.abs(this.x - this.startX);
        let smokeColor = 'rgba(255, 255, 255, 0.5)'; // Mặc định khói trắng

        // Xử lý sát thương và màu khói theo khoảng cách
        if (dist <= 30) {
            this.damage = 25;
            smokeColor = 'rgba(255, 0, 0, 0.6)'; // Khói đỏ
        } else if (dist <= 550) {
            // Giảm tuyến tính từ 25 xuống 6 trong khoảng cách 380px (từ 30 đến 550)
            let ratio = (dist - 20) / 380;
            this.damage = 35 - (29 * ratio);
            smokeColor = 'rgba(187, 0, 31, 0.6)'; // Khói hồng
        } else {
            this.damage = 6;
            smokeColor = 'rgba(255, 255, 255, 0.6)'; // Khói trắng
        }

        // Tạo hiệu ứng khói dựa theo màu đã tính toán
        if (Math.random() < 0.3) {
            effects.push(new Explosion(this.x + 8, this.y + 8, 4, smokeColor));
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 8, this.y + 8);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-6, -2, 3, 3);
        ctx.fillRect(4, -2, 3, 3);
        ctx.restore();
    }

    applyEffect(target) {
        // --- THÊM RANDOM ÂM THANH TRÚNG ĐỊCH BASIC ---
        if (typeof playSkillSound !== 'undefined') {
            let hits = ['assets/sounds/sound_skill/ronaldo/basic_hit1.ogg', 'assets/sounds/sound_skill/ronaldo/basic_hit2.ogg'];
            let randomHit = hits[Math.floor(Math.random() * hits.length)];
            playSkillSound(randomHit);
        }

        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 8, this.y + 8, 15, 'rgba(255,255,255,0.8)'));
    }
}

class PurpleCurveBall extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, -2, 20, 20, '#9900ff', owner, 50, false);
        this.rotation = 0;
        this.state = 'flying';
        this.rollTimer = 300;
    }

    update() {
        if (this.state === 'flying') {
            this.vy += gravity * 0.5;
            this.x += this.vx;
            this.y += this.vy;
            if (this.x <= 0) {
                this.x = 0;
                this.vx *= -0.8;
            } else if (this.x + this.width >= canvas.width) {
                this.x = canvas.width - this.width;
                this.vx *= -0.8;
            }
            if (this.y + this.height >= canvas.height - groundHeight) {
                this.y = canvas.height - groundHeight - this.height;
                this.state = 'rolling';
                this.vy = 0;
                this.damage = 25;
            }
        } else if (this.state === 'rolling') {
            this.rollTimer--;
            this.vx *= 0.98;
            this.x += this.vx;
            if (this.rollTimer <= 0 || Math.abs(this.vx) < 0.1) this.active = false;
        }

        this.rotation += this.vx * 0.1;
        if (Math.random() < 0.5) effects.push(new Explosion(this.x + 10, this.y + 10, 5, 'rgba(153,0,255,0.4)'));
        if (this.x < -100 || this.x > canvas.width + 100 || this.y > canvas.height + 100 || this.y < -500) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 10, this.y + 10);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#cc66ff';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    applyEffect(target) {
        // --- THÊM ÂM THANH TRÚNG ĐỊCH C1 ---
        if (typeof playSkillSound !== 'undefined') {
            playSkillSound('assets/sounds/sound_skill/ronaldo/c12_hit.ogg');
        }

        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 10, this.y + 10, 25, 'rgba(153,0,255,0.8)'));
    }
}

class HomingFireBall extends Projectile {
    constructor(x, y, facingRight, owner, target) {
        super(x, y, facingRight ? 5 : -5, -3, 24, 24, '#ff3300', owner, 20, false);
        this.target = target;
        this.timer = 600;
        this.speed = 8;
        this.exploded = false;
        this.age = 0;
    }

    update() {
        if (this.exploded) return;
        this.age++;
        this.timer--;
        if (this.timer <= 0) {
            this.explode();
            return;
        }

        if (this.target && !this.target.isDead) {
            let tx = this.target.x + this.target.width / 2;
            let ty = this.target.y + this.target.height / 2;
            let desiredAngle = Math.atan2(ty - (this.y + 12), tx - (this.x + 12));
            let currentAngle = Math.atan2(this.vy, this.vx);
            let diff = desiredAngle - currentAngle;
            
            while (diff <= -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            // --- THAY ĐỔI TẠI ĐÂY: Giảm từ 10 độ xuống còn 3.1 độ mỗi khung hình ---
            let maxTurn = 3.1 * Math.PI / 180; 
            if (diff > maxTurn) diff = maxTurn;
            if (diff < -maxTurn) diff = -maxTurn;
            
            let newAngle = currentAngle + diff;
            this.vx = Math.cos(newAngle) * this.speed;
            this.vy = Math.sin(newAngle) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Xử lý đạn chạm Tường Chặn
        for (let wall of walls) {
            if (wall.type === 'wall' || wall.type === 'wall_hit') {
                if (this.x > wall.x && this.x < wall.x + wall.w &&
                    this.y > wall.y && this.y < wall.y + wall.h) {
                    this.explode();
                    break;
                }
            }
        }

        effects.push(new Explosion(this.x + 12 + (Math.random() * 8 - 4), this.y + 12 + (Math.random() * 8 - 4), 8, 'rgba(255, 69, 0, 0.6)'));
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        this.active = false;
        
        if (typeof playSkillSound !== 'undefined') {
            playSkillSound('assets/sounds/sound_skill/ronaldo/c12_hit.ogg');
        }

        effects.push(new Explosion(this.x + 12, this.y + 12, 150, 'rgba(255,50,0,0.8)'));
        
        let checkAOE = (t) => {
            let cx = this.x + 12;
            let cy = this.y + 12;
            let tx = t.x + t.width / 2;
            let ty = t.y + t.height / 2;
            if (Math.hypot(tx - cx, ty - cy) <= 150 + t.width / 2) {
                t.takeDamage(this.damage);
            }
        };

        checkAOE(player1);
        checkAOE(player2);
    }

    applyEffect(target) {
        if (target === this.owner && this.age < 15) return;
        this.explode();
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}