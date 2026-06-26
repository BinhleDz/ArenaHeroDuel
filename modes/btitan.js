// ==========================================
// CHẾ ĐỘ: BTITAN (NGƯỜI KHỔNG LỒ & SIÊU CẤP TOTEM)
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    // Đẩy chế độ BTitan vào mảng gameModes của hệ thống chính
    if (typeof gameModes !== 'undefined') {
        gameModes.push({ 
            id: 'btitan', 
            name: '🔥 BTITAN', 
            icon: 'assets/gameplay/btitan.png'
        });
        
        // Khôi phục chữ hiển thị trên nút nếu user đang lưu chế độ btitan từ trước
        if (typeof currentMode !== 'undefined' && currentMode === 'btitan') {
            document.getElementById('btn-open-mode').innerText = "CHẾ ĐỘ: 🔥 BTITAN";
        }
    }
});
// 2. Khởi tạo 3 Super Totems cho cả hai người chơi khi bắt đầu Game
const originalStartGameBtitan = window.startGame;
window.startGame = function() {
    // Gọi hàm startGame gốc để khởi tạo mọi thứ
    originalStartGameBtitan();
    
    if (currentMode === 'btitan') {
        player1.btitanTotems = 3;
        player2.btitanTotems = 3;
    }
};

// 3. Scale mọi đòn đánh/kỹ năng (Projectiles)
function updateBtitanMode(p1, p2) {
    projectiles.forEach(p => {
        if (!p.btitanScaled) {
            // Random độ lớn và sát thương (Gấp 1 đến 5 lần)
            let scale = 1 + Math.random() * 4; 
            p.btitanScale = scale;
            
            // Tỷ lệ thuận Sát thương
            if (p.damage !== undefined) {
                p.damage = Math.floor(p.damage * scale);
            }
            
            // Phóng to Hitbox (Cập nhật X/Y để đạn nới rộng từ tâm, không bị lệch)
            if (p.width !== undefined && p.height !== undefined) {
                p.x -= (p.width * scale - p.width) / 2;
                p.y -= (p.height * scale - p.height) / 2;
                p.width *= scale;
                p.height *= scale;
            }
            if (p.radius !== undefined) {
                p.radius *= scale;
            }
            
            // Phóng to Hình ảnh hiển thị (Ghi đè hàm draw)
            if (typeof p.draw === 'function') {
                const originalDraw = p.draw;
                p.draw = function() {
                    ctx.save();
                    
                    let cx = this.x;
                    let cy = this.y;
                    if (this.width !== undefined && this.height !== undefined) {
                        cx = this.x + this.width / 2;
                        cy = this.y + this.height / 2;
                    }
                    
                    // Scale Canvas tại trung tâm của đạn
                    ctx.translate(cx, cy);
                    ctx.scale(this.btitanScale, this.btitanScale);
                    ctx.translate(-cx, -cy);
                    
                    // Trả lại kích thước gốc TẠM THỜI để tránh bị x2 scale khi gọi originalDraw
                    let tempW = this.width;
                    let tempH = this.height;
                    let tempX = this.x;
                    let tempY = this.y;
                    let tempR = this.radius;
                    
                    if (this.width !== undefined && this.height !== undefined) {
                        this.width = tempW / this.btitanScale;
                        this.height = tempH / this.btitanScale;
                        this.x = cx - this.width / 2;
                        this.y = cy - this.height / 2;
                    }
                    if (this.radius !== undefined) {
                        this.radius = tempR / this.btitanScale;
                    }
                    
                    originalDraw.call(this); // Vẽ hình
                    
                    // Trả lại kích thước thực tế sau khi vẽ xong
                    this.width = tempW;
                    this.height = tempH;
                    this.x = tempX;
                    this.y = tempY;
                    if (this.radius !== undefined) this.radius = tempR;
                    
                    ctx.restore();
                };
            }

            
            if (typeof p.update === 'function' && !p.btitanUpdateHooked) {
                const origUpdate = p.update;
                p.update = function() {
                    window.currentBtitanProjectile = this;
                    try {
                        origUpdate.call(this);
                    } finally {
                        window.currentBtitanProjectile = null;
                    }
                };
                p.btitanUpdateHooked = true;
            }

            if (typeof p.applyEffect === 'function' && !p.btitanApplyEffectHooked) {
                const origApplyEffect = p.applyEffect;
                p.applyEffect = function(target) {
                    window.currentBtitanProjectile = this;
                    try {
                        origApplyEffect.call(this, target);
                    } finally {
                        window.currentBtitanProjectile = null;
                    }
                };
                p.btitanApplyEffectHooked = true;
            }
            
            p.btitanScaled = true; 
        }
    });
}

