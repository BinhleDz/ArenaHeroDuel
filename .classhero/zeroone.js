// Lớp vẽ đường truyền dẫn kĩ thuật số nối điểm đầu - điểm cuối khi dịch chuyển tức thời
class ZeroOneTechConnectLine {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.life = 15;
        this.maxLife = 15;
        this.active = true;
        this.color = '#adff2f';
    }

    update() {
        this.life--;
        if (this.life <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        let segments = 20; // Chia đường đi thành 20 phân đoạn để tạo hiệu ứng mất dần từ đầu đến cuối
        for (let i = 0; i < segments; i++) {
            let tStart = i / segments;
            let tEnd = (i + 1) / segments;

            let sx = this.x1 + (this.x2 - this.x1) * tStart;
            let sy = this.y1 + (this.y2 - this.y1) * tStart;
            let ex = this.x1 + (this.x2 - this.x1) * tEnd;
            let ey = this.y1 + (this.y2 - this.y1) * tEnd;

            // Opacity giảm dần về phía điểm đầu (tStart càng nhỏ thì mờ càng nhanh)
            let segmentLifeRatio = this.life / this.maxLife;
            let opacity = segmentLifeRatio * (0.15 + 0.85 * tStart);
            if (opacity < 0) opacity = 0;

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3.5 * opacity + 0.5;
            ctx.globalAlpha = opacity;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Sinh nhẹ vài hạt kĩ thuật số rơi rớt dọc theo đường truyền
            if (Math.random() < 0.12 * opacity) {
                effects.push(new ZeroOneTechParticle(
                    sx + (Math.random() - 0.5) * 8,
                    sy + (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ));
            }
        }
        ctx.restore();
    }
}
// Lớp hiệu ứng vệt tốc độ công nghệ hình thanh (Rod-shape Speed Line) cho Chiêu cuối
class ZeroOneTechSpeedLine {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 2 + Math.random() * 3;
        this.life = 12 + Math.random() * 8;
        this.maxLife = this.life;
        this.color = '#adff2f';
        this.active = true;
    }

    update() {
        this.life--;
        if (this.life <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        
        // Vẽ vệt tốc độ hình thanh dọc theo hướng di chuyển ngược về sau
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
        ctx.stroke();
        ctx.restore();
    }
}
// Lớp hạt hiệu ứng công nghệ kỹ thuật số rực rỡ đặc trưng của Zero-One
class ZeroOneTechParticle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = 2 + Math.random() * 5;
        this.life = 15 + Math.random() * 15;
        this.maxLife = this.life;
        this.color = Math.random() > 0.3 ? '#adff2f' : '#ffffff'; // Vàng chanh neon hoặc trắng kĩ thuật số
        this.binary = Math.random() > 0.5 ? "1" : "0";
        this.isDigit = Math.random() > 0.6; // Chuyển đổi ngẫu nhiên giữa số nhị phân và ô vuông mã hóa
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
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#adff2f';
        ctx.fillStyle = this.color;
        
        if (this.isDigit) {
            ctx.font = `bold ${this.size + 8}px Courier New`;
            ctx.fillText(this.binary, this.x, this.y);
        } else {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.life * 0.1);
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
}

// Khai báo lớp Đạn của đòn đánh thường
class ZeroOneBullet {
    constructor(x, y, vx, vy, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 16;
        this.height = 4;
        this.color = '#adff2f';
        this.owner = owner;
        this.damage = 10;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    applyEffect(target) {
        target.takeDamage(this.damage);
        effects.push(new Explosion(this.x, this.y, 20, '#adff2f'));
        this.active = false;
    }
}

// Lớp sóng chém năng lượng công nghệ cao (Slash Wave) của Chiêu 1
class ZeroOneSlashWave {
    constructor(x, y, w, h, vx, vy, owner, type) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.damage = 30;
        this.active = true;
        this.type = type; // 'up', 'down', 'forward'
        this.spawnParticlesTimer = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Sinh hạt liên tục trên quỹ đạo bay
        this.spawnParticlesTimer++;
        if (this.spawnParticlesTimer % 2 === 0) {
            for (let i = 0; i < 4; i++) {
                effects.push(new ZeroOneTechParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3
                ));
            }
        }

