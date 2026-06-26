// --- LOGIC CHO CHẾ ĐỘ BOOM ---

// Bộ đếm thời gian ẩn để liên tục tạo Boom mỗi 10 giây
class BoomSpawner extends Projectile {
    constructor() {
        super(0, 0, 0, 0, 0, 0, 'transparent', null, 0, true);
        this.timer = 0;
    }
    update() {
        // Mỗi 10s (600 frames ở 60 FPS) tạo 1 quả Boom ở giữa map theo trục X
        if (this.timer % 600 === 0) {
            // Dùng Math.pow(Math.random(), 2) để bóp tỉ lệ: Càng lên cao tỉ lệ spawn càng thấp
            let skewedRandom = Math.pow(Math.random(), 2);
            let randomYOffset = 100 + skewedRandom * 1200; 
            let spawnY = canvas.height - groundHeight - randomYOffset;
            
            // Giới hạn để bom không bị văng tuốt ra ngoài lề trên của màn hình
            if (spawnY < 50) spawnY = 50; 

            projectiles.push(new ModeBoomEntity(canvas.width / 2 - 20, spawnY));
        }
        this.timer++;
    }
    draw() {}
    applyEffect() {}
}

class ModeBoomEntity extends Projectile {
    constructor(x, y) {
        super(x, y, 0, 0, 40, 40, '#222', null, 0, true);
        this.timer = 600; // 10 giây đếm ngược tới lúc nổ
        this.type = 'normal'; // Trạng thái mặc định
    }

    update() {
        this.timer--;

        // Giây thứ 4 kết thúc -> bước sang 3 giây cuối (180 frames) -> Hóa form
        if (this.timer === 180) {
            let types = ['blue', 'red', 'purple', 'yellow', 'green'];
            this.type = types[Math.floor(Math.random() * types.length)];
        }

        // Logic của BOM XANH DƯƠNG (Hút địch)
        if (this.timer <= 180 && this.type === 'blue') {
            this.applyBlueSuction(player1);
            this.applyBlueSuction(player2);
        }

        // Logic của BOM TÍM (Hoán đổi vị trí người chơi)
        if (this.timer <= 180 && this.type === 'purple') {
            // Mỗi giây (60 frames) có 50% tỉ lệ đổi vị trí
            if (this.timer % 60 === 0 && Math.random() < 0.5) {
                let tempX = player1.x; let tempY = player1.y;
                player1.x = player2.x; player1.y = player2.y;
                player2.x = tempX; player2.y = tempY;
                
                effects.push(new Explosion(player1.x + 15, player1.y + 25, 40, 'rgba(138, 43, 226, 0.8)'));
                effects.push(new Explosion(player2.x + 15, player2.y + 25, 40, 'rgba(138, 43, 226, 0.8)'));
                effects.push(new DamageText(player1.x, player1.y - 20, "SWAP!", '#cc00ff'));
                effects.push(new DamageText(player2.x, player2.y - 20, "SWAP!", '#cc00ff'));
            }
        }

        // Rơi tự do
        this.vy += gravity;
        let nextY = this.y + this.vy;
        let onGround = false;

        // Check chạm đất dưới cùng
        if (nextY >= canvas.height - groundHeight - this.height) {
            this.vy = 0;
            this.y = canvas.height - groundHeight - this.height;
            onGround = true;
        } else {
            // Check chạm bục đá (platforms bay trên không)
            for (let plat of platforms) {
                if (this.vy > 0 && this.y + this.height - this.vy <= plat.y && 
                    this.x + this.width > plat.x && this.x < plat.x + plat.w && nextY + this.height >= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    onGround = true;
                    break;
                }
            }
        }

        if (!onGround) {
            this.y += this.vy;
        }
        
        // Ma sát để bom trượt lăn rồi dừng lại
        this.vx *= 0.92;
        this.x += this.vx;

        // Giới hạn biên bản đồ
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Nhận lực đẩy từ đạn/đòn đánh thường của player (Bỏ qua TNT nhỏ)
        for (let p of projectiles) {
            if (p !== this && p.active && checkCollision(this, p) && p.damage > 0 && !(p instanceof SmallTNT) && !(p instanceof BoomBananaMinion)) {
                this.vx = p.vx > 0 ? 8 : (p.vx < 0 ? -8 : (Math.random() > 0.5 ? 8 : -8));
                this.vy = -3;
                if (!p.preserve) p.active = false;
            }
        }

        // Hết giờ nổ
        if (this.timer <= 0) {
            this.explode();
        }
    }

