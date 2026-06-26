// ==========================================
// CHẾ ĐỘ COMBO (id: combo)
// ==========================================

// Lưu trữ hàm executeSkill gốc của Player lại để dùng
const originalExecuteSkill = Player.prototype.executeSkill;

// Ghi đè hàm executeSkill của class Player
Player.prototype.executeSkill = function(skillKey, isComboCast = false) {
    
    // Nếu KHÔNG PHẢI mode combo, HOẶC chiêu này đang là chiêu phụ (bắn ra từ combo)
    // -> Bỏ qua logic tính toán, chỉ chạy chiêu bình thường để tránh lặp vô hạn
    if (currentMode !== 'combo' || isComboCast) {
        originalExecuteSkill.call(this, skillKey);
        return;
    }

    let rand = Math.floor(Math.random() * 100) + 1; 
    let comboCount = 1;

    if (rand <= 25) comboCount = 1;              // 25%
    else if (rand <= 45) comboCount = 2;         // 20%
    else if (rand <= 60) comboCount = 3;         // 15%
    else if (rand <= 70) comboCount = 4;         // 10%
    else if (rand <= 79) comboCount = 5;         // 9%
    else if (rand <= 87) comboCount = 6;         // 8%
    else if (rand <= 94) comboCount = 7;         // 7%
    else if (rand <= 97) comboCount = 8;         // 3%
    else if (rand <= 99) comboCount = 9;         // 2%
    else comboCount = 10;                        // 1%

    if (comboCount > 1) {
        let color = comboCount >= 8 ? '#ff0000' : (comboCount >= 5 ? '#ff00ff' : '#ffff00');
        effects.push(new DamageText(this.x, this.y - 40, "x" + comboCount + " COMBO", color));
    }
    let originX = this.x;
    let originY = this.y;
    let originFacing = this.facingRight;

    originalExecuteSkill.call(this, skillKey);

    for (let i = 1; i < comboCount; i++) {
        this.actionQueue.push({
            delay: i * 6, 
            action: () => {
                let tempX = this.x;
                let tempY = this.y;
                let tempFacing = this.facingRight;

                this.x = originX;
                this.y = originY;
                this.facingRight = originFacing;

                originalExecuteSkill.call(this, skillKey, true);

                this.x = tempX;
                this.y = tempY;
                this.facingRight = tempFacing;
            }
        });
    }
};