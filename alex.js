class BubbleParticle {
        constructor(x, y, vx, vy) {
            this.x = x; this.y = y; this.vx = vx; this.vy = vy;
            this.size = 2 + Math.random() * 3;
            this.life = 15 + Math.random() * 15;
            this.maxLife = this.life;
            this.active = true;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.vy -= 0.05; // Nổi lên nhẹ
            this.life--;
            if(this.life <= 0) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.strokeStyle = `rgba(150, 220, 255, ${this.life/this.maxLife})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.stroke();
        }
    }

    class RainDrop {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.vy = 15 + Math.random() * 10;
            this.length = 15 + Math.random() * 10;
            this.active = true;
        }
        update() {
            this.y += this.vy;
            if (this.y > canvas.height - groundHeight) {
                this.active = false;
                effects.push(new BubbleParticle(this.x, canvas.height - groundHeight, (Math.random()-0.5)*2, -Math.random()*2 - 1));
            }
        }
        draw() {
            if(!this.active) return;
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length); ctx.stroke();
        }
    }

    class AlexBasicHitbox extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 50, 24, 'transparent', owner, 9, false);
            this.life = 10; // ~150px tầm xa
            this.hitTargets = [];
        }
        update() {
            this.x += this.vx;
            this.life--;
            if (this.life <= 0) this.active = false;
            if (Math.random() < 0.6) effects.push(new BubbleParticle(this.x + Math.random()*this.width, this.y + Math.random()*this.height, (Math.random()-0.5)*2, -Math.random()*2));
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = 'rgba(100, 220, 255, 0.7)';
            ctx.shadowBlur = 5; ctx.shadowColor = '#00ffff';
            ctx.fillRect(this.x, this.y, this.width, 4);
            ctx.fillRect(this.x + 10, this.y + 10, this.width, 4);
            ctx.fillRect(this.x, this.y + 20, this.width, 4);
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(target.x + 15, target.y + 25, 20, 'rgba(100, 200, 255, 0.6)'));
            }
        }
    }

    class AlexReturningTrident extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 40, 10, 'transparent', owner, 21, true);
            this.state = 'forward';
            this.hitTargets = [];
            this.rotation = vx > 0 ? 0 : Math.PI;
        }
        update() {
            if (this.state === 'forward') {
                this.x += this.vx;
                if (Math.random() < 0.5) effects.push(new BubbleParticle(this.x, this.y + 5, -this.vx*0.1, -Math.random()*2));
                if (this.x < -100 || this.x > canvas.width + 100) {
                    this.state = 'returning';
                    this.hitTargets = []; // Reset để trúng thêm lần nữa khi về
                }
            } else {
                let dx = (this.owner.x + this.owner.width/2) - (this.x + this.width/2);
                let dy = (this.owner.y + this.owner.height/2) - (this.y + this.height/2);
                let dist = Math.hypot(dx, dy);
                if (dist < 30) {
                    this.active = false; // Thu hồi thành công
                    let returnSounds = ['c1_return1.ogg', 'c1_return2.ogg', 'c1_return3.ogg'];
                    let randomReturn = returnSounds[Math.floor(Math.random() * returnSounds.length)];
                    playSkillSound('assets/sounds/sound_skill/alex/' + randomReturn);
                } else {
                    let speed = 25;
                    this.x += (dx/dist) * speed;
                    this.y += (dy/dist) * speed;
                    this.rotation = Math.atan2(dy, dx);
                }
                if (Math.random() < 0.5) effects.push(new BubbleParticle(this.x, this.y + 5, (Math.random()-0.5)*2, -Math.random()*2));
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#999'; ctx.fillRect(-20, -2, 40, 4); // Thân
            ctx.fillStyle = '#00ffff'; // Ngạnh
            ctx.fillRect(15, -8, 5, 16); ctx.fillRect(20, -8, 8, 3); ctx.fillRect(20, -1.5, 10, 3); ctx.fillRect(20, 5, 8, 3);
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.hitTargets.includes(target) && target !== this.owner) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(target.x + 15, target.y + 25, 30, 'rgba(0, 255, 255, 0.6)'));
                
                let hitSounds = ['c1_hit1.ogg', 'c1_hit2.ogg', 'c1_hit3.ogg'];
                let randomHit = hitSounds[Math.floor(Math.random() * hitSounds.length)];
                playSkillSound('assets/sounds/sound_skill/alex/' + randomHit);
            }
        }
    }

    // --- TRIDENT NÂNG CẤP CHIÊU 1 ---
    class AlexUpgradedTrident extends Projectile {
        constructor(x, y, owner, targetEnemy) {
            let speed = 20;
            let dx = (targetEnemy.x + targetEnemy.width/2) - x;
            let dy = (targetEnemy.y + targetEnemy.height/2) - y;
            let dist = Math.hypot(dx, dy) || 1;
            let vx = (dx / dist) * speed;
            let vy = (dy / dist) * speed;

            super(x, y, vx, vy, 40, 10, 'transparent', owner, 18, true);
            this.targetEnemy = targetEnemy;
            this.state = 'phase1'; // 'phase1', 'phase2', 'returning'
            this.hitTargets = [];
            this.rotation = Math.atan2(vy, vx);
            this.speed = speed;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (Math.random() < 0.5) {
                effects.push(new BubbleParticle(this.x + this.width/2, this.y + this.height/2, -this.vx*0.1, -this.vy*0.1));
            }

            let outOfBound = (this.x < -150 || this.x > canvas.width + 150 || this.y < -150 || this.y > canvas.height + 150);

            if (outOfBound) {
                if (this.state === 'phase1') {
                    this.state = 'phase2';
                    this.hitTargets = [];
                    let dx = (this.targetEnemy.x + this.targetEnemy.width/2) - this.x;
                    let dy = (this.targetEnemy.y + this.targetEnemy.height/2) - this.y;
                    let dist = Math.hypot(dx, dy) || 1;
                    this.vx = (dx / dist) * this.speed;
                    this.vy = (dy / dist) * this.speed;
                    this.rotation = Math.atan2(this.vy, this.vx);
                } else if (this.state === 'phase2') {
                    this.state = 'returning';
                    this.hitTargets = [];
                }
            }

            if (this.state === 'returning') {
                let dx = (this.owner.x + this.owner.width/2) - (this.x + this.width/2);
                let dy = (this.owner.y + this.owner.height/2) - (this.y + this.height/2);
                let dist = Math.hypot(dx, dy);
                if (dist < 30) {
                    this.active = false;
                    let returnSounds = ['c1_return1.ogg', 'c1_return2.ogg', 'c1_return3.ogg'];
                    let randomReturn = returnSounds[Math.floor(Math.random() * returnSounds.length)];
                    playSkillSound('assets/sounds/sound_skill/alex/' + randomReturn);
                } else {
                    let rSpeed = 25;
                    this.vx = (dx / dist) * rSpeed;
                    this.vy = (dy / dist) * rSpeed;
                    this.rotation = Math.atan2(dy, dx);
                }
            }

            // Va chạm với chủ nhân trên đường bay trước khi thu về
            let distToOwner = Math.hypot((this.owner.x + this.owner.width/2) - (this.x + this.width/2), (this.owner.y + this.owner.height/2) - (this.y + this.height/2));
            if (distToOwner < 30) {
                if (this.state !== 'returning') {
                    this.active = false;
                    // Hồi 90% thời gian hồi chiêu còn lại của Chiêu 1
                    let remaining = this.owner.cds.c1;
                    this.owner.cds.c1 = Math.max(0, Math.floor(remaining * 0.1));
                    
                    let returnSounds = ['c1_return1.ogg', 'c1_return2.ogg', 'c1_return3.ogg'];
                    let randomReturn = returnSounds[Math.floor(Math.random() * returnSounds.length)];
                    playSkillSound('assets/sounds/sound_skill/alex/' + randomReturn);
                }
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#bbb'; ctx.fillRect(-20, -2, 40, 4);
            ctx.fillStyle = '#ffaa00'; // Đinh ba nâng cấp màu cam/vàng đặc biệt
            ctx.fillRect(15, -8, 5, 16); ctx.fillRect(20, -8, 8, 3); ctx.fillRect(20, -1.5, 10, 3); ctx.fillRect(20, 5, 8, 3);
            ctx.restore();
        }
        applyEffect(target) {
            if (!this.hitTargets.includes(target) && target !== this.owner) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
                effects.push(new Explosion(target.x + 15, target.y + 25, 30, 'rgba(255, 170, 0, 0.6)'));
                
                // Mỗi lần trúng đích cộng 1 nội tại
                if (this.owner.alexPassive === undefined) this.owner.alexPassive = 0;
                if (this.owner.alexPassive < 2) {
                    this.owner.alexPassive++;
                }

                let hitSounds = ['c1_hit1.ogg', 'c1_hit2.ogg', 'c1_hit3.ogg'];
                let randomHit = hitSounds[Math.floor(Math.random() * hitSounds.length)];
                playSkillSound('assets/sounds/sound_skill/alex/' + randomHit);
            }
        }
    }

    class AlexLightningStrike {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.timer = 15; this.active = true;
        }
        update() { this.timer--; if(this.timer <= 0) this.active = false; }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10;
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.moveTo(this.x, 0);
            ctx.lineTo(this.x + (Math.random()-0.5)*20, this.y/2);
            ctx.lineTo(this.x, this.y); ctx.stroke();
            ctx.lineWidth = 4; ctx.strokeStyle = '#00ffff'; ctx.stroke();
            ctx.restore();
        }
    }

    class AlexFireZone extends Projectile {
        constructor(x, y, owner) {
            super(x, y, 0, 0, 250, 250, 'transparent', owner, 1, true); // 1 dame mỗi tick
            this.timer = 300; // 5s
            this.hitCooldowns = new Map();
        }
        update() {
            this.timer--;
            if (this.timer <= 0) this.active = false;
            for (let [target, cd] of this.hitCooldowns) {
                if (cd > 0) this.hitCooldowns.set(target, cd - 1);
            }
            if (Math.random() < 0.4) { // Lửa Minecraft pixel
                effects.push(new RockParticle(this.x + Math.random()*250, this.y + 250, 0, -1 - Math.random()*3, Math.random()>0.5 ? '#ffaa00' : '#ff3300'));
                effects.push(new RockParticle(this.x + Math.random()*250, this.y + 250, 0, -2 - Math.random()*2, '#555555')); // Khói
            }
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.timer / 30) * 0.4;
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(this.x, this.y + 200, 250, 50); // Nền lửa
            ctx.restore();
        }
        applyEffect(target) {
            if (target === this.owner) return;
            let cd = this.hitCooldowns.get(target) || 0;
            if (cd <= 0) {
                target.takeDamage(this.damage);
                this.hitCooldowns.set(target, 6); // 0.1s dính 1 dame
            }
        }
    }

    class EnderParticle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = (Math.random() - 0.5) * 5 - 1;
            this.life = 20 + Math.random() * 10;
            this.maxLife = this.life;
            this.active = true;
            this.color = Math.random() > 0.5 ? '#aa00ff' : '#ff00ff';
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            this.vx *= 0.9; this.vy *= 0.9;
            this.life--;
            if(this.life <= 0) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.fillRect(this.x, this.y, 4, 4);
            ctx.restore();
        }
    }

    class AlexEnderSlash {
        constructor(x, y, dir) {
            this.x = x; this.y = y; this.dir = dir;
            this.timer = 15; this.active = true;
        }
        update() { this.timer--; if(this.timer <= 0) this.active = false; }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.dir, 1);
            ctx.strokeStyle = '#aa00ff';
            ctx.lineWidth = 15 * (this.timer / 15);
            ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff';
            ctx.beginPath();
            ctx.arc(0, 0, 50, -Math.PI/2, Math.PI/2);
            ctx.stroke();
            ctx.restore();
        }
    }

    class AlexEnderTrident extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 40, 10, 'transparent', owner, 20, false);
        }
        update() {
            this.x += this.vx;
            if (Math.random() < 0.6) effects.push(new EnderParticle(this.x + 20, this.y + 5));
            if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = '#999'; ctx.fillRect(this.x, this.y+3, 40, 4);
            ctx.fillStyle = '#00ffff'; ctx.fillRect(this.vx > 0 ? this.x+35 : this.x, this.y-2, 5, 14);
            
            let pearlX = this.vx > 0 ? this.x+42 : this.x-2;
            ctx.fillStyle = '#220033';
            ctx.beginPath(); ctx.arc(pearlX, this.y+5, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#aa00ff';
            ctx.beginPath(); ctx.arc(pearlX, this.y+5, 4, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
        applyEffect(target) {
            if (target === this.owner) return;
            this.active = false;
            
            playSkillSound('assets/sounds/sound_skill/alex/c2_hit.ogg');
            
            for(let i=0; i<15; i++) effects.push(new EnderParticle(this.owner.x + this.owner.width/2, this.owner.y + this.owner.height/2));
            let dir = this.vx > 0 ? -1 : 1; 
            this.owner.x = target.x + (dir * 25);
            this.owner.y = target.y;
            
            for(let i=0; i<15; i++) effects.push(new EnderParticle(this.owner.x + this.owner.width/2, this.owner.y + this.owner.height/2));
            
            target.takeDamage(this.damage);
            target.stunTimer = 30; 
            
            this.owner.addStatus('strength', 'buff', 'assets/icon/buff/strength.png', 150, 3, 60);

            // Chiêu 2 trúng địch cộng 1 nội tại
            if (this.owner.alexPassive === undefined) this.owner.alexPassive = 0;
            if (this.owner.alexPassive < 2) {
                this.owner.alexPassive++;
            }
            
            effects.push(new AlexEnderSlash(target.x + 15, target.y + 25, this.vx > 0 ? 1 : -1));
        }
    }

    class AlexC3Trident extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 40, 10, 'transparent', owner, 40, false);
        }
        update() {
            this.x += this.vx;
            if (Math.random() < 0.6) effects.push(new Explosion(this.x + 20, this.y + 5, 8, 'rgba(0, 255, 255, 0.8)'));
            if (this.x < -100 || this.x > canvas.width + 100) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
            ctx.fillRect(this.x, this.y+3, 40, 4);
            ctx.fillRect(this.vx > 0 ? this.x+35 : this.x, this.y-2, 5, 14);
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            
            playSkillSound('assets/sounds/sound_skill/alex/c3_hit.ogg');
            
            target.addStatus('silence', 'debuff', 'assets/icon/debuff/silence.png', 150, 0, 60);

            // Chiêu cuối trúng đích lập tức hồi Chiêu 1
            if (this.owner) {
                this.owner.cds.c1 = 0;
            }

            this.active = false;
            effects.push(new AlexLightningStrike(target.x + 15, target.y + 25));
            projectiles.push(new AlexFireZone(target.x + 15 - 125, target.y + 25 - 250, this.owner));
            canvas.style.transform = `translate(${Math.random()*15 - 7.5}px, ${Math.random()*15 - 7.5}px)`;
            setTimeout(() => canvas.style.transform = 'none', 100);
        }
    }