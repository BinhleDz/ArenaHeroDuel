// --- NỘI DUNG FILE: mode_0scd.js ---

let mode0sTimer = 0; // Bộ đếm thời gian đếm ngược 5 giây

// Hàm này gọi 1 lần khi bấm nút "VÀO TRẬN"
function init0sCDMode() {
    mode0sTimer = 0; // Gọi buff ngay lập tức khi vừa vào game
}

// Hàm này gọi liên tục 60 lần/giây (60 FPS) trong gameLoop
function update0sCDMode(p1, p2) {
    if (!gameActive || isPaused) return;

    // 1. ÉP TOÀN BỘ HỒI CHIÊU XUỐNG TỐI ĐA 10 FRAMES
    let skillKeys = ['basic', 'c1', 'c2', 'c3', 'dash'];
    [p1, p2].forEach(player => {
        if (!player.isDead) {
            skillKeys.forEach(key => {
                // Nếu chiêu vừa được xài (thời gian hồi > 10), lập tức ép xuống 10
                if (player.cds[key] > 10) {
                    player.cds[key] = 10;
                }
            });
        }
    });

    // 2. LOGIC BUFF ĐỊNH KỲ (MỖI 5 GIÂY = 300 FRAMES)
    if (mode0sTimer <= 0) {
        [p1, p2].forEach(player => {
            if (!player.isDead) {
                // Thêm Giáp ảo (bhshield) 50 máu, tồn tại trong 5s (300 frames)
                player.addStatus('bhshield', 'buff', 'assets/icon/buff/mode/bhshield.png', 300, 50, 60);
                
                // Thêm Miễn khống (ironbody), tồn tại trong 0.5s (30 frames)
                player.addStatus('ironbody', 'buff', 'assets/icon/buff/ironbody.png', 30, 0, 60);
            }
        });
        
        mode0sTimer = 300; // Reset lại bộ đếm 5 giây
    }
    
    // Đếm ngược thời gian
    mode0sTimer--;
}