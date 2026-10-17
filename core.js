const GameRegistry = {
    'MEGA 6/45': { numCount: 6, maxVal: 45, desc: "Dán kết quả Mega 6/45 (6 số mỗi kỳ từ 01 đến 45)", placeholder: "Ví dụ: 05 12 23 34 41 45", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5], m[6]] },
    'POWER 6/55': { numCount: 6, maxVal: 55, desc: "Dán kết quả Power 6/55 (6 số mỗi kỳ từ 01 đến 55)", placeholder: "Ví dụ: 02 11 19 28 33 40", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5], m[6]] },
    'MAX 3D PRO': { numCount: 6, maxVal: 99, desc: "Dán kết quả Max 3D Pro (6 vị trí số)", placeholder: "Ví dụ: 12 34 56 78 90 12", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5], m[6]] },
    'KENO': { numCount: 5, maxVal: 80, desc: "Dán kết quả Keno", placeholder: "Ví dụ: 03 15 21 30 39", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5]] },
    'LOTTO 5/35': { numCount: 6, maxVal: 35, desc: "Dán kết quả Lotto 5/35 (6 vị trí số)", placeholder: "Ví dụ: 01 09 18 27 31 12", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5], m[6]] },
    'XSKT (GĐB)': { numCount: 6, maxVal: 99, desc: "Dán kết quả Xổ Số Kiến Thiết (6 số)", placeholder: "Ví dụ: 07 13 20 26 35 41", regex: /(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/g, parseMatch: m => [m[1], m[2], m[3], m[4], m[5], m[6]] }
};

let savedData = {};
let currentGame = "";
let currentView = "home"; 
let currentPos = 1;
let appData = [];
let currentChartMode = 'tail'; 

// Hàm tự động tải file data.json khi vừa mở web
async function loadServerData() {
    try {
        const response = await fetch('data.json?t=' + new Date().getTime());
        if (response.ok) {
            savedData = await response.json();
        } else {
            savedData = JSON.parse(localStorage.getItem('vietlott_saved_data')) || {};
        }
    } catch (e) {
        savedData = JSON.parse(localStorage.getItem('vietlott_saved_data')) || {};
    }
    updateHomeCounts();
}

window.addEventListener('DOMContentLoaded', () => {
    loadServerData();
});

function updateHomeCounts() {
    Object.keys(GameRegistry).forEach(gameId => {
        const key = gameId.toLowerCase().replace(/[\/\s\(\)]/g, '-');
        const count = savedData[gameId] ? savedData[gameId].length : 0;
        const el = document.getElementById(`count-${key.split('-')[0]}`);
        if(el) el.innerText = count + ' kỳ';
    });
}

function openGameMenu(gameId) {
    if (!GameRegistry[gameId]) return;
    currentGame = gameId;
    appData = savedData[gameId] || [];
    currentView = "menu";

    document.getElementById('homeView').style.display = 'none';
    document.getElementById('gameMenuView').style.display = 'block';
    
    document.getElementById('chartView').style.display = 'none';
    document.getElementById('tailAnalysisView').style.display = 'none';
    document.getElementById('oddEvenAnalysisView').style.display = 'none';
    document.getElementById('dausoAnalysisView').style.display = 'none';
    document.getElementById('amduongAnalysisView').style.display = 'none';
    
    document.getElementById('btnBack').style.display = 'flex';
    document.getElementById('menuGameTitle').innerText = `🎮 TÍNH NĂNG SOI CẦU: ${currentGame}`;

    document.getElementById('modalDesc').innerText = GameRegistry[currentGame].desc;
    document.getElementById('dataInput').placeholder = GameRegistry[currentGame].placeholder;
}

