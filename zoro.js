/**
 * Roronoa Zoro - Class Expansion for Arena Hero Duel
 */

// 1. TỐI ƯU HÓA HẠT AURA ĐỂ TRÁNH TỐN RAM/CPU
class ZoroAuraParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -Math.random() * 2 - 0.5;
        this.size = Math.random() * 3 + 2;
        this.life = 15 + Math.random() * 10;
        this.maxLife = this.life;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = (this.life / this.maxLife) * 0.6;
        ctx.fillStyle = '#2ecc71';
        // Sử dụng fillRect thay vì arc + shadowBlur để tối ưu hóa hiệu năng vẽ
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Thực thể nhát chém chuẩn của Zoro
class ZoroSlashProj extends Projectile {
    constructor(x, y, vx, vy, owner, damage, color, range, isForm2 = false, isDarkGreen = false) {
        super(x, y, vx, vy, isForm2 ? 40 : 30, isForm2 ? 40 : 15, color, owner, damage);
        this.startX = x;
        this.range = range;
        this.isForm2 = isForm2;
        this.isDarkGreen = isDarkGreen;
    }

    update() {
        super.update();
        if (Math.abs(this.x - this.startX) >= this.range) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        if (this.isForm2) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, Math.PI/4, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }

    applyEffect(target) {
        super.applyEffect(target);
        if (this.owner && this.owner.heroType === 'zoro') {
            let cur = this.owner.getStatusValue('zorostack');
            // Cộng stack và áp dụng giới hạn tối đa 251
            this.owner.addStatus('zorostack', 'buff', 'assets/icon/buff/zorostack.png', 'inf', Math.min(251, cur + 5), 60);

            if (this.owner.zoroForm === 3) {
                this.owner.addStatus('hastesp', 'buff', 'assets/icon/buff/hastesp.png', 60, 75, 60);
            }
        }
    }
}

// Vùng sát thương Chiêu 1 - Dạng 3 (Tồn tại 5 giây độc lập)
class ZoroS1Zone extends Projectile {
    constructor(x, y, owner) {
        // Thiết lập kích thước ảo nhỏ để tránh va chạm đạn vật lý thông thường
        super(x - 5, y - 5, 0, 0, 10, 10, 'transparent', owner, 0);
        this.centerX = x;
        this.centerY = y;
        this.radius = 150;
        this.life = 300; // 5s = 300 frames
        this.damageTimer = 0;
        this.preserve = true; // Tránh bị clear bởi các hiệu ứng xóa đạn thông thường
    }

    update() {
        this.life--;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        this.damageTimer++;
        if (this.damageTimer >= 15) { // 0.25s = 15 frames
            this.damageTimer = 0;
            let enemy = this.owner === player1 ? player2 : player1;
            let dist = Math.hypot((enemy.x + enemy.width/2) - this.centerX, (enemy.y + enemy.height/2) - this.centerY);
            if (dist <= this.radius && !enemy.isDead) {
                enemy.takeDamage(10);
                effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 30, 'rgba(46, 204, 113, 0.5)'));
            }
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -Date.now() / 30;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI*2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(46, 204, 113, 0.05)';
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

// Thực thể Lốc xoáy (Chiêu 2 - Dạng 3 hỗ trợ đứng im biến mất sau 0.5s)
class ZoroTornado extends Projectile {
    constructor(x, y, vx, vy, owner, width = 30, height = 100, damage = 40, lifetime = null) {
        super(x, y, vx, vy, width, height, 'rgba(46, 204, 113, 0.75)', owner, damage);
        this.lifetime = lifetime;
    }

    update() {
        if (this.lifetime !== null) {
            this.lifetime--;
            if (this.lifetime <= 0) {
                this.active = false;
                return;
            }
        }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -200 || this.x > canvas.width + 200) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#2ecc71';
        
