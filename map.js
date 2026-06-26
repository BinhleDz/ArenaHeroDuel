// ==========================================
// HỆ THỐNG QUẢN LÝ BẢN ĐỒ VÀ MAP EDITOR
// ==========================================

let currentMapId = 'default';
let savedMaps = JSON.parse(localStorage.getItem('arenaDuelMaps')) || {};

// Map ví dụ chuẩn theo định dạng bồ yêu cầu
const defaultMapText = `
name: Map Mặc Định
config{
    platform[0.15][0.75][150][20],
    platform[0.85][0.75][150][20],
    platform[0.35][0.60][150][20],
    platform[0.65][0.60][150][20],
    platform[0.5][0.45][200][20]
}`;

// --- BỘ PHIÊN DỊCH TEXT CẤU TRÚC MAP ---
function parseMapText(txt) {
    let nameMatch = txt.match(/name:\s*(.+)/);
    let name = nameMatch ? nameMatch[1].trim() : "Map Tự Tạo";
    let plats = [];
    let wls = [];
    
    // Đọc Bậc đứng
    let regex = /platform\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    let match;
    while ((match = regex.exec(txt)) !== null) {
        plats.push({
            x: parseFloat(match[1]), y: parseFloat(match[2]),
            w: parseFloat(match[3]), h: parseFloat(match[4]), type: 'platform'
        });
    }
    
    let regexWall = /(wall|wall_hit)\[(.*?)\]\[(.*?)\]\[(.*?)\]\[(.*?)\]/g;
    while ((match = regexWall.exec(txt)) !== null) {
        wls.push({
            type: match[1], // sẽ lấy đúng 'wall' hoặc 'wall_hit'
            x: parseFloat(match[2]), y: parseFloat(match[3]),
            w: parseFloat(match[4]), h: parseFloat(match[5])
        });
    }
    
    return { name: name, rawText: txt, platforms: plats, walls: wls };
}

function stringifyMap(name, elements, cw, ch) {
    let str = `name: ${name}\nconfig{\n`;
    elements.forEach(p => {
        let px = (p.x / cw).toFixed(3);
        let py = (p.y / ch).toFixed(3);
        str += `    ${p.type}[${px}][${py}][${Math.round(p.w)}][${Math.round(p.h)}],\n`;
    });
    str += `}`;
    return str;
}

// Khởi tạo map mặc định nếu chưa có
if (!savedMaps['default']) {
    savedMaps['default'] = parseMapText(defaultMapText);
    localStorage.setItem('arenaDuelMaps', JSON.stringify(savedMaps));
}

function getCurrentMapPlatforms(cw, ch) {
    let mapData = savedMaps[currentMapId] || savedMaps['default'];
    let realPlats = [];
    mapData.platforms.forEach(p => {
        // Đọc tỷ lệ chuyển thành pixel thực tế
        let realX = p.x < 2 ? p.x * cw : p.x; // Nếu < 2 thì hiểu là tỷ lệ % màn hình
        let realY = p.y < 2 ? p.y * ch : p.y;
        if (p.x === 0.85) realX = cw * 0.85 - p.w; // Trick xử lý map mặc định đối xứng
        if (p.x === 0.65) realX = cw * 0.65 - p.w;
        if (p.x === 0.5) realX = cw * 0.5 - p.w/2;

        realPlats.push({ x: realX, y: realY, w: p.w, h: p.h });
    });
    return realPlats;
}
function getCurrentMapWalls(cw, ch) {
    let mapData = savedMaps[currentMapId] || savedMaps['default'];
    let realWalls = [];
    if (mapData.walls) {
        mapData.walls.forEach(w => {
            let realX = w.x < 2 ? w.x * cw : w.x; 
            let realY = w.y < 2 ? w.y * ch : w.y;
            // ĐÃ SỬA: Lấy đúng w.type từ dữ liệu map thay vì ép cứng thành 'wall'
            realWalls.push({ x: realX, y: realY, w: w.w, h: w.h, type: w.type });
        });
    }
    return realWalls;
}

