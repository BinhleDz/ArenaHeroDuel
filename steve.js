class MinecraftArrow extends Projectile {
    constructor(x, y, vx, owner, type = 'normal') {
        super(x, y, vx, 0, 24, 4, '#8B4513', owner, 10, false);
        this.type = type; // Lưu loại mũi tên
    }

    update() {
        super.update();
        // Hiệu ứng vệt đuôi khi bay
        if (Math.random() < 0.6) {
            let tailX = this.vx > 0 ? this.x : this.x + 24;
            if (this.type === 'poison') effects.push(new Explosion(tailX, this.y + 2, 4, 'rgba(0, 255, 0, 0.6)')); // Đuôi xanh lá
            else if (this.type === 'flame') effects.push(new FireParticle(tailX, this.y + 2, (Math.random()-0.5), -Math.random()*2, 3+Math.random()*2, 15, '#ff3300')); // Đuôi lửa
            else if (this.type === 'slowness') effects.push(new Explosion(tailX, this.y + 2, 4, 'rgba(112, 128, 144, 0.6)')); // Đuôi xanh xám
            else if (this.type === 'levitation') effects.push(new Explosion(tailX, this.y + 2, 4, 'rgba(255, 255, 255, 0.6)')); // Đuôi khói trắng
            else if (this.type === 'instant') effects.push(new Explosion(tailX, this.y + 2, 4, 'rgba(139, 0, 0, 0.8)')); // Đuôi đỏ sẫm
        }
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 24, 4);
        
        // Đổi màu đầu mũi tên theo loại
        let headColor = '#999';
        if (this.type === 'poison') headColor = '#00ff00';
        else if (this.type === 'flame') headColor = '#ff3300';
        else if (this.type === 'slowness') headColor = '#708090';
        else if (this.type === 'levitation') headColor = '#ffffff';
        else if (this.type === 'instant') headColor = '#8b0000';

        ctx.fillStyle = headColor;
        ctx.fillRect(this.vx > 0 ? this.x + 20 : this.x, this.y - 2, 4, 8);
        ctx.fillStyle = 'white';
        ctx.fillRect(this.vx > 0 ? this.x : this.x + 20, this.y - 2, 4, 8);
    }

    applyEffect(target) {
        let dmg = this.damage;
        if (this.type === 'instant') dmg += 5; // Sát thương tức thì cộng thêm 5
        
        target.takeDamage(dmg);
        
        // Áp dụng các loại debuff (10s = 600 frames)
        if (this.type === 'poison') {
            target.addStatus('poison', 'debuff', 'assets/icon/debuff/poison.png', 600, 2, 120); // 2dame/2s
        } else if (this.type === 'flame') {
            target.addStatus('flame', 'debuff', 'assets/icon/debuff/flame.png', 600, 1, 60); // 1dame/1s
        } else if (this.type === 'slowness') {
            target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 600, 40, 60); // Chậm 40%
        } else if (this.type === 'levitation') {
            target.addStatus('levitation', 'debuff', 'assets/icon/debuff/levitation.png', 600, 1.5, 60); // Lơ lửng nhẹ
        }

        this.active = false;
    }
}

class DiamondSwordSlash extends Projectile {
    constructor(x, y, facingRight, owner) {
        super(x, y - 10, facingRight ? 5 : -5, 0, 40, 60, 'rgba(66, 245, 227, 0.8)', owner, 20, true);
        this.timer = 6;
        this.hitTarget = false;
    }

    update() {
        this.x += this.vx;
        this.timer--;
        if (this.timer <= 0) this.active = false;
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        let dir = this.vx > 0 ? 1 : -1;
        ctx.fillRect(this.x + (dir > 0 ? 0 : 20), this.y, 20, 15);
        ctx.fillRect(this.x + 10, this.y + 15, 20, 15);
        ctx.fillRect(this.x + (dir > 0 ? 20 : 0), this.y + 30, 20, 30);
    }