        if (this.x < -200 || this.x > canvas.width + 200 || this.y < -200 || this.y > canvas.height + 200) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(173, 255, 47, 0.3)';
        ctx.strokeStyle = '#adff2f';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#adff2f';
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Đường vân mã hóa bên trong luồng sóng
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this.type === 'up' || this.type === 'down') {
            for (let offset = 30; offset < this.width; offset += 50) {
                ctx.moveTo(this.x + offset, this.y);
                ctx.lineTo(this.x + offset, this.y + this.height);
            }
        } else {
            for (let offset = 30; offset < this.height; offset += 50) {
                ctx.moveTo(this.x, this.y + offset);
                ctx.lineTo(this.x + this.width, this.y + offset);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    applyEffect(target) {
        target.takeDamage(this.damage);
        
        // Hất văng đối thủ theo cơ chế vật lý tương ứng của từng kiểu chém
        if (this.type === 'up') {
            target.vy = -12;
            target.onGround = false;
            target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 35);
        } else if (this.type === 'down') {
            target.vy = 12;
            target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 35);
        } else {
            target.vx = (this.vx > 0 ? 12 : -12);
            target.vy = -4;
            target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 35);
        }

        effects.push(new Explosion(target.x + 15, target.y + 25, 70, '#adff2f'));
        playSkillSound('assets/sounds/sound_skill/robot-R1/c1_hit.ogg');
        
        // Hồi đạn khi chém trúng đích
        if (this.owner) {
            let curAmmo = this.owner.getStatusValue('bullet01');
            this.owner.addStatus('bullet01', 'buff', 'assets/icon/buff/bullet01.png', 'inf', Math.min(5, curAmmo + 2));
        }
        this.active = false;
    }
}
class ZeroOneC3ExplosionFX {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.delay = 2;       // Chờ 2 frames sau khi trúng đích mới bắt đầu chạy hoạt ảnh
        this.duration = 12;   // Tổng thời gian chạy hoạt ảnh là 12 frames (tương đương 0.2s ở 60fps)
        this.elapsed = 0;
        
