// --- NỘI TẠI MỚI CỦA DECADE ---
    // Hàm này được nhúng trực tiếp vào Player để dễ gọi ở mọi nơi
    Player.prototype.applyDecadeMark = function(target) {
        if (this.heroType !== 'decade' || target.isDead) return;
        
        let currentStacks = target.getStatusValue('decade_mark') || 0;
        
        if (currentStacks >= 9) {//nội tại
            playSkillSound('assets/sounds/sound_skill/decade/decade_nt.ogg'); 
            target.removeStatus('decade_mark'); // Xóa ấn
            target.addStatus('stuncc', 'debuff', 'assets/icon/debuff/stuncc.png', 120, 0, 60); // (120 frames)
            target.addStatus('snowless', 'debuff', 'assets/icon/debuff/snowless.png', 320, 50, 60); // Slow 50% trong 5 frame
            target.addStatus('freeze', 'debuff', 'assets/icon/debuff/freeze.png', 320, 0, 60);


            
            // Hiệu ứng nổ và Text
            effects.push(new DamageText(target.x, target.y - 40, "DECADE STUN!", '#ff00ff'));
            effects.push(new Explosion(target.x + 15, target.y + 25, 80, '#ff00ff'));
            
            // Rung màn hình
            let canvas = document.getElementById('gameCanvas');
            canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
            setTimeout(() => canvas.style.transform = 'none', 100);
        } else {
            // Cộng dồn 1 stack, để 'inf' (vô hạn)
            target.addStatus('decade_mark', 'debuff', 'assets/icon/debuff/decade.png', 'inf', currentStacks + 1, 60);
        }
    };

    class DecadeBasicBullet extends Projectile {
        constructor(x, y, vx, owner, damage = 10) {
            super(x, y, vx, 0, 15, 10, '#ffff00', owner, damage, false);
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = '#ffff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + (this.vx > 0 ? 10 : 0), this.y + 2, 5, 6);
            ctx.restore();
        }
        applyEffect(target) {
            target.takeDamage(this.damage);
            if (this.owner && this.owner.applyDecadeMark) this.owner.applyDecadeMark(target); // Tích nội tại
            this.active = false;
            effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 20, 'rgba(255, 255, 0, 0.8)'));
        }
    }

class DecadeBlastGunSpawner extends Projectile {
        constructor(owner, index) {
            let dir = owner.facingRight ? 1 : -1;
            let x = owner.facingRight ? owner.x + owner.width + 10 + Math.random()*20 : owner.x - 50 - Math.random()*20;
            let y = owner.y - 30 + index * 18;
            super(x, y, 0, 0, 40, 15, 'rgba(0,0,0,0)', owner, 0, true);
            this.index = index;
            this.timer = 45; // 0.75s xả đạn
            this.shotsFired = 0;
            this.dir = dir;
        }
        update() {
            this.timer--;
            // Mỗi 9 frame bắn 1 viên (để ra đủ 5 viên trong 45 frame)
            if (this.timer % 9 === 0 && this.shotsFired < 5) {
                
                if (this.index === 0 && typeof playSkillSound !== 'undefined') {
                    playSkillSound('assets/sounds/sound_skill/decade/c1_shoot.ogg'); 
                }

                projectiles.push(new DecadeBasicBullet(this.x + (this.dir==1?40:0), this.y + 2, this.dir * 18, this.owner, 8));
                this.shotsFired++;
            }
            if (this.timer <= 0) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#111';
            ctx.fillRect(this.x, this.y, 40, 15);
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(this.x + (this.dir==1 ? 0 : 30), this.y, 10, 15);
            ctx.restore();
        }
    }

    class DecadeSwordSlashFX extends Projectile {
        constructor(x, y, w, h, facingRight) {
            super(x, y, 0, 0, w, h, 'transparent', null, 0, true);
            this.timer = 10;
            this.facingRight = facingRight;
        }
        update() {
            this.timer--;
            if (this.timer <= 0) this.active = false;
        }
        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 255, ${this.timer/15})`;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10; ctx.shadowColor = '#ff00ff';
            ctx.beginPath();
            if (Math.random() > 0.5) {
                ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.width, this.y + this.height);
            } else {
                ctx.moveTo(this.x + this.width, this.y); ctx.lineTo(this.x, this.y + this.height);
            }
            ctx.stroke();
            ctx.restore();
        }
    }