// Hàm hỗ trợ áp dụng nội tại làm chậm 50% trong 5s cho mọi đòn đánh của Pokra
function applyPokraPassive(target) {
    if (!target.isDead) {
        target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 300, 50, 60);
    }
}

// ================= CHIÊU ĐÁNH THƯỜNG (0 - 3 NỘI TẠI) =================
class PokraBasicThrust {
    constructor(x, y, facingRight, owner, stacks) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 75;
        this.facingRight = facingRight;
        this.owner = owner;
        this.stacks = stacks;
        this.active = true;
        
        // Thiết lập sát thương và nhịp đâm theo số nội tại
        if (stacks === 0) {
            this.damages = [15];
            this.timings = [0]; // Đâm ngay lập tức
            this.maxLife = 6;
        } else if (stacks === 1) {
            this.damages = [14, 14];
            this.timings = [0, 10]; // Nhát 1: frame 0, Nhát 2: frame 10
            this.maxLife = 16;
        } else if (stacks === 2) {
            this.damages = [13, 13, 13];
            this.timings = [0, 7, 14];
            this.maxLife = 23;
        } else if (stacks === 3) {
            this.damages = [12, 12, 12, 12];
            this.timings = [0, 6, 12, 18];
            this.maxLife = 25;
        }
        
        this.life = 0;
        this.hitsDone = 0;
        this.color = '#8a2be2'; 
    }

    update() {
        this.x = this.facingRight ? this.owner.x + this.owner.width : this.owner.x - 200;
        this.y = this.owner.y;

        let enemy = this.owner === player1 ? player2 : player1;

        // Nếu chạm mốc thời gian của nhát đâm tiếp theo
        if (this.hitsDone < this.timings.length && this.life === this.timings[this.hitsDone]) {
            // Check trúng mục tiêu
            if (checkCollision(this, enemy) && !enemy.isDead) {
                enemy.takeDamage(this.damages[this.hitsDone]);
                applyPokraPassive(enemy);
                effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 25, 'rgba(138, 43, 226, 0.8)'));
            }
            
            // Vẽ vệt chém (VFX)
            effects.push(new OvalShockwave(this.facingRight ? this.x : this.x + this.width, this.y + 35, this.facingRight, this.color));
            
            this.hitsDone++;
        }

        this.life++;
        if (this.life >= this.maxLife) this.active = false;
    }

    draw() {
        if (!this.active) return;
        
        // TÍNH TOÁN: Chỉ hiển thị hình ảnh mũi nhọn trong vòng 5 frame sau khi đâm
        let shouldDraw = false;
        for (let i = 0; i < this.hitsDone; i++) {
            let timeSinceHit = this.life - this.timings[i];
            if (timeSinceHit > 0 && timeSinceHit <= 5) {
                shouldDraw = true;
                break;
            }
        }
        
        if (!shouldDraw) return; // Quá 5 frame thì tàng hình chờ nhát đâm sau

        ctx.save();
        ctx.fillStyle = '#8a2be2';
        ctx.beginPath();
        if (this.facingRight) {
            ctx.moveTo(this.x, this.y + 25);
            ctx.lineTo(this.x + this.width, this.y + 35);
            ctx.lineTo(this.x, this.y + 45);
        } else {
            ctx.moveTo(this.x + this.width, this.y + 25);
            ctx.lineTo(this.x, this.y + 35);
            ctx.lineTo(this.x + this.width, this.y + 45);
        }
        ctx.fill();
        ctx.restore();
    }
    
    applyEffect(target) {} 
}

// ================= ĐÁNH THƯỜNG MŨI KHOAN ĐỘC (4 NỘI TẠI) =================
class PokraBasicTornado {
    constructor(x, y, vx, owner) {
        this.x = x; 
        this.y = y + 10; // Chỉnh tâm cho cân đối
        this.width = 200; // Chiều dài 200px
        this.height = 30; // Hitbox cao 30px
        this.vx = vx;
        this.vy = 0;
        this.owner = owner;
        this.damage = 40;
        this.active = true;
        this.preserve = true; 
        this.hitEnemy = false;
    }
    
