// =============================================
// LUCKY DRAW - HMTI FT UNSIKA
// main.js
// =============================================

let participants = [];
let winnerCount = 1;
let isDrawing = false;

// =============================================
// FILE UPLOAD HANDLER
// =============================================

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFile);

const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.style.borderColor = 'var(--gold)';
});
zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '';
});
zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    const f = e.dataTransfer.files[0];
    if (f) {
        const dt = new DataTransfer();
        dt.items.add(f);
        fileInput.files = dt.files;
        handleFile({ target: { files: [f] } });
    }
});

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('tagName').textContent = file.name;
    document.getElementById('fileTag').style.display = 'flex';

    const reader = new FileReader();

    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.onload = ev => {
            const lines = ev.target.result.split('\n').filter(l => l.trim());
            participants = lines
                .slice(1)
                .map(l => l.split(',')[0].replace(/"/g, '').trim())
                .filter(Boolean);
            updateBtn();
        };
        reader.readAsText(file);
    } else {
        reader.onload = ev => {
            const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            participants = rows
                .slice(1)
                .map(r => r[0])
                .filter(v => v !== undefined && v !== '')
                .map(String);
            updateBtn();
        };
        reader.readAsArrayBuffer(file);
    }
}

// =============================================
// UPDATE BUTTON STATE
// =============================================

function updateBtn() {
    const btn = document.getElementById('drawBtn');
    if (participants.length > 0) {
        btn.disabled = false;
        btn.textContent = '🎯 MULAI UNDIAN (' + participants.length + ' peserta)';
    } else {
        btn.disabled = true;
        alert('Tidak ada data ditemukan di kolom pertama.');
    }
}

// =============================================
// WINNER COUNT CONTROL
// =============================================

function changeCount(d) {
    winnerCount = Math.max(1, Math.min(winnerCount + d, Math.max(participants.length, 10)));
    document.getElementById('countDisplay').textContent = winnerCount;
}

// =============================================
// START DRAW
// =============================================

async function startDraw() {
    if (isDrawing || participants.length === 0) return;
    isDrawing = true;

    document.getElementById('winnersSection').style.display = 'none';
    document.getElementById('winnersList').innerHTML = '';
    document.getElementById('rollingLabel').style.opacity = '1';
    document.getElementById('rollingName').textContent = '';

    const btn = document.getElementById('drawBtn');
    btn.disabled = true;
    btn.textContent = '⏳ MENGUNDI...';

    const count = Math.min(winnerCount, participants.length);
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, count);

    await roll(3200);

    document.getElementById('rollingLabel').style.opacity = '0';
    document.getElementById('rollingName').textContent = '';
    document.getElementById('winnersSection').style.display = 'block';

    const trophies = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];
    const list = document.getElementById('winnersList');

    winners.forEach((name, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'winner-card';
            div.style.animationDelay = (i * 0.12) + 's';
            div.innerHTML =
                '<div class="w-rank">' + (i + 1) + '</div>' +
                '<div class="w-info">' +
                    '<div class="w-name">' + name + '</div>' +
                    '<div class="w-sub">Pemenang ke-' + (i + 1) + '</div>' +
                '</div>' +
                '<div class="w-trophy">' + (trophies[i] || '🏅') + '</div>';
            list.appendChild(div);
        }, i * 160);
    });

    setTimeout(confetti, 300);
    isDrawing = false;
    btn.disabled = false;
    btn.textContent = '🔄 UNDIAN LAGI';
}

// =============================================
// ROLLING ANIMATION
// =============================================

function roll(duration) {
    return new Promise(res => {
        const start = Date.now();
        const el = document.getElementById('rollingName');
        el.classList.remove('revealed');
        function tick() {
            const p = (Date.now() - start) / duration;
            if (p >= 1) {
                el.textContent = '';
                el.classList.remove('revealed');
                res();
                return;
            }
            el.textContent = participants[Math.floor(Math.random() * participants.length)];
            setTimeout(tick, 50 + p * p * 300);
        }
        tick();
    });
}

// =============================================
// CONFETTI EFFECT
// =============================================

function confetti() {
    const cols = ['#f5c518','#ffd94d','#00c6ff','#ffffff','#c9930a','#4466dd'];
    for (let i = 0; i < 90; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.cssText =
                'left:' + Math.random() * 100 + 'vw;' +
                'background:' + cols[Math.floor(Math.random() * cols.length)] + ';' +
                'width:' + (7 + Math.random() * 9) + 'px;' +
                'height:' + (7 + Math.random() * 9) + 'px;' +
                'animation-duration:' + (2 + Math.random() * 2) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4500);
        }, i * 25);
    }
}