function showFeature(featureName) {
    document.getElementById('gameMenuView').style.display = 'none';
    
    if (featureName === 'chart') {
        currentView = "chart";
        document.getElementById('chartView').style.display = 'block';
        document.getElementById('currentGameTitle').innerText = `📊 ĐANG SOI CẦU BIỂU ĐỒ: ${currentGame}`;
        checkDataState();
    } else if (featureName === 'tail') {
        currentView = "tail";
        document.getElementById('tailAnalysisView').style.display = 'block';
        renderTailAnalysis();
    } else if (featureName === 'oddeven') {
        currentView = "oddeven";
        document.getElementById('oddEvenAnalysisView').style.display = 'block';
        renderOddEvenAnalysis();
    } else if (featureName === 'dauso') {
        currentView = "dauso";
        document.getElementById('dausoAnalysisView').style.display = 'block';
        renderDauSoAnalysis();
    } else if (featureName === 'amduong') {
        currentView = "amduong";
        document.getElementById('amduongAnalysisView').style.display = 'block';
        renderAmDuongAnalysis();
    }
}

function handleBack() {
    if (['chart', 'tail', 'oddeven', 'dauso', 'amduong'].includes(currentView)) {
        openGameMenu(currentGame);
    } else if (currentView === 'menu') {
        goHome();
    }
}