        // Kích thước hiển thị vụ nổ trên canvas (tùy chỉnh cho vừa vặn với nhân vật)
        this.drawSize = 350; 
    }

    update() {
        this.elapsed++;
        if (this.elapsed >= this.delay + this.duration) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active || this.elapsed < this.delay) return;

        // Tính toán frame hiển thị (0, 1 hoặc 2) dựa trên số frame đã trôi qua sau delay
        let animElapsed = this.elapsed - this.delay;
        let frameIndex = Math.floor(animElapsed / 4); // 12 frames chia đều cho 3 frame ảnh = 4 frames/mỗi ảnh
        if (frameIndex > 2) frameIndex = 2;

        // Lấy ảnh từ bộ nhớ đệm preloader, nếu chưa tải kịp thì tạo mới để tránh lỗi sập canvas
        let img = loadedImages['assets/skill_effect/zeroone/ex.png'];
        if (!img) {
            img = new Image();
            img.src = 'assets/skill_effect/zeroone/ex.png';
        }

        ctx.save();
        // Cắt khung hình 1024x1024 từ sprite sheet dọc (1024x3072) và vẽ từ tâm (x, y)
        ctx.drawImage(
            img,
            0, frameIndex * 1024, 1024, 1024, // Cắt theo tọa độ Y dọc tương ứng với frameIndex
            this.x - this.drawSize / 2, this.y - this.drawSize / 2, 
            this.drawSize, this.drawSize
        );
        ctx.restore();
    }
}
// Logic thực thi các kỹ năng đặc thù của Zero-One
Player.prototype.executeZeroOneSkill = function(skillKey, enemy, dir, canvas) {
    if (skillKey === 'basic') {
        // Tìm và trừ trực tiếp giá trị đạn thay vì sử dụng addStatus (khắc phục lỗi Math.max)
        let ammoStatus = this.statusList.find(s => s.id === 'bullet01');
        if (ammoStatus) {
            ammoStatus.value = Math.max(0, ammoStatus.value - 1);
            if (ammoStatus.value <= 0) {
                this.removeStatus('bullet01');
            }
        }
        
        let radBase = this.facingRight ? 0 : Math.PI;
        let angles = [-0.174, -0.087, 0, 0.087, 0.174];
        let px = this.facingRight ? this.x + this.width + 5 : this.x - 20;

        angles.forEach(ang => {
            let finalAng = radBase + ang;
            projectiles.push(new ZeroOneBullet(px, this.y + 15, Math.cos(finalAng) * 22, Math.sin(finalAng) * 22, this));
        });
        effects.push(new OvalShockwave(px, this.y + 15, this.facingRight, '#adff2f'));
    }
    else if (skillKey === 'c1') {
        let dx = Math.abs((enemy.x + 15) - (this.x + 15));
        
        if (dx <= 150) {
            // --- ĐỐI THỦ Ở TRONG PHẠM VI 150PX ---
            if (enemy.y > this.y) {
                // KIỂU 2 (Đã đảo): Địch ở dưới -> Nhảy nhẹ lên trên, bắn sóng chém 300px xuống đất
                this.vy = -6;
                this.onGround = false;

                let waveX = this.x + this.width / 2 - 150;
                let waveY = this.y + this.height;
                projectiles.push(new ZeroOneSlashWave(waveX, waveY, 300, 40, 0, 15, this, 'down'));
                effects.push(new Explosion(this.x + 15, this.y + 25, 60, '#adff2f'));
            } else {
                // KIỂU 1 (Đã đảo): Địch ở trên hoặc ngang -> Rơi mạnh xuống đất, sau đó bắn sóng chém 300px lên trời
                let targetY = canvas.height - groundHeight - this.height;
                let minDist = targetY - this.y;
                for (let plat of platforms) {
                    if (plat.y > this.y && this.x + this.width > plat.x && this.x < plat.x + plat.w) {
                        let d = plat.y - this.height - this.y;
                        if (d > 0 && d < minDist) {
                            minDist = d;
                            targetY = plat.y - this.height;
                        }
                    }
                }
                for (let wall of walls) {
                    if (wall.y > this.y && this.x + this.width > wall.x && this.x < wall.x + wall.w) {
                        let d = wall.y - this.height - this.y;
                        if (d > 0 && d < minDist) {
                            minDist = d;
                            targetY = wall.y - this.height;
                        }
                    }
                }
                this.y = targetY;
                this.vy = 0;
                this.onGround = true;
                this.peakY = null; // Chống nhận sát thương rơi do rơi mạnh

                let waveX = this.x + this.width / 2 - 150;
                let waveY = this.y - 40;
                projectiles.push(new ZeroOneSlashWave(waveX, waveY, 300, 40, 0, -15, this, 'up'));
                effects.push(new Explosion(this.x + 15, this.y + 25, 60, '#adff2f'));
            }
        } else {
            // --- ĐỐI THỦ Ở XA (TRÊN 150PX) ---
            // KIỂU 3: Lướt 1 đoạn 100px về phía trước rồi chém thẳng đứng dọc
            let oldX = this.x;
            let oldY = this.y;

            let targetX = this.x + dir * 100;
            if (targetX < 0) targetX = 0;
            if (targetX + this.width > canvas.width) targetX = canvas.width - this.width;

            for (let wall of walls) {
                if (wall.type === 'wall' || wall.type === 'wall_hit') {
                    if (dir === 1 && this.x < wall.x && targetX + this.width > wall.x) {
                        targetX = wall.x - this.width;
                    } else if (dir === -1 && this.x > wall.x + wall.w && targetX < wall.x + wall.w) {
                        targetX = wall.x + wall.w;
                    }
                }
            }
            this.x = targetX;

            // Tạo vệt truyền dẫn nối từ vị trí cũ sang vị trí mới
            effects.push(new ZeroOneTechConnectLine(
                oldX + this.width / 2, 
                oldY + this.height / 2, 
                this.x + this.width / 2, 
                this.y + this.height / 2
            ));

            let waveX = this.facingRight ? this.x + this.width + 5 : this.x - 45;
            let waveY = this.y + this.height / 2 - 150;
            projectiles.push(new ZeroOneSlashWave(waveX, waveY, 40, 300, dir * 18, 0, this, 'forward'));
            effects.push(new Explosion(this.x + 15, this.y + 25, 45, '#adff2f'));
        }
    }
    else if (skillKey === 'c2') {
        if (this.onGround) {
            // KIỂU 1: Trên mặt đất -> Thực hiện động tác Dash né đòn
            this.isDashing = true;
            this.dashTimer = 15;
            this.vx = dir * 22;
            effects.push(new Explosion(this.x + 15, this.y + 25, 30, 'rgba(173, 255, 47, 0.35)'));
        } else {
            // KIỂU 2: Trên không trung -> Dịch chuyển tức thời tới cùng trục X của địch và nhảy cao
            let oldX = this.x;
            let oldY = this.y;

            this.x = enemy.x + (enemy.width / 2) - (this.width / 2);
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x)); // Giới hạn biên bản đồ
            this.y = Math.max(90, this.y - 350);
            this.vy = -2;
            this.peakY = null; // Chống nhận sát thương rơi
            
            // Vẽ đường truyền dẫn nối từ dưới lên vị trí mới trên cao của địch
            effects.push(new ZeroOneTechConnectLine(
                oldX + this.width / 2, 
                oldY + this.height / 2, 
                this.x + this.width / 2, 
                this.y + this.height / 2
            ));

            let curAmmo = this.getStatusValue('bullet01');
            this.addStatus('bullet01', 'buff', 'assets/icon/buff/bullet01.png', 'inf', Math.min(5, curAmmo + 1));
            
            // Tạo luồng bụi phản lực đẩy lên
            for (let i = 0; i < 8; i++) {
                effects.push(new RockParticle(this.x + 15, this.y + 50, (Math.random() - 0.5) * 6, Math.random() * 4, '#adff2f'));
            }
        }
    }
    else if (skillKey === 'c3') {
        this.isZeroOneS3Diving = true;
        this.zerooneS3DraggedEnemy = false;
        
        // Kích hoạt đóng băng game và khởi động cut-in đặc biệt nếu cài đặt bật
        if (typeof heroSettings !== 'undefined' && heroSettings.c3ZeroOneEffect) {
            window.zeroOneCutInActive = true;
            window.zeroOneCutInTimer = 0;
        }
    }
};