        let t = Date.now() / 50;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.quadraticCurveTo(this.x - (this.width*0.15) + Math.sin(t)*(this.width*0.2), this.y + this.height/2, this.x - (this.width*0.3), this.y);
        ctx.lineTo(this.x + this.width + (this.width*0.3), this.y);
        ctx.quadraticCurveTo(this.x + this.width + (this.width*0.15) + Math.sin(t)*(this.width*0.2), this.y + this.height/2, this.x + this.width/2, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    applyEffect(target) {
        if (target === this.owner) return;
        target.takeDamage(this.damage);
        target.y = Math.max(50, target.y - 150);
        target.vy = -10;
        target.stunTimer = 30;
        effects.push(new Explosion(target.x + target.width/2, target.y + target.height/2, this.width, 'rgba(39, 174, 96, 0.8)'));
        this.active = false;
    }
}

class ZoroC3PillarFX {
    constructor(x, y) {
        this.x = x; 
        this.y = y; 
        this.width = 200; 
        this.height = 1000;
        this.timer = 30;
        this.maxTimer = 30;
        this.active = true;
    }

    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let alpha = this.timer / this.maxTimer;
        
        // Khống chế tọa độ vẽ thực tế nghiêm ngặt trong viewport của canvas để ngăn lỗi kẹt hình ở rìa màn hình
        let topY = Math.max(0, this.y - this.height/2);
        let bottomY = Math.min(canvas.height, this.y + this.height/2);
        let drawHeight = bottomY - topY;

