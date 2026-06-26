// Quản lý nhạc nền riêng cho TrumpDog (Chiêu 2)
let activeTrumpDogsCount = 0;
let trumpDogMusicAudio = new Audio('assets/sounds/sound_skill/trump/c2_music.ogg');
trumpDogMusicAudio.loop = true;

class TrumpBullet extends Projectile {
    constructor(x, y, vx, owner) {
        super(x, y, vx, 0, 12, 5, '#ffcc00', owner, 15, false);
        playSkillSound('assets/sounds/sound_skill/trump/basic_cast.ogg'); // Phát âm khi bắn
    }

    applyEffect(target) {
        playSkillSound('assets/sounds/sound_skill/trump/basic_shoot.ogg'); // Phát âm khi trúng địch
        super.applyEffect(target);
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5; ctx.shadowColor = '#ff6600';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class TrumpPlane extends Projectile {
    constructor(y, facingRight, owner) {
        let startX = facingRight ? -200 : canvas.width + 200;
        let vx = facingRight ? 10 : -10;
        super(startX, y, vx, 0, 150, 40, 'rgba(0,0,0,0)', owner, 0, true);
        this.facingRight = facingRight;
        this.bombsDropped = 0;
        this.timer = 0;
        
        playSkillSound('assets/sounds/sound_skill/trump/c1_plane.ogg'); // Âm thanh máy bay
    }
    update() {
        this.x += this.vx;
        this.timer++;
        // Thả 10 quả bom đều đặn
        if (this.timer % 12 === 0 && this.bombsDropped < 10) {
            projectiles.push(new TrumpBomb(this.x + 75, this.y + 20, this.owner));
            this.bombsDropped++;
        }
        if (this.x > canvas.width + 300 || this.x < -300) this.active = false;
        
        // Rung nhẹ màn hình khi máy bay bay qua
        if (this.timer % 5 === 0) {
            canvas.style.transform = `translate(0px, ${Math.random()*4 - 2}px)`;
            setTimeout(() => canvas.style.transform = 'none', 30);
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#4b5320'; // Xanh lính
        ctx.beginPath();
        if (this.facingRight) {
            ctx.ellipse(this.x + 75, this.y + 20, 75, 15, 0, 0, Math.PI*2);
            ctx.fillRect(this.x + 10, this.y, 40, 10); // Đuôi
        } else {
            ctx.ellipse(this.x + 75, this.y + 20, 75, 15, 0, 0, Math.PI*2);
            ctx.fillRect(this.x + 100, this.y, 40, 10); // Đuôi
        }
        ctx.fill();
        ctx.fillStyle = '#222'; ctx.fillRect(this.facingRight ? this.x + 120 : this.x + 20, this.y + 10, 20, 10); // Buồng lái
        ctx.restore();
    }
}

class TrumpBomb extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 6, 10, 30, '#333', owner, 25, true); // Có bảo toàn
        this.exploded = false;
    }
    update() {
        if (this.exploded) return;
        this.y += this.vy;
        if (this.y >= canvas.height - groundHeight - this.height) {
            this.explode();
        }
    }
    explode() {
        this.exploded = true;
        this.active = false;
        
        playSkillSound('assets/sounds/sound_skill/trump/c1_hit.ogg'); // Âm bom nổ

        effects.push(new Explosion(this.x + 5, this.y + 30, 170, 'rgba(255, 100, 0, 0.8)'));
        let enemy = this.owner === player1 ? player2 : player1;
        if (Math.hypot(enemy.x + enemy.width/2 - this.x, enemy.y + enemy.height/2 - this.y) <= 170) {
            enemy.takeDamage(this.damage);
        }
        canvas.style.transform = `translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
        setTimeout(() => canvas.style.transform = 'none', 50);
    }
    applyEffect(target) {
        this.explode();
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.beginPath(); // Mũi bom nhọn
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width/2, this.y + this.height + 10);
        ctx.fill();
        // Lửa đuôi
        ctx.fillStyle = (Math.random() > 0.5) ? 'orange' : 'red';
        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y);
        ctx.lineTo(this.x + 8, this.y);
        ctx.lineTo(this.x + 5, this.y - 15 - Math.random() * 5);
        ctx.fill();
        ctx.restore();
    }
}

class TrumpDog extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 0, 35, 25, '#ffd700', owner, 10, true);
        this.hp = 35;
        this.maxHp = 35;
        this.biteCooldown = 0;
        this.markedDead = false;
        
        // Quản lý Random Âm thanh Dog
        this.randomSoundTimer = this.getRandomTime();

        // Quản lý Nhạc nền TrumpDog
        activeTrumpDogsCount++;
        if (activeTrumpDogsCount === 1) {
            if (typeof appSettings !== 'undefined' && appSettings.sfxOn) {
                trumpDogMusicAudio.volume = appSettings.sfxVol / 100;
                trumpDogMusicAudio.currentTime = 0;
                trumpDogMusicAudio.play().catch(e => {});
            }
        }
    }

    getRandomTime() {
        // 5 đến 10 giây (300 đến 600 frames)
        return 300 + Math.floor(Math.random() * 300);
    }
    
    markDead() {
        if (this.markedDead) return;
        this.markedDead = true;
        this.active = false;
        
        activeTrumpDogsCount--;
        if (activeTrumpDogsCount <= 0) {
            activeTrumpDogsCount = 0;
            trumpDogMusicAudio.pause();
        }
    }

    takeDamage(amt) {
        this.hp -= amt;
        effects.push(new DamageText(this.x + this.width/2, this.y - 10, `-${Math.floor(amt)}`, '#ff0000'));
        if (this.hp <= 0) {
            this.markDead();
            effects.push(new Explosion(this.x + this.width/2, this.y + this.height/2, 20, 'rgba(255, 215, 0, 0.5)'));
        }
    }

    applyEffect(target) {
    }

    update() {
        // Dọn dẹp nếu trận đấu kết thúc hoặc thoát ra Menu
        if (typeof gameActive !== 'undefined' && !gameActive) {
            this.markDead();
            return;
        }

        // Logic phát âm thanh random
        this.randomSoundTimer--;
        if (this.randomSoundTimer <= 0) {
            playSkillSound('assets/sounds/sound_skill/trump/c2_random.ogg');
            this.randomSoundTimer = this.getRandomTime();
        }

        this.vy += gravity;
        let enemy = this.owner === player1 ? player2 : player1;
        let dx = enemy.x + enemy.width/2 - (this.x + this.width/2);
        
        if (Math.abs(dx) > 15) {
            this.vx = Math.sign(dx) * 6.5; 
            this.facingRight = this.vx > 0;
        } else {
            this.vx = 0;
        }
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.y >= canvas.height - groundHeight - this.height) {
            this.y = canvas.height - groundHeight - this.height;
            this.vy = 0;
        }

        // Nhận sát thương từ đạn của địch
        for (let p of projectiles) {
            if (p.owner !== this.owner && p.active && p !== this && checkCollision(this, p)) {
                this.takeDamage(p.damage);
                if (!p.preserve) p.active = false;
            }
        }

        if (this.biteCooldown > 0) this.biteCooldown--;

        if (checkCollision(this, enemy) && this.biteCooldown <= 0 && !enemy.isDead) {
            enemy.takeDamage(this.damage);
            this.biteCooldown = 45; // Cắn mỗi 0.75s
        }
    }
    
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 5, this.y + 5, 25, 3);
        ctx.fillRect(this.x + 5, this.y + 11, 25, 3);
        ctx.fillRect(this.x + 5, this.y + 17, 25, 3);

        // Đầu chó
        ctx.fillStyle = this.color;
        let headX = this.facingRight ? this.x + this.width : this.x - 15;
        ctx.fillRect(headX, this.y - 5, 15, 15);
        ctx.fillStyle = 'black'; 
        ctx.fillRect(this.facingRight ? headX + 10 : headX + 2, this.y, 3, 3);
        
        // Thanh máu của chó
        ctx.fillStyle = 'red'; ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = 'green'; ctx.fillRect(this.x, this.y - 8, this.width * (this.hp/this.maxHp), 4);
        ctx.restore();
    }
}

class TrumpCrosshair extends Projectile {
    constructor(target, owner, isSecond = false) {
        super(target.x, target.y, 0, 0, 1, 1, 'transparent', owner, 0, true);
        this.target = target;
        this.timer = 90; // 1.5 giây
        this.targetX = target.x + target.width/2;
        this.isSecond = isSecond;
    }
    
    update() {
        this.timer--;
        if (this.timer > 30) {
            this.targetX = this.target.x + this.target.width/2; 
        }
        
        if (this.timer <= 0) {
            this.active = false;
            projectiles.push(new TrumpNuke(this.targetX - 25, -200, this.owner));
            if (!this.isSecond) {
                // Gọi lần 2
                projectiles.push(new TrumpCrosshair(this.target, this.owner, true));
            }
        }
    }

    applyEffect(target) {
    }

    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.strokeStyle = (this.timer % 10 < 5) ? 'red' : 'rgba(255,0,0,0.3)'; 
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.targetX, canvas.height - groundHeight, 30, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.targetX - 40, canvas.height - groundHeight); ctx.lineTo(this.targetX + 40, canvas.height - groundHeight);
        ctx.moveTo(this.targetX, canvas.height - groundHeight - 40); ctx.lineTo(this.targetX, canvas.height - groundHeight + 40);
        ctx.stroke();
        ctx.restore();
    }
}

class TrumpNuke extends Projectile {
    constructor(x, y, owner) {
        super(x, y, 0, 20, 50, 120, '#555', owner, 85, true); 
        this.exploded = false;
        
        playSkillSound('assets/sounds/sound_skill/trump/c3_bomb.ogg'); // Âm thanh Nuke rơi
    }
    update() {
        if (this.exploded) return;
        this.y += this.vy;
        if (this.y >= canvas.height - groundHeight - this.height) {
            this.explode();
        }
    }
    explode() {
        this.exploded = true;
        this.active = false;
        
        // Random 3 âm thanh nổ
        let hitSounds = ['c3_hit_1.ogg', 'c3_hit_2.ogg', 'c3_hit_3.ogg'];
        let randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)];
        playSkillSound('assets/sounds/sound_skill/trump/' + randomSound);

        let cx = this.x + this.width/2;
        let cy = this.y + this.height;

        // Đám mây hình nấm 🍄
        effects.push(new Explosion(cx, cy, 300, 'rgba(255, 69, 0, 0.9)')); // Gốc lửa
        effects.push(new Explosion(cx, cy - 100, 200, 'rgba(100, 100, 100, 0.8)')); // Thân khói
        effects.push(new Explosion(cx, cy - 250, 250, 'rgba(80, 80, 80, 0.9)')); // Tán nấm
        effects.push(new Explosion(cx - 150, cy - 200, 150, 'rgba(120, 120, 120, 0.8)')); // Tán trái
        effects.push(new Explosion(cx + 150, cy - 200, 150, 'rgba(120, 120, 120, 0.8)')); // Tán phải
        
        canvas.style.transform = `translate(${Math.random()*40 - 20}px, ${Math.random()*40 - 20}px)`;
        setTimeout(() => canvas.style.transform = 'none', 300);

        let enemy = this.owner === player1 ? player2 : player1;
        if (Math.hypot(enemy.x + enemy.width/2 - cx, enemy.y + enemy.height/2 - cy) <= 300) {
            enemy.takeDamage(this.damage);
            enemy.vx = (enemy.x > cx) ? 20 : -20;
            enemy.vy = -15;
        }
    }
    applyEffect(target) {
        this.explode();
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = '#555'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#111'; ctx.fillRect(this.x - 10, this.y, 70, 20); // Đuôi nuke
        ctx.beginPath(); // Mũi nuke bầu tròn
        ctx.arc(this.x + this.width/2, this.y + this.height, this.width/2, 0, Math.PI);
        ctx.fill();
        // Ký hiệu hạt nhân vàng xám
        ctx.fillStyle = 'yellow';
        ctx.beginPath(); ctx.arc(this.x + this.width/2, this.y + this.height/2, 12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(this.x + this.width/2, this.y + this.height/2, 4, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}