// Ghi đè hàm update() để liên tục tạo luồng hiệu ứng công nghệ số khi di chuyển
const originalUpdate = Player.prototype.update;
Player.prototype.update = function() {
    originalUpdate.apply(this, arguments);
    if (this.heroType === 'zeroone' && !this.isDead) {
        // 1. Sinh hiệu ứng kĩ thuật số cơ bản khi di chuyển thông thường
        if (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0) {
            if (Math.random() < 0.45) {
                effects.push(new ZeroOneTechParticle(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3
                ));
            }
        }
        
        // 2. Sinh vệt mờ công nghệ dạng thanh khi đang Dash kéo dãn (Chiêu 2 dạng 1 hoặc chạy nhanh)
        if (this.isDashing && this.dashTimer > 0) {
            if (Math.random() < 0.6) {
                effects.push(new ZeroOneTechSpeedLine(
                    this.x + Math.random() * this.width,
                    this.y + Math.random() * this.height,
                    this.vx,
                    this.vy
                ));
            }
        }
        
        // 3. Vệt tốc độ hình thanh kĩ thuật số rực rỡ khi đang sử dụng Rider Kick (c3)
        if (this.isZeroOneS3Diving) {
            for (let i = 0; i < 2; i++) {
                effects.push(new ZeroOneTechSpeedLine(
                    this.x - 50 + Math.random() * (this.width + 100), // Mở rộng vùng sinh vệt sáng
                    this.y + Math.random() * this.height,
                    this.vx,
                    this.vy
                ));
            }
        }
    }
};

// Ghi đè hàm executeSkill hiện có để đồng bộ tướng mới một cách an toàn
const originalExecute = Player.prototype.executeSkill;
Player.prototype.executeSkill = function(skillKey) {
    if (this.heroType === 'zeroone') {
        let enemy = (this === player1) ? player2 : player1;
        let dir = this.facingRight ? 1 : -1;
        this.executeZeroOneSkill(skillKey, enemy, dir, canvas);
    } else {
        originalExecute.apply(this, arguments);
    }
};

// Đăng ký thư viện thông tin tướng để hiển thị trong Thư Viện Tướng (📖)
if (typeof HeroData !== 'undefined') {
    HeroData.zeroone = {
        difficulty: 3,
        passive: "Lực bật nhảy tăng dần theo thời gian đứng trên mặt đất (Tối đa 2.5x). Reset về 1.0x khi thực hiện nhảy.\nTự động hồi phục 1 điểm đạn mỗi 5 giây (Tối đa 5 viên).",
        c1: "Tung luồng sóng chém Slash Wave công nghệ cao rộng 300px (Gây 30 sát thương, trúng đích hồi +2 đạn):\n- Địch ở gần (dưới 150px) & bên dưới: Bản thân rơi thẳng cực nhanh xuống đất và bắn sóng chém hất tung địch lên trời.\n- Địch ở gần (dưới 150px) & bên trên: Bản thân nhảy vút lên và bắn sóng chém cực mạnh dội ngược xuống đất.\n- Địch ở xa (trên 150px): Lướt nhanh tới trước 100px và phóng sóng chém dọc thẳng mặt đối thủ.",
        c2: "- Trên mặt đất: Lướt nhanh né đòn linh hoạt.\n- Trên không: Tự động dịch chuyển tới cùng tọa độ X của địch và nhảy vút lên cao, đồng thời hồi +1 điểm đạn.",
        c3: "(Chỉ dùng được trên không)\nLao cực nhanh xuống đất (Rider Kick). Nếu chạm trúng kẻ địch trên đường bay sẽ kéo địch xuống theo, chạm đất miễn sát thương rơi, gây 75 sát thương, choáng 2.5s và cộng 3 điểm đạn cho bản thân."
    };
}
// --- CẤU HÌNH HIỆU ỨNG ĐẶC BIỆT C3 ZERO-ONE ---
window.zeroOneCutInActive = false;
window.zeroOneCutInTimer = 0;
window.cutInDrawnThisFrame = false;

