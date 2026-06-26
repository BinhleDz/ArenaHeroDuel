// Khởi tạo các giá trị cài đặt mặc định từ localStorage
let heroSettings = JSON.parse(localStorage.getItem('heroSettings')) || {};
if (heroSettings.leviDash === undefined) heroSettings.leviDash = false;
if (heroSettings.c3ZeroOneEffect === undefined) heroSettings.c3ZeroOneEffect = false;

// Đồng bộ hóa trạng thái checkbox và tự động chèn giao diện cài đặt mới khi tải trang xong
window.addEventListener('DOMContentLoaded', () => {
    // Tự động chèn giao diện cho cài đặt hiệu ứng C3 của Zero-One
    const container = document.querySelector('#hero-settings-screen .settings-container');
    if (container && !document.getElementById('setting-c3-zero-one')) {
        // Tạo dải phân cách
        const hr = document.createElement('hr');
        hr.style.borderColor = '#444';
        hr.style.margin = '20px 0';
        
        // Tạo dòng cài đặt
        const row = document.createElement('div');
        row.className = 'setting-row';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.marginBottom = '15px';
        row.style.paddingBottom = '15px';
        row.style.borderBottom = '1px solid #444';
        
        row.innerHTML = `
            <span style="font-size: 16px; font-weight: bold; color: #fff;">⚡ Hiệu ứng C3 Kamen Rider Zero-One</span>
            <label class="switch">
                <input type="checkbox" id="setting-c3-zero-one">
                <span class="slider-switch"></span>
            </label>
        `;
        
        // Tạo mô tả chi tiết
        const desc = document.createElement('p');
        desc.style.fontSize = '13px';
        desc.style.color = '#aaa';
        desc.style.margin = '0';
        desc.style.lineHeight = '1.4';
        desc.innerHTML = `* Khi kích hoạt, việc sử dụng Chiêu 3 (Rider Kick) sẽ dừng trò chơi trong 1 giây để khởi chạy hiệu ứng cắt cảnh (Cut-in) phong cách đặc biệt và tạo hoạt ảnh nổ "Rising Impact" 3D cực kỳ hoành tráng khi trúng mục tiêu.`;
        
        container.appendChild(hr);
        container.appendChild(row);
        container.appendChild(desc);
        
        // Liên kết sự kiện thay đổi trạng thái
        const checkboxC3 = document.getElementById('setting-c3-zero-one');
        if (checkboxC3) {
            checkboxC3.checked = !!heroSettings.c3ZeroOneEffect;
            checkboxC3.onchange = (e) => {
                toggleHeroSetting('c3ZeroOneEffect', e.target.checked); // Đã lưu trữ chính xác trạng thái
            };
        }
    }

    const checkboxLevi = document.getElementById('setting-levi-dash');
    if (checkboxLevi) {
        checkboxLevi.checked = !!heroSettings.leviDash;
    }
});

/**
 * Mở màn hình cài đặt cơ chế từ thư viện tướng
 */
function openHeroSettings() {
    const libraryScreen = document.getElementById('hero-library-screen');
    const settingsScreen = document.getElementById('hero-settings-screen');
    
    if (libraryScreen && settingsScreen) {
        libraryScreen.style.display = 'none';
        settingsScreen.style.display = 'flex';
    }
}

/**
 * Đóng màn hình cài đặt cơ chế, quay lại thư viện tướng
 */
function closeHeroSettings() {
    const libraryScreen = document.getElementById('hero-library-screen');
    const settingsScreen = document.getElementById('hero-settings-screen');
    
    if (libraryScreen && settingsScreen) {
        settingsScreen.style.display = 'none';
        libraryScreen.style.display = 'flex';
    }
}

/**
 * Thay đổi trạng thái và lưu cài đặt vào localStorage
 */
function toggleHeroSetting(key, val) {
    heroSettings[key] = val;
    localStorage.setItem('heroSettings', JSON.stringify(heroSettings));
}