    update() {
        this.x += this.vx;
        if (this.x < -400 || this.x > canvas.width + 400) this.active = false;
        
        // Hạt bụi độc rơi rớt
        if (Math.random() < 0.5) effects.push(new Explosion(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 5, '#4b0082'));
    }
    
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(75, 0, 130, 0.9)'; // Tím sẫm
        ctx.shadowBlur = 15; ctx.shadowColor = '#8a2be2';
        
        // Vẽ Mũi Khoan Nhọn
        ctx.beginPath();
        let isRight = this.vx > 0;
        if (isRight) {
            ctx.moveTo(this.x, this.y); // Đuôi trên
            ctx.lineTo(this.x + this.width, this.y + this.height/2); // Mũi nhọn
            ctx.lineTo(this.x, this.y + this.height); // Đuôi dưới
        } else {
            ctx.moveTo(this.x + this.width, this.y); 
            ctx.lineTo(this.x, this.y + this.height/2); 
            ctx.lineTo(this.x + this.width, this.y + this.height); 
        }
        ctx.fill();
        
        // Các đường gờ xoắn ốc xanh lá (Tạo cảm giác khoan)
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isRight) {
            ctx.moveTo(this.x + 20, this.y + 3); ctx.lineTo(this.x + 50, this.y + this.height - 3);
            ctx.moveTo(this.x + 80, this.y + 6); ctx.lineTo(this.x + 110, this.y + this.height - 6);
            ctx.moveTo(this.x + 140, this.y + 10); ctx.lineTo(this.x + 160, this.y + this.height - 10);
        } else {
            ctx.moveTo(this.x + this.width - 20, this.y + 3); ctx.lineTo(this.x + this.width - 50, this.y + this.height - 3);
            ctx.moveTo(this.x + this.width - 80, this.y + 6); ctx.lineTo(this.x + this.width - 110, this.y + this.height - 6);
            ctx.moveTo(this.x + this.width - 140, this.y + 10); ctx.lineTo(this.x + this.width - 160, this.y + this.height - 10);
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    applyEffect(target) {
        if (!this.hitEnemy) {
            target.takeDamage(this.damage);
            applyPokraPassive(target);
            this.hitEnemy = true; 
        }
    }
}

// ================= CHIÊU 1: ĐÂM LIÊN HOÀN (ĐẨY LÙI) =================
class PokraC1Thrust {
    constructor(x, y, facingRight, owner) {
        this.x = x; this.y = y;
        this.width = 300;
        this.height = 150;
        this.facingRight = facingRight;
        this.owner = owner;
        this.active = true;
        this.life = 0;
        this.maxLife = 120; 
    }

    update() {
        this.x = this.facingRight ? this.owner.x + this.owner.width : this.owner.x - 300;
        this.y = this.owner.y - 50;

        let enemy = this.owner === player1 ? player2 : player1;

        if (this.life % 12 === 0) {
            if (checkCollision(this, enemy) && !enemy.isDead) {
                enemy.takeDamage(10);
                applyPokraPassive(enemy);
                
                // Đẩy lùi
                let pushDir = this.facingRight ? 1 : -1;
                enemy.x += pushDir * 25;
                
                effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 30, '#9400d3'));
            }
            effects.push(new OvalShockwave(this.facingRight ? this.x + 50 : this.x + this.width - 50, this.y + 75 + (Math.random()-0.5)*50, this.facingRight, '#8a2be2'));
        }

        this.life++;
        if (this.life >= this.maxLife) this.active = false;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(75, 0, 130, 0.3)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    
    applyEffect(target) {}
}

// ================= CHIÊU 2: CỘT ĐẤT ĐẨY VÀO TƯỜNG GÂY CHOÁNG =================
class PokraEarthPillar {
    constructor(x, y, vx, owner) {
        this.x = x; this.y = y;
        this.width = 40;
        this.height = 100;
        this.vx = vx;
        this.vy = 0;
        this.owner = owner;
        this.active = true;
        this.caughtEnemy = null;
    }