    applyBlueSuction(target) {
        if (target.isDead) return;
        let cx = this.x + this.width/2;
        let cy = this.y + this.height/2;
        let tcx = target.x + target.width/2;
        let tcy = target.y + target.height/2;
        
        let pullX = (cx > tcx) ? 5.5 : -5.5;
        target.x += pullX;

        if (tcy > cy) {
            target.vy -= 1; 
        } else {
            target.vy += 1.5;
        }
    }

    explode() {
        this.active = false;
        
        // Gọi sóng nổ lan chậm (Đem loại boom đi theo để xét)
        projectiles.push(new BoomExplosionWave(this.x + this.width/2, this.y + this.height/2, this.type));
        
        // Logic của BOM ĐỎ (Mưa 50 TNT)
        if (this.type === 'red') {
            for (let i = 0; i < 50; i++) {
                let tntX = this.x + (Math.random() - 0.5) * 1400; 
                let tntY = this.y - Math.random() * 700; 
                
                if (tntX < 10) tntX = 10;
                if (tntX > canvas.width - 25) tntX = canvas.width - 25;
                if (tntY < 50) tntY = 50 + Math.random() * 100;

                projectiles.push(new SmallTNT(tntX, tntY));
            }
        }

        // Logic của BOM VÀNG (Spawn 2 chuối)
        if (this.type === 'yellow') {
            for (let i = 0; i < 2; i++) {
                let target = (i < 1) ? player1 : player2;
                
                let spawnX = Math.random() * canvas.width;
                let spawnY = canvas.height - groundHeight - 40; 
                
                // Random 50% ra trên không (các bậc platform)
                if (platforms.length > 0 && Math.random() < 0.5) {
                    let plat = platforms[Math.floor(Math.random() * platforms.length)];
                    spawnX = plat.x + Math.random() * (plat.w - 24);
                    spawnY = plat.y - 40;
                }
                
                projectiles.push(new BoomBananaMinion(spawnX, spawnY, target));
            }
        }

        // Rung màn hình mạnh
        canvas.style.transform = `translate(${Math.random()*30 - 15}px, ${Math.random()*30 - 15}px)`;
        setTimeout(() => canvas.style.transform = 'none', 300);
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        
        // Đổi màu bom dựa theo type
        if (this.type === 'blue') ctx.fillStyle = '#0055ff';
        else if (this.type === 'red') ctx.fillStyle = '#ff0000';
        else if (this.type === 'purple') ctx.fillStyle = '#8a2be2';
        else if (this.type === 'yellow') ctx.fillStyle = '#ffd700';
        else if (this.type === 'green') ctx.fillStyle = '#32cd32';
        else ctx.fillStyle = '#363636'; 
        
        ctx.beginPath(); ctx.arc(this.x + 20, this.y + 20, 20, 0, Math.PI*2); ctx.fill();
        
        // VFX đặc trưng của vài loại
        if (this.type === 'blue') {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            let pulse = (this.timer % 30) * 3;
            ctx.beginPath(); ctx.arc(this.x + 20, this.y + 20, 100 - pulse, 0, Math.PI*2); ctx.stroke();
        } else if (this.type === 'purple') {
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
            ctx.lineWidth = 2;
            let pulse = (this.timer % 20) * 2;
            ctx.beginPath(); ctx.arc(this.x + 20, this.y + 20, 30 + pulse, 0, Math.PI*2); ctx.stroke();
        } else if (this.type === 'green') {
            if (Math.random() < 0.2) effects.push(new Explosion(this.x + 20, this.y + 20, 5, 'rgba(50, 205, 50, 0.8)'));
        }

        // Cầu chì nhấp nháy đỏ
        ctx.strokeStyle = (this.timer % 10 < 5) ? '#ffffff' : '#ffa500';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(this.x + 20, this.y); ctx.lineTo(this.x + 20, this.y - 12); ctx.stroke();
        
        // Hiện số giây đếm ngược
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(this.timer / 60), this.x + 20, this.y + 27);
        ctx.restore();
    }
    
    applyEffect(target) {} 
}