// --- UI CHỌN BẢN ĐỒ ---
function renderMapList() {
    const list = document.getElementById('map-list');
    list.innerHTML = ''; 
    for (let id in savedMaps) {
        let map = savedMaps[id];
        let div = document.createElement('div');
        div.style.cssText = `background: #2a2a2a; border: 3px solid ${currentMapId === id ? '#00ffff' : '#444'}; border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;`;
        
        // Click chọn map
        div.onclick = () => {
            currentMapId = id;
            document.getElementById('btn-open-map').innerText = "MAP: " + map.name.toUpperCase();
            document.getElementById('map-modal-overlay').style.display = 'none';
        };

        div.innerHTML = `
            <span style="color: white; font-size: 20px; font-weight: bold;">${map.name}</span>
            <div>
                ${id !== 'default' ? `<button onclick="event.stopPropagation(); deleteMap('${id}')" style="background: #ff4d4d; color: white; border: none; font-size: 20px; font-weight: bold; cursor: pointer; padding: 5px 15px; border-radius: 5px; margin-right: 5px;" title="Xóa Map">[-]</button>` : ''}
                <button onclick="event.stopPropagation(); openMapEditor('${id}')" style="background: #444; color: #00ffff; border: none; font-size: 20px; font-weight: bold; cursor: pointer; padding: 5px 15px; border-radius: 5px;" title="Chỉnh sửa Map">[+]</button>
            </div>
        `;
        list.appendChild(div);
    }
}

function openMapModal() {
    renderMapList();
    document.getElementById('map-modal-overlay').style.display = 'flex';
}

function closeMapModal(e) {
    if(e && e.target.id !== 'map-modal-overlay') return;
    document.getElementById('map-modal-overlay').style.display = 'none';
}

function deleteMap(id) {
    if (id === 'default') {
        alert("Không thể xóa map mặc định!");
        return;
    }
    
    if (confirm("Bạn có chắc chắn muốn xóa map này vĩnh viễn không?")) {
        delete savedMaps[id];
        localStorage.setItem('arenaDuelMaps', JSON.stringify(savedMaps));
        
        // Nếu map đang được chọn ngoài sảnh bị xóa, tự động đưa về map mặc định
        if (currentMapId === id) {
            currentMapId = 'default';
            document.getElementById('btn-open-map').innerText = "MAP: MẶC ĐỊNH";
        }
        
        renderMapList(); // Refresh lại danh sách hiển thị
    }
}


// ==========================================
// MAP EDITOR LOGIC
// ==========================================

let editCanvas, editCtx;
let isEditingMap = false;
let editMapId = null;
let editPlatforms = [];
let selectedPlat = null;
let currentTool = 'platform';

// Undo / Redo
let historyStack = [];
let redoStack = [];

// Biến kéo thả / resize
let isDragging = false;
let dragAction = ''; // 'move', 'resize-tl', 'resize-tr', 'resize-bl', 'resize-br'
let dragOffsetX = 0; let dragOffsetY = 0;
let mouseX = 0; let mouseY = 0;

let testPlayer = null; // Gojo test

function editorSaveState() {
    historyStack.push(JSON.stringify(editPlatforms));
    if(historyStack.length > 20) historyStack.shift();
    redoStack = [];
}

function editorUndo() {
    if(historyStack.length > 0) {
        redoStack.push(JSON.stringify(editPlatforms));
        editPlatforms = JSON.parse(historyStack.pop());
        selectedPlat = null;
    }
}

function editorRedo() {
    if(redoStack.length > 0) {
        historyStack.push(JSON.stringify(editPlatforms));
        editPlatforms = JSON.parse(redoStack.pop());
        selectedPlat = null;
    }
}

