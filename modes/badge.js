let badgeTimer = 0;
const BADGE_INTERVAL = 600; // thời gian đổi

// 1. Thêm 'light', 'water', 'blood', 'cooldown', 'ghost', 'poison' vào danh sách
const BADGE_POOL = ['dracula', 'electric', 'sound', 'boxup', 'barrier', 'block', 'light', 'water', 'blood', 'cooldown', 'ghost', 'poison']; 

// ================= CLASS HIỆU ỨNG RƠI CỦA NỘI TẠI BLOOD =================
class BloodDropFalling {
    constructor(x, y, target, damage, size) {
        this.x = x; this.y = y;
        this.target = target;
        this.damage = damage;
        this.size = size;
        this.active = true;
        this.vy = 2; // Tốc độ rơi ban đầu
    }
    update() {
        this.y += this.vy;
        this.vy += 0.8; // Trọng lực tăng tốc rơi
        
        let targetCenterY = this.target.y + this.target.height/2;
        
        // Chạm vào giữa người kẻ địch
        if (this.y >= targetCenterY) {
            if (!this.target.isDead) {
                this.target.takeDamage(this.damage);
                effects.push(new Explosion(this.target.x + this.target.width/2, this.target.y + this.target.height/2, this.size * 1.5, '#cc0000'));
                effects.push(new DamageText(this.target.x, this.target.y - 40, `BÙNG NỔ -${Math.floor(this.damage)}`, '#ff0000'));
            }
            this.active = false;
        }
        if (this.y > canvas.height) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#cc0000';
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI);
        ctx.lineTo(this.x, this.y - this.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class LightBullet {
    constructor(x, y, target, owner) {
        this.x = x; this.y = y; this.width = 15; this.height = 4;
        this.owner = owner; 
        this.active = true;
        this.preserve = true; 
        
        if (Math.random() < 0.85) {
            this.damage = Math.floor(Math.random() * 20) + 1; 
        } else {
            this.damage = Math.floor(Math.random() * 80) + 21; 
        }
        
        let targetX = target.x + target.width/2;
        let targetY = target.y + target.height/2;
        let angle = Math.atan2(targetY - y, targetX - x);
        let speed = 25; 
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < -100 || this.x > canvas.width + 100 || this.y > canvas.height + 100 || this.y < -500) this.active = false;
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.fillStyle = '#ffffff'; 
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
        ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(15, 0); ctx.lineTo(0, 2); ctx.fill();
        ctx.restore();
    }
    applyEffect(target) {
        if (target === this.owner) return; 
        target.takeDamage(this.damage);
        this.active = false;
    }
}

class WaterPuddle {
    constructor(x, y, owner) {
        this.x = x; this.y = y; 
        this.width = 300; this.height = 25;
        this.owner = owner; this.active = true;
        this.enemyTick = 0; 
        this.selfTick = 0;  
    }
    update() {
        if (!this.active) return;
        let enemy = this.owner === player1 ? player2 : player1;
        
        if (checkCollision(this, enemy) && !enemy.isDead) {
            this.enemyTick++;
            enemy.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 48, 75, 60);
            enemy.addStatus('freeze', 'debuff', 'assets/icon/debuff/freeze.png', 48, 0, 60);
            
            if (this.enemyTick >= 42) {
                enemy.takeDamage(2);
                this.enemyTick = 0;
            }
        } else {
            this.enemyTick = 0; 
        }

        if (checkCollision(this, this.owner) && !this.owner.isDead) {
            this.selfTick++;
            this.owner.addStatus('ironbody', 'buff', 'assets/icon/buff/ironbody.png', 48, 0, 60);
            
            if (this.selfTick >= 60) {
                this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + 2);
                effects.push(new DamageText(this.owner.x + 15, this.owner.y - 20, "+2", '#00ff00'));
                this.selfTick = 0;
            }
        } else {
            this.selfTick = 0;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 20 + Math.sin(Date.now()/200)*10, this.y + 5);
        ctx.lineTo(this.x + this.width - 20, this.y + 5);
        ctx.stroke();
        ctx.restore();
    }
}