// Lớp sóng nổ chính
class BoomExplosionWave extends Projectile {
    constructor(cx, cy, bombType) {
        super(cx - 10, cy - 10, 0, 0, 20, 20, 'rgba(255, 69, 0, 0.6)', null, 200, true); 
        this.cx = cx;
        this.cy = cy;
        this.bombType = bombType; // Kế thừa hệ bom để biết xử lý
        this.radius = 10;
        this.maxRadius = 2000; 
        this.hasHitSomeone = false;
    }

    update() {
        if (this.hasHitSomeone) {
            this.active = false;
            return;
        }

        this.radius += 12; // Lan nhanh
        
        this.x = this.cx - this.radius;
        this.y = this.cy - this.radius;
        this.width = this.radius * 2;
        this.height = this.radius * 2;

        if (this.radius >= this.maxRadius) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2); ctx.fill();
        
        ctx.strokeStyle = '#ff0000'; 
        if (this.bombType === 'green') ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 8;
        ctx.shadowBlur = 20; ctx.shadowColor = this.bombType === 'green' ? '#00ff00' : '#ff4500';
        ctx.beginPath(); ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
    }

    applyEffect(target) {
        if (this.hasHitSomeone) return;

        if (!target.isDead) {
            let targetCx = target.x + target.width/2;
            let targetCy = target.y + target.height/2;
            let dist = Math.hypot(targetCx - this.cx, targetCy - this.cy);
            
            if (dist <= this.radius + target.width/2) {
                target.takeDamage(this.damage);
                
                effects.push(new Explosion(targetCx, targetCy, 80, this.bombType === 'green' ? '#00ff00' : '#ff0000'));
                
                this.hasHitSomeone = true;
                this.active = false;

                // Xử lý tạo vũng độc của Boom Green
                if (this.bombType === 'green') {
                    projectiles.push(new PoisonZone(this.cx, this.cy, this.radius));
                }
            }
        }
    }
}

// Vùng độc được sinh ra khi Bom Xanh lá phát nổ trúng địch
class PoisonZone extends Projectile {
    constructor(cx, cy, radius) {
        // Tạo hitbox khít với vụ nổ
        super(cx - radius, cy - radius, 0, 0, radius*2, radius*2, 'rgba(0, 255, 0, 0.4)', null, 0, true);
        this.cx = cx;
        this.cy = cy;
        this.radius = radius;
        this.timer = 450; // Tồn tại 7.5s (450 frames)
    }
    update() {
        this.timer--;
        if (this.timer <= 0) this.active = false;
        
        // 1 dmg / 0.2s = mỗi 12 frames
        if (this.timer % 12 === 0) {
            this.checkAndPoison(player1);
            this.checkAndPoison(player2);
        }
    }
    checkAndPoison(target) {
        if (target.isDead) return;
        let targetCx = target.x + target.width/2;
        let targetCy = target.y + target.height/2;
        if (Math.hypot(targetCx - this.cx, targetCy - this.cy) <= this.radius + target.width/2) {
            target.takeDamage(1); // Gây 1 dmg trực tiếp trong vùng độc
            
            // Ép debuff poison: Gây 5 sát thương mỗi 5 giây (300 frames), kéo dài 20 giây
            target.addStatus('poison', 'debuff', 'assets/icon/debuff/poison.png', 1200, 5, 300);
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2); ctx.fill();
        
        // Bong bóng độc nổi lên
        if (Math.random() < 0.15) {
            let rx = this.cx + (Math.random() - 0.5) * this.radius * 1.8;
            let ry = this.cy + (Math.random() - 0.5) * this.radius * 1.8;
            effects.push(new Explosion(rx, ry, 5 + Math.random()*5, 'rgba(0, 255, 0, 0.8)'));
        }
        ctx.restore();
    }
    applyEffect(target) {} 
}

