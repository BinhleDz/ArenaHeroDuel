    class KidCard extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 15, 8, '#ffffff', owner, 7, false);
            this.trail = [];
        }
        update() {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 5) this.trail.shift();
            super.update();
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for(let t of this.trail) ctx.fillRect(t.x, t.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5; ctx.shadowColor = '#fff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
        
        applyEffect(target) {
            playSkillSound('assets/sounds/sound_skill/kid/basic_hit.ogg');
            super.applyEffect(target);
        }
    }

    class KidDove extends Projectile {
        constructor(x, y, vx, owner) {
            // preserve = true để bay xuyên qua nhiều mục tiêu
            super(x, y, vx, 0, 25, 15, '#ffffff', owner, 22, true);
            this.hitTargets = [];
            this.flap = 0;
        }
        update() {
            super.update();
            this.flap += 0.3; // Tốc độ đập cánh
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
            // Thân chim bồ câu
            ctx.beginPath(); ctx.ellipse(this.x+12, this.y+7, 12, 6, 0, 0, Math.PI*2); ctx.fill();
            // Cánh chim đập lên xuống
            let wingY = Math.sin(this.flap) * 12;
            ctx.beginPath(); 
            ctx.moveTo(this.x+12, this.y+7); 
            ctx.lineTo(this.x+4, this.y+7-wingY); 
            ctx.lineTo(this.x+18, this.y+7-wingY); 
            ctx.fill();
            ctx.restore();
        }
        applyEffect(target) {
            if(!this.hitTargets.includes(target)) {
                playSkillSound('assets/sounds/sound_skill/kid/c1_hit.ogg'); 
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
            }
        }
    }

    class KidColorCard extends Projectile {
        constructor(x, y, vx, owner, color, damage) {
            super(x, y, vx, 0, 30, 16, color, owner, damage, false);
            this.trail = [];
        }
        update() {
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 8) this.trail.shift();
            
            // Thêm hiệu ứng bong bóng nổ liti bay theo đuôi cho bài đỏ
            if (this.color === '#ff0000' && Math.random() < 0.5) {
                effects.push(new Explosion(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 4 + Math.random()*3, 'rgba(255, 0, 0, 0.6)'));
            }
            super.update();
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            
            // Đuôi bài (Màu tệp với màu bài)
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.color;
            for(let t of this.trail) ctx.fillRect(t.x, t.y, this.width, this.height);
            ctx.globalAlpha = 1.0;
            
            // Xử lý hiệu ứng phát sáng tùy theo màu
            if (this.color === '#ff0000') {
                // Bài đỏ: Phát sáng mạnh, to
                ctx.shadowBlur = 25; 
                ctx.shadowColor = '#ff0000';
            } else if (this.color === '#32cd32') {
                // Bài xanh lá: Phát sáng nhẹ
                ctx.shadowBlur = 10; 
                ctx.shadowColor = '#32cd32';
            } else {
                // Bài xanh dương: Mặc định
                ctx.shadowBlur = 5; 
                ctx.shadowColor = '#00bfff';
            }

            // Vẽ lá bài
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Thêm lõi trắng cho bài đỏ và xanh lá để tạo cảm giác sáng chói hơn
            if (this.color === '#ff0000' || this.color === '#32cd32') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            }

            ctx.restore();
        }

        applyEffect(target) {
            playSkillSound('assets/sounds/sound_skill/kid/c2_hit.ogg'); // <-- THÊM ÂM THANH HIT C2
            super.applyEffect(target);
        }
        
    }