function editorSetTool(tool) {
    currentTool = tool;
    document.getElementById('tool-platform').style.background = tool === 'platform' ? '#00ffff' : '#555';
    document.getElementById('tool-wall').style.background = tool === 'wall' ? '#00ffff' : '#555';
    document.getElementById('tool-wall_hit').style.background = tool === 'wall_hit' ? '#e74c3c' : '#555';
    document.getElementById('tool-none').style.background = tool === 'none' ? '#555' : '#555';
}

function editorDeleteSelected() {
    if (selectedPlat) {
        editorSaveState();
        editPlatforms = editPlatforms.filter(p => p !== selectedPlat);
        selectedPlat = null;
    }
}

function editorMirrorSelected() {
    if (selectedPlat) {
        editorSaveState();
        // Tính toán tọa độ X đối xứng qua trục giữa của màn hình
        let mirroredPlat = {
            x: editCanvas.width - selectedPlat.x - selectedPlat.w,
            y: selectedPlat.y,
            w: selectedPlat.w,
            h: selectedPlat.h,
            type: selectedPlat.type
        };
        editPlatforms.push(mirroredPlat);
        selectedPlat = mirroredPlat; // Đổi con trỏ sang khối mới vừa được tạo
    } else {
        alert("Vui lòng click chọn 1 cấu trúc để phản chiếu!");
    }
}

function openMapEditor(id) {
    document.getElementById('map-modal-overlay').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('map-editor-container').style.display = 'block';
    
    editCanvas = document.getElementById('editorCanvas');
    editCanvas.width = window.innerWidth;
    editCanvas.height = window.innerHeight;
    editCtx = editCanvas.getContext('2d');

    historyStack = []; redoStack = [];
    selectedPlat = null;
    isEditingMap = true;
    editMapId = id;

    if (id && savedMaps[id]) {
        document.getElementById('editor-map-name').value = savedMaps[id].name;
        // Gộp cả platform và wall vào chung một mảng editPlatforms để dễ chỉnh sửa
        editPlatforms = getCurrentMapPlatforms(editCanvas.width, editCanvas.height)
                        .concat(getCurrentMapWalls(editCanvas.width, editCanvas.height));
    } else {
        document.getElementById('editor-map-name').value = "Map Mới " + Math.floor(Math.random()*100);
        editPlatforms = [];
    }

    editorSaveState();

    // SPAWN GOJO MÔ PHỎNG DI CHUYỂN
    // Đã thay đổi phím cho Player 1 theo yêu cầu: AWD để đi, Space để nhảy, WER để xài chiêu
    testPlayer = new Player(editCanvas.width / 2, 100, '#fff', 
        { left: 'a', right: 'd', up: ' ', down: 's', dash: 'shift', basic: 'q', c1: 'w', c2: 'e', c3: 'r', charge: 'c' }, 
        true, 'gojo', 500);

    // Tạm mượn phím WASD để test map
    window.addEventListener('mousedown', editorMouseDown);
    window.addEventListener('mousemove', editorMouseMove);
    window.addEventListener('mouseup', editorMouseUp);

    requestAnimationFrame(editorLoop);
}

function closeMapEditor() {
    isEditingMap = false;
    document.getElementById('map-editor-container').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'block';
    window.removeEventListener('mousedown', editorMouseDown);
    window.removeEventListener('mousemove', editorMouseMove);
    window.removeEventListener('mouseup', editorMouseUp);
}

function editorSave() {
    let name = document.getElementById('editor-map-name').value;
    let txt = stringifyMap(name, editPlatforms, editCanvas.width, editCanvas.height);
    
    let mapIdToSave = editMapId ? editMapId : 'map_' + Date.now();
    savedMaps[mapIdToSave] = parseMapText(txt);
    localStorage.setItem('arenaDuelMaps', JSON.stringify(savedMaps));
    
    alert(`Đã lưu map: ${name} nhưng bạn quá Gay`);
    currentMapId = mapIdToSave;
    document.getElementById('btn-open-map').innerText = "MAP: " + name.toUpperCase();
    closeMapEditor();
}