        if (drawHeight > 0) {
            let gradient = ctx.createLinearGradient(this.x - this.width/2, this.y, this.x + this.width/2, this.y);
            gradient.addColorStop(0, 'rgba(46, 204, 113, 0)');
            gradient.addColorStop(0.2, `rgba(46, 204, 113, ${alpha * 0.4})`);
            gradient.addColorStop(0.5, `rgba(240, 255, 240, ${alpha * 0.8})`);
            gradient.addColorStop(0.8, `rgba(46, 204, 113, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.width/2, topY, this.width, drawHeight);

            ctx.strokeStyle = `rgba(39, 174, 96, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - this.width/2, topY);
            ctx.lineTo(this.x - this.width/2, bottomY);
            ctx.moveTo(this.x + this.width/2, topY);
            ctx.lineTo(this.x + this.width/2, bottomY);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                let lineX = this.x - this.width/2 + (this.width / 4) * (i + 1) + Math.sin(Date.now()/100 + i)*10;
                ctx.beginPath();
                ctx.moveTo(lineX, topY);
                ctx.lineTo(lineX, bottomY);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// Nhúng lớp Zoro vào cấu trúc core bằng mô hình ghi đè nguyên mẫu
(function() {
    const originalUpdate = Player.prototype.update;
    const originalDraw = Player.prototype.draw;
    const originalTriggerSkill = Player.prototype.triggerSkill;
    const originalExecuteSkill = Player.prototype.executeSkill;
    const originalTakeDamage = Player.prototype.takeDamage;

    Player.prototype.update = function() {
        if (this.heroType === 'zoro') {
            updateZoro(this);
            if (this.isZoroTransforming) {
                this.updateStatuses();
                return;
            }
        }
        originalUpdate.apply(this, arguments);
    };

    // FIX LỖI KHÔNG HIỂN THỊ THANH VẬN CHIÊU (CHANNELING BAR)
    Player.prototype.draw = function() {
        if (this.heroType === 'zoro') {
            drawZoro(this); // Vẽ sprite của Zoro trước
        }
        originalDraw.apply(this, arguments); // Sau đó gọi hàm vẽ gốc để vẽ thanh vận chiêu, hiệu ứng choáng, đóng băng, v.v. lên trên
    };

    Player.prototype.triggerSkill = function(skillKey) {
        if (this.heroType === 'zoro') {
            triggerZoroSkill(this, skillKey);
        } else {
            originalTriggerSkill.apply(this, arguments);
        }
    };

    Player.prototype.executeSkill = function(skillKey) {
        if (this.heroType === 'zoro') {
            executeZoroSkill(this, skillKey);
        } else {
            originalExecuteSkill.apply(this, arguments);
        }
    };

    Player.prototype.takeDamage = function(amount, damageType) {
        if (this.heroType === 'zoro' && this.isZoroTransforming) {
            return; // Miễn nhiễm sát thương khi chuyển hóa
        }
        originalTakeDamage.apply(this, arguments);
    };

    function updateZoro(player) {
        if (player.zoroInit === undefined) {
            player.zoroInit = true;
            player.zoroPassiveTimer = 0;
            player.zoroForm = 1; 
            player.isZoroTransforming = false;
            player.zoroTransformTimer = 0;
            player.maxCds = { c1: 400, c2: 420, c3: 600 };
            player.addStatus('zorostack', 'buff', 'assets/icon/buff/zorostack.png', 'inf', 0, 60);
        }

        // Kiểm tra và khống chế mốc stack tối đa là 251
        let currentStacks = player.getStatusValue('zorostack');
        if (currentStacks > 251) {
            let stackStatus = player.statusList.find(s => s.id === 'zorostack');
            if (stackStatus) stackStatus.value = 251;
            currentStacks = 251;
        }

        // Phân cấp dạng dựa theo quy chuẩn mới:
        // Dạng 1: 0 - 125 | Dạng 2: 126 - 250 | Dạng 3: 251
        let targetForm = 1;
        if (currentStacks >= 251) targetForm = 3;
        else if (currentStacks >= 126) targetForm = 2;

        if (targetForm !== player.zoroForm && !player.isZoroTransforming) {
            player.isZoroTransforming = true;
            player.zoroTransformTimer = 60; // 1s chuyển hóa
            player.zoroTargetForm = targetForm;
            player.isInvincible = true;
            player.vx = 0;
            player.vy = 0;
        }

        if (player.isZoroTransforming) {
            player.vx = 0;
            player.vy = 0;
            player.isInvincible = true;
            player.zoroTransformTimer--;

            if (Math.random() < 0.4) {
                effects.push(new ZoroAuraParticle(player.x + player.width/2 + (Math.random()-0.5)*40, player.y + player.height/2 + (Math.random()-0.5)*40));
            }

            if (player.zoroTransformTimer <= 0) {
                player.isZoroTransforming = false;
                player.isInvincible = false;
                player.zoroForm = player.zoroTargetForm;

                effects.push(new OvalShockwave(player.x + player.width/2, player.y + player.height/2, player.facingRight, '#2ecc71', 0, {
                    radiusY: 50, radiusX: 50, growthY: 10, growthX: 10, maxTimer: 25, lineWidth: 6
                }));
            }
            return;
        }

        // Tăng nội tại tự nhiên mỗi 2s (+1 zorostack) và giới hạn tối đa 251
        player.zoroPassiveTimer++;
        if (player.zoroPassiveTimer >= 120) {
            player.zoroPassiveTimer = 0;
            let cur = player.getStatusValue('zorostack');
            player.addStatus('zorostack', 'buff', 'assets/icon/buff/zorostack.png', 'inf', Math.min(251, cur + 1), 60);
        }

        if (player.zoroForm === 3 && Math.random() < 0.15) { // Giảm tỉ lệ sinh hạt để tối ưu RAM
            effects.push(new ZoroAuraParticle(player.x + Math.random()*player.width, player.y + player.height));
        }
    }

    function triggerZoroSkill(player, skillKey) {
        if (player.isZoroTransforming) return;
        if (player.isSilenced || player.hasStatus('stuncc')) {
            effects.push(new DamageText(player.x, player.y - 20, "Bị Khóa!", '#ff0000'));
            return;
        }

        if (skillKey === 'basic') {
            player.executeSkill('basic');
            player.cds.basic = 20; 
        }
        else if (skillKey === 'c1') {
            if (player.zoroForm === 1) {
                // Khởi động thanh vận chiêu trong 45 frames (0.75s) để người đứng khựng lại
                player.startChannel('zoro_c1_f1_dummy', 45); 
                player.cds.c1 = 300;

                // Xếp lịch tung 3 nhát chém tự động tại các mốc thời gian yêu cầu
                player.actionQueue.push({
                    delay: 15, // 0.25s
                    action: () => { zoroSlashC1(player, 1); }
                });
                player.actionQueue.push({
                    delay: 30, // 0.5s
                    action: () => { zoroSlashC1(player, 2); }
                });
                player.actionQueue.push({
                    delay: 45, // 0.75s
                    action: () => { zoroSlashC1(player, 3); }
                });
            } else if (player.zoroForm === 2) {
                player.startChannel('zoro_c1_f2', 30); 
                player.cds.c1 = 360;
            } else if (player.zoroForm === 3) {
                player.executeSkill('zoro_c1_f3');
                player.cds.c1 = 400;
            }
        }
        else if (skillKey === 'c2') {
            if (player.zoroForm === 1) {
                player.executeSkill('zoro_c2_f1_dash');
                player.cds.c2 = 300;
            } else if (player.zoroForm === 2) {
                player.executeSkill('zoro_c2_f2');
                player.cds.c2 = 360;
            } else if (player.zoroForm === 3) {
                player.executeSkill('zoro_c2_f3');
                player.cds.c2 = 420;
            }
        }
        else if (skillKey === 'c3') {
            if (player.zoroForm === 1) {
                player.executeSkill('zoro_c3_f1_dash');
                player.cds.c3 = 450;
            } else if (player.zoroForm === 2) {
                player.executeSkill('zoro_c3_f2');
                player.cds.c3 = 500;
            } else if (player.zoroForm === 3) {
                player.startChannel('zoro_c3_f3', 15); 
                player.cds.c3 = 600;
            }
        }
    }

    // Logic xử lý nhát chém Chiêu 1 - Dạng 1
    function zoroSlashC1(player, step) {
        if (player.isDead) return;
        let dir = player.facingRight ? 1 : -1;
        let enemy = player === player1 ? player2 : player1;
        
        // Thiết lập hitbox chém rộng 120px khớp chuẩn với đồ họa
        let hitbox = {
            x: player.facingRight ? player.x + player.width : player.x - 120,
            y: player.y - 10,
            width: 120,
            height: player.height + 20,
            owner: player
        };
        
        let effectX = player.facingRight ? player.x + player.width + 60 : player.x - 60;
        effects.push(new OvalShockwave(effectX, player.y + player.height/2, player.facingRight, '#2ecc71', (Math.PI/6) * (step - 2), {
            radiusY: 45,
            radiusX: 15,
            growthY: 8,
            growthX: 3,
            maxTimer: 12,
            lineWidth: 3
        }));
        
        if (checkCollision(hitbox, enemy) && !enemy.isDead) {
            enemy.takeDamage(12);
            effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 25, 'rgba(46, 204, 113, 0.6)'));
        }
    }

    function executeZoroSkill(player, skillKey) {
        let dir = player.facingRight ? 1 : -1;
        let enemy = player === player1 ? player2 : player1;
        let px = player.facingRight ? player.x + player.width + 5 : player.x - 30;

        if (skillKey === 'basic') {
            if (player.zoroForm === 1) {
                projectiles.push(new ZoroSlashProj(px, player.y + 15, dir * 15, 0, player, 10, '#2ecc71', 250, false, false));
            } else if (player.zoroForm === 2) {
                projectiles.push(new ZoroSlashProj(px, player.y + 10, dir * 18, 0, player, 15, '#27ae60', 350, true, false));
            } else if (player.zoroForm === 3) {
                projectiles.push(new ZoroSlashProj(px, player.y + 10, dir * 20, 0, player, 20, '#1e8449', 350, true, true));
            }
        }
        else if (skillKey === 'zoro_c1_f2') {
            player.vx = 0;
            effects.push(new OvalShockwave(player.x + player.width/2, player.y + player.height/2, player.facingRight, '#27ae60', Math.PI/4, {
                radiusY: 45, radiusX: 20, growthY: 10, growthX: 5, maxTimer: 15, lineWidth: 4
            }));
            effects.push(new OvalShockwave(player.x + player.width/2, player.y + player.height/2, player.facingRight, '#27ae60', -Math.PI/4, {
                radiusY: 45, radiusX: 20, growthY: 10, growthX: 5, maxTimer: 15, lineWidth: 4
            }));

            let dist = Math.hypot((enemy.x + enemy.width/2) - (player.x + player.width/2), (enemy.y + enemy.height/2) - (player.y + player.height/2));
            if (dist <= 125 && !enemy.isDead) {
                enemy.takeDamage(30);
            }
        }
        else if (skillKey === 'zoro_c1_f3') {
            let zoneX = player.x + player.width/2;
            let zoneY = player.y + player.height/2;
            
            // 1. Tạo vùng sát thương bán kính 150px
            projectiles.push(new ZoroS1Zone(zoneX, zoneY, player));

            // 2. Lập tức lướt về phía trước 125px
            let targetX = player.x + dir * 125;
            if (targetX < 0) targetX = 0;
            if (targetX + player.width > canvas.width) targetX = canvas.width - player.width;
            player.x = targetX;
            
            effects.push(new Explosion(player.x + player.width/2, player.y + player.height/2, 40, 'rgba(46, 204, 113, 0.6)'));
        }
        else if (skillKey === 'zoro_c2_f1_dash') {
            let targetX = player.x;
            for (let i = 0; i < 100; i += 5) {
                let checkX = player.x + i * dir;
                let dummyRect = { x: checkX, y: player.y, width: player.width, height: player.height };
                if (checkCollision(dummyRect, enemy)) {
                    targetX = checkX - 10 * dir;
                    break;
                }
                targetX = checkX;
            }
            if (targetX < 0) targetX = 0;
            if (targetX + player.width > canvas.width) targetX = canvas.width - player.width;
            
            player.x = targetX;

            player.actionQueue.push({
                delay: 9,
                action: () => {
                    let slashX = player.facingRight ? player.x + player.width + 10 : player.x - 30;
                    effects.push(new OvalShockwave(slashX, player.y + player.height/2, player.facingRight, '#2ecc71', Math.PI/4));
                    effects.push(new OvalShockwave(slashX, player.y + player.height/2, player.facingRight, '#2ecc71', -Math.PI/4));
                    
                    let hitRect = { x: player.facingRight ? player.x : player.x - 50, y: player.y, width: player.width + 50, height: player.height };
                    if (checkCollision(hitRect, enemy) && !enemy.isDead) {
                        enemy.takeDamage(15);
                    }
                }
            });
        }
        else if (skillKey === 'zoro_c2_f2') {
            // TĂNG LƯỚT LÊN 200PX VÀ HITBOX DAME ĐỒNG BỘ
            let startX = player.x;
            let targetX = player.x + dir * 200;
            if (targetX < 0) targetX = 0;
            if (targetX + player.width > canvas.width) targetX = canvas.width - player.width;

            let actualDashDist = Math.abs(targetX - startX);

            let pathRect = {
                x: Math.min(startX, targetX),
                y: player.y,
                width: actualDashDist + player.width,
                height: player.height,
                owner: player
            };

            player.x = targetX;

            effects.push(new OvalShockwave(startX + (dir * actualDashDist / 2) + player.width/2, player.y + player.height/2, player.facingRight, '#27ae60', 0, {
                radiusY: 15, radiusX: actualDashDist / 2, growthY: 3, growthX: 10, maxTimer: 12, lineWidth: 3
            }));

            if (checkCollision(pathRect, enemy) && !enemy.isDead) {
                enemy.takeDamage(30);
                effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 45, 'rgba(39, 174, 96, 0.7)'));
            }
        }
        else if (skillKey === 'zoro_c2_f3') {
            // Tăng chiều rộng lốc xoáy thêm 50% (75px * 1.5 = 112px), chiều cao giữ nguyên 250px
            let tornadoW = 112; 
            let tornadoH = 250;
            let tX = player.x + player.width/2 - tornadoW/2;
            let tY = player.y + player.height - tornadoH;
            projectiles.push(new ZoroTornado(tX, tY, 0, 0, player, tornadoW, tornadoH, 45, 30));
        }
        else if (skillKey === 'zoro_c3_f1_dash') {
            let targetX = player.x + dir * 125;
            if (targetX < 0) targetX = 0;
            if (targetX + player.width > canvas.width) targetX = canvas.width - player.width;
            player.x = targetX;

            player.facingRight = !player.facingRight; // Quay lại hướng về phía kẻ địch sau khi lướt qua
            player.lockFacingTimer = 15; // KHÓA hướng nhìn trong 15 frames để chém xong mới trả lại tự do quay mặt

            player.actionQueue.push({
                delay: 12,
                action: () => {
                    let slashDir = player.facingRight ? 1 : -1;
                    effects.push(new OvalShockwave(player.x + player.width/2 + 100*slashDir, player.y + player.height/2, player.facingRight, '#2ecc71', Math.PI/180 * 20, {
                        radiusY: 60, radiusX: 15, growthY: 12, growthX: 3, maxTimer: 15, lineWidth: 3
                    }));

                    let dist = Math.hypot((enemy.x + enemy.width/2) - (player.x + player.width/2), (enemy.y + enemy.height/2) - (player.y + player.height/2));
                    let inDirection = player.facingRight ? (enemy.x > player.x) : (enemy.x < player.x);
                    if (dist <= 200 && inDirection && !enemy.isDead) {
                        enemy.takeDamage(25);
                        effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 50, '#2ecc71'));
                    }
                }
            });
        }
        else if (skillKey === 'zoro_c3_f2') {
            effects.push(new OvalShockwave(player.x + player.width/2, player.y + player.height/2, player.facingRight, '#27ae60', 0, {
                radiusY: 75, radiusX: 200, growthY: 15, growthX: 25, maxTimer: 15, lineWidth: 5
            }));

            let dx = Math.abs((enemy.x + enemy.width/2) - (player.x + player.width/2));
            let dy = Math.abs((enemy.y + enemy.height/2) - (player.y + player.height/2));
            if (dx <= 200 && dy <= 75 && !enemy.isDead) {
                enemy.takeDamage(35);
            }
        }
        else if (skillKey === 'zoro_c3_f3') {
            let targetX = player.x + player.width/2;
            let targetY = player.y + player.height/2;

            // Spawns hiệu ứng làm lại dạng cột chỉ rõ biên giới hạn hitbox 200px
            effects.push(new ZoroC3PillarFX(targetX, targetY));

            canvas.style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
            setTimeout(() => canvas.style.transform = 'none', 150);

            let dx = Math.abs((enemy.x + enemy.width/2) - targetX);
            let dy = (enemy.y + enemy.height/2) - targetY;
            if (dx <= 100 && dy >= -500 && dy <= 500 && !enemy.isDead) {
                enemy.takeDamage(55);
                effects.push(new Explosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 120, 'rgba(46, 204, 113, 0.8)'));
            }
        }
    }

    function drawZoro(player) {
        let cx = player.x + player.width / 2;
        let cy = player.y + player.height / 2;
        let flip = player.facingRight ? 1 : -1;

        if (player.isZoroTransforming) {
            let shakeX = (Math.random() - 0.5) * 6;
            let shakeY = (Math.random() - 0.5) * 6;
            ctx.translate(shakeX, shakeY);
        }

        if (player.zoroForm === 1) {
            ctx.fillStyle = '#111'; 
            ctx.fillRect(player.x + 4, player.y + 35, 8, 15);
            ctx.fillRect(player.x + 18, player.y + 35, 8, 15);

            ctx.fillStyle = '#0a3d1d'; 
            ctx.fillRect(player.x, player.y + 25, player.width, 10);

            ctx.fillStyle = '#2ecc71'; 
            ctx.fillRect(player.x - 1, player.y + 18, player.width + 2, 8);

            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(player.x, player.y + 12, player.width, 8);

            ctx.fillStyle = '#ffcc99'; 
            ctx.fillRect(player.x + 4, player.y, player.width - 8, 12);

            ctx.fillStyle = '#111'; 
            ctx.fillRect(player.x - (player.facingRight ? 2 : -26), player.y + 14, 4, 4);

            ctx.fillStyle = '#27ae60'; 
            ctx.fillRect(player.x + 2, player.y - 4, player.width - 4, 5);

            ctx.fillStyle = '#000'; 
            let eyeX = player.facingRight ? player.x + 18 : player.x + 6;
            ctx.fillRect(eyeX, player.y + 4, 5, 2);

            ctx.save();
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1.5;
            let scabX = player.facingRight ? player.x + 2 : player.x + 24;
            ctx.beginPath();
            ctx.moveTo(scabX, player.y + 20);
            ctx.lineTo(scabX - 10 * flip, player.y + 35);
            ctx.moveTo(scabX + 2 * flip, player.y + 19);
            ctx.lineTo(scabX - 8 * flip, player.y + 34);
            ctx.moveTo(scabX + 4 * flip, player.y + 18);
            ctx.lineTo(scabX - 6 * flip, player.y + 33);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 2;
            ctx.beginPath();
            let handX = player.facingRight ? player.x + player.width + 2 : player.x - 2;
            ctx.moveTo(handX, player.y + 20);
            ctx.lineTo(handX + 18 * flip, player.y + 20);
            ctx.stroke();
            ctx.fillStyle = '#f1c40f'; 
            ctx.fillRect(handX + 1 * flip, player.y + 18, 2, 5);

        } else if (player.zoroForm === 2 || player.zoroForm === 3) {
            ctx.fillStyle = '#111';
            ctx.fillRect(player.x + 4, player.y + 35, 8, 15);
            ctx.fillRect(player.x + 18, player.y + 35, 8, 15);

            ctx.fillStyle = '#0f5132'; 
            ctx.fillRect(player.x - 2, player.y + 15, player.width + 4, 25);

            ctx.fillStyle = '#c0392b'; 
            ctx.fillRect(player.x - 3, player.y + 22, player.width + 6, 4);

            ctx.fillStyle = '#ffcc99'; 
            ctx.beginPath();
            ctx.moveTo(player.x + 8, player.y + 12);
            ctx.lineTo(player.x + 22, player.y + 12);
            ctx.lineTo(player.x + 15, player.y + 22);
            ctx.fill();

            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            let scarX = player.facingRight ? player.x + 20 : player.x + 8;
            ctx.moveTo(scarX, player.y + 2);
            ctx.lineTo(scarX, player.y + 7);
            ctx.stroke();

            ctx.fillStyle = '#ffcc99'; 
            ctx.fillRect(player.x + 4, player.y, player.width - 8, 12);

            ctx.fillStyle = '#2ecc71'; 
            ctx.fillRect(player.x + 2, player.y - 4, player.width - 4, 5);

            ctx.fillStyle = '#000'; 
            ctx.fillRect(player.facingRight ? player.x + 10 : player.x + 16, player.y + 4, 4, 2);

            ctx.save();
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1.5;
            let scabX = player.facingRight ? player.x + 2 : player.x + 24;
            ctx.beginPath();
            ctx.moveTo(scabX, player.y + 24);
            ctx.lineTo(scabX - 10 * flip, player.y + 39);
            ctx.moveTo(scabX + 2 * flip, player.y + 23);
            ctx.lineTo(scabX - 8 * flip, player.y + 38);
            ctx.moveTo(scabX + 4 * flip, player.y + 22);
            ctx.lineTo(scabX - 6 * flip, player.y + 37);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1.8;
            let hand1X = player.facingRight ? player.x + player.width + 2 : player.x - 2;
            ctx.beginPath();
            ctx.moveTo(hand1X, player.y + 20);
            ctx.lineTo(hand1X + 18 * flip, player.y + 12);
            ctx.stroke();

            let hand2X = player.facingRight ? player.x - 2 : player.x + player.width + 2;
            ctx.beginPath();
            ctx.moveTo(hand2X, player.y + 22);
            ctx.lineTo(hand2X - 14 * flip, player.y + 16);
            ctx.stroke();

            if (player.zoroForm === 3) {
                ctx.strokeStyle = '#eee';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                let mouthX = player.facingRight ? player.x + 18 : player.x + 12;
                ctx.moveTo(mouthX, player.y + 8);
                ctx.lineTo(mouthX + 20 * flip, player.y + 8);
                ctx.stroke();
                ctx.fillStyle = '#f1c40f'; 
                ctx.fillRect(mouthX - 3 * flip, player.y + 7, 3, 2);
            }
        }

        if (player.isZoroTransforming) {
            ctx.strokeStyle = '#00ff66';
            ctx.lineWidth = 4;
            ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
            ctx.beginPath();
            ctx.arc(cx, cy, 35, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
    }
})();