function goHome() {
    currentView = "home";
    ['chartView', 'tailAnalysisView', 'oddEvenAnalysisView', 'dausoAnalysisView', 'amduongAnalysisView', 'gameMenuView'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById('btnBack').style.display = 'none';
    document.getElementById('homeView').style.display = 'block';
    updateHomeCounts();
}

function checkDataState() {
    if(appData.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('analysisContent').style.display = 'none';
    } else {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('analysisContent').style.display = 'block';
        currentPos = 1; renderTabs(); drawChart();
    }
}

function openModal() { document.getElementById('modal').style.display = 'flex'; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

function processData() {
    const rawText = document.getElementById('dataInput').value;
    if(!rawText.trim()) return;

    let parsed = [];
    const lines = rawText.split('\n');

    lines.forEach(line => {
        if (!line.trim()) return;

        // Tự động lọc bỏ chuỗi tiền thưởng dài phía sau, sau đó quét lấy 6 số cuối cùng
        let cleanLine = line.replace(/\d{9,}/g, '');
        let finalPairs = cleanLine.match(/\b\d{2}\b/g);
        
        if (finalPairs && finalPairs.length >= 6) {
            let targetBalls = finalPairs.slice(-6);
            parsed.push([targetBalls[0], targetBalls[1], targetBalls[2], targetBalls[3], targetBalls[4], targetBalls[5]]);
        }
    });

    if(parsed.length === 0) { 
        alert(`Không tìm thấy kết quả hợp lệ! Vui lòng kiểm tra lại định dạng.`); 
        return; 
    }
    
    parsed.reverse();
    appData = parsed; 
    savedData[currentGame] = appData; 
    localStorage.setItem('vietlott_saved_data', JSON.stringify(savedData));

    closeModal(); 
    document.getElementById('dataInput').value = ''; 
    
    if(currentView === 'chart') checkDataState();
    else if(currentView === 'tail') renderTailAnalysis();
    else if(currentView === 'oddeven') renderOddEvenAnalysis();
    else if(currentView === 'dauso') renderDauSoAnalysis();
    else if(currentView === 'amduong') renderAmDuongAnalysis();
}

function clearCurrentGameData() {
    if(confirm(`Xóa toàn bộ dữ liệu kỳ quay của [${currentGame}]?`)) {
        appData = [];
        savedData[currentGame] = [];
        localStorage.setItem('vietlott_saved_data', JSON.stringify(savedData));
        closeModal();
        
        if(currentView === 'chart') checkDataState();
        else if(currentView === 'tail') renderTailAnalysis();
        else if(currentView === 'oddeven') renderOddEvenAnalysis();
        else if(currentView === 'dauso') renderDauSoAnalysis();
        else if(currentView === 'amduong') renderAmDuongAnalysis();
    }
}

// ----------------- CHUYỂN ĐỔI GIỮA 2 BIỂU ĐỒ -----------------
function switchChartType(mode) {
    currentChartMode = mode;
    const btnFull = document.getElementById('btnChartFull');
    const btnTail = document.getElementById('btnChartTail');
    const boxFull = document.getElementById('containerChartFull');
    const boxTail = document.getElementById('containerChartTail');

    if (mode === 'tail') {
        if(btnTail) btnTail.className = "btn btn-primary";
        if(btnFull) btnFull.className = "btn";
        if(boxTail) boxTail.style.display = "block";
        if(boxFull) boxFull.style.display = "none";
    } else {
        if(btnTail) btnTail.className = "btn";
        if(btnFull) btnFull.className = "btn btn-primary";
        if(boxTail) boxTail.style.display = "none";
        if(boxFull) boxFull.style.display = "block";
    }
    drawChart();
}

// ----------------- TÍNH NĂNG 1: BIỂU ĐỒ -----------------
function renderTabs() {
    const tabsDiv = document.getElementById('posTabs'); tabsDiv.innerHTML = '';
    const numCount = GameRegistry[currentGame].numCount;
    tabsDiv.style.gridTemplateColumns = `repeat(${numCount}, 1fr)`;
    for(let i=1; i<=numCount; i++) {
        const div = document.createElement('div');
        div.className = `tab ${currentPos === i ? 'active' : ''}`;
        div.onclick = () => { currentPos = i; renderTabs(); drawChart(); };
        div.innerHTML = `<h4>VỊ TRÍ ${i}</h4><p>(Số ${i})</p>`; tabsDiv.appendChild(div);
    }
}

function drawChart() {
    if(appData.length === 0) return;
    if (currentChartMode === 'full') {
        drawChartFull();
    } else {
        drawChartTail();
    }
}

// 1. BIỂU ĐỒ SỐ ĐẦY ĐỦ
function drawChartFull() {
    document.getElementById('chartTitleFull').innerText = `BIỂU ĐỒ SỐ ĐẦY ĐỦ - VỊ TRÍ ${currentPos}`;
    const svg = document.getElementById('svgChartFull'); svg.innerHTML = '';
    const yAxis = document.getElementById('yAxisFull'); yAxis.innerHTML = '';

    let maxVal = GameRegistry[currentGame].maxVal || 45;
    // Cấu hình chuẩn riêng cho Lotto 5/35: Vị trí 1-5 max 35, riêng vị trí số 6 max 12
    if (currentGame === 'LOTTO 5/35') {
        maxVal = (currentPos === 6) ? 12 : 35;
    }

    const nodeSpacing = 45; 
    const width = Math.max(850, appData.length * nodeSpacing);
    svg.style.width = width + 'px'; 
    const height = 220;

    const steps = 5;
    for(let i=0; i<=steps; i++) {
        const val = Math.round((maxVal / steps) * i);
        const yPos = height - (i * (height / steps));
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0); line.setAttribute("y1", yPos); line.setAttribute("x2", width); line.setAttribute("y2", yPos);
        line.setAttribute("class", "grid-line"); svg.appendChild(line);

        const lbl = document.createElement('span');
        lbl.className = 'y-label';
        lbl.innerText = val;
        yAxis.appendChild(lbl);
    }

    let points = [], htmlTaiXiu = '', htmlChanLe = '', htmlKhoangCach = '', prevNum = null;

    appData.forEach((draw, index) => {
        const rawVal = draw[currentPos - 1];
        const fullNum = (rawVal !== undefined && rawVal !== null) ? parseInt(rawVal, 10) : 1;
        const unitNum = fullNum % 10;
        const isTai = unitNum >= 5;
        const isChan = fullNum % 2 === 0;

        htmlTaiXiu += `<div class="mini-ball ${isTai ? 'ball-tai' : 'ball-xiu'}">${isTai ? 'T' : 'X'}</div>`;
        htmlChanLe += `<div class="mini-ball ${isChan ? 'ball-chan-do' : 'ball-le-trang'}">${isChan ? 'C' : 'L'}</div>`;

        if (prevNum !== null) {
            const diff = fullNum - prevNum;
            let stepClass = 'step-flat', sign = '';
            if (diff > 0) { stepClass = 'step-up'; sign = '+'; }
            else if (diff < 0) { stepClass = 'step-down'; }
            htmlKhoangCach += `<div class="mini-step ${stepClass}">${sign}${diff}</div>`;
        } else {
            htmlKhoangCach += `<div class="mini-step step-flat">-</div>`;
        }
        prevNum = fullNum;

        const yPos = height - ((fullNum / maxVal) * height);
        points.push({ x: 30 + (index * nodeSpacing), y: Math.max(12, Math.min(height - 12, yPos)), fullNum, index: index+1 });
    });

    document.getElementById('boxTaiXiuFull').innerHTML = htmlTaiXiu;
    document.getElementById('boxChanLeFull').innerHTML = htmlChanLe;
    document.getElementById('boxKhoangCachFull').innerHTML = htmlKhoangCach;

    if(points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${points[0].x} ${points[0].y}`;
        for(let i=1; i<points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        path.setAttribute("d", d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "var(--primary)"); path.setAttribute("stroke-width", "2.5");
        svg.appendChild(path);
    }

    points.forEach(pt => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "node-group");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x); circle.setAttribute("cy", pt.y); circle.setAttribute("r", 15);
        circle.setAttribute("fill", "var(--bg-card)");
        circle.setAttribute("stroke", "var(--primary)"); circle.setAttribute("stroke-width", "2");

        const txtNum = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtNum.setAttribute("x", pt.x); txtNum.setAttribute("y", pt.y + 4.5); txtNum.setAttribute("text-anchor", "middle");
        txtNum.setAttribute("fill", "#fff"); txtNum.setAttribute("font-size", "10px"); txtNum.setAttribute("font-weight", "bold");
        txtNum.textContent = pt.fullNum < 10 ? '0' + pt.fullNum : pt.fullNum;

        const txtIndex = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtIndex.setAttribute("x", pt.x); txtIndex.setAttribute("y", pt.y - 18); txtIndex.setAttribute("text-anchor", "middle");
        txtIndex.setAttribute("fill", "var(--text-muted)"); txtIndex.setAttribute("font-size", "9px");
        txtIndex.textContent = `K #${pt.index}`;

        g.appendChild(circle); g.appendChild(txtNum); g.appendChild(txtIndex); svg.appendChild(g);
    });

    const scrollFull = document.getElementById('scrollFull');
    if (scrollFull) scrollFull.scrollLeft = scrollFull.scrollWidth;

    ['boxTaiXiuFull', 'boxChanLeFull', 'boxKhoangCachFull'].forEach(boxId => {
        const boxEl = document.getElementById(boxId);
        if (boxEl) boxEl.scrollTop = boxEl.scrollHeight;
    });
}