// --- TƯƠNG TÁC CHUỘT (DRAG & RESIZE) ---
const HANDLE_SIZE = 10;

function getHandle(x, y, p) {
    if (!p) return null;
    let inRect = (hx, hy) => (x >= hx - HANDLE_SIZE && x <= hx + HANDLE_SIZE && y >= hy - HANDLE_SIZE && y <= hy + HANDLE_SIZE);
    if (inRect(p.x, p.y)) return 'resize-tl';
    if (inRect(p.x + p.w, p.y)) return 'resize-tr';
    if (inRect(p.x, p.y + p.h)) return 'resize-bl';
    if (inRect(p.x + p.w, p.y + p.h)) return 'resize-br';
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return 'move';
    return null;
}

function editorMouseDown(e) {
    if(!isEditingMap) return;
    if(e.clientY < 60 || e.clientY > window.innerHeight - 60) return; // Bỏ qua khu vực UI trên/dưới

    let handle = getHandle(e.clientX, e.clientY, selectedPlat);
    if (handle) {
        editorSaveState();
        isDragging = true;
        dragAction = handle;
        dragOffsetX = e.clientX - selectedPlat.x;
        dragOffsetY = e.clientY - selectedPlat.y;
    } else {
        // Tìm chọn platform khác
        let clicked = editPlatforms.find(p => e.clientX >= p.x && e.clientX <= p.x+p.w && e.clientY >= p.y && e.clientY <= p.y+p.h);
        if (clicked) {
            selectedPlat = clicked;
        } else if (currentTool === 'platform' || currentTool === 'wall' || currentTool === 'wall_hit') {
            editorSaveState();
            // Tạo vật thể mới dựa trên tool đang chọn
            let isWallType = (currentTool === 'wall' || currentTool === 'wall_hit');
            let newPlat = { 
                x: e.clientX - 75, 
                y: e.clientY - (isWallType ? 50 : 10), 
                w: 150, 
                h: (isWallType ? 100 : 20), 
                type: currentTool 
            };
            editPlatforms.push(newPlat);
            selectedPlat = newPlat;
            isDragging = true;
            dragAction = 'move';
            dragOffsetX = 75; 
            dragOffsetY = isWallType ? 50 : 10;
            currentTool = 'none'; 
            editorSetTool('none');
        } else {
            selectedPlat = null; // Bấm ra ngoài hủy chọn
        }
    }
}

function editorMouseMove(e) {
    if(!isEditingMap) return;
    mouseX = e.clientX; mouseY = e.clientY;
    
    // Đổi trỏ chuột
    let hoverHandle = getHandle(mouseX, mouseY, selectedPlat);
    if(hoverHandle === 'resize-tl' || hoverHandle === 'resize-br') editCanvas.style.cursor = 'nwse-resize';
    else if(hoverHandle === 'resize-tr' || hoverHandle === 'resize-bl') editCanvas.style.cursor = 'nesw-resize';
    else if(hoverHandle === 'move') editCanvas.style.cursor = 'move';
    else editCanvas.style.cursor = 'default';

    if (isDragging && selectedPlat) {
        if (dragAction === 'move') {
            selectedPlat.x = mouseX - dragOffsetX;
            selectedPlat.y = mouseY - dragOffsetY;
        } else if (dragAction === 'resize-tl') {
            let oldR = selectedPlat.x + selectedPlat.w; let oldB = selectedPlat.y + selectedPlat.h;
            selectedPlat.x = mouseX; selectedPlat.y = mouseY;
            selectedPlat.w = oldR - mouseX; selectedPlat.h = oldB - mouseY;
        } else if (dragAction === 'resize-tr') {
            let oldB = selectedPlat.y + selectedPlat.h;
            selectedPlat.y = mouseY;
            selectedPlat.w = mouseX - selectedPlat.x; selectedPlat.h = oldB - mouseY;
        } else if (dragAction === 'resize-bl') {
            let oldR = selectedPlat.x + selectedPlat.w;
            selectedPlat.x = mouseX;
            selectedPlat.w = oldR - mouseX; selectedPlat.h = mouseY - selectedPlat.y;
        } else if (dragAction === 'resize-br') {
            selectedPlat.w = mouseX - selectedPlat.x;
            selectedPlat.h = mouseY - selectedPlat.y;
        }
        
        // Chống lật ngược hình
        if(selectedPlat.w < 20) selectedPlat.w = 20;
        if(selectedPlat.h < 10) selectedPlat.h = 10;
    }
}

