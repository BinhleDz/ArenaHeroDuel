    class TanjiroWaterSlash extends Projectile {
        constructor(x, y, vx, owner) {
            super(x, y, vx, 0, 40, 15, '#00bfff', owner, 11, false); // Sát thương 11, không bảo toàn
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
            ctx.fillStyle = 'rgba(0, 191, 255, 0.4)';
            for(let t of this.trail) {
                ctx.beginPath(); ctx.ellipse(t.x + 20, t.y + 7.5, 20, 7.5, 0, 0, Math.PI*2); ctx.fill();
            }
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.ellipse(this.x + 20, this.y + 7.5, 20, 7.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffffff'; // Vệt bọt nước trắng ở giữa
            ctx.beginPath(); ctx.ellipse(this.x + (this.vx > 0 ? 25 : 15), this.y + 7.5, 12, 3, 0, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
    }

    class TanjiroWaterWheel extends Projectile {
        constructor(x, y, owner) {
            super(x - 50, y - 50, 0, 0, 100, 100, 'transparent', owner, 17, true); // Sát thương 17, có bảo toàn
            this.timer = 20; 
            this.hitTargets = [];
            this.rotation = 0;
        }
        update() {
            // Bám sát theo người Tanjiro
            this.x = this.owner.x + this.owner.width/2 - this.width/2;
            this.y = this.owner.y + this.owner.height/2 - this.height/2;
            this.timer--;
            this.rotation += 0.5;
            if(this.timer <= 0) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.owner.facingRight ? this.rotation : -this.rotation);
            ctx.strokeStyle = '#00bfff'; ctx.lineWidth = 15;
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI*2); ctx.stroke();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; // Dòng bọt nước trắng chém
            ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI); ctx.stroke();
            ctx.restore();
        }
        applyEffect(target) {
            if(!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
            }
        }
    }

    class TanjiroFlowingDance extends Projectile {
        constructor(startX, startY, endX, endY, owner) {
            let left = Math.min(startX, endX);
            let top = Math.min(startY, endY) - 120; // Chiều cao 120px theo yêu cầu
            let width = Math.abs(endX - startX) + 50;
            super(left, top, 0, 0, width, 150, 'transparent', owner, 20, true); // Sát thương 20, có bảo toàn
            this.startX = startX; this.startY = startY;
            this.endX = endX; this.endY = endY;
            this.timer = 30; 
            this.hitTargets = [];
        }
        update() {
            this.timer--;
            if(this.timer <= 0) this.active = false;
        }
        draw() {
            if(!this.active) return;
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.timer / 15);
            ctx.strokeStyle = '#00bfff'; ctx.lineWidth = 20; ctx.lineCap = 'round';
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            
            // Vẽ vệt chém uốn lượn mượt mà
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            let midX = (this.startX + this.endX) / 2;
            let midY = Math.min(this.startY, this.endY) - 120;
            ctx.quadraticCurveTo(midX, midY, this.endX, this.endY);
            ctx.stroke();

            // Lõi kiếm nước trắng
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.stroke();
            ctx.restore();
        }
        applyEffect(target) {
            if(!this.hitTargets.includes(target)) {
                target.takeDamage(this.damage);
                this.hitTargets.push(target);
            }
        }
    }
