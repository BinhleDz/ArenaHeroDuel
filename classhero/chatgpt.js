class ChatGPTShot extends Projectile {
    constructor(x, y, vx, vy, owner, isBurst = false) {
        // Sát thương tăng theo stack: gốc 5 + (stack * 0.5)
        let dmg = (5 + (owner.dataStacks * 0.5)) * (isBurst ? 0.7 : 1);
        super(x, y, vx, vy, 12, 6, '#007bff', owner, dmg, false);
        this.isBurst = isBurst;
    }
    update() {
        super.update();
        // Hiệu ứng tracking nhẹ khi Ulti
        if (this.owner.isOverriding) {
            let enemy = this.owner === player1 ? player2 : player1;
            let dy = (enemy.y + 25) - this.y;
            this.vy += dy * 0.02;
        }
        
        // Kiểm tra trúng mục tiêu để tăng Stack
        let enemy = this.owner === player1 ? player2 : player1;
        if (checkCollision(this, enemy)) {
            if (this.owner.dataStacks < 20) this.owner.dataStacks++;
            this.active = false;
            enemy.takeDamage(this.damage);
            effects.push(new Explosion(this.x, this.y, 30, '#007bff'));
        }
    }
    draw() {
        ctx.fillStyle = this.owner.isOverriding ? '#ff00ff' : '#007bff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Hiệu ứng hạt nhỏ bay sau đạn
        if (Math.random() > 0.5) {
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - 5, this.y + Math.random()*5, 2, 2);
        }
    }
}