// 2. BIỂU ĐỒ SỐ ĐUÔI
function drawChartTail() {
    document.getElementById('chartTitleTail').innerText = `BIỂU ĐỒ SOI SỐ ĐUÔI - VỊ TRÍ ${currentPos}`;
    const svg = document.getElementById('svgChartTail'); svg.innerHTML = '';
    const nodeSpacing = 38; const width = Math.max(850, appData.length * nodeSpacing);
    svg.style.width = width + 'px'; const height = 200;

    for(let i=0; i<=9; i++) {
        const yPos = height - (i * (height/9));
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", 0); line.setAttribute("y1", yPos); line.setAttribute("x2", width); line.setAttribute("y2", yPos);
        line.setAttribute("class", "grid-line"); svg.appendChild(line);
    }

    const yMid = height - (4.5 * (height/9));
    const divider = document.createElementNS("http://www.w3.org/2000/svg", "line");
    divider.setAttribute("x1", 0); divider.setAttribute("y1", yMid); divider.setAttribute("x2", width); divider.setAttribute("y2", yMid);
    divider.setAttribute("class", "divider-line"); svg.appendChild(divider);

    let points = [], htmlTaiXiu = '', htmlChanLe = '', htmlKhoangCach = '', prevUnit = null;

    appData.forEach((draw, index) => {
        const rawVal = draw[currentPos - 1];
        const fullNum = (rawVal !== undefined && rawVal !== null) ? parseInt(rawVal, 10) : 0;
        const unitNum = Math.abs(fullNum) % 10;
        const isTai = unitNum >= 5;
        const isChan = unitNum % 2 === 0;

        htmlTaiXiu += `<div class="mini-ball ${isTai ? 'ball-tai' : 'ball-xiu'}">${isTai ? 'T' : 'X'}</div>`;
        htmlChanLe += `<div class="mini-ball ${isChan ? 'ball-chan-do' : 'ball-le-trang'}">${isChan ? 'C' : 'L'}</div>`;

        if (prevUnit !== null) {
            const diff = unitNum - prevUnit;
            let stepClass = 'step-flat', sign = '';
            if (diff > 0) { stepClass = 'step-up'; sign = '+'; }
            else if (diff < 0) { stepClass = 'step-down'; }
            htmlKhoangCach += `<div class="mini-step ${stepClass}">${sign}${diff}</div>`;
        } else {
            htmlKhoangCach += `<div class="mini-step step-flat">-</div>`;
        }
        prevUnit = unitNum;

        points.push({ x: 20 + (index * nodeSpacing), y: height - (unitNum * (height/9)), unitNum, fullNum, isTai, index: index+1 });
    });

    document.getElementById('boxTaiXiuTail').innerHTML = htmlTaiXiu;
    document.getElementById('boxChanLeTail').innerHTML = htmlChanLe;
    document.getElementById('boxKhoangCachTail').innerHTML = htmlKhoangCach;

    if(points.length > 1) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let d = `M ${points[0].x} ${points[0].y}`;
        for(let i=1; i<points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        path.setAttribute("d", d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "var(--primary)"); path.setAttribute("stroke-width", "2");
        svg.appendChild(path);
    }

    points.forEach(pt => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "node-group");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x); circle.setAttribute("cy", pt.y); circle.setAttribute("r", 10);
        circle.setAttribute("fill", pt.isTai ? "var(--red-tai)" : "var(--blue-xiu)");
        circle.setAttribute("stroke", "#fff"); circle.setAttribute("stroke-width", "1.5");

        const txtUnit = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtUnit.setAttribute("x", pt.x); txtUnit.setAttribute("y", pt.y + 3.5); txtUnit.setAttribute("text-anchor", "middle");
        txtUnit.setAttribute("fill", "#fff"); txtUnit.setAttribute("font-size", "10px"); txtUnit.setAttribute("font-weight", "bold");
        txtUnit.textContent = pt.unitNum;

        const txtFull = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtFull.setAttribute("x", pt.x); txtFull.setAttribute("y", pt.y - 14); txtFull.setAttribute("text-anchor", "middle");
        txtFull.setAttribute("fill", "var(--text-muted)"); txtFull.setAttribute("font-size", "9px");
        txtFull.textContent = `[${pt.fullNum < 10 ? '0'+pt.fullNum : pt.fullNum}]`;

        g.appendChild(circle); g.appendChild(txtUnit); g.appendChild(txtFull); svg.appendChild(g);
    });

    const scrollTail = document.getElementById('scrollTail');
    if (scrollTail) scrollTail.scrollLeft = scrollTail.scrollWidth;

    ['boxTaiXiuTail', 'boxChanLeTail', 'boxKhoangCachTail'].forEach(boxId => {
        const boxEl = document.getElementById(boxId);
        if (boxEl) boxEl.scrollTop = boxEl.scrollHeight;
    });
}

