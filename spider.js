// ==============================================================================
// FILE: .classhero/spider.js
// THIẾT KẾ CHI TIẾT TƯỚNG SPIDERMAN - ĐÃ KHẮC PHỤC TOÀN BỘ LỖI KHỐNG CHẾ & DRAW DEBUFF
// TÍCH HỢP CƠ CHẾ KHẮC CHẾ ĐẶC BIỆT VỚI TANJIRO HINOKAMI (V2)
// ==============================================================================

// Lớp Bẫy Tơ (Web Trap)
class WebTrap {
    constructor(x, y, w, h, angle = 0) {
        this.x = x; this.y = y; this.w = w; this.h = h; this.angle = angle;
        this.timer = 3600; // Tồn tại tối đa 100 giây
        this.active = true;
    }
    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.active = false;
            return;
        }

        // TƯƠNG TÁC ĐẶC BIỆT: Kiểm tra xem có bị trúng đòn tấn công bằng lửa của Tanjiro v2 không
        let fireProjectiles = projectiles.filter(p => {
            if (!p.active) return false;
            let cName = p.constructor.name;
            return cName === 'Tanjiro2BasicSlash' || 
                   cName === 'Tanjiro2Tornado' || 
                   cName === 'Tanjiro2FireWheelSlash' || 
                   cName === 'Tanjiro2FlameDance';
        });

        for (let p of fireProjectiles) {
            let pRect = { x: p.x, y: p.y, width: p.width, height: p.height };
            if (this.intersects(pRect)) {
                this.active = false; // Thiêu rụi và dọn dẹp bẫy tơ

                // Tạo vụ nổ lửa rực rỡ tại tâm của bẫy tơ
                effects.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.75, '#ff4500'));
                
                // Sinh các hạt lửa bùng cháy văng ra xung quanh bẫy tơ bị dọn dẹp
                let particleCount = Math.min(25, Math.floor(this.w / 8));
                for (let i = 0; i < particleCount; i++) {
                    effects.push(new FireParticle(
                        this.x + Math.random() * this.w,
                        this.y + Math.random() * this.h,
                        (Math.random() - 0.5) * 8,
                        -Math.random() * 6 - 2,
                        4 + Math.random() * 6,
                        30,
                        Math.random() > 0.5 ? '#ffcc00' : '#ff3300'
                    ));
                }
                break;
            }
        }
    }
    draw() {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.angle);
        
        // Vẽ mạng nhện đồng tâm
        ctx.beginPath();
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.moveTo(-this.w / 2, -this.h / 2); ctx.lineTo(this.w / 2, this.h / 2);
        ctx.moveTo(this.w / 2, -this.h / 2); ctx.lineTo(-this.w / 2, this.h / 2);
        ctx.strokeRect(-this.w / 4, -this.h / 4, this.w / 2, this.h / 2);
        ctx.stroke();
        ctx.restore();
    }
    intersects(rect) {
        return (this.x < rect.x + rect.width && this.x + this.w > rect.x &&
                this.y < rect.y + rect.height && this.y + this.h > rect.y);
    }
    applyEffect(target) {
        // Tránh lỗi nổ/biến mất khi người chơi đi qua bẫy tơ tĩnh
    }
}

// Lớp Kén Nhện (Cocoon Entity)
class CocoonEntity {
    constructor(x, y, owner) {
        this.x = x; this.y = y; this.width = 30; this.height = 40;
        this.active = true;
        this.owner = owner;
    }
    update() {
        // Chờ nổ hoặc nở nhện
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#eef2f3';
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.x + 15, this.y + 20, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 10); ctx.lineTo(this.x + 30, this.y + 30);
        ctx.moveTo(this.x + 30, this.y + 10); ctx.lineTo(this.x, this.y + 30);
        ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        // Tránh lỗi nổ/biến mất khi va chạm thường với người chơi
    }
}