// Lớp TNT con được văng ra từ Boom Đỏ
class SmallTNT extends Projectile {
    constructor(x, y) {
        super(x, y, 0, 0, 15, 15, '#ff4444', null, 30, true);
        this.timer = 60 + Math.random() * 60; 
    }

    update() {
        this.timer--;
        this.vy += gravity;
        
        let nextY = this.y + this.vy;
        let hitGround = false;
        
        if (nextY >= canvas.height - groundHeight - this.height) {
            this.y = canvas.height - groundHeight - this.height;
            hitGround = true;
        } else {
            for (let plat of platforms) {
                if (this.vy > 0 && this.y + this.height - this.vy <= plat.y && 
                    this.x + this.width > plat.x && this.x < plat.x + plat.w && nextY + this.height >= plat.y) {
                    this.y = plat.y - this.height;
                    hitGround = true;
                    break;
                }
            }
        }
        
        if (!hitGround) this.y += this.vy;
        
        if (hitGround || this.timer <= 0) {
            this.explode();
        }
    }

    explode() {
        this.active = false;
        effects.push(new Explosion(this.x + 7.5, this.y + 7.5, 30, '#ffaa00'));
        
        let checkDmg = (target) => {
            if(target.isDead) return;
            let dist = Math.hypot((target.x+target.width/2) - (this.x+7.5), (target.y+target.height/2) - (this.y+7.5));
            if(dist < 50) target.takeDamage(this.damage);
        };
        checkDmg(player1); checkDmg(player2);
    }

    draw() {
        if(!this.active) return;
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Arial'; 
        ctx.fillText('TNT', this.x + 1, this.y + 10);
    }

    applyEffect(target) {
        this.explode(); 
    }
}

// Lớp Banana Minion được dùng riêng cho hệ thống ArenaHeroDuel (Sinh từ Boom vàng)
class BoomBananaMinion extends Projectile {
    constructor(x, y, targetPlayer) {
        super(x, y, 0, 0, 24, 40, 'yellow', null, 20, true);
        this.targetPlayer = targetPlayer;
        this.maxHp = 25;
        this.hp = 25;
        this.baseSpeed = 4; // Tốc độ gốc để tính toán làm chậm
        this.speed = 4;
        this.attackWindup = 0;
        this.attackCooldown = 0;
        this.moveTick = 0;
        this.facingRight = true;
        this.isDead = false;
        this.deathTimer = 30;

        // ==========================================
        // HỆ THỐNG GIẢ LẬP PLAYER ĐỂ NHẬN HIỆU ỨNG
        // ==========================================
        this.heroType = 'banana'; 
        this.statusList = [];
        this.stunTimer = 0;
        this.slowTimer = 0;
        this.shield = { layers: 0, facingRight: true }; // Tránh lỗi khi kỹ năng kiểm tra khiên
        this.isDeflecting = false; // Tránh lỗi
        this.hitBy = new Set(); // Bộ lọc chống nhận dame liên tục từ 1 hitbox (Piercing)
    }

    // Các hàm quản lý assets/icon/buff/Debuff y hệt Player
    addStatus(id, type, icon, durationFrames, value = 0, tickRate = 60) {
        let existing = this.statusList.find(s => s.id === id);
        if (existing) {
            existing.timer = Math.max(existing.timer, durationFrames);
            existing.value = Math.max(existing.value, value);
        } else {
            this.statusList.push({ id: id, type: type, icon: icon, timer: durationFrames, value: value, tickRate: tickRate, currentTick: 0 });
        }
        // Map các hiệu ứng đặc biệt trực tiếp
        if (id === 'stuncc' || id === 'freeze' || id === 'stunbutter') this.stunTimer = durationFrames;
        if (id === 'snowless') this.slowTimer = durationFrames;
    }
    
    hasStatus(id) { return this.statusList.some(s => s.id === id); }
    getStatusValue(id) { let st = this.statusList.find(s => s.id === id); return st ? st.value : 0; }
    removeStatus(id) { this.statusList = this.statusList.filter(s => s.id !== id); }