window.zeroOneCutInImages = {
    text1: new Image(),
    text2: new Image(),
    exSheet: new Image()
};
window.zeroOneCutInImages.text1.src = 'assets/skill_effect/zeroone/text1.png';
window.zeroOneCutInImages.text2.src = 'assets/skill_effect/zeroone/text2.png';
window.zeroOneCutInImages.exSheet.src = 'assets/skill_effect/zeroone/ex.png';

// Lớp hoạt ảnh nổ đặc biệt 3 frame của Zero-One
class ZeroOneImpactExplosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.timer = 0;
        this.active = true;
        
        // --- THỜI GIAN HOẠT ẢNH VÀ THÔNG SỐ ---
        this.totalDuration = 9; // Tổng thời gian chạy (9 frames = 0.15 giây ở 60 FPS)
        this.framesCount = 3;   // Số lượng khung hình cắt ra từ ảnh dọc (1024x3072)
        this.frameSize = 1024;  // Kích thước của mỗi khung hình vuông (1024x1024)
    }

    update() {
        this.timer++;
        if (this.timer >= this.totalDuration) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active || !window.zeroOneCutInImages.exSheet.complete) return;

        // Xác định frame hiện tại dựa trên tiến độ thời gian chạy hoạt ảnh
        let frameIndex = Math.floor((this.timer / this.totalDuration) * this.framesCount);
        if (frameIndex >= this.framesCount) frameIndex = this.framesCount - 1;

        ctx.save();
        
        // Căn giữa vụ nổ ngay tại vị trí va chạm (tại vị trí của địch)
        let drawSize = 350; // Kích thước vụ nổ hiển thị (đối xứng)
        
        ctx.drawImage(
            window.zeroOneCutInImages.exSheet,
            0, frameIndex * this.frameSize, this.frameSize, this.frameSize, // Cắt tọa độ ảnh nguồn (1024x1024)
            this.x - drawSize / 2, (this.y - 25) - drawSize / 2, drawSize, drawSize // Vẽ căn giữa quanh vị trí của địch
        );

        ctx.restore();
    }
}

// Bẫy chặn mảng 'effects' gán từ game để tự động can thiệp hàm push và tráo đổi hiệu ứng nổ C3 của Zero-One
let _effects = [];
Object.defineProperty(window, 'effects', {
    get: function() {
        return _effects;
    },
    set: function(val) {
        _effects = val;
        if (_effects && !_effects.patched) {
            _effects.patched = true;
            const originalPush = _effects.push;
            _effects.push = function(...items) {
                if (typeof heroSettings !== 'undefined' && heroSettings.c3ZeroOneEffect) {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        // Nhận diện vụ nổ mặc định có bán kính 140 rực vàng chanh của chiêu 3 Zero-One khi hạ cánh thành công
                        if (item && item.constructor && item.constructor.name === 'Explosion' && item.radius === 140 && item.color === '#adff2f') {
                            // Tráo đổi sang hoạt ảnh vụ nổ 3 frame đặc biệt
                            items[i] = new ZeroOneImpactExplosion(item.x, item.y);
                        }
                    }
                }
                return originalPush.apply(this, items);
            };
        }
    },
    configurable: true
});

// --- HOOK VÀO CLEARRECT ĐỂ PHỤC VỤ UPDATE BỘ ĐẾM VÀ RESET FLAG FRAME MỚI ---
const originalClearRect = CanvasRenderingContext2D.prototype.clearRect;
CanvasRenderingContext2D.prototype.clearRect = function(x, y, w, h) {
    window.cutInDrawnThisFrame = false;
    
    if (window.zeroOneCutInActive) {
        window.zeroOneCutInTimer++;
        if (window.zeroOneCutInTimer >= 90) {
            window.zeroOneCutInActive = false;
            window.zeroOneCutInTimer = 0;
        }
    }
    
    originalClearRect.call(this, x, y, w, h);
};