// Hàm khởi tạo khi bắt đầu trận
function initBadgeMode(p1, p2) {
    badgeTimer = BADGE_INTERVAL; 
    p1.superTotemUsed = false;
    p2.superTotemUsed = false;
    p1.currentBadge = null;
    p2.currentBadge = null;

    if (!Player.prototype.originalTakeDamageBadge) {
        Player.prototype.originalTakeDamageBadge = Player.prototype.takeDamage;
    }
    if (!Player.prototype.originalExecuteSkillBadge) {
        Player.prototype.originalExecuteSkillBadge = Player.prototype.executeSkill;
    }

    // Ghi đè hàm executeSkill để xử lý nội tại Cooldown
    Player.prototype.executeSkill = function(skillKey) {
        this.originalExecuteSkillBadge(skillKey);
        
        if (typeof currentMode !== 'undefined' && currentMode === 'badge' && this.currentBadge === 'cooldown' && skillKey === 'basic') {
            let skills = ['c1', 'c2', 'c3'];
            let randomSkill = skills[Math.floor(Math.random() * skills.length)];
            if (this.cds[randomSkill] > 0) {
                this.cds[randomSkill] = Math.max(0, this.cds[randomSkill] - 60); // Giảm 1s (60 frames)
                if (typeof effects !== 'undefined' && typeof DamageText !== 'undefined') {
                    effects.push(new DamageText(this.x, this.y - 20, "-1s CD", '#00ffff'));
                }
            }
        }
    };

// Ghi đè hàm takeDamage
    Player.prototype.takeDamage = function(amount, damageType) {
        if (currentMode !== 'badge') {
            this.originalTakeDamageBadge(amount, damageType);
            return;
        }

        if (this.currentBadge === 'block') amount *= 0.25; 

        let attacker = (this === player1) ? player2 : player1;

        // === NỘI TẠI BLOOD ===
        if (attacker && attacker.currentBadge === 'blood' && amount > 0 && !this.isDead) {
            this.bloodAccumulatedDamage = (this.bloodAccumulatedDamage || 0) + amount;
            if (!this.bloodDisplayMultiplier) {
                this.bloodDisplayMultiplier = (Math.random() * 2.75) + 0.25; 
            }
            effects.push(new DamageText(this.x + 10, this.y, `Tích tụ`, '#ff0000'));
            return; 
        }

        // === NỘI TẠI POISON: TRÚNG ĐỘC TÍCH LŨY ===
        // Thêm điều kiện chặn damageType !== 'spoison'
        if (attacker && attacker.currentBadge === 'poison' && amount > 0 && !this.isDead && damageType !== 'spoison') {
            let currentStacks = this.getStatusValue('spoison');
            this.addStatus('spoison', 'debuff', 'assets/icon/debuff/spoison.png', 300, currentStacks + 1, 60); // Tồn tại 5s
        }

        let preHp = this.hp;

        // Xử lý sát thương gốc bình thường
        this.originalTakeDamageBadge(amount, damageType);

        let actualDamageTaken = preHp - this.hp;

        // Nội tại Dracula
        if (attacker && attacker.currentBadge === 'dracula' && actualDamageTaken > 0 && !this.isDead) {
            let healAmount = actualDamageTaken;
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
            effects.push(new DamageText(attacker.x + 15, attacker.y - 20, "+" + Math.floor(healAmount), '#00ff00')); 
        }
        
        // Nội tại Barrier
        if (attacker && attacker.currentBadge === 'barrier' && actualDamageTaken > 0 && !this.isDead) {
            if (typeof SansBoneCage !== 'undefined') projectiles.push(new SansBoneCage(this, attacker));
        }
        
        // Nội tại Water
        if (attacker && attacker.currentBadge === 'water' && actualDamageTaken > 0 && !this.isDead) {
            attacker.waterPuddleCD = attacker.waterPuddleCD || 0;
            if (attacker.waterPuddleCD <= 0) {
                let pX = this.x + this.width/2 - 150; 
                let pY = canvas.height - 50 - 25; 
                effects.push(new WaterPuddle(pX, pY, attacker));
                attacker.waterPuddleCD = 120; 
            }
        }

        // Cơ chế Super Totem
        if (this.hp <= 0 && !this.superTotemUsed) {
            this.hp = this.maxHp;     
            this.isDead = false;      
            this.superTotemUsed = true; 

            if (typeof playSkillSound !== 'undefined') playSkillSound('assets/sounds/sound_skill/totem/death_totem.ogg');

            this.addStatus('hshield', 'buff', 'assets/icon/buff/hshield.png', 1500, this.maxHp, 60);

            effects.push(new DamageText(this.x, this.y - 50, "SUPER TOTEM!", '#ffaa00'));
            for (let i = 0; i < 50; i++) {
                effects.push(new RockParticle(
                    this.x + this.width / 2, this.y + this.height / 2, 
                    (Math.random() - 0.5) * 20, -Math.random() * 15 - 5, '#ffff00'
                ));
            }

            document.getElementById('gameCanvas').style.transform = `translate(${Math.random()*20 - 10}px, ${Math.random()*20 - 10}px)`;
            setTimeout(() => document.getElementById('gameCanvas').style.transform = 'none', 300);
        }
    };
}