// Hàm kiểm tra va chạm giữa Kén nhện và Bẫy tơ để sinh nhện con
function checkCocoonWebtrapCollision(cocoon) {
    let traps = projectiles.filter(p => p instanceof WebTrap && p.active);
    for (let trap of traps) {
        if (trap.intersects(cocoon)) {
            cocoon.active = false; 
            let spider = new SpiderSummon(cocoon.x, cocoon.y, cocoon.owner);
            projectiles.push(spider);
            effects.push(new Explosion(cocoon.x + 15, cocoon.y + 20, 35, 'rgba(255, 255, 255, 0.8)'));
            break;
        }
    }
}

// Lớp Nhện Săn Mồi (Spider Summon)
class SpiderSummon {
    constructor(x, y, owner) {
        this.x = x; this.y = y; this.width = 24; this.height = 16;
        this.hp = 75;
        this.owner = owner;
        this.active = true;
        this.speed = 3.5;
        this.attackTimer = 0;
    }
    update() {
        if (this.hp <= 0) {
            this.active = false;
            return;
        }

        let traps = projectiles.filter(p => p instanceof WebTrap && p.active);
        let onTrap = traps.some(trap => trap.intersects(this));
        if (!onTrap) {
            this.active = false; // Tự hủy nếu không ở trên bẫy tơ
            return;
        }

        let enemy = this.owner === player1 ? player2 : player1;
        if (!enemy || enemy.isDead) return;

        let dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
        let dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
        let dist = Math.hypot(dx, dy);

        if (dist < 30) {
            this.attackTimer++;
            if (this.attackTimer % 60 === 0) {
                enemy.takeDamage(15);
                effects.push(new DamageText(enemy.x, enemy.y - 20, "15 Spider Bite!", '#ff3333'));
            }
        } else {
            let vx = (dx / dist) * this.speed;
            let vy = (dy / dist) * this.speed;

            let nextX = this.x + vx;
            let nextY = this.y + vy;
            let nextRect = { x: nextX, y: nextY, width: this.width, height: this.height };
            
            if (traps.some(trap => trap.intersects(nextRect))) {
                this.x = nextX;
                this.y = nextY;
            } else {
                let nextRectX = { x: this.x + vx, y: this.y, width: this.width, height: this.height };
                if (traps.some(trap => trap.intersects(nextRectX))) {
                    this.x += vx;
                } else {
                    let nextRectY = { x: this.x, y: this.y + vy, width: this.width, height: this.height };
                    if (traps.some(trap => trap.intersects(nextRectY))) {
                        this.y += vy;
                    }
                }
            }
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            let angle = (i * Math.PI / 3) - Math.PI / 6;
            ctx.beginPath();
            ctx.moveTo(this.x + 12, this.y + 8);
            ctx.lineTo(this.x + 12 + Math.cos(angle) * 12, this.y + 8 + Math.sin(angle) * 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + 12, this.y + 8);
            ctx.lineTo(this.x + 12 - Math.cos(angle) * 12, this.y + 8 + Math.sin(angle) * 12);
            ctx.stroke();
        }
        ctx.restore();
    }
    takeDamage(amount) {
        this.hp -= amount;
    }
    applyEffect(target) {
        // Tránh lỗi va chạm trực tiếp với người chơi
    }
}

// Lớp Đạn Tơ Đánh Thường (Spiderman Basic Web)
class SpidermanBasicWeb {
    constructor(x, y, vx, vy, owner) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.width = 16; this.height = 10;
        this.owner = owner;
        this.active = true;
        this.damage = 6;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y > canvas.height || this.y < 0) {
            this.active = false;
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        if (Math.random() < 0.40) {
            let cocoon = new CocoonEntity(target.x, target.y + target.height - 40, this.owner);
            projectiles.push(cocoon);
            effects.push(new Explosion(target.x + 15, target.y + 20, 30, '#ffffff'));
            checkCocoonWebtrapCollision(cocoon);
        }
    }
}

