// ==========================================
// CHẾ ĐỘ FLAGFIGHT (CƯỚP CỜ)
// ==========================================

let flagScoreP1 = 0;
let flagScoreP2 = 0;
let flagProg = 0; // Từ 0 đến 100 (%)
let flagOwner = 0; // 0: Không ai, 1: Player 1, 2: Player 2
let flagX = 0;
let flagY = 0;

let p1DeadTimer = 0;
let p2DeadTimer = 0;

// Khởi tạo thông số khi bắt đầu trận
function initFlagFightMode() {
    flagScoreP1 = 0;
    flagScoreP2 = 0;
    flagProg = 0;
    flagOwner = 0;
    p1DeadTimer = 0;
    p2DeadTimer = 0;

    // Vị trí cờ nằm ngay giữa bục trung tâm (Theo tọa độ map gốc của bạn)
    flagX = window.innerWidth * 0.5;
    flagY = window.innerHeight * 0.45;
}

// Chạy liên tục mỗi frame trong gameLoop
function updateFlagFightMode(p1, p2, ctx) {

    if (p1.isDead) {
        if (p1DeadTimer === 0 && !p2.isDead) {
            // P1 vừa nằm xuống -> Thưởng cho P2 buff renge 20hp/s (Tồn tại trong 5 giây = 300 frames)
            p2.addStatus('renge', 'buff', 'assets/icon/buff/renge.png', 300, 20, 60); 
        }
        p1DeadTimer++;
        p1.x = -2000; // Giấu hitbox ra khỏi map để không dính đạn
        p1.y = 0;
        if (p1DeadTimer >= 180) { // 3 giây (60 frames * 3)
            p1.isDead = false;
            p1.hp = p1.maxHp;
            p1.x = window.innerWidth * 0.1; // Vị trí xuất phát gốc
            p1.y = window.innerHeight - 50 - 100;
            p1.vx = 0; p1.vy = 0;
            p1DeadTimer = 0;
            effects.push(new Explosion(p1.x + 15, p1.y + 25, 80, '#ff4d4d')); // Nổ hiệu ứng hồi sinh
        }
    }
    
    if (p2.isDead) {
        if (p2DeadTimer === 0 && !p1.isDead) {
            // P2 vừa nằm xuống -> Thưởng cho P1 buff renge 20hp/s (Tồn tại trong 5 giây = 300 frames)
            p1.addStatus('renge', 'buff', 'assets/icon/buff/renge.png', 300, 20, 60);
        }
        p2DeadTimer++;
        p2.x = window.innerWidth + 2000; // Giấu hitbox
        p2.y = 0;
        if (p2DeadTimer >= 180) {
            p2.isDead = false;
            p2.hp = p2.maxHp;
            p2.x = window.innerWidth * 0.9 - 30; // Vị trí xuất phát gốc
            p2.y = window.innerHeight - 50 - 100;
            p2.vx = 0; p2.vy = 0;
            p2DeadTimer = 0;
            effects.push(new Explosion(p2.x + 15, p2.y + 25, 80, '#4da6ff'));
        }
    }

    // -----------------------------------------
    // 2. CƠ CHẾ BUFF SHIELD (BÁM ĐUỔI)
    // -----------------------------------------
    // Cấp buff trong 2 frame liên tục. Nếu đuổi kịp điểm, vòng if này sai -> buff tự hủy ngay lập tức.
    if (flagScoreP1 < flagScoreP2 && !p1.isDead) {
        p1.addStatus('shield', 'buff', 'assets/icon/buff/shield.png', 2, 15, 60); 
    } else if (flagScoreP2 < flagScoreP1 && !p2.isDead) {
        p2.addStatus('shield', 'buff', 'assets/icon/buff/shield.png', 2, 15, 60);
    }

    // -----------------------------------------
    // 3. LÕI TÍNH ĐIỂM (CƯỚP CỜ)
    // -----------------------------------------
    // Tính khoảng cách từ tâm người chơi tới chân cột cờ
    let dist1 = Math.hypot((p1.x + p1.width/2) - flagX, (p1.y + p1.height/2) - flagY);
    let dist2 = Math.hypot((p2.x + p2.width/2) - flagX, (p2.y + p2.height/2) - flagY);

    let p1In = dist1 <= 300 && !p1.isDead;
    let p2In = dist2 <= 300 && !p2.isDead;

    if (p1In && p2In) {
        // Đang tranh chấp -> Không ai được cộng điểm
    } else if (p1In) {
        if (flagOwner === 2) {
            // Địch đang chiếm -> Tụt 1%/9fr (1/9 mỗi frame)
            flagProg -= 1/9; 
            if (flagProg <= 0) { flagProg = 0; flagOwner = 1; } // Về 0 thì bắt đầu thành cờ của mình
        } else {
            flagOwner = 1;
            flagProg += 1/9; // Mình chiếm -> +1% mỗi 9 frame
        }
    } else if (p2In) {
        if (flagOwner === 1) {
            flagProg -= 1/9;
            if (flagProg <= 0) { flagProg = 0; flagOwner = 2; }
        } else {
            flagOwner = 2;
            flagProg += 1/9;
        }
    } else {
        // Không có ai ở trong vòng
        if (flagProg > 0) {
            flagProg -= 1/60; // Tụt dần 1%/s
            if (flagProg <= 0) { flagProg = 0; flagOwner = 0; }
        }
    }

    // Xử lý khi đạt 100%
    if (flagProg >= 100) {
        if (flagOwner === 1) flagScoreP1++;
        else if (flagOwner === 2) flagScoreP2++;

        // Reset thanh năng lượng
        flagProg = 0;
        
        // Hiệu ứng ăn cờ
        let nổMàu = flagOwner === 1 ? 'rgba(255, 50, 50, 0.9)' : 'rgba(50, 150, 255, 0.9)';
        effects.push(new Explosion(flagX, flagY, 200, nổMàu));
        flagOwner = 0;

        // Rung màn hình cực mạnh
        document.getElementById('gameCanvas').style.transform = `translate(${Math.random()*30 - 15}px, ${Math.random()*30 - 15}px)`;
        setTimeout(() => document.getElementById('gameCanvas').style.transform = 'none', 300);

        // CHECK ĐIỀU KIỆN THẮNG TRẬN (3 ĐIỂM)
        if (flagScoreP1 >= 3 || flagScoreP2 >= 3) {
            gameActive = false; // Dừng game
            const gameOverUI = document.getElementById('game-over');
            gameOverUI.style.display = 'block';
            let winnerName = flagScoreP1 >= 3 ? "PLAYER 1" : "PLAYER 2";
            let winnerColor = flagScoreP1 >= 3 ? "#ff4d4d" : "#4da6ff";
            
            gameOverUI.innerHTML = `
                <div style="color: ${winnerColor}; text-shadow: 2px 2px 5px #000;">${winnerName} THẮNG ĐOẠT CỜ!</div>
                <div style="font-size: 24px; margin-top: 15px;">TỈ SỐ: <span style="color:#ff4d4d">${flagScoreP1}</span> - <span style="color:#4da6ff">${flagScoreP2}</span></div>
                <br><span style='font-size:20px; cursor:pointer; color: #aaa; border: 1px solid #aaa; padding: 5px 15px; border-radius: 5px;' onclick='exitToMenu()'>THOÁT VỀ MENU</span>
            `;
            return;
        }
    }

    // -----------------------------------------
    // 4. VẼ GIAO DIỆN CHẾ ĐỘ CHƠI LÊN CANVAS
    // -----------------------------------------
    ctx.save();
    
    // Vẽ Vùng Cờ (Bán kính 300px)
    let zoneColor = 'rgba(255, 255, 255, 0.05)';
    if (flagOwner === 1) zoneColor = `rgba(255, 50, 50, ${0.05 + (flagProg/100)*0.2})`;
    if (flagOwner === 2) zoneColor = `rgba(50, 150, 255, ${0.05 + (flagProg/100)*0.2})`;
    
    ctx.beginPath();
    ctx.arc(flagX, flagY, 300, 0, Math.PI * 2);
    ctx.fillStyle = zoneColor;
    ctx.fill();
    ctx.strokeStyle = (flagOwner === 1) ? '#ff4d4d' : (flagOwner === 2 ? '#4da6ff' : '#aaaaaa');
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 15]); // Vòng nét đứt
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ Cột Cờ
    ctx.fillStyle = '#ccc';
    ctx.fillRect(flagX - 4, flagY - 120, 8, 120);
    ctx.fillStyle = '#888';
    ctx.fillRect(flagX - 8, flagY - 5, 16, 5); // Chân đế
    
    // Vẽ Lá Cờ lấp ló
    let wave = Math.sin(Date.now() / 200) * 8;
    ctx.fillStyle = (flagOwner === 1) ? '#ff4d4d' : (flagOwner === 2 ? '#4da6ff' : '#aaaaaa');
    ctx.beginPath();
    ctx.moveTo(flagX + 4, flagY - 115);
    ctx.lineTo(flagX + 50, flagY - 100 + wave);
    ctx.lineTo(flagX + 4, flagY - 80);
    ctx.fill();

    // Vẽ Thanh Năng Lượng (% Nạp)
    let barW = 100;
    let barH = 12;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(flagX - barW/2, flagY - 145, barW, barH);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(flagX - barW/2, flagY - 145, barW, barH);

    let fillColor = (flagOwner === 1) ? '#ff4d4d' : '#4da6ff';
    if (flagOwner !== 0) {
        ctx.fillStyle = fillColor;
        ctx.shadowBlur = 10; ctx.shadowColor = fillColor;
        ctx.fillRect(flagX - barW/2, flagY - 145, barW * (flagProg/100), barH);
        ctx.shadowBlur = 0;
    }

    // Vẽ chữ số %
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(flagProg)}%`, flagX, flagY - 155);

    // Vẽ Bảng Điểm Trên Đỉnh Màn Hình
    ctx.font = 'bold 48px Arial';
    ctx.shadowBlur = 5; ctx.shadowColor = '#000';
    ctx.fillStyle = '#ff4d4d';
    ctx.fillText(`P1: ${flagScoreP1}`, window.innerWidth/2 - 150, 60);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`-`, window.innerWidth/2, 60);
    ctx.fillStyle = '#4da6ff';
    ctx.fillText(`P2: ${flagScoreP2}`, window.innerWidth/2 + 150, 60);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';

    // Vẽ UI đếm ngược hồi sinh ngay tại vị trí chết (hoặc trên màn hình)
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 4; ctx.shadowColor = '#000';
    if (p1.isDead) {
        let remain = Math.ceil((180 - p1DeadTimer)/60);
        ctx.fillStyle = '#ff4d4d';
        ctx.fillText(`Hồi sinh sau: ${remain}s`, window.innerWidth * 0.15, window.innerHeight * 0.4);
    }
    if (p2.isDead) {
        let remain = Math.ceil((180 - p2DeadTimer)/60);
        ctx.fillStyle = '#4da6ff';
        ctx.fillText(`Hồi sinh sau: ${remain}s`, window.innerWidth * 0.85, window.innerHeight * 0.4);
    }
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;

    ctx.restore();
}