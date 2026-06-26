class EnergyBounceBullet extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 12, 12, '#00ffcc', owner, 7, false);
        this.bounceCount = 0;
        this.maxBounces = 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        let bounced = false;

        if (this.x <= 0) {
            this.x = 0;
            this.vx *= -1;
            bounced = true;
        } else if (this.x + this.width >= canvas.width) {
            this.x = canvas.width - this.width;
            this.vx *= -1;
            bounced = true;
        }

        if (this.y + this.height >= canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            this.vy *= -1;
            bounced = true;
        }

        if (bounced) {
            if (typeof playSkillSound !== 'undefined') {
                playSkillSound('assets/sounds/sound_skill/robot-R1/basic_hitwall.ogg');
            }

            this.bounceCount++;
            if (this.bounceCount > this.maxBounces) {
                this.active = false;
            } else {
                let currentAngle = Math.atan2(this.vy, this.vx);
                let randomDev = (Math.random() * (Math.PI / 4)) - (Math.PI / 8);
                let speed = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(currentAngle + randomDev) * speed;
                this.vy = Math.sin(currentAngle + randomDev) * speed;
            }
        }
    }

    applyEffect(target) {
        if (typeof playSkillSound !== 'undefined') {
            playSkillSound('assets/sounds/sound_skill/robot-R1/basic_hit.ogg');
        }
        super.applyEffect(target);
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class EnergyOrb extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 20, 20, '#00bfff', owner, 25, false);
        this.zapTimer = 0;
    }

    update() {
        super.update();
        this.zapTimer++;
        if (this.zapTimer >= 3) {
            this.zapTimer = 0;
            let enemy = this.owner === player1 ? player2 : player1;
            
            if (!enemy.isDead) {
                let cx = this.x + this.width / 2;
                let cy = this.y + this.height / 2;
                let ex = enemy.x + enemy.width / 2;
                let ey = enemy.y + enemy.height / 2;
                let dist = Math.hypot(ex - cx, ey - cy);
                
                if (dist <= 225) {
                    enemy.takeDamage(1);
                    effects.push(new LightningZap(cx, cy, ex, ey, '#00ffff')); 
                    
                    let zaps = ['c1_zip1.ogg', 'c1_zip2.ogg', 'c1_zip3.ogg'];
                    let randomZap = zaps[Math.floor(Math.random() * zaps.length)];
                    if (typeof playSkillSound !== 'undefined') playSkillSound('assets/sounds/sound_skill/robot-R1/' + randomZap);
                }
            }
        }
    }

    applyEffect(target) {
        if (typeof playSkillSound !== 'undefined') playSkillSound('assets/sounds/sound_skill/robot-R1/c1_hit.ogg');
        super.applyEffect(target);
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class ExplosiveEnergyBall extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 30, 30, '#ff3300', owner, 50, false);
        this.hasExploded = false;
    }

    update() {
        if (this.hasExploded) return;
        this.x += this.vx;

        // Cơ chế hợp nhất: Tìm và kiểm tra va chạm với EnergyOrb (Chiêu 1) của bản thân
        for (let proj of projectiles) {
            if (proj instanceof EnergyOrb && proj.active && proj.owner === this.owner) {
                let dx = (proj.x + proj.width / 2) - (this.x + this.width / 2);
                let dy = (proj.y + proj.height / 2) - (this.y + this.height / 2);
                let dist = Math.hypot(dx, dy);

                if (dist < (proj.width / 2 + this.width / 2)) {
                    // Hủy hai quả cầu thường
                    proj.active = false;
                    this.active = false;

                    // Tạo Siêu cầu điện di chuyển siêu chậm
                    let midX = (proj.x + this.x) / 2;
                    let midY = (proj.y + this.y) / 2;
                    let speed = 1.5; // Tốc độ di chuyển siêu chậm
                    let angle = Math.atan2(this.vy, this.vx);
                    if (this.vx === 0 && this.vy === 0) {
                        angle = this.owner.facingRight ? 0 : Math.PI;
                    }
                    let svx = Math.cos(angle) * speed;
                    let svy = Math.sin(angle) * speed;

                    projectiles.push(new SuperElectricOrb(midX, midY, svx, svy, this.owner));
                    return;
                }
            }
        }

        if (this.x <= 0 || this.x + this.width >= canvas.width || this.y + this.height >= canvas.height - groundHeight) {
            this.explode(true);
        }
    }

    explode(hitWall = false) {
        if (this.hasExploded) return;
        this.hasExploded = true;
        this.active = false;
        
        if (typeof playSkillSound !== 'undefined') {
            playSkillSound('assets/sounds/sound_skill/robot-R1/c3_hit.ogg');
        }

        let explosionRadius = hitWall ? 500 : 100;
        effects.push(new Explosion(this.x + this.width / 2, this.y + this.height / 2, explosionRadius, 'rgba(255, 69, 0, 0.8)'));

        let checkHit = (target) => {
            let dx = (target.x + target.width / 2) - (this.x + this.width / 2);
            let dy = (target.y + target.height / 2) - (this.y + this.height / 2);
            if (Math.sqrt(dx * dx + dy * dy) < explosionRadius + Math.max(target.width, target.height) / 2) {
                target.takeDamage(this.damage);
                
                if (!hitWall && target !== this.owner) {
                    target.stunTimer = 150; 
                    effects.push(new DamageText(target.x, target.y - 30, "STUNNED!", '#ffff00'));
                }
            }
        };

        checkHit(player1);
        checkHit(player2);
        
        if (hitWall) {
            canvas.style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
            setTimeout(() => canvas.style.transform = 'none', 100);
        }
    }

    applyEffect(target) {
        this.explode(false);
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ================= LỚP SIÊU CẦU ĐIỆN (HỢP NHẤT CHIÊU 1 + CHIÊU 3) =================
class SuperElectricOrb extends Projectile {
    constructor(x, y, vx, vy, owner) {
        super(x, y, vx, vy, 45, 45, '#00ffff', owner, 45, false);
        this.zapTimer = 0;
        this.zapInterval = 60; // 1 giây giật một lần
        this.pulseRadius = 400; // Tầm giật điện tự động rộng 400px
        this.age = 0; // Đếm số khung hình tồn tại để ngăn tự kích nổ ngay lập tức khi xuất hiện
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        if (this.x < -100 || this.x > canvas.width + 100 || this.y > canvas.height + 100 || this.y < -500) {
            this.active = false;
        }

        // Tự động quét giật tia điện vào đối thủ (Không tự giật chính mình)
        this.zapTimer++;
        if (this.zapTimer >= this.zapInterval) {
            this.zapTimer = 0;
            let enemy = this.owner === player1 ? player2 : player1;
            if (enemy && !enemy.isDead) {
                let cx = this.x + this.width / 2;
                let cy = this.y + this.height / 2;
                let ex = enemy.x + enemy.width / 2;
                let ey = enemy.y + enemy.height / 2;
                let dist = Math.hypot(ex - cx, ey - cy);

                if (dist <= this.pulseRadius) {
                    enemy.takeDamage(12);
                    effects.push(new LightningZap(cx, cy, ex, ey, '#00ffff'));
                    if (typeof playSkillSound !== 'undefined') {
                        playSkillSound('assets/sounds/sound_skill/robot-R1/c1_zip1.ogg');
                    }
                }
            }
        }
    }

    applyEffect(target) {
        // Gây sát thương trực tiếp và áp đặt hiệu ứng sốc điện
        target.takeDamage(this.damage);
        target.addStatus('shock', 'debuff', 'assets/icon/debuff/shock.png', 600, 5, 60); // 5 giây, mỗi giây gây 5 sát thương
        
        effects.push(new DamageText(target.x, target.y - 30, "SHOCKED!", '#00ffff'));
        effects.push(new Explosion(this.x + this.width / 2, this.y + this.height / 2, 120, 'rgba(0, 255, 204, 0.8)'));
        
        if (typeof playSkillSound !== 'undefined') {
            playSkillSound('assets/sounds/sound_skill/robot-R1/c3_hit.ogg');
        }

        this.active = false;
    }

    draw() {
        if (!this.active) return;
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;

        ctx.save();
        // Lớp phát quang ngoài
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffcc';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 + Math.sin(Date.now() / 80) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Lõi năng lượng vàng
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 4, 0, Math.PI * 2);
        ctx.fill();

        // Tia lửa điện ngẫu nhiên bao quanh
        if (Math.random() < 0.4) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60);
            ctx.lineTo(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ================= LỚP VÙNG NHIỄU ĐIỆN (COMBO CHIÊU 1 + CHIÊU 2) =================
class ElectricalZone {
    constructor(owner) {
        this.owner = owner;
        this.radius = 400; // Tầm rộng tăng lên 400px theo yêu cầu
        this.duration = 360; // Tồn tại 6 giây (360 frames ở tốc độ 60fps)
        this.timer = this.duration;
        this.active = true;
        this.tickRate = 20; // 0.33 giây gây sát thương một lần (20 frames) -> Tổng 3 sát thương/giây
        this.tickTimer = 0;
    }

    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.active = false;
            return;
        }

        // Luôn bám sát trung tâm của Robot-R1
        this.x = this.owner.x + this.owner.width / 2;
        this.y = this.owner.y + this.owner.height / 2;

        this.tickTimer++;
        if (this.tickTimer >= this.tickRate) {
            this.tickTimer = 0;
            let enemy = this.owner === player1 ? player2 : player1;
            if (enemy && !enemy.isDead) {
                let ex = enemy.x + enemy.width / 2;
                let ey = enemy.y + enemy.height / 2;
                let dist = Math.hypot(ex - this.x, ey - this.y);

                if (dist <= this.radius) {
                    // Gây 1 sát thương mỗi tick (20 frames) -> Đạt chính xác 3 sát thương/giây
                    enemy.takeDamage(1);
                    // Hồi phục lượng máu tương đương cho bản thân
                    this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + 1);
                    effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, "+1", '#00ffcc'));
                    effects.push(new LightningZap(this.x, this.y, ex, ey, '#00ffcc'));

                    // Phát âm thanh giật điện ngẫu nhiên khi trúng mục tiêu
                    let zaps = ['c1_zip1.ogg', 'c1_zip2.ogg', 'c1_zip3.ogg'];
                    let randomZap = zaps[Math.floor(Math.random() * zaps.length)];
                    if (typeof playSkillSound !== 'undefined') {
                        playSkillSound('assets/sounds/sound_skill/robot-R1/' + randomZap);
                    }
                }
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        // Vẽ ranh giới điện trường dao động nhẹ
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.12)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + Math.sin(Date.now() / 120) * 8, 0, Math.PI * 2);
        ctx.stroke();

        // Đường vân viền nét đứt
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 12]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Tia sét chạy dọc trong vùng
        if (Math.random() < 0.25) {
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * this.radius;
            let lx = this.x + Math.cos(angle) * distance;
            let ly = this.y + Math.sin(angle) * distance;
            effects.push(new LightningZap(this.x, this.y, lx, ly, 'rgba(0, 255, 204, 0.5)'));
        }
        ctx.restore();
    }
}