    applyEffect(target) {
        if (!this.hitTarget) {
            let sharpnessLvl = (this.owner && this.owner.steveEnchants) ? this.owner.steveEnchants.sharpness : 0;
            let fireLvl = (this.owner && this.owner.steveEnchants) ? this.owner.steveEnchants.fire_aspect : 0;

            let finalDamage = this.damage;
            if (sharpnessLvl > 0) {
                finalDamage += 4 + (sharpnessLvl - 1) * 2;
            }
            
            target.takeDamage(finalDamage);
            target.vx = this.vx > 0 ? 3 : -3;

            if (fireLvl > 0) {
                let fireDuration = fireLvl * 180; // 3s mỗi cấp
                target.addStatus('flame', 'debuff', 'assets/icon/debuff/flame.png', fireDuration, 3, 60); // Gây 2 sát thương mỗi giây
            }

            this.hitTarget = true;
        }
    }
}

// ==========================================
// HỆ THỐNG ENCHANTMENT CHO STEVE (HOOKS)
// ==========================================

const originalUpdate = Player.prototype.update;
Player.prototype.update = function() {
    if (this.heroType === 'steve' && !this.isDead) {
        // Khởi tạo các cấp độ enchant ban đầu bằng 0
        if (!this.steveEnchants) {
            this.steveEnchants = { sharpness: 0, fire_aspect: 0, lunge: 0, density: 0 };
            this.steveEnchantTimer = 0;
            this.floatingEnchant = null; // Quản lý hiển thị chữ enchant nâng cấp
        }

        const maxLevels = { sharpness: 5, fire_aspect: 2, lunge: 2, density: 4 };
        let allMaxed = true;

        for (let key in this.steveEnchants) {
            if (this.steveEnchants[key] < maxLevels[key]) {
                allMaxed = false;
            }
        }

        // Tự động nâng cấp ngẫu nhiên mỗi 7 giây (420 frames) nếu chưa đạt giới hạn tối đa
        if (!allMaxed) {
            this.steveEnchantTimer++;
            if (this.steveEnchantTimer >= 420) {
                this.steveEnchantTimer = 0;
                let upgradeableKeys = [];
                for (let key in this.steveEnchants) {
                    if (this.steveEnchants[key] < maxLevels[key]) {
                        upgradeableKeys.push(key);
                    }
                }

                if (upgradeableKeys.length > 0) {
                    let chosenEnchant = upgradeableKeys[Math.floor(Math.random() * upgradeableKeys.length)];
                    this.steveEnchants[chosenEnchant]++;

                    this.floatingEnchant = {
                        name: chosenEnchant,
                        level: this.steveEnchants[chosenEnchant],
                        timer: 120 // Hiển thị trong vòng 2 giây
                    };

                    // Hiệu ứng hạt bụi phép tím rực rỡ tỏa ra xung quanh
                    for (let i = 0; i < 25; i++) {
                        effects.push(new RockParticle(
                            this.x + this.width / 2,
                            this.y - 15,
                            (Math.random() - 0.5) * 8,
                            -Math.random() * 8 - 2,
                            '#8a2be2' // Màu tím huyễn hoặc
                        ));
                    }
                    
                    // Chọn ngẫu nhiên 1 trong 3 âm thanh Enchanting Table để phát
                    const enchantSoundIndex = Math.floor(Math.random() * 3) + 1;
                    playSkillSound(`assets/sounds/sound_skill/steve/Enchanting_Table_enchant${enchantSoundIndex}.ogg`);
                }
            }
        }

        if (this.floatingEnchant) {
            this.floatingEnchant.timer--;
            if (this.floatingEnchant.timer <= 0) {
                this.floatingEnchant = null;
            }
        }

        // Đánh dấu để áp dụng hệ thống tăng sát thương từ Density lên Mace Drop
        let enemy = (this === player1) ? player2 : player1;
        if (this.isMaceDropping && enemy) {
            const originalTakeDamage = enemy.takeDamage;
            const self = this;
            enemy.takeDamage = function(amount, damageType) {
                let densityLvl = self.steveEnchants ? self.steveEnchants.density : 0;
                let multiplier = 1 + 0.125 * densityLvl;
                originalTakeDamage.call(this, amount * multiplier, damageType);
                enemy.takeDamage = originalTakeDamage; // Phục hồi ngay lập tức
            };

            originalUpdate.apply(this, arguments);

            if (enemy.takeDamage === enemy.takeDamage) {
                enemy.takeDamage = originalTakeDamage;
            }
        } else {
            originalUpdate.apply(this, arguments);
        }
    } else {
        originalUpdate.apply(this, arguments);
    }
};