// Cập nhật thư viện dữ liệu hiển thị cơ chế chiêu thức
if (typeof HeroData !== 'undefined') {
    HeroData['zoro'] = {
        difficulty: 4,
        passive: "Nội tại: Tam Kiếm Phái\nMỗi 2s cộng 1 stack. Đòn đánh thường trúng kẻ địch cộng 5 stack.\nKhi đạt mốc stack tự động chuyển dạng và được bất tử 1s:\n- Dạng 1 (0-125): Nhất Kiếm.\n- Dạng 2 (126-250): Song Kiếm.\n- Dạng 3 (251): Tam Kiếm (Cố định).",
        c1: "Chiêu 1:\n- Dạng 1: Đứng khựng tụ lực 0.75s, chém 3 nhát liên tiếp tại các mốc (0.25s-0.5s-0.75s) gây 12 dame mỗi nhát.\n- Dạng 2: Chém một nhát hình X-oval diện rộng gây 30 dame.\n- Dạng 3: Tạo vùng hắc ám bán kính 150px tồn tại 5s liên tục gây 10 dame mỗi 0.25s, đồng thời lướt nhanh về phía trước 125px.",
        c2: "Chiêu 2:\n- Dạng 1: Lướt nhanh đâm một kiếm hình chữ X (15 dame).\n- Dạng 2: Thần tốc lướt 200px xuyên qua kẻ địch gây nhát chém thẳng (30 dame).\n- Dạng 3: Tạo lốc xoáy khổng lồ gấp 2.5 lần tại chỗ ngồi gây 45 dame và hất tung kẻ địch trong 0.5s.",
        c3: "Chiêu 3:\n- Dạng 1: Lướt xuyên phá rồi quay ngược đầu chém vòng cung (25 dame).\n- Dạng 2: Chém vòng tròn kiếm khí diện cực rộng (35 dame).\n- Dạng 3: Đại Thiên Thế Giới - Vận lực 0.25s chém một luồng kiếm khí sấm sét khổng lồ dọc theo toàn bộ cột hiển thị rộng 200px gây 55 dame."
    };
}