function editorMouseUp(e) {
    isDragging = false;
}

// --- VÒNG LẶP EDITOR ---
function editorLoop() {
    if (!isEditingMap) return;

    editCtx.clearRect(0, 0, editCanvas.width, editCanvas.height);
    
    // Vẽ nền & đất
    editCtx.fillStyle = '#3a2e24'; 
    editCtx.fillRect(0, editCanvas.height - 50, editCanvas.width, 50); // groundHeight giả định là 50
    editCtx.fillStyle = '#1e5e3a'; 
    editCtx.fillRect(0, editCanvas.height - 50, editCanvas.width, 10);

    // Vẽ các platforms
    editCtx.fillStyle = '#666';
    // Vẽ các platforms và tường
    for (let p of editPlatforms) {
        if (p.type === 'wall_hit') {
            editCtx.fillStyle = '#1b4875'; // Màu đỏ cho Tường 2
            editCtx.fillRect(p.x, p.y, p.w, p.h);
            editCtx.strokeStyle = '#316eaa'; editCtx.lineWidth = 2;
            editCtx.strokeRect(p.x, p.y, p.w, p.h);
        } else if (p.type === 'wall') {
            editCtx.fillStyle = '#34495e'; // Màu xanh xám cho Tường 1
            editCtx.fillRect(p.x, p.y, p.w, p.h);
            editCtx.strokeStyle = '#2c3e50'; editCtx.lineWidth = 2;
            editCtx.strokeRect(p.x, p.y, p.w, p.h);
        } else {
            editCtx.fillStyle = '#666'; // Màu Bậc đứng mặc định
            editCtx.fillRect(p.x, p.y, p.w, p.h);
            editCtx.fillStyle = '#888'; 
            editCtx.fillRect(p.x, p.y, p.w, 4);
        }
    }

    // Vẽ lưới/Outline chọn
    if (selectedPlat) {
        editCtx.strokeStyle = '#00ffff';
        editCtx.lineWidth = 2;
        editCtx.strokeRect(selectedPlat.x, selectedPlat.y, selectedPlat.w, selectedPlat.h);
        
        // Vẽ các góc (Resize handles)
        editCtx.fillStyle = '#ffffff';
        let p = selectedPlat;
        let hs = HANDLE_SIZE / 2;
        editCtx.fillRect(p.x - hs, p.y - hs, HANDLE_SIZE, HANDLE_SIZE);
        editCtx.fillRect(p.x + p.w - hs, p.y - hs, HANDLE_SIZE, HANDLE_SIZE);
        editCtx.fillRect(p.x - hs, p.y + p.h - hs, HANDLE_SIZE, HANDLE_SIZE);
        editCtx.fillRect(p.x + p.w - hs, p.y + p.h - hs, HANDLE_SIZE, HANDLE_SIZE);
    }

    // Tạm thời gán platforms hệ thống bằng editPlatforms để Gojo đứng được
    let tempOldPlats = window.platforms;
    window.platforms = editPlatforms;

    // Chạy logic test Player
    if (testPlayer) {
        testPlayer.update();
        
        // Render tạm hình Gojo (Lấy hàm vẽ thẳng từ dummy)
        let tempCtx = window.ctx;
        window.ctx = editCtx; // Tráo Context sang màn hình editor
        testPlayer.draw();
        window.ctx = tempCtx;
    }

    window.platforms = tempOldPlats;

    requestAnimationFrame(editorLoop);
}