// Can thiệp vào phương thức vẽ gốc của lớp Player để tích hợp chức năng hiển thị điểm bám dây dự kiến
if (typeof Player !== 'undefined' && Player.prototype) {
    const originalPlayerDraw = Player.prototype.draw;

    Player.prototype.draw = function() {
        // Gọi lại hàm vẽ gốc của nhân vật
        originalPlayerDraw.apply(this, arguments);

        // Chỉ hiển thị điểm bám khi trận đấu đang diễn ra và cài đặt bám dây đang bật
        if (typeof gameActive !== 'undefined' && gameActive && heroSettings.leviDash) {
            // Chỉ áp dụng cho Levi hoặc Eren ở dạng người (không áp dụng khi Eren hóa Titan)
            if (this.heroType === 'levi' || (this.heroType === 'eren' && !this.isTitanForm)) {
                // Chỉ hiển thị khi nhân vật đang không trong trạng thái đu dây hoặc bay chiêu 1
                if (!this.isLeviDashing && !this.isLeviS1 && !this.isLeviS3Dashing) {
                    let closest = null;
                    let minDist = Infinity;
                    const allStructures = [];

                    // Tập hợp tất cả các bục đứng (platforms) và tường chặn (walls)
                    if (typeof platforms !== 'undefined' && Array.isArray(platforms)) {
                        allStructures.push(...platforms);
                    }
                    if (typeof walls !== 'undefined' && Array.isArray(walls)) {
                        allStructures.push(...walls);
                    }

                    const curCanvas = document.getElementById('gameCanvas');
                    const gHeight = typeof groundHeight !== 'undefined' ? groundHeight : 50;

                    // Tính toán tìm cấu trúc bám dây gần nhất giống như logic đu dây thực tế
                    allStructures.forEach(struct => {
                        let px = Math.max(struct.x, Math.min(this.x + 15, struct.x + struct.w));
                        let py = Math.max(struct.y, Math.min(this.y + 25, struct.y + struct.h));
                        let d = Math.hypot(px - (this.x + 15), py - (this.y + 25));

                        // Không cho phép bám vào vùng sát đất
                        if (curCanvas && d < minDist && py < curCanvas.height - gHeight - 10) {
                            minDist = d;
                            closest = { x: px, y: py };
                        }
                    });

                    // Nếu phát hiện điểm bám hợp lệ, tiến hành vẽ đường chỉ hướng và điểm mục tiêu
                    if (closest && curCanvas) {
                        const ctx = curCanvas.getContext('2d');
                        ctx.save();

                        // Thiết lập màu sắc dựa theo màu của Player (Đỏ cho P1, Xanh lam cho P2)
                        const isPlayer1 = (this.color === '#ff4d4d');
                        const themeColor = isPlayer1 ? 'rgba(255, 77, 77, 0.4)' : 'rgba(77, 166, 255, 0.4)';
                        const solidColor = isPlayer1 ? '#ff4d4d' : '#4da6ff';

                        // 1. Vẽ đường nét đứt mờ nối từ tâm nhân vật tới điểm bám
                        ctx.strokeStyle = themeColor;
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([4, 4]); // Tạo hiệu ứng nét đứt
                        ctx.beginPath();
                        ctx.moveTo(this.x + 15, this.y + 25);
                        ctx.lineTo(closest.x, closest.y);
                        ctx.stroke();

                        // 2. Vẽ một chấm phát sáng nhỏ tại vị trí bám dự kiến
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = solidColor;
                        ctx.fillStyle = solidColor;
                        ctx.beginPath();
                        ctx.arc(closest.x, closest.y, 4, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.restore();
                    }
                }
            }
        }
    };
}

function debugStopAll() {
    // 1. Dừng nhạc nền trận đấu cũ (nếu còn chạy)
    if (typeof inGameBGM !== 'undefined' && inGameBGM) {
        try {
            inGameBGM.pause();
            inGameBGM.currentTime = 0;
        } catch(e) {}
        inGameBGM = null;
    }

    // 2. Dừng voice line của tướng đang chọn
    if (typeof currentPickVoice !== 'undefined' && currentPickVoice) {
        try {
            currentPickVoice.pause();
            currentPickVoice.currentTime = 0;
        } catch(e) {}
        currentPickVoice = null;
    }

    // 3. Dừng nhạc hoặc âm thanh lặp của Trump
    if (typeof trumpDogMusicAudio !== 'undefined' && trumpDogMusicAudio) {
        try {
            trumpDogMusicAudio.pause();
            trumpDogMusicAudio.currentTime = 0;
        } catch (e) {}
    }

    // 4. Dừng âm thanh Room của Law và xóa sạch Room
    if (typeof activeRooms !== 'undefined' && activeRooms) {
        activeRooms.forEach(room => {
            if (room.roomAudio) {
                try {
                    room.roomAudio.pause();
                    room.roomAudio.currentTime = 0;
                } catch (e) {}
            }
        });
        activeRooms = [];
    }

    // 5. Dừng âm thanh bay lượn của Kid
    if (typeof player1 !== 'undefined' && player1) {
        if (player1.kidC3Audio) {
            try {
                player1.kidC3Audio.pause();
                player1.kidC3Audio.currentTime = 0;
            } catch(e) {}
            player1.kidC3Audio = null;
        }
        player1.stopHeroVoice();
        player1.statusList = [];
        player1.kurumiShadowActive = false; // Reset bóng của Kurumi nếu có
    }
    
    if (typeof player2 !== 'undefined' && player2) {
        if (player2.kidC3Audio) {
            try {
                player2.kidC3Audio.pause();
                player2.kidC3Audio.currentTime = 0;
            } catch(e) {}
            player2.kidC3Audio = null;
        }
        player2.stopHeroVoice();
        player2.statusList = [];
        player2.kurumiShadowActive = false;
    }

    // 6. Làm sạch mảng đạn và hiệu ứng hình ảnh
    if (typeof projectiles !== 'undefined') projectiles = [];
    if (typeof effects !== 'undefined') effects = [];

    // 7. Trả lại giao diện màn hình bình thường
    document.body.style.backgroundColor = '#111';
    if (typeof canvas !== 'undefined' && canvas) {
        canvas.style.transform = 'none';
    }

    // 8. Đảm bảo nhạc nền màn hình chọn tướng hoạt động bình thường
    if (typeof appSettings !== 'undefined' && appSettings.bgmOn && typeof pickScreenBGM !== 'undefined' && pickScreenBGM) {
        pickScreenBGM.volume = (appSettings.bgmVol / 100) * 0.7;
        pickScreenBGM.play().catch(e => {});
    }
}