// Lớp Cầu Tơ Chiêu 2 (Web Ball)
class WebBall {
    constructor(x, y, owner) {
        this.x = x; this.y = y; this.vx = 0; this.vy = -18;
        this.width = 20; this.height = 20;
        this.owner = owner;
        this.active = true;
    }
    update() {
        this.y += this.vy;
        if (this.y < -50) {
            this.active = false;
            this.owner.spawnCocoonFalls();
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        // Tránh lỗi crash
    }
}

// Lớp Cầu Kén Rơi Chiêu 2 (Cocoon Ball)
class CocoonBall {
    constructor(x, y, owner) {
        this.x = x; this.y = y; this.vx = 0; this.vy = 8;
        this.width = 30; this.height = 40;
        this.owner = owner;
        this.active = true;
        this.damage = 35;
    }
    update() {
        this.y += this.vy;

        // Xử lý va chạm với môi trường địa hình
        let groundY = canvas.height - groundHeight;
        if (this.y + this.height >= groundY) {
            this.active = false;
            let cocoon = new CocoonEntity(this.x, groundY - 40, this.owner);
            projectiles.push(cocoon);
            checkCocoonWebtrapCollision(cocoon);
            return;
        }

        let structs = [...platforms, ...walls];
        for (let struct of structs) {
            let sW = struct.w !== undefined ? struct.w : struct.width;
            if (this.y + this.height >= struct.y && this.y < struct.y &&
                this.x + this.width > struct.x && this.x < struct.x + sW) {
                if (Math.random() < 0.35) {
                    this.active = false;
                    let cocoon = new CocoonEntity(this.x, struct.y - 40, this.owner);
                    projectiles.push(cocoon);
                    checkCocoonWebtrapCollision(cocoon);
                    return;
                }
            }
        }
        if (this.y > canvas.height) this.active = false;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(238, 242, 243, 0.8)';
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(this.x + 15, this.y + 20, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    applyEffect(target) {
        target.takeDamage(this.damage);
        this.active = false;
        effects.push(new Explosion(this.x + 15, this.y + 20, 50, '#ffffff'));
    }
}

// Tránh lỗi undefined khi tính toán khoảng cách cấu trúc
function closestPointOnAABB(px, py, rect) {
    let w = rect.w !== undefined ? rect.w : rect.width;
    let h = rect.h !== undefined ? rect.h : rect.height;
    let rx = Math.max(rect.x, Math.min(px, rect.x + w));
    let ry = Math.max(rect.y, Math.min(py, rect.y + h));
    return { x: rx, y: ry };
}


// ==========================================
// TÍCH HỢP HOOK VÀO CORE GAME ENGINE
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    // 1. Đăng ký Spiderman vào hồ sơ danh sách tướng
    if (typeof heroPool !== 'undefined') {
        let exists = heroPool.some(h => h.id === 'spiderman');
        if (!exists) {
            heroPool.push({ id: 'spiderman', name: 'Spiderman' });
        }
    }

    // 2. Đăng ký thông tin kỹ năng hiển thị trong Thư viện
    if (typeof HeroData !== 'undefined') {
        HeroData['spiderman'] = {
            difficulty: 4,
            passive: "NỘI TẠI: TƠ NHỆN SINH TỒN\n- Khi đứng trên bẫy tơ, Spiderman bay lượn nhẹ nhàng và chỉ chịu 10% trọng lực.\n- Bẫy tơ làm giảm 75% tốc độ của kẻ địch đứng bên trong (Tối đa 100 giây).",
            c1: "CHIÊU 1: GIĂNG TƠ LIÊN KẾT\n- Nối tơ giữa 2 cấu trúc gần bản thân nhất, gây 20 sát thương lên kẻ địch chạm phải và để lại bẫy tơ tương ứng diện tích liên kết.",
            c2: "CHIÊU 2: TRẬN MƯA KÉN\n- Bắn khối cầu tơ lên trời tạo ra cơn mưa 3 quả kén (30% nhắm trúng địch), gây 35 sát thương. Rơi trúng bẫy tơ sẽ sinh ra Nhện Săn Mồi (75 HP, 15 sát thương/giây).",
            c3: "CHIÊU 3: KÍCH NỔ KÉN NHỆN\n- Phát nổ toàn bộ Kén trên bản đồ, gây 25 sát thương diện rộng và tạo bẫy tơ mới có kích thước 250px tại điểm nổ."
        };
    }

    // 3. Hook logic vẽ (Draw) của Spiderman
    if (typeof Player !== 'undefined') {
        const originalDraw = Player.prototype.draw;
        Player.prototype.draw = function() {
            if (this.heroType === 'spiderman') {
                ctx.save();
                let cx = this.x + this.width / 2;
                let cy = this.y + this.height / 2;

                // Vẽ tơ khi đu lên (Chiêu phụ)
                if (this.isSpidermanSwinging) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx, 0); // Kéo thẳng lên trên cùng map
                    ctx.stroke();
                }

                // Vẽ cơ thể Spiderman
                // Chân xanh
                ctx.fillStyle = '#0033cc';
                ctx.fillRect(this.x + 3, this.y + 35, 10, 15);
                ctx.fillRect(this.x + 17, this.y + 35, 10, 15);
                // Ủng đỏ
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x + 3, this.y + 45, 10, 5);
                ctx.fillRect(this.x + 17, this.y + 45, 10, 5);

                // Thân (Họa tiết đỏ và xanh)
                ctx.fillRect(this.x, this.y + 15, this.width, 20);
                ctx.fillStyle = '#0033cc';
                ctx.fillRect(this.x, this.y + 20, 5, 15);
                ctx.fillRect(this.x + this.width - 5, this.y + 20, 5, 15);

                // Biểu tượng Nhện trên ngực
                ctx.fillStyle = '#111111';
                ctx.fillRect(cx - 2, this.y + 22, 4, 6);
                ctx.strokeStyle = '#111111'; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx, this.y + 25); ctx.lineTo(cx - 6, this.y + 22);
                ctx.moveTo(cx, this.y + 25); ctx.lineTo(cx + 6, this.y + 22);
                ctx.moveTo(cx, this.y + 25); ctx.lineTo(cx - 6, this.y + 28);
                ctx.moveTo(cx, this.y + 25); ctx.lineTo(cx + 6, this.y + 28);
                ctx.stroke();