// 4. Hook vào hàm update của Player để gọi updateBtitanMode mỗi frame
if (!Player.prototype.originalUpdateBtitanHook) {
    Player.prototype.originalUpdateBtitanHook = Player.prototype.update;
    Player.prototype.update = function() {
        this.originalUpdateBtitanHook();
        // Chỉ cần gọi 1 lần mỗi frame (Gọi khi update player1)
        if (currentMode === 'btitan' && this === player1) {
            updateBtitanMode(player1, player2);
        }
    };
}

// 5. Cấm nhận Sát thương từ đòn đánh của bản thân (Trừ khi bị đổi chủ như Ronaldo C3)
if (!window.originalCheckCollisionBtitan) {
    window.originalCheckCollisionBtitan = window.checkCollision;
    window.checkCollision = function(rect1, rect2) {
        if (currentMode === 'btitan') {
            // rect1 thường là đạn/hitbox, rect2 là player đang bị check
            let attacker = rect1.owner || rect1;
            
            // FIX LỖI HITBOX ẢO: Nếu đạn đang chạy tạo ra một hitbox ẩn (không có owner), ta móc nối nó về chủ nhân của đạn
            if (window.currentBtitanProjectile && !rect1.owner && !rect1.heroType) {
                attacker = window.currentBtitanProjectile.owner || attacker;
            }

            // Nếu người tạo đòn đánh trùng với người dính đòn (Bản thân) -> Xuyên qua, bỏ qua va chạm!
            // Khi Ronaldo C3 sút phản đạn, rect1.owner sẽ bị chuyển thành Ronaldo -> nên nó sẽ đánh trúng chủ cũ.
            if (attacker === rect2) return false; 
        }
        return window.originalCheckCollisionBtitan(rect1, rect2);
    };
}

// 6. Hook vào hàm nhận Sát thương (TakeDamage) để xử lý 3 Super Totems và MIỄN SÁT THƯƠNG TỪ BẢN THÂN
if (!Player.prototype.originalTakeDamageBtitan) {
    Player.prototype.originalTakeDamageBtitan = Player.prototype.takeDamage;
    
    Player.prototype.takeDamage = function(amount) {
        // Nếu không phải mode BTitan, gọi hàm gốc và kết thúc
        if (currentMode !== 'btitan') {
            this.originalTakeDamageBtitan(amount);
            return;
        }
        
        // --- FIX LỖI ĐẠN LỚN TỰ GÂY DAME (AOE Trực tiếp) ---
        // Chặn toàn bộ sát thương nếu nó xuất phát từ một viên đạn do chính mình tạo ra
        if (window.currentBtitanProjectile && window.currentBtitanProjectile.owner === this) {
            return; // Bỏ qua, không nhận dame
        }
        
        // Nhận sát thương bình thường
        this.originalTakeDamageBtitan(amount);
        
        // Nếu máu tụt xuống <= 0 nhưng vẫn còn Super Totems
        if (this.hp <= 0 && this.btitanTotems > 0) {
            this.hp = this.maxHp;           // Hồi 100% HP
            this.isDead = false;            // Cứu sống
            this.btitanTotems--;            // Trừ đi 1 Totem
            
            // Âm thanh Totem
            if (typeof playSkillSound !== 'undefined') {
                playSkillSound('assets/sounds/sound_skill/totem/death_totem.ogg');
            }
            
            // Thêm Giáp ảo (HShield) 100% HP trong thời gian rất lâu (1500 frames = 25s)
            this.addStatus('hshield', 'buff', 'assets/icon/buff/hshield.png', 1500, this.maxHp, 60);
            
            // Hiệu ứng chữ và hạt lấp lánh
            effects.push(new DamageText(this.x, this.y - 50, `SUPER TOTEM! (${this.btitanTotems} left)`, '#ffaa00'));
            for (let i = 0; i < 50; i++) {
                effects.push(new RockParticle(
                    this.x + this.width / 2, 
                    this.y + this.height / 2, 
                    (Math.random() - 0.5) * 20, 
                    -Math.random() * 15 - 5, 
                    '#ffff00'
                ));
            }
            
            // Rung màn hình mãnh liệt
            let canvas = document.getElementById('gameCanvas');
            if (canvas) {
                canvas.style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
                setTimeout(() => canvas.style.transform = 'none', 300);
            }
        }
    };
}