// ----------------- TÍNH NĂNG 2: TRA CỨU ĐUÔI SỐ -----------------
function renderTailAnalysis() {
    const searchVal = document.getElementById('tailSearchInput').value.trim();
    const searchTokens = searchVal ? searchVal.split(/[\s\,]+/) : [];
    
    const resultsContainer = document.getElementById('tailSearchResults');
    const duplicateContainer = document.getElementById('boxDuplicateTails');
    const missingPairsContainer = document.getElementById('boxMissingTailPairs');

    resultsContainer.innerHTML = ''; duplicateContainer.innerHTML = ''; missingPairsContainer.innerHTML = '';

    if (appData.length === 0) {
        resultsContainer.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Chưa có dữ liệu kỳ quay nào được nạp.</div>';
        return;
    }

    const totalCount = appData.length;
    const reversedData = [...appData].reverse();

    reversedData.forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const tails = draw.map(num => parseInt(num, 10) % 10);
        let isMatch = true;

        if (searchTokens.length > 0) {
            isMatch = searchTokens.some(token => {
                const cleanToken = token.padStart(2, '0');
                const lastDigit = parseInt(token, 10) % 10;
                return draw.includes(cleanToken) || tails.includes(lastDigit);
            });
        }

        const row = document.createElement('div');
        row.className = `draw-row ${!isMatch ? 'dimmed' : ''}`;
        
        let ballsHTML = draw.map((num, i) => {
            const tail = tails[i];
            const isTarget = searchTokens.some(t => t.padStart(2, '0') === num || parseInt(t, 10) % 10 === tail);
            return `<div class="num-ball ${isTarget ? 'matched' : ''}">${num}</div>`;
        }).join('');

        row.innerHTML = `<span>Kỳ #${origIdx + 1} [Đuôi: ${tails.join(' ')}]</span><div class="draw-balls">${ballsHTML}</div>`;
        resultsContainer.appendChild(row);

        const tailCounts = {};
        tails.forEach(t => tailCounts[t] = (tailCounts[t] || 0) + 1);
        const dupTails = Object.keys(tailCounts).filter(t => tailCounts[t] >= 2);

        if (dupTails.length > 0) {
            const dupRow = document.createElement('div');
            dupRow.className = 'draw-row';
            let dupBallsHTML = draw.map((num, i) => {
                const isDup = dupTails.includes(tails[i].toString());
                return `<div class="num-ball ${isDup ? 'matched' : ''}">${num}</div>`;
            }).join('');
            dupRow.innerHTML = `<span>Kỳ #${origIdx + 1} (Trùng đuôi: ${dupTails.join(', ')})</span><div class="draw-balls">${dupBallsHTML}</div>`;
            duplicateContainer.appendChild(dupRow);
        }
    });

    const appearedPairs = new Set();
    appData.forEach(draw => {
        const tails = draw.map(num => parseInt(num, 10) % 10);
        for(let i=0; i<tails.length; i++) {
            for(let j=i+1; j<tails.length; j++) {
                appearedPairs.add([tails[i], tails[j]].sort().join('-'));
            }
        }
    });

    let missingList = [];
    for(let d=0; d<=9; d++) {
        if (!appearedPairs.has(`${d}-${d}`)) missingList.push(`Đôi đuôi <b>${d}-${d}</b>`);
    }

    if (missingList.length === 0) {
        missingPairsContainer.innerHTML = '<div style="color:#10b981; font-size:11px;">Tất cả các cặp đôi đuôi đã từng xuất hiện!</div>';
    } else {
        missingPairsContainer.innerHTML = `<div style="color:#ef4444; font-size:11px; line-height:1.6;">🚨 Các cặp đôi đuôi CHƯA VỀ lần nào:<br>${missingList.join('<br>')}</div>`;
    }
}