// --- ĐÓNG BĂNG ĐỘNG LỰC HỌC CHUNG KHI ĐANG VẬN HÀNH CUT-IN 1S ---
const originalPlayerUpdate = Player.prototype.update;
Player.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Chặn mọi thay đổi tọa độ, thời gian hồi chiêu, trạng thái
    }
    originalPlayerUpdate.apply(this, arguments);
};

const originalProjectileUpdate = Projectile.prototype.update;
Projectile.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Đóng băng đạn bay
    }
    originalProjectileUpdate.apply(this, arguments);
};

const originalExplosionUpdate = Explosion.prototype.update;
Explosion.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Đóng băng vụ nổ
    }
    originalExplosionUpdate.apply(this, arguments);
};

const originalDamageTextUpdate = DamageText.prototype.update;
DamageText.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Đóng băng chữ hiển thị sát thương
    }
    originalDamageTextUpdate.apply(this, arguments);
};

const originalRockParticleUpdate = RockParticle.prototype.update;
RockParticle.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Đóng băng hạt bụi vỡ
    }
    originalRockParticleUpdate.apply(this, arguments);
};

const originalOvalShockwaveUpdate = OvalShockwave.prototype.update;
OvalShockwave.prototype.update = function() {
    if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
        return; // Đóng băng sóng xung kích
    }
    originalOvalShockwaveUpdate.apply(this, arguments);
};

if (typeof FireParticle !== 'undefined') {
    const originalFireParticleUpdate = FireParticle.prototype.update;
    FireParticle.prototype.update = function() {
        if (window.zeroOneCutInActive && window.zeroOneCutInTimer < 60) {
            return; // Đóng băng tàn lửa
        }
        originalFireParticleUpdate.apply(this, arguments);
    };
}

// --- INTERCEPT VÀO PLAYER DRAW ĐỂ HIỂN THỊ CUT-IN TRÊN LAYER GAME DƯỚI PLAYER ---
const originalPlayerDraw = Player.prototype.draw;
Player.prototype.draw = function() {
    if (!window.cutInDrawnThisFrame) {
        drawZeroOneCutIn();
        window.cutInDrawnThisFrame = true;
    }
    originalPlayerDraw.apply(this, arguments);
};

function drawZeroOneCutIn() {
    if (!window.zeroOneCutInActive) return;

    ctx.save();
    
    let opacity = 1.0;
    if (window.zeroOneCutInTimer >= 60) {
        // Cả 2 ảnh mờ dần trong 0.5s cuối (từ frame 60 đến 90)
        opacity = 1.0 - (window.zeroOneCutInTimer - 60) / 30;
    }
    ctx.globalAlpha = opacity;

    const destX = 0;
    const destY = canvas.height - 600;

    // Vẽ Text 1 (Trượt mượt mà từ trái qua phải trong 0.5s đầu)
    if (window.zeroOneCutInTimer < 30) {
        let t = window.zeroOneCutInTimer / 30;
        let ease = 1 - Math.pow(1 - t, 2); // Quad ease-out
        let x1 = -900 + (destX - (-900)) * ease; // Trượt từ x = -900 sang x = 0
        if (window.zeroOneCutInImages.text1.complete) {
            ctx.drawImage(window.zeroOneCutInImages.text1, x1, destY, 900, 600);
        }
    } else {
        if (window.zeroOneCutInImages.text1.complete) {
            ctx.drawImage(window.zeroOneCutInImages.text1, destX, destY, 900, 600);
        }
    }

    // Vẽ Text 2 (Trượt mượt mà từ trên xuống dưới trong 0.5s tiếp theo để ghép cặp)
    if (window.zeroOneCutInTimer >= 30) {
        if (window.zeroOneCutInTimer < 60) {
            let t = (window.zeroOneCutInTimer - 30) / 30;
            let ease = 1 - Math.pow(1 - t, 2); // Quad ease-out
            let startY = -600;
            let y2 = startY + (destY - startY) * ease;
            if (window.zeroOneCutInImages.text2.complete) {
                ctx.drawImage(window.zeroOneCutInImages.text2, destX, y2, 900, 600);
            }
        } else {
            if (window.zeroOneCutInImages.text2.complete) {
                ctx.drawImage(window.zeroOneCutInImages.text2, destX, destY, 900, 600);
            }
        }
    }

    ctx.restore();
}