function updateBadgeMode(p1, p2) {
    if (p1.isDead || p2.isDead) return;

    badgeTimer++;

    if (p1.waterPuddleCD > 0) p1.waterPuddleCD--;
    if (p2.waterPuddleCD > 0) p2.waterPuddleCD--;

    if (badgeTimer >= BADGE_INTERVAL) {
        badgeTimer = 0;
        
        let oldP1Badge = p1.currentBadge;
        let oldP2Badge = p2.currentBadge;

        const getNewBadge = (currentBadge) => {
            let availableBadges = BADGE_POOL.filter(b => b !== currentBadge);
            if (availableBadges.length === 0) return currentBadge; 
            return availableBadges[Math.floor(Math.random() * availableBadges.length)];
        };

        p1.currentBadge = getNewBadge(p1.currentBadge);
        p2.currentBadge = getNewBadge(p2.currentBadge);

        effects.push(new DamageText(p1.x, p1.y - 40, `+`, '#59ff00'));
        effects.push(new DamageText(p2.x, p2.y - 40, `+`, '#59ff00'));
        for(let i=0; i<15; i++) {
            effects.push(new Explosion(p1.x + Math.random()*p1.width, p1.y + Math.random()*p1.height, 4, '#59ff00'));
            effects.push(new Explosion(p2.x + Math.random()*p2.width, p2.y + Math.random()*p2.height, 4, '#59ff00'));
        }

        const handleBadgeExpiration = (oldB, newB, player, enemy) => {
            if (oldB === 'water' && newB !== 'water') {
                for (let i = effects.length - 1; i >= 0; i--) {
                    if (effects[i] instanceof WaterPuddle && effects[i].owner === player) {
                        effects[i].active = false;
                    }
                }
            }
            
            if (oldB === 'light' && newB !== 'light') {
                let orbX = player.facingRight ? player.x - 30 : player.x + player.width + 30;
                let orbY = player.y + 10;
                
                effects.push(new Explosion(orbX, orbY, 60, 'rgba(255, 255, 255, 0.9)'));
                for(let i=0; i<20; i++) effects.push(new RockParticle(orbX, orbY, (Math.random()-0.5)*15, (Math.random()-0.5)*15, '#ffffff'));
                
                for (let i = projectiles.length - 1; i >= 0; i--) {
                    let proj = projectiles[i];
                    if (proj.owner !== player) {
                        let distProj = Math.hypot((proj.x+proj.width/2) - orbX, (proj.y+proj.height/2) - orbY);
                        if (distProj <= 250) proj.active = false;
                    }
                }
                
                let distEnemy = Math.hypot((enemy.x+enemy.width/2) - orbX, (enemy.y+enemy.height/2) - orbY);
                if (distEnemy <= 250 && !enemy.isDead) {
                    enemy.takeDamage(100);
                    effects.push(new DamageText(enemy.x, enemy.y - 30, "ÁNH SÁNG PHÁN QUYẾT!", '#ffffff'));
                    document.getElementById('gameCanvas').style.transform = `translate(${Math.random()*15 - 7.5}px, ${Math.random()*15 - 7.5}px)`;
                    setTimeout(() => document.getElementById('gameCanvas').style.transform = 'none', 100);
                }
            }

            if (oldB === 'blood' && newB !== 'blood') {
                if (enemy.bloodAccumulatedDamage > 0) {
                    let finalDamage = enemy.bloodAccumulatedDamage * 1.2; 
                    let dropSize = 10 + Math.floor(enemy.bloodAccumulatedDamage / 5);
                    effects.push(new BloodDropFalling(enemy.x + enemy.width/2, enemy.y - 50 - dropSize, enemy, finalDamage, dropSize));
                    enemy.bloodAccumulatedDamage = 0;
                    enemy.bloodDisplayMultiplier = null;
                }
            }
        };

        handleBadgeExpiration(oldP1Badge, p1.currentBadge, p1, p2);
        handleBadgeExpiration(oldP2Badge, p2.currentBadge, p2, p1);
    }

    [ {p: p1, e: p2}, {p: p2, e: p1} ].forEach(pair => {
        let owner = pair.p;
        let target = pair.e;

        if (owner.currentBadge === 'blood') {
            if (target.bloodAccumulatedDamage > 0 && !target.isDead) {
                let baseSize = 10;
                let dropSize = baseSize + Math.floor(target.bloodAccumulatedDamage / 5);
                let displayDame = Math.floor(target.bloodAccumulatedDamage * target.bloodDisplayMultiplier);
                
                let dropX = target.x + target.width / 2;
                let dropY = target.y - 30;
                
                ctx.save();
                ctx.fillStyle = '#cc0000';
                ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
                ctx.beginPath();
                ctx.arc(dropX, dropY, dropSize / 2, 0, Math.PI); 
                ctx.lineTo(dropX, dropY - dropSize); 
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 13px Arial';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 3; ctx.shadowColor = '#000000';
                ctx.fillText(displayDame, dropX, dropY - dropSize - 5);
                ctx.restore();
            }
        }

        if (owner.currentBadge === 'light' && !owner.isDead) {
            let orbX = owner.facingRight ? owner.x - 30 : owner.x + owner.width + 30;
            let orbY = owner.y + 10 + Math.sin(Date.now()/200)*5; 
            
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20; ctx.shadowColor = '#ffffaa';
            ctx.beginPath(); ctx.arc(orbX, orbY, 12, 0, Math.PI*2); ctx.fill();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; 
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(orbX, orbY, 250, 0, Math.PI*2); ctx.stroke();
            ctx.restore();

            let targetCx = target.x + target.width / 2;
            let targetCy = target.y + target.height / 2;
            let dist = Math.hypot(targetCx - orbX, targetCy - orbY);

            if (dist <= 250 && !target.isDead) {
                owner.lightTimer = (owner.lightTimer || 0) + 1;
                if (owner.lightTimer === 60 || owner.lightTimer === 70) {
                    projectiles.push(new LightBullet(orbX, orbY, target, owner));
                    effects.push(new Explosion(orbX, orbY, 20, 'rgba(255, 255, 200, 0.8)'));
                    if (typeof playSkillSound !== 'undefined') playSkillSound('assets/sounds/sound_skill/alex/trident_cast.ogg');
                }
                if (owner.lightTimer >= 70) owner.lightTimer = 0; 
            } else {
                owner.lightTimer = 0; 
            }
        }

        if (owner.currentBadge === 'block' && !owner.isDead) {
            owner.statusList = owner.statusList.filter(s => s.type !== 'debuff');
            owner.blockAngle = (owner.blockAngle || 0) + 0.12; 
            if (owner.blockHitCooldown > 0) owner.blockHitCooldown--;

            let cx = owner.x + owner.width / 2;
            let cy = owner.y + owner.height / 2;
            let orbitRadius = 60; 

            for (let i = 0; i < 2; i++) {
                let angle = owner.blockAngle + i * Math.PI;
                let ballX = cx + Math.cos(angle) * orbitRadius;
                let ballY = cy + Math.sin(angle) * orbitRadius;

                effects.push(new FireParticle(ballX, ballY, 0, 0, 10, 2, '#ff4500')); 
                effects.push(new FireParticle(ballX, ballY, (Math.random()-0.5)*2, -1, 4, 10, '#ffaa00')); 

                if (!target.isDead && owner.blockHitCooldown <= 0) {
                    let targetCx = target.x + target.width / 2;
                    let targetCy = target.y + target.height / 2;
                    if (Math.hypot(ballX - targetCx, ballY - targetCy) < 35) {
                        target.takeDamage(15);
                        owner.blockHitCooldown = 15; 
                        effects.push(new Explosion(ballX, ballY, 40, '#ff4500')); 
                    }
                }
            }
        }

        if (owner.currentBadge === 'electric' && !target.isDead) {
            projectiles.forEach(proj => {
                if (proj.owner === owner) {
                    let targetCenterX = target.x + target.width / 2;
                    let targetCenterY = target.y + target.height / 2;
                    let dist = Math.hypot(proj.x - targetCenterX, proj.y - targetCenterY);

                    if (dist < 300) {
                        proj.electricTimer = (proj.electricTimer || 0) + 1;
                        if (proj.electricTimer >= 15) {
                            proj.electricTimer = 0; 
                            target.hp -= 2;
                            effects.push(new DamageText(targetCenterX + (Math.random()*20-10), targetCenterY - 30, "2", '#00ffff'));

                            if (typeof LightningZap !== 'undefined') {
                                effects.push(new LightningZap(proj.x, proj.y, targetCenterX, targetCenterY, '#00ffff'));
                            }
                            for(let i = 0; i < 3; i++) effects.push(new RockParticle(targetCenterX, targetCenterY, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, '#00ffff'));
                            
                            let zaps = ['c1_zip1.ogg', 'c1_zip2.ogg', 'c1_zip3.ogg'];
                            let randomZap = zaps[Math.floor(Math.random() * zaps.length)];
                            if (typeof playSkillSound !== 'undefined') playSkillSound('assets/sounds/sound_skill/robot-R1/' + randomZap);
                        }
                    }
                }
            });
        }

        if (owner.currentBadge === 'sound' && !owner.isDead) {
            owner.soundBadgeTimer = (owner.soundBadgeTimer || 0) + 1;
            
            if (owner.soundBadgeTimer >= 60) {
                owner.soundBadgeTimer = 0;
                owner.soundBadgeCount = (owner.soundBadgeCount || 0) + 1;
                
                let cx = owner.x + owner.width / 2;
                let cy = owner.y + owner.height / 2;

                if (owner.soundBadgeCount < 3) {
                    if (typeof playSkillSound !== 'undefined') playSkillSound('assets/badge/sound_effect_hit.ogg');
                    effects.push(new Explosion(cx, cy, 80, 'rgba(0, 255, 255, 0.5)'));
                    effects.push(new OvalShockwave(cx, cy, owner.facingRight, '#00ffff', 0));
                } else {
                    owner.soundBadgeCount = 0; 
                    if (typeof playSkillSound !== 'undefined') playSkillSound('assets/badge/sound_hit.ogg');
                    
                    effects.push(new Explosion(cx, cy, 750, 'rgba(255, 0, 255, 0.25)')); 
                    effects.push(new OvalShockwave(cx, cy, owner.facingRight, '#ff00ff', 0));
                    effects.push(new OvalShockwave(cx, cy, owner.facingRight, '#ff00ff', Math.PI/2)); 

                    for (let i = projectiles.length - 1; i >= 0; i--) {
                        let proj = projectiles[i];
                        if (proj.owner !== owner) {
                            let projCx = proj.x + proj.width / 2;
                            let projCy = proj.y + proj.height / 2;
                            if (Math.hypot(projCx - cx, projCy - cy) <= 500) {
                                proj.active = false;
                                effects.push(new Explosion(projCx, projCy, 20, 'rgba(255, 255, 255, 0.8)')); 
                            }
                        }
                    }

                    if (!target.isDead) {
                        let targetCx = target.x + target.width / 2;
                        let targetCy = target.y + target.height / 2;
                        let distTarget = Math.hypot(targetCx - cx, targetCy - cy);

                        if (distTarget <= 750) {
                            target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 150, 75, 60);
                            let alpha = (1 - (distTarget / 750)).toFixed(2);
                            effects.push(new Explosion(targetCx, targetCy, 60, `rgba(0, 255, 255, ${alpha})`));
                            effects.push(new DamageText(targetCx + (Math.random()*20-10), targetCy - 40, "CHẬM!", `rgba(0, 255, 255, ${alpha})`));
                        }
                    }
                }
            }
        } else {
            owner.soundBadgeTimer = 0;
            owner.soundBadgeCount = 0;
        }
    });
}