// ----------------- TÍNH NĂNG 3: PHÂN TÍCH CHẮN / LẺ -----------------
function renderOddEvenAnalysis() {
    const maxNum = (currentGame === 'LOTTO 5/35') ? 35 : ((currentGame === 'MEGA 6/45') ? 45 : 55);
    const evenListEl = document.getElementById('matrixEvenList');
    const oddListEl = document.getElementById('matrixOddList');
    const historyEl = document.getElementById('oddEvenHistoryList');

    evenListEl.innerHTML = ''; oddListEl.innerHTML = ''; historyEl.innerHTML = '';

    for(let i=1; i<=maxNum; i++) {
        const numStr = i.toString().padStart(2, '0');
        const ball = `<div class="num-ball" style="font-size:9px;" onclick="highlightOddEvenNumber('${numStr}')">${numStr}</div>`;
        if (i % 2 === 0) evenListEl.innerHTML += ball;
        else oddListEl.innerHTML += ball;
    }

    if (appData.length === 0) {
        historyEl.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Chưa có dữ liệu kỳ quay.</div>';
        return;
    }

    const totalCount = appData.length;
    [...appData].reverse().forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const evens = draw.filter(n => parseInt(n, 10) % 2 === 0);
        const odds = draw.filter(n => parseInt(n, 10) % 2 !== 0);

        const row = document.createElement('div');
        row.className = 'draw-row';
        row.innerHTML = `
            <span>Kỳ #${origIdx + 1}</span>
            <div>
                <span style="color:#38bdf8;">Lẻ (${odds.length}): ${odds.join(' ')}</span> | 
                <span style="color:#ef4444;">Chẵn (${evens.length}): ${evens.join(' ')}</span>
            </div>
        `;
        historyEl.appendChild(row);
    });
}