const originalExecuteSkill = Player.prototype.executeSkill;
Player.prototype.executeSkill = function(skillKey) {
    if (this.heroType === 'steve') {
        let dir = this.facingRight ? 1 : -1;
        if (skillKey === 'c2') {
            playSkillSound('assets/sounds/sound_skill/steve/c2_cast.ogg');
            
            let lungeLvl = this.steveEnchants ? this.steveEnchants.lunge : 0;
            this.isSpearDashing = true;
            this.spearHit = false;

            if (lungeLvl === 0) {
                // Đâm tại chỗ, hitbox tồn tại trong 0.55 giây (33 frames)
                this.spearTimer = 33;
                this.vx = 0;
            } else if (lungeLvl === 1) {
                // Lướt ngắn bằng một nửa khoảng cách gốc
                this.spearTimer = 15;
                this.vx = dir * 10;
            } else {
                // Lướt xa đầy đủ
                this.spearTimer = 15;
                this.vx = dir * 20;
            }
            return;
        }
    }
    originalExecuteSkill.apply(this, arguments);
};

const originalDraw = Player.prototype.draw;
Player.prototype.draw = function() {
    originalDraw.apply(this, arguments);

    // Vẽ hình ảnh cường hóa kỹ năng trôi nổi phía trên đầu Steve
    if (this.heroType === 'steve' && this.floatingEnchant) {
        let enchant = this.floatingEnchant;
        let namePath = `assets/skill_effect/steve/${enchant.name}.png`;
        let lvlPath = `assets/skill_effect/steve/${enchant.level}.png`;

        if (!skillImagesCache[namePath]) {
            skillImagesCache[namePath] = new Image();
            skillImagesCache[namePath].src = namePath;
        }
        if (!skillImagesCache[lvlPath]) {
            skillImagesCache[lvlPath] = new Image();
            skillImagesCache[lvlPath].src = lvlPath;
        }

        let nameImg = skillImagesCache[namePath];
        let lvlImg = skillImagesCache[lvlPath];

        let drawHeight = 72; // Chiều cao cố định của ảnh hiển thị
        let alphaValue = Math.min(1.0, enchant.timer / 30); // Mờ dần trong 30 frames cuối

        ctx.save();
        ctx.globalAlpha = alphaValue;

        let widthName = 72;
        if (nameImg.complete && nameImg.naturalWidth > 0 && nameImg.naturalHeight > 0) {
            widthName = (nameImg.naturalWidth / nameImg.naturalHeight) * drawHeight;
        }
        let widthLvl = 72;
        if (lvlImg.complete && lvlImg.naturalWidth > 0 && lvlImg.naturalHeight > 0) {
            widthLvl = (lvlImg.naturalWidth / lvlImg.naturalHeight) * drawHeight;
        }

        let totalWidth = widthName + widthLvl + 6;
        let drawX = this.x + (this.width / 2) - (totalWidth / 2);
        let drawY = this.y - 120; // Đặt cách xa vừa đủ trên đầu nhân vật

        if (nameImg.complete && nameImg.naturalWidth > 0) {
            ctx.drawImage(nameImg, drawX, drawY, widthName, drawHeight);
        } else {
            ctx.fillStyle = '#da70d6';
            ctx.font = 'bold 16px Courier New';
            ctx.fillText(enchant.name.toUpperCase(), drawX, drawY + 40);
        }

        if (lvlImg.complete && lvlImg.naturalWidth > 0) {
            ctx.drawImage(lvlImg, drawX + widthName + 6, drawY, widthLvl, drawHeight);
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 24px Courier New';
            ctx.fillText("+" + enchant.level, drawX + widthName + 10, drawY + 45);
        }

        ctx.restore();
    }
};