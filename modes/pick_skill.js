// ==========================================
// CHẾ ĐỘ: PICK SKILL (MIX KỸ NĂNG)
// ==========================================

// Đăng ký chế độ vào danh sách (Sẽ chạy tự động nếu nhúng file script này vào HTML)
if (typeof gameModes !== 'undefined') {
    gameModes.push({ id: 'pick_skill', name: '🧩 PICK SKILL', icon: 'assets/gameplay/normal.png' });
}

// Lưu trữ trạng thái kỹ năng được chọn
let pickState = {
    p1: { c1: null, c2: null, c3: null },
    p2: { c1: null, c2: null, c3: null }
};

let currentPickingPlayer = 1;
let currentPickingSlot = 1; // 1 = C1, 2 = C2, 3 = C3
let selectedHeroId = null;

// Ghi đè hàm startGame gốc để chèn UI Pick Skill vào giữa
const originalStartGameMethod = window.startGame;
window.startGame = function() {
    if (typeof currentMode !== 'undefined' && currentMode === 'pick_skill') {
        document.getElementById('selection-screen').style.display = 'none';
        initPickSkillUI();
    } else {
        originalStartGameMethod();
    }
};

// ==========================================
// GIAO DIỆN (UI) CHỌN KỸ NĂNG
// ==========================================
function initPickSkillUI() {
    // Reset state
    pickState = { p1: { c1: null, c2: null, c3: null }, p2: { c1: null, c2: null, c3: null } };
    currentPickingPlayer = 1;
    currentPickingSlot = 1;
    selectedHeroId = null;

    let overlay = document.getElementById('pick-skill-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pick-skill-overlay';
        overlay.innerHTML = `
            <style>
                #pick-skill-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #111; z-index: 1000; display: flex; flex-direction: column; align-items: center; padding: 20px; box-sizing: border-box; font-family: 'Courier New', monospace; color: white;}
                .ps-header { font-size: 30px; font-weight: bold; color: #ffcc00; margin-bottom: 20px; text-transform: uppercase; }
                .ps-boards { display: flex; gap: 30px; width: 100%; max-width: 1000px; margin-bottom: 20px; }
                .ps-board { flex: 1; background: #222; border: 4px solid #555; border-radius: 10px; padding: 15px; text-align: center; transition: 0.3s; }
                .ps-board.active { border-color: #00ffff; box-shadow: 0 0 15px rgba(0,255,255,0.5); }
                .ps-board h3 { margin-top: 0; }
                .ps-slot-container { display: flex; justify-content: space-around; margin-top: 15px; }
                .ps-slot { width: 80px; height: 80px; background: #111; border: 2px solid #555; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 14px; font-weight: bold; transition: 0.2s; background-size: cover; background-position: center;}
                .ps-slot.active { border-color: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
                
                .ps-selection-area { width: 100%; max-width: 1000px; flex: 1; background: #222; border: 4px solid #555; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; }
                .ps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; flex: 1; overflow-y: auto; padding-right: 10px; }
                .ps-grid::-webkit-scrollbar { width: 8px; }
                .ps-grid::-webkit-scrollbar-thumb { background: #777; border-radius: 4px; }
                .ps-hero-btn { background: #333; color: white; border: 2px solid #555; border-radius: 5px; padding: 10px; cursor: pointer; font-weight: bold; font-family: inherit; transition: 0.2s; }
                .ps-hero-btn:hover, .ps-hero-btn.selected { background: #00ffff; color: black; border-color: #00ffff; }
                
                .ps-controls { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
                .ps-controls button { padding: 15px 30px; font-size: 18px; font-weight: bold; border: none; border-radius: 5px; cursor: pointer; font-family: inherit; transition: 0.2s;}
                #ps-btn-random { background: #ffaa00; color: black; }
                #ps-btn-confirm { background: #00ff00; color: black; }
                #ps-btn-finish { background: #ff0055; color: white; display: none; }
                #ps-btn-random:hover, #ps-btn-confirm:hover, #ps-btn-finish:hover { transform: scale(1.05); }
            </style>
            
            <div class="ps-header" id="ps-main-title">MIX KỸ NĂNG</div>
            
            <div class="ps-boards">
                <div class="ps-board active" id="ps-board-1" style="border-color: #ff4d4d;">
                    <h3 style="color: #ff4d4d;">PLAYER 1</h3>
                    <div style="font-size: 14px; color:#aaa;">Tướng gốc: <span id="ps-p1-base"></span></div>
                    <div class="ps-slot-container">
                        <div class="ps-slot active" id="ps-slot-1-1">C1</div>
                        <div class="ps-slot" id="ps-slot-1-2">C2</div>
                        <div class="ps-slot" id="ps-slot-1-3">C3</div>
                    </div>
                </div>
                <div class="ps-board" id="ps-board-2" style="border-color: #555;">
                    <h3 style="color: #4da6ff;">PLAYER 2</h3>
                    <div style="font-size: 14px; color:#aaa;">Tướng gốc: <span id="ps-p2-base"></span></div>
                    <div class="ps-slot-container">
                        <div class="ps-slot" id="ps-slot-2-1">C1</div>
                        <div class="ps-slot" id="ps-slot-2-2">C2</div>
                        <div class="ps-slot" id="ps-slot-2-3">C3</div>
                    </div>
                </div>
            </div>

            <div class="ps-selection-area" id="ps-selection-area">
                <h2 style="margin-top: 0; text-align: center; color: #00ffff;" id="ps-pick-title">P1 ĐANG CHỌN: CHIÊU 1</h2>
                <div class="ps-grid" id="ps-hero-grid"></div>
                <div class="ps-controls">
                    <button id="ps-btn-random" onclick="psRandomSkill()">🎲 RANDOM</button>
                    <button id="ps-btn-confirm" onclick="psConfirmSkill()">✔ ĐỒNG Ý</button>
                    <button id="ps-btn-finish" onclick="launchPickSkillGame()">⚔️ VÀO TRẬN ⚔️</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('pick-skill-overlay').style.display = 'flex';
    
    // Tìm tên tướng gốc
    let p1Name = heroPool.find(h => h.id === p1Hero)?.name || "Chưa rõ";
    let p2Name = heroPool.find(h => h.id === p2Hero)?.name || "Chưa rõ";
    document.getElementById('ps-p1-base').innerText = p1Name;
    document.getElementById('ps-p2-base').innerText = p2Name;

    renderPSHeroGrid();
    updatePSUI();
}

function renderPSHeroGrid() {
    const grid = document.getElementById('ps-hero-grid');
    grid.innerHTML = '';
    heroPool.forEach(hero => {
        let btn = document.createElement('button');
        btn.className = 'ps-hero-btn';
        btn.innerText = hero.name;
        btn.onclick = () => {
            selectedHeroId = hero.id;
            document.querySelectorAll('.ps-hero-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        grid.appendChild(btn);
    });
}

function psRandomSkill() {
    const randomIndex = Math.floor(Math.random() * heroPool.length);
    selectedHeroId = heroPool[randomIndex].id;
    
    let btns = document.querySelectorAll('.ps-hero-btn');
    btns.forEach(b => b.classList.remove('selected'));
    btns[randomIndex].classList.add('selected');
}

function psConfirmSkill() {
    if (!selectedHeroId) {
        alert("Vui lòng chọn một kỹ năng!");
        return;
    }

    // Lưu vào state
    pickState[`p${currentPickingPlayer}`][`c${currentPickingSlot}`] = selectedHeroId;
    
    // Cập nhật ảnh vào Slot
    let slotDiv = document.getElementById(`ps-slot-${currentPickingPlayer}-${currentPickingSlot}`);
    slotDiv.style.backgroundImage = `url('assets/icon/cd_skill/${selectedHeroId}/c${currentPickingSlot}_${selectedHeroId}.png')`;
    slotDiv.innerText = ""; // Xóa chữ C1, C2, C3

    // Chuyển slot
    selectedHeroId = null;
    document.querySelectorAll('.ps-hero-btn').forEach(b => b.classList.remove('selected'));

    currentPickingSlot++;
    if (currentPickingSlot > 3) {
        currentPickingSlot = 1;
        currentPickingPlayer++;
    }

    updatePSUI();
}

function updatePSUI() {
    // Reset bảng active
    document.getElementById('ps-board-1').style.borderColor = '#555';
    document.getElementById('ps-board-2').style.borderColor = '#555';
    document.querySelectorAll('.ps-slot').forEach(s => s.classList.remove('active'));

    if (currentPickingPlayer <= 2) {
        // Cập nhật viền cho người đang chọn
        let color = currentPickingPlayer === 1 ? '#ff4d4d' : '#4da6ff';
        document.getElementById(`ps-board-${currentPickingPlayer}`).style.borderColor = color;
        document.getElementById(`ps-slot-${currentPickingPlayer}-${currentPickingSlot}`).classList.add('active');
        
        document.getElementById('ps-pick-title').innerText = `P${currentPickingPlayer} ĐANG CHỌN: CHIÊU ${currentPickingSlot}`;
        document.getElementById('ps-pick-title').style.color = color;
    } else {
        // Đã chọn xong cả 2
        document.getElementById('ps-pick-title').innerText = "ĐÃ CHỌN XONG KỸ NĂNG!";
        document.getElementById('ps-pick-title').style.color = '#00ff00';
        document.getElementById('ps-hero-grid').style.display = 'none';
        document.getElementById('ps-btn-random').style.display = 'none';
        document.getElementById('ps-btn-confirm').style.display = 'none';
        document.getElementById('ps-btn-finish').style.display = 'block';
    }
}

// ==========================================
// VÀO TRẬN VÀ GHI ĐÈ LOGIC CỐT LÕI
// ==========================================
function launchPickSkillGame() {
    document.getElementById('pick-skill-overlay').style.display = 'none';
    
    // Gọi hàm gốc để sinh ra Player1, Player2 và vẽ map
    originalStartGameMethod();

    // Áp dụng bộ skill đã mix
    applyMixedSkills(player1, pickState.p1);
    applyMixedSkills(player2, pickState.p2);
}

function applyMixedSkills(player, skills) {
    player.baseHeroType = player.heroType; // Lưu bản gốc

    // 1. Chèn trước một số biến cần thiết để chống crash (Nếu mượn chiêu của tướng đặc thù)
    let borrowed = [skills.c1, skills.c2, skills.c3];
    
    // Đã fix: Hỗ trợ cả id goku và songoku
    if (borrowed.includes('songoku') || borrowed.includes('goku')) { player.maxMana = 200; player.mana = 0; }
    if (borrowed.includes('doraemon')) { player.doraeMinis = []; player.doraeC3Window = 0; }
    if (borrowed.includes('yasuo')) { player.yasuoQStacks = 0; }
    if (borrowed.includes('kurumi')) { player.kurumiShadowActive = false; player.isKurumiC2Charging = false; }
    if (borrowed.includes('pokra')) { player.pokraC1Timer = 0; player.isPokraAttacking = false; }

    // Lưu lại các hàm gốc
    const origTrigger = player.triggerSkill;
    const origExecute = player.executeSkill;
    const origStartChannel = player.startChannel;
    const origUpdate = player.update;
    const origDraw = player.draw;

    // 2. Ghi đè phím bấm kỹ năng
    player.triggerSkill = function(skillKey) {
        if (skillKey === 'c1') this.heroType = skills.c1;
        else if (skillKey === 'c2') this.heroType = skills.c2;
        else if (skillKey === 'c3') this.heroType = skills.c3;

        origTrigger.call(this, skillKey);

        this.heroType = this.baseHeroType; // Trả về gốc
    };

    // 3. Ghi đè lúc xuất chiêu (Xử lý delay từ startChannel)
    player.executeSkill = function(skillKey) {
        if (skillKey === 'c1') this.heroType = skills.c1;
        else if (skillKey === 'c2') this.heroType = skills.c2;
        else if (skillKey === 'c3') this.heroType = skills.c3;
        else if (this._pendingSkillHero) this.heroType = this._pendingSkillHero;

        origExecute.call(this, skillKey);

        this.heroType = this.baseHeroType;
        this._pendingSkillHero = null;
    };

    // 4. Ghi đè lúc bắt đầu vận chiêu
    player.startChannel = function(skillKey, frames) {
        this._pendingSkillHero = this.heroType; // Ghi nhớ chủ nhân thực sự của chiêu đang vận
        origStartChannel.call(this, skillKey, frames);
    };

    // 5. Cấp quyền Update cho các trạng thái bị khóa theo tướng
    player.update = function() {
        let base = this.baseHeroType;

        // Cho phép các hiệu ứng update của chiêu được mượn chạy ngầm
        if (this.kurumiShadowActive || this.isKurumiC2Charging) this.heroType = 'kurumi';
        else if (this.isSonicRolling) this.heroType = 'sonic';
        else if (this.doraeC3Window > 0 || (this.doraeMinis && this.doraeMinis.length > 0)) this.heroType = 'doraemon';
        else if (this.shadowDarkTimer > 0) this.heroType = 'shadowpea';
        // Đã fix: Xóa dòng check mana bao quát, chỉ ép về goku nếu ĐANG gồng hoặc chưởng Kamehameha
        else if (this.isKamehameha || this.isChargingKi) this.heroType = borrowed.includes('goku') ? 'goku' : 'songoku'; 
        else this.heroType = base;

        origUpdate.call(this);
        this.heroType = base;
    };

    // 6. Cấp quyền Vẽ VFX cho các trạng thái bị khóa theo tướng
    player.draw = function() {
        let base = this.baseHeroType;
        
        if (this.isSonicRolling) this.heroType = 'sonic';
        else if (this.kurumiShadowActive || this.isKurumiC2Charging || this.timeFrozen) this.heroType = 'kurumi';
        else this.heroType = base;

        origDraw.call(this);
        this.heroType = base;
    };
}

// ==========================================
// FIX GIAO DIỆN ICON KỸ NĂNG IN-GAME
// ==========================================
// Vòng lặp game gốc lấy icon dựa theo heroType, chúng ta sẽ vẽ đè icon Mix đè lên nó.
const baseGameLoopMethod = window.gameLoop;
window.gameLoop = function() {
    baseGameLoopMethod(); // Chạy loop gốc trước
    
    // Nếu đang trong trận và đúng chế độ pick_skill, vẽ đè icon
    if (gameActive && typeof currentMode !== 'undefined' && currentMode === 'pick_skill') {
        drawMixedIcons(player1, pickState.p1, 20);
        drawMixedIcons(player2, pickState.p2, canvas.width - (32 * 3 + 20) - 20);
    }
};

function drawMixedIcons(player, skills, startX) {
    let iconSize = 32;
    let yPos = canvas.height - 50 + 12; // 50 = groundHeight
    let keys = ['c1', 'c2', 'c3'];

    for (let i = 0; i < 3; i++) {
        let key = keys[i];
        let x = startX + i * (iconSize + 10);
        let mixedHero = skills[key]; // Lấy id của tướng bị mượn chiêu
        
        let src = `assets/icon/cd_skill/${mixedHero}/${key}_${mixedHero}.png`;
        
        if (!skillImagesCache[src]) {
            skillImagesCache[src] = new Image();
            skillImagesCache[src].src = src;
        }
        let img = skillImagesCache[src];
        
        // Vẽ đè ảnh lên nền
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, yPos, iconSize, iconSize);
        }
        
        // Vẽ lại cục bóng tối hồi chiêu để không bị ảnh che mất
        let currentCd = player.cds[key];
        if (currentCd > 0 && player.maxCds && player.maxCds[key]) {
            let ratio = currentCd / Math.max(1, player.maxCds[key]); 
            if (ratio > 1) ratio = 1; if (ratio < 0) ratio = 0;
            let darkHeight = iconSize * ratio;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; 
            ctx.fillRect(x, yPos + (iconSize - darkHeight), iconSize, darkHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 3; ctx.shadowColor = '#000000';
            ctx.fillText((currentCd / 60).toFixed(1), x + iconSize/2, yPos + iconSize/2);
            ctx.shadowBlur = 0;
        }
        
        // Vẽ lại khung viền
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, yPos, iconSize, iconSize);
    }
}