function highlightOddEvenNumber(numStr) {
    document.querySelectorAll('#oddEvenHistoryList .num-ball').forEach(b => {
        if(b.innerText === numStr) b.classList.toggle('matched');
    });
}

// ----------------- TÍNH NĂNG 4: THỐNG KÊ ĐẦU SỐ -----------------
function renderDauSoAnalysis() {
    const limitVal = document.getElementById('dauKyLimitSelect').value;
    const suggEl = document.getElementById('dausoSuggestions');
    const historyEl = document.getElementById('dausoHistoryList');

    suggEl.innerHTML = ''; historyEl.innerHTML = '';

    if (appData.length === 0) {
        historyEl.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Chưa có dữ liệu kỳ quay.</div>';
        return;
    }

    const numCount = GameRegistry[currentGame].numCount;
    let targetData = appData;
    if (limitVal !== 'all') {
        const limit = parseInt(limitVal, 10);
        targetData = appData.slice(Math.max(0, appData.length - limit));
    }

    const posAppearedDaus = Array.from({length: numCount}, () => new Set());
    targetData.forEach(draw => {
        draw.forEach((num, pIdx) => {
            if(pIdx < numCount) {
                posAppearedDaus[pIdx].add(Math.floor(parseInt(num, 10) / 10));
            }
        });
    });

    for(let p=0; p<numCount; p++) {
        let missingDaus = [];
        for(let d=0; d<=5; d++) {
            if(!posAppearedDaus[p].has(d)) missingDaus.push(`Đầu ${d}`);
        }
        const item = document.createElement('div');
        item.className = 'dauso-sugg-item';
        item.innerHTML = `<b style="color:var(--primary)">Vị trí ${p+1}:</b><br><span style="color:#ef4444">${missingDaus.join(', ') || 'Đã đủ đầu'}</span>`;
        suggEl.appendChild(item);
    }

    const totalCount = appData.length;
    [...appData].reverse().forEach((draw, rIdx) => {
        const origIdx = totalCount - 1 - rIdx;
        const daus = draw.map(n => Math.floor(parseInt(n, 10) / 10));
        const row = document.createElement('div');
        row.className = 'draw-row';
        row.innerHTML = `<span>Kỳ #${origIdx + 1} [Đầu: ${daus.join(' - ')}]</span><span style="color:var(--text-muted); font-size:10px;">Dãy: ${draw.join(' ')}</span>`;
        historyEl.appendChild(row);
    });
}

// ----------------- TÍNH NĂNG 5: KHOẢNG CÁCH ÂM DƯƠNG -----------------
function renderAmDuongAnalysis() {
    const historyEl = document.getElementById('amduongHistoryList');
    historyEl.innerHTML = '';

    if (appData.length < 2) {
        historyEl.innerHTML = '<div style="color:var(--text-muted); font-size:11px;">Cần ít nhất 2 kỳ quay để tính khoảng cách.</div>';
        return;
    }

    let rows = [];
    for (let i = 1; i < appData.length; i++) {
        const prev = appData[i-1];
        const curr = appData[i];
        const diffs = curr.map((num, idx) => {
            const diff = parseInt(num, 10) - parseInt(prev[idx], 10);
            return (diff > 0 ? '+' + diff : diff);
        });

        rows.push(`
            <div class="draw-row">
                <span>Kỳ #${i} ➔ #${i+1}</span>
                <span style="font-family:monospace; color:#34d399; font-weight:bold;">${diffs.join('   ')}</span>
                <span style="color:var(--text-muted); font-size:10px;">(${curr.join(' ')})</span>
            </div>
        `);
    }

    historyEl.innerHTML = rows.reverse().join('');
}