    // Gánh chịu sát thương (Có tính toán giáp và hiệu ứng)
    takeDamage(amount) {
        if (this.isDead) return;

        // Xuyên giáp/Sát thương nhận thêm
        if (this.hasStatus('arpenetration')) {
            amount += amount * (this.getStatusValue('arpenetration') / 100);
        }
        // Giảm thương
        if (this.hasStatus('shield')) {
            amount -= amount * (this.getStatusValue('shield') / 100);
        }

        this.hp -= amount;
        effects.push(new DamageText(this.x + 10, this.y, `-${Math.floor(amount)}`, '#ffaa00')); // Dame cam

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    updateStatuses() {
        if (this.stunTimer > 0) this.stunTimer--;
        if (this.slowTimer > 0) this.slowTimer--;

        // Áp dụng làm chậm
        this.speed = this.slowTimer > 0 ? this.baseSpeed * 0.5 : this.baseSpeed;

        for (let i = this.statusList.length - 1; i >= 0; i--) {
            let s = this.statusList[i];
            s.timer--;
            s.currentTick++;

            // Sát thương theo thời gian (Độc, Thiêu đốt, Chảy máu)
            if (s.id === 'poison' || s.id === 'bleed' || s.id === 'flame') {
                if (s.currentTick >= s.tickRate) {
                    this.takeDamage(s.value);
                    s.currentTick = 0;
                }
            }
            if (s.timer <= 0) this.statusList.splice(i, 1);
        }
    }

    update() {
        if (this.hp <= 0 && !this.isDead) {
            this.hp = 0;
            this.isDead = true;
        }
        if (this.isDead) {
            this.deathTimer--;
            if (this.deathTimer <= 0) this.active = false;
            return;
        }

        // 1. Chạy tiến trình hiệu ứng khống chế / sát thương theo thời gian
        this.updateStatuses();

        // 2. NHẬN SÁT THƯƠNG TỪ KỸ NĂNG/HITBOX NHƯ PLAYER BÌNH THƯỜNG
        for (let p of projectiles) {
            if (p.active && p !== this && p.owner instanceof Player && !this.hitBy.has(p)) {
                if (checkCollision(this, p)) {
                    this.hitBy.add(p);
                    let preHp = this.hp;
                    
                    // ÉP KỸ NĂNG ĐÓ TÁC DỤNG LÊN CHUỐI (Choáng, đẩy lùi, v.v...)
                    p.applyEffect(this);
                    
                    // Hủy đạn nếu nó gây dame và không phải là đạn xuyên thấu (preserve)
                    if (!p.preserve && p.active && this.hp < preHp) {
                        p.active = false;
                    }
                }
            }
        }
        // Dọn dẹp hitbox rác
        for (let p of this.hitBy) {
            if (!projectiles.includes(p)) this.hitBy.delete(p);
        }

        // 3. XỬ LÝ TRỌNG LỰC
        this.vy += gravity;
        let nextY = this.y + this.vy;
        let onGround = false;
        
        if (nextY >= canvas.height - groundHeight - this.height) {
            this.y = canvas.height - groundHeight - this.height;
            this.vy = 0;
            onGround = true;
        } else {
            for (let plat of platforms) {
                if (this.vy > 0 && this.y + this.height - this.vy <= plat.y && 
                    this.x + this.width > plat.x && this.x < plat.x + plat.w && nextY + this.height >= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    onGround = true;
                    break;
                }
            }
        }
        if (!onGround) this.y += this.vy;

        // 4. LOGIC TRUY ĐUỔI & TẤN CÔNG
        if (this.attackCooldown > 0) this.attackCooldown--;

        let target = this.targetPlayer;
        let dx = target.x + target.width/2 - (this.x + this.width/2);
        let dy = target.y + target.height/2 - (this.y + this.height/2);
        let dist = Math.abs(dx);
        let attackRange = 40;

        // NẾU BỊ CHOÁNG HOẶC ĐÓNG BĂNG THÌ ĐỨNG YÊN
        if (this.stunTimer > 0 || this.hasStatus('freeze') || this.hasStatus('stunbutter')) {
            this.vx = 0;
        } else {
            if (this.attackWindup > 0) {
                this.attackWindup--;
                this.vx = 0;
                if (this.attackWindup <= 0) {
                    if (dist <= attackRange + 20 && Math.abs(dy) < 50 && !target.isDead) {
                        target.takeDamage(this.damage);
                    }
                    this.attackCooldown = 60;
                }
            } else {
                if (dist <= attackRange && Math.abs(dy) < 50) {
                    this.vx = 0;
                    if (this.attackCooldown <= 0) {
                        this.attackWindup = 15;
                        this.facingRight = dx > 0;
                    }
                } else {
                    if (dx > 5) { this.vx = this.speed; this.facingRight = true; }
                    else if (dx < -5) { this.vx = -this.speed; this.facingRight = false; }
                    else { this.vx = 0; }
                }
            }
        }
        
        this.x += this.vx;

        // Giới hạn biên
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        if (this.vx !== 0) this.moveTick++;
        else this.moveTick = 0;
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        let centerX = this.x + this.width/2;
        let centerY = this.y + this.height/2;
        ctx.translate(centerX, centerY);
        
        if (this.vx !== 0 && !this.isDead) {
            let angle = Math.sin(this.moveTick * 0.3) * 0.2; 
            ctx.rotate(angle);
        }

        let bodyColor = this.isDead ? '#ff0000' : '#ffe135';
        let legColor = '#3e2723';
        let armColor = '#ffb300';

        ctx.fillStyle = legColor;
        let legOffset1 = 0; let legOffset2 = 0;
        if (this.vx !== 0 && !this.isDead) {
            legOffset1 = Math.sin(this.moveTick * 0.5) * 5;
            legOffset2 = -Math.sin(this.moveTick * 0.5) * 5;
        }
        ctx.beginPath(); ctx.arc(-6, this.height/2 + legOffset1, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, this.height/2 + legOffset2, 4, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        if (this.facingRight) {
            ctx.moveTo(0, -this.height/2); 
            ctx.quadraticCurveTo(15, -10, 5, this.height/2); 
            ctx.lineTo(-5, this.height/2); 
            ctx.quadraticCurveTo(5, -10, -10, -this.height/2); 
        } else {
            ctx.moveTo(0, -this.height/2);
            ctx.quadraticCurveTo(-15, -10, -5, this.height/2); 
            ctx.lineTo(5, this.height/2); 
            ctx.quadraticCurveTo(-5, -10, 10, -this.height/2); 
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f57f17';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (!this.isDead) {
            ctx.fillStyle = 'black';
            let eyeX = this.facingRight ? 2 : -6;
            ctx.beginPath(); ctx.arc(eyeX, -10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX + 4, -10, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX + 2, -4, 3, 0, Math.PI); ctx.stroke();

            ctx.fillStyle = armColor;
            if (this.attackWindup > 0) {
                if (this.facingRight) ctx.fillRect(-10, 0, 8, 4);
                else ctx.fillRect(2, 0, 8, 4);
            } else if (this.attackCooldown > 45) { 
                if (this.facingRight) ctx.fillRect(5, 0, 15, 4);
                else ctx.fillRect(-20, 0, 15, 4);
            } else {
                ctx.fillRect(-12, 0, 6, 4);
                ctx.fillRect(6, 0, 6, 4);
            }
        }

        // VẼ HIỆU ỨNG ĐÓNG BĂNG BÊN NGOÀI
        if (this.hasStatus('freeze')) {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.4)';
            ctx.fillRect(-this.width/2 - 2, -this.height/2 - 2, this.width + 4, this.height + 4);
        }

        // VẼ HIỆU ỨNG CHOÁNG
        if (this.stunTimer > 0) {
            ctx.translate(0, -this.height/2 - 10);
            ctx.rotate(this.stunTimer * 0.2);
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            for(let i=0; i<3; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, 6 + i*3, i*Math.PI/1.5, i*Math.PI/1.5 + Math.PI/2);
                ctx.stroke();
            }
        }
        ctx.restore();

        // Thanh HP
        if (!this.isDead) {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y - 10, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / this.maxHp), 4);
        }
    }
    applyEffect(target) {}
}