                // Mặt nạ đầu đỏ
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x + 2, this.y, this.width - 4, 15);
                
                // Mắt nhện màu trắng viền đen
                ctx.fillStyle = '#111111';
                let eyeLX = this.facingRight ? cx + 2 : cx - 12;
                ctx.beginPath();
                ctx.moveTo(eyeLX, this.y + 4); ctx.lineTo(eyeLX + 10, this.y + 10); ctx.lineTo(eyeLX, this.y + 11); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(eyeLX + 1, this.y + 5); ctx.lineTo(eyeLX + 8, this.y + 9); ctx.lineTo(eyeLX + 1, this.y + 10); ctx.fill();

                ctx.restore();
            }
            
            // LUÔN LUÔN GỌI HÀM VẼ GỐC: Để hiển thị vòng chỉ định, debuff dính băng, choáng sao trên người Spiderman
            originalDraw.apply(this, arguments);
        };

        // 4. Hook logic cập nhật (Update) của Spiderman
        const originalUpdate = Player.prototype.update;
        Player.prototype.update = function() {
            if (this.heroType === 'spiderman') {
                let enemy = this === player1 ? player2 : player1;

                // Kiểm tra xem có đang đứng trên Bẫy tơ không
                let traps = projectiles.filter(p => p instanceof WebTrap && p.active);
                let onTrap = traps.some(trap => trap.intersects(this));
                this.isOnWebTrap = onTrap;

                // Tác dụng làm chậm lên địch đứng trên bẫy tơ
                if (enemy && !enemy.isDead) {
                    let enemyOnTrap = traps.some(trap => trap.intersects(enemy));
                    if (enemyOnTrap) {
                        enemy.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 10, 75, 60);
                    }
                }

                // Kiểm tra trạng thái bị khống chế hoặc vô hiệu hóa hành động
                let isCCed = this.hasStatus('stuncc') || 
                             this.hasStatus('stunbutter') || 
                             this.isFrozen || 
                             this.isSilenced;

                // Chiêu phụ: Đu tơ lên cao (giữ phím charge) - Chỉ cho phép khi không bị dính khống chế
                let chargePressed = keys[this.controls.charge];
                if (chargePressed && !isCCed) {
                    this.isSpidermanSwinging = true;
                    this.vx = 0;     // Khóa di chuyển ngang
                    this.vy = -6.5;  // Đu tơ kéo cơ thể lên cao
                    this.addStatus('shield', 'buff', 'assets/icon/buff/shield.png', 5, 40, 60); // Nhận 40% miễn thương
                } else {
                    this.isSpidermanSwinging = false;
                }

                // Nội tại: Giảm 90% trọng lực khi ở trong mạng tơ
                let originalGravity = 0.5;
                if (this.isOnWebTrap) {
                    this.vy += (originalGravity * 0.10) - originalGravity;
                }

                originalUpdate.apply(this, arguments);
            } else {
                originalUpdate.apply(this, arguments);
            }
        };

        // 5. Hook lệnh kích hoạt chiêu thức (Trigger Skill)
        const originalTriggerSkill = Player.prototype.triggerSkill;
        Player.prototype.triggerSkill = function(skillKey) {
            if (this.heroType === 'spiderman') {
                if (this.isSilenced || this.hasStatus('stuncc')) return;

                if (skillKey === 'basic') {
                    this.executeSkill('spiderman_basic');
                    this.cds.basic = 36; // Tốc đánh 0.6s
                } else if (skillKey === 'c1') {
                    this.executeSkill('spiderman_c1');
                    this.cds.c1 = 300; // Hồi chiêu 5s
                } else if (skillKey === 'c2') {
                    this.executeSkill('spiderman_c2');
                    this.cds.c2 = 420; // Hồi chiêu 7s
                } else if (skillKey === 'c3') {
                    this.executeSkill('spiderman_c3');
                    this.cds.c3 = 600; // Hồi chiêu 10s
                }
            } else {
                originalTriggerSkill.apply(this, arguments);
            }
        };

        // 6. Hook thực thi chiêu thức (Execute Skill)
        const originalExecuteSkill = Player.prototype.executeSkill;
        Player.prototype.executeSkill = function(skillKey) {
            if (this.heroType === 'spiderman') {
                let dir = this.facingRight ? 1 : -1;
                let enemy = this === player1 ? player2 : player1;
                let px = this.facingRight ? this.x + this.width : this.x - 16;

                // Đánh thường: Bắn tơ
                if (skillKey === 'spiderman_basic') {
                    projectiles.push(new SpidermanBasicWeb(px, this.y + 20, dir * 20, 0, this));
                }
                
                // Chiêu 1: Giăng tơ liên kết 2 cấu trúc gần nhất
                else if (skillKey === 'spiderman_c1') {
                    let structs = [];
                    platforms.forEach(p => structs.push({ x: p.x, y: p.y, w: p.w !== undefined ? p.w : p.width, h: p.h !== undefined ? p.h : p.height }));
                    walls.forEach(w => structs.push({ x: w.x, y: w.y, w: w.w !== undefined ? w.w : w.width, h: w.h !== undefined ? w.h : w.height }));
                    structs.push({ x: -20, y: 0, w: 20, h: canvas.height }); // Rìa trái map
                    structs.push({ x: canvas.width, y: 0, w: 20, h: canvas.height }); // Rìa phải map
                    structs.push({ x: 0, y: canvas.height - groundHeight, w: canvas.width, h: groundHeight }); // Mặt đất

                    let cx = this.x + 15;
                    let cy = this.y + 25;
                    let points = structs.map(s => {
                        let cp = closestPointOnAABB(cx, cy, s);
                        let d = Math.hypot(cp.x - cx, cp.y - cy);
                        return { pt: cp, dist: d };
                    });
                    
                    // Sắp xếp tìm 2 điểm gần nhất
                    points.sort((a, b) => a.dist - b.dist);
                    let pt1 = points[0] ? points[0].pt : { x: 0, y: cy };
                    let pt2 = points[1] ? points[1].pt : { x: canvas.width, y: cy };

                    // Tạo bẫy tơ bao phủ khoảng trống liên kết
                    let minX = Math.min(pt1.x, pt2.x);
                    let maxX = Math.max(pt1.x, pt2.x);
                    let minY = Math.min(pt1.y, pt2.y);
                    let maxY = Math.max(pt1.y, pt2.y);
                    let w = Math.max(80, maxX - minX);
                    let h = Math.max(80, maxY - minY);

                    let newTrap = new WebTrap(minX, minY, w, h, 0);
                    projectiles.push(newTrap);

                    // Gây 20 sát thương nếu địch đứng trong tầm giăng tơ
                    if (enemy && !enemy.isDead && newTrap.intersects(enemy)) {
                        enemy.takeDamage(20);
                        effects.push(new DamageText(enemy.x, enemy.y - 20, "20 Web Entangle!", '#ffffff'));
                    }

                    // Hiệu ứng bọt tơ trắng bám tỏa
                    for (let i = 0; i < 15; i++) {
                        effects.push(new Explosion(minX + Math.random() * w, minY + Math.random() * h, 12, '#ffffff'));
                    }
                }
                
                // Chiêu 2: Bắn tơ cầu rơi kén
                else if (skillKey === 'spiderman_c2') {
                    projectiles.push(new WebBall(this.x + this.width / 2 - 10, this.y, this));
                }
                
                // Chiêu 3: Phát nổ kén nhện
                else if (skillKey === 'spiderman_c3') {
                    let cocoons = projectiles.filter(p => p instanceof CocoonEntity && p.active);
                    cocoons.forEach(c => {
                        c.active = false;
                        effects.push(new Explosion(c.x + 15, c.y + 20, 250, 'rgba(255, 255, 255, 0.6)'));
                        if (enemy && !enemy.isDead) {
                            let dist = Math.hypot((enemy.x + enemy.width / 2) - (c.x + 15), (enemy.y + enemy.height / 2) - (c.y + 20));
                            if (dist <= 250) {
                                enemy.takeDamage(25);
                                effects.push(new DamageText(enemy.x, enemy.y - 20, "25 Cocoon Burst!", '#ffffff'));
                            }
                        }
                        // Tạo bẫy tơ 250px tại vùng phát nổ kén
                        projectiles.push(new WebTrap(c.x + 15 - 125, c.y + 20 - 125, 250, 250, 0));
                    });
                }
            } else {
                originalExecuteSkill.apply(this, arguments);
            }
        };

        // Bổ sung hàm hỗ trợ thả kén cho chiêu 2
        Player.prototype.spawnCocoonFalls = function() {
            let enemy = this === player1 ? player2 : player1;
            for (let i = 0; i < 3; i++) {
                let targetX;
                if (Math.random() < 0.30 && enemy && !enemy.isDead) {
                    targetX = enemy.x + (Math.random() - 0.5) * 30; // 30% rơi chính xác cột X của địch
                } else {
                    targetX = Math.random() * (canvas.width - 50);
                }
                let cb = new CocoonBall(targetX, -100 - (i * 60), this);
                projectiles.push(cb);
            }
        };
    }
});