// ================= CAN THIỆP GIAO DIỆN CHƯƠNG TRÌNH PLAYER =================
// Đè lên các cơ chế kích hoạt chiêu để xử lý combo chuyển hướng cho Robot-R1
if (typeof Player !== 'undefined' && Player.prototype) {
    
    // Can thiệp vào vòng lặp update để lắng nghe phím bấm Chiêu 2 khi đang vận Chiêu 1
    const originalUpdate = Player.prototype.update;
    Player.prototype.update = function() {
        if (this.heroType === 'robot-R1' && this.isChanneling && this.pendingSkill === 'c1') {
            // Kiểm tra nếu phím Chiêu 2 được nhấn và Chiêu 2 không trong thời gian hồi
            if (keys[this.controls.c2] && this.cds.c2 <= 0) {
                this.triggerSkill('c2');
            }
        }
        originalUpdate.call(this);
    };

    const originalTriggerSkill = Player.prototype.triggerSkill;
    Player.prototype.triggerSkill = function(skillKey) {
        if (this.heroType === 'robot-R1') {
            // Nếu người chơi bấm chiêu 2 trong khi chiêu 1 đang vận hành gồng tụ lực
            if (skillKey === 'c2' && this.isChanneling && this.pendingSkill === 'c1') {
                this.pendingSkill = 'robot_r1_combo'; // Đổi tiến trình sang combo nhiễu điện
                this.cds.c2 = 480; // Bắt đầu tính thời gian hồi của chiêu 2
                effects.push(new DamageText(this.x, this.y - 30, "INTERFERENCE COMBO!", '#00ffcc'));
                
                if (typeof playSkillSound !== 'undefined') {
                    playSkillSound('assets/sounds/sound_skill/robot-R1/c2_upshield.ogg');
                }
                return; // Ngăn chặn việc chạy chiêu 2 thường (Không tạo 3 lớp giáp và khiên ảo)
            }
        }
        originalTriggerSkill.call(this, skillKey);
    };

    const originalExecuteSkill = Player.prototype.executeSkill;
    Player.prototype.executeSkill = function(skillKey) {
        if (this.heroType === 'robot-R1' && skillKey === 'robot_r1_combo') {
            // Khi kết thúc 15 frame vận khí thành công, tạo Vùng nhiễu điện
            effects.push(new ElectricalZone(this));

            // Nhận 5% HP tối đa thành giáp/máu ảo trong 5s (300 frames)
            let shieldValue = Math.floor(this.maxHp * 0.05);
            this.addStatus('hshield', 'buff', 'assets/icon/buff/hshield.png', 300, shieldValue, 60);
            this.tempShield = shieldValue;

            if (typeof playSkillSound !== 'undefined') {
                playSkillSound('assets/sounds/sound_skill/robot-R1/c3_cast.ogg');
            }
            return;
        }
        originalExecuteSkill.call(this, skillKey);
    };
}