    update() {
        this.x += this.vx;
        
        let enemy = this.owner === player1 ? player2 : player1;

        if (!this.caughtEnemy && checkCollision(this, enemy) && !enemy.isDead) {
            this.caughtEnemy = enemy;
            applyPokraPassive(enemy);
        }

        if (this.caughtEnemy) {
            this.caughtEnemy.x = this.vx > 0 ? this.x + this.width : this.x - this.caughtEnemy.width;
            
            if (this.caughtEnemy.x <= 0 || this.caughtEnemy.x + this.caughtEnemy.width >= canvas.width) {
                this.caughtEnemy.takeDamage(20);
                this.caughtEnemy.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 240, 0, 60); 
                effects.push(new DamageText(this.caughtEnemy.x, this.caughtEnemy.y - 30, "WALL SPLAT!", '#ffff00'));
                effects.push(new Explosion(this.caughtEnemy.x, this.caughtEnemy.y + 50, 80, '#8b4513'));
                
                this.active = false; 
            }
        }

        if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#654321'; 
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#228b22'; 
        ctx.fillRect(this.x, this.y, this.width, 10);
        ctx.restore();
    }
    
    applyEffect(target) {}
}

// ================= CHIÊU 3: MŨI KHOAN KHỔNG LỒ (HOLD) =================
class PokraC3Tornado {
    constructor(x, y, vx, owner) {
        this.x = x; 
        this.y = y + 40; // Cân bằng độ cao
        this.width = 400; // Siêu to
        this.height = 80; // Hitbox cao 80px
        this.vx = vx;
        this.vy = 0;
        this.owner = owner;
        this.damage = 40;
        this.active = true;
        this.preserve = true;
        this.hitEnemy = false;
        this.poisonTrailTimer = 0;
    }
    
    update() {
        this.x += this.vx;
        if (this.x < -600 || this.x > canvas.width + 600) this.active = false;
        
        // Nhỏ vũng độc
        this.poisonTrailTimer++;
        if (this.poisonTrailTimer % 5 === 0) {
            effects.push(new Explosion(this.x + this.width/2, canvas.height - 50, 40, 'rgba(138, 43, 226, 0.4)'));
        }
    }
    
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(75, 0, 130, 0.95)'; // Tím đậm cực quang
        ctx.shadowBlur = 30; ctx.shadowColor = '#00ff00';
        
        // Mũi Khoan
        ctx.beginPath();
        let isRight = this.vx > 0;
        if (isRight) {
            ctx.moveTo(this.x, this.y); 
            ctx.lineTo(this.x + this.width, this.y + this.height/2); 
            ctx.lineTo(this.x, this.y + this.height); 
        } else {
            ctx.moveTo(this.x + this.width, this.y); 
            ctx.lineTo(this.x, this.y + this.height/2); 
            ctx.lineTo(this.x + this.width, this.y + this.height); 
        }
        ctx.fill();
        
        // Gờ xoắn ốc khổng lồ
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        ctx.beginPath();
        if (isRight) {
            ctx.moveTo(this.x + 50, this.y + 10); ctx.lineTo(this.x + 100, this.y + this.height - 10);
            ctx.moveTo(this.x + 150, this.y + 15); ctx.lineTo(this.x + 200, this.y + this.height - 15);
            ctx.moveTo(this.x + 250, this.y + 25); ctx.lineTo(this.x + 280, this.y + this.height - 25);
        } else {
            ctx.moveTo(this.x + this.width - 50, this.y + 10); ctx.lineTo(this.x + this.width - 100, this.y + this.height - 10);
            ctx.moveTo(this.x + this.width - 150, this.y + 15); ctx.lineTo(this.x + this.width - 200, this.y + this.height - 15);
            ctx.moveTo(this.x + this.width - 250, this.y + 25); ctx.lineTo(this.x + this.width - 280, this.y + this.height - 25);
        }
        ctx.stroke();

        // Lõi năng lượng xoáy
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/4, this.height/6, 0, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
    }
    
    applyEffect(target) {
        if (!this.hitEnemy) {
            target.takeDamage(this.damage + 50); 
            applyPokraPassive(target);
            target.addStatus('freeze', 'debuff', 'assets/icon/debuff/freeze.png', 54, 0, 60); 
            this.hitEnemy = true;
            effects.push(new DamageText(target.x, target.y - 40, "TOXIC DRILL!", '#00ff00'));
        }
    }
}