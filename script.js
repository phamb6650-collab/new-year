// --- CẤU HÌNH THỜI GIAN ---
// Lấy thời gian hiện tại theo múi giờ Việt Nam để xác định năm
const vnCurrentTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
const currentYear = vnCurrentTime.getFullYear();

// Đặt mục tiêu là 00:00:00 ngày 1/1 của năm sau (Múi giờ Việt Nam +07:00)
const nextYear = currentYear + 1;
const newYearTime = new Date(`${nextYear}-01-01T00:00:00+07:00`).getTime();

const dateEl = document.getElementById('current-date');
const msgEl = document.getElementById('happy-new-year-msg');
const musicEl = document.getElementById('music');
const musicBtn = document.getElementById('music-toggle');

// Nút đóng khung đếm ngược
const closeCountdownBtn = document.getElementById('close-countdown');
if (closeCountdownBtn) {
    closeCountdownBtn.addEventListener('click', () => {
        document.getElementById('countdown-container').style.display = 'none';
    });
}

// Các element hiển thị số
const dEl = document.getElementById('days');
const hEl = document.getElementById('hours');
const mEl = document.getElementById('minutes');
const sEl = document.getElementById('seconds');

let fireworksActive = false;

// --- HÀM ĐẾM NGƯỢC ---
function updateCountdown() {
    const now = new Date().getTime();
    const gap = newYearTime - now;

    // Cập nhật ngày tháng năm hiện tại (Theo giờ Việt Nam)
    const nowVN = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[nowVN.getDay()];
    const date = nowVN.getDate();
    const month = nowVN.getMonth() + 1;
    const year = nowVN.getFullYear();
    
    dateEl.innerText = `Hôm nay là ${dayName}, ngày ${date} tháng ${month} năm ${year}`;

    if (gap <= 0) {
        // Đã đến năm mới
        handleNewYear();
        return;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const d = Math.floor(gap / day);
    const h = Math.floor((gap % day) / hour);
    const m = Math.floor((gap % hour) / minute);
    const s = Math.floor((gap % minute) / second);

    dEl.innerText = d < 10 ? '0' + d : d;
    hEl.innerText = h < 10 ? '0' + h : h;
    mEl.innerText = m < 10 ? '0' + m : m;
    sEl.innerText = s < 10 ? '0' + s : s;
}

function handleNewYear() {
    // Ẩn bộ đếm, hiện lời chúc
    document.getElementById('countdown-container').style.display = 'none';
    
    msgEl.style.display = 'block';
    msgEl.innerText = `Happy New Year ${nextYear}!`;

    // Hiện nút bật tắt nhạc khi đến giờ G
    musicBtn.style.display = 'block';

    // Bật pháo hoa
    fireworksActive = true;

    // Bật nhạc (Lưu ý: Trình duyệt có thể chặn autoplay nếu chưa tương tác)
    musicEl.play().catch(error => {
        console.log("Cần tương tác người dùng để phát nhạc: ", error);
        // Có thể thêm nút "Bật nhạc" ở đây nếu cần
    });
}

setInterval(updateCountdown, 1000);

// --- HIỆU ỨNG PHÁO HOA (CANVAS) ---
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // Vận tốc ngẫu nhiên bung ra mọi hướng
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1; // Độ trong suốt
        this.decay = Math.random() * 0.015 + 0.005; // Tốc độ mờ dần
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Trọng lực nhẹ
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height / 2); // Nổ ở nửa trên màn hình
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Tạo 50 hạt cho mỗi vụ nổ
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Xóa màn hình dần dần (làm trong suốt) để lộ nền đỏ bên dưới thay vì tô đen
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    if (fireworksActive) {
        // Tỉ lệ xuất hiện pháo hoa ngẫu nhiên
        if (Math.random() < 0.05) {
            createFirework();
        }
    }

    // Cập nhật và vẽ các hạt
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        // Xóa hạt khi nó mờ hết
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
}

animate();

// --- SỰ KIỆN CLICK RƠI LÌ XÌ ---
let isRainingLixi = false;
const lixiWords = ['Phúc', 'Lộc', 'Thọ', 'Tài'];

document.addEventListener('click', () => {
    // Nếu đang có mưa lì xì thì chặn click
    if (isRainingLixi) return;
    isRainingLixi = true;

    // Tạo 30 vật phẩm rơi rải rác ngẫu nhiên
    for (let i = 0; i < 30; i++) {
        const randomDelay = Math.random() * 2000; // Xuất hiện ngẫu nhiên trong vòng 2 giây
        setTimeout(() => {
            // 50% cơ hội ra lì xì, 50% ra đồng xu
            Math.random() < 0.5 ? createFallingLixi() : createFallingCoin();
        }, randomDelay);
    }

    // Mở khóa click sau 7 giây (đủ thời gian cho đợt mưa kết thúc)
    setTimeout(() => {
        isRainingLixi = false;
    }, 7000);
});

function createFallingLixi() {
    const lixi = document.createElement('div');
    lixi.classList.add('falling-lixi');
    
    // Chọn chữ ngẫu nhiên
    lixi.innerText = lixiWords[Math.floor(Math.random() * lixiWords.length)];
    
    // Vị trí ngang ngẫu nhiên
    lixi.style.left = Math.random() * 100 + 'vw';
    
    // Vị trí bắt đầu cao thấp ngẫu nhiên (để không rơi thành hàng ngang)
    lixi.style.top = -(Math.random() * 150 + 50) + 'px';

    // Tạo độ lệch ngang ngẫu nhiên (gió thổi) từ -150px đến 150px
    const drift = (Math.random() - 0.5) * 300;
    lixi.style.setProperty('--fall-drift', `${drift}px`);

    // Thời gian rơi ngẫu nhiên từ 2s đến 5s
    const duration = Math.random() * 3 + 2;
    lixi.style.animation = `fall ${duration}s linear forwards`;
    
    document.body.appendChild(lixi);

    // Xóa sau khi rơi xong
    setTimeout(() => {
        lixi.remove();
    }, duration * 1000);
}

function createFallingCoin() {
    const coin = document.createElement('div');
    coin.classList.add('falling-coin');
    
    // Vị trí ngang ngẫu nhiên
    coin.style.left = Math.random() * 100 + 'vw';
    
    // Vị trí bắt đầu cao thấp ngẫu nhiên
    coin.style.top = -(Math.random() * 150 + 50) + 'px';

    // Tạo độ lệch ngang ngẫu nhiên
    const drift = (Math.random() - 0.5) * 300;
    coin.style.setProperty('--fall-drift', `${drift}px`);

    // Thời gian rơi ngẫu nhiên
    const duration = Math.random() * 3 + 2;
    coin.style.animation = `fall ${duration}s linear forwards`;
    
    document.body.appendChild(coin);

    // Xóa sau khi rơi xong
    setTimeout(() => {
        coin.remove();
    }, duration * 1000);
}

// --- HIỆU ỨNG CÁNH HOA RƠI ---
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('falling-petal');
    
    // Vị trí xuất hiện: Xung quanh khu vực cây hoa mai (giữa màn hình)
    // Cây rộng 800px, tâm ở 50vw. Random trong khoảng -350px đến 350px từ tâm.
    const offset = (Math.random() - 0.5) * 700;
    petal.style.left = `calc(50vw + ${offset}px)`;
    
    // Xuất hiện ở độ cao ngẫu nhiên phía trên cây (khoảng 60% - 80% chiều cao màn hình từ trên xuống)
    const startTop = window.innerHeight - (Math.random() * 500 + 200); 
    petal.style.top = `${startTop}px`;

    // Độ lệch gió
    const drift = (Math.random() - 0.5) * 100;
    petal.style.setProperty('--fall-drift', `${drift}px`);

    // Thời gian rơi
    const duration = Math.random() * 3 + 2;
    petal.style.animation = `fall ${duration}s linear forwards`;

    document.body.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, duration * 1000);
}

// Tạo cánh hoa rơi liên tục
setInterval(createPetal, 300);

// --- ĐIỀU KHIỂN NHẠC ---
musicBtn.addEventListener('click', () => {
    if (musicEl.paused) {
        musicEl.play().catch(e => console.log("Lỗi phát nhạc:", e));
    } else {
        musicEl.pause();
    }
});

// Cập nhật trạng thái nút khi nhạc thay đổi (do click hoặc tự động phát)
musicEl.addEventListener('play', () => {
    musicBtn.innerText = "🔊 Tắt nhạc";
    musicBtn.style.background = "#ffd700";
    musicBtn.style.color = "#8b0000";
});
musicEl.addEventListener('pause', () => {
    musicBtn.innerText = "🔇 Bật nhạc";
    musicBtn.style.background = "rgba(139, 0, 0, 0.8)";
    musicBtn.style.color = "#ffd700";
});

// --- SỰ KIỆN TEST GIAO THỪA (ẨN TRONG BÁNH TÉT) ---
document.querySelector('.banh-tet').addEventListener('dblclick', () => {
    const password = prompt("Nhập mật khẩu kích hoạt:");
    if (password === "tombumdiboi0192837465") {
        handleNewYear();
    } else if (password !== null) {
        alert("Sai mật khẩu!");
    }
});

// --- CẬP NHẬT CÂU ĐỐI NGẪU NHIÊN ---
const coupletList = [
    { left: "Cung Chúc Tân Xuân", right: "Vạn Sự Như Ý" },
    { left: "Phúc Lộc Thọ Toàn", right: "Gia Đình Hạnh Phúc" },
    { left: "Tấn Tài Tấn Lộc", right: "Công Thành Danh Toại" },
    { left: "Xuân An Khang", right: "Đức Tài Như Ý" },
    { left: "Tết Đến Xuân Sang", right: "Phúc Lộc An Khang" }
];

function updateCouplets() {
    const pair = coupletList[Math.floor(Math.random() * coupletList.length)];
    const leftEl = document.querySelector('.couplet.left');
    const rightEl = document.querySelector('.couplet.right');

    // Giữ nguyên cấu trúc ảnh, chỉ thay đổi chữ và xuống dòng cho từng từ
    leftEl.innerHTML = pair.left.split(' ').join('<br>');
    
    rightEl.innerHTML = pair.right.split(' ').join('<br>');
}

// Chạy hàm khi tải trang
updateCouplets();

// --- SỰ KIỆN CLICK BÁNH CHƯNG (HIỆN CHỮ PHÚC) ---
document.querySelector('.banh-chung').addEventListener('click', () => {
    const phucEl = document.getElementById('phuc-dao');
    phucEl.classList.add('show');

    // Phát âm thanh Ting
    const tingAudio = document.getElementById('ting-sound');
    if (tingAudio) {
        tingAudio.currentTime = 0; // Tua lại đầu để phát ngay nếu click liên tục
        tingAudio.play().catch(e => console.log("Chưa có file âm thanh hoặc lỗi phát:", e));
    }
    
    // Ẩn sau 3 giây
    setTimeout(() => {
        phucEl.classList.remove('show');
    }, 3000);
});

// --- GAME BẦU CUA ---
const gameModal = document.getElementById('game-modal');
const gameBtn = document.getElementById('game-toggle');
const closeGameBtn = document.querySelector('.close-game');
const rollBtn = document.getElementById('roll-btn');
const diceEls = [document.getElementById('dice1'), document.getElementById('dice2'), document.getElementById('dice3')];
const boardItems = document.querySelectorAll('.board-item');

const bauCuaItems = [
    { id: 'nai', icon: '🦌', name: 'Nai' },
    { id: 'bau', icon: '🍐', name: 'Bầu' },
    { id: 'ga', icon: '🐓', name: 'Gà' },
    { id: 'ca', icon: '🐟', name: 'Cá' },
    { id: 'cua', icon: '🦀', name: 'Cua' },
    { id: 'tom', icon: '🦐', name: 'Tôm' }
];

// Mở/Đóng game
gameBtn.addEventListener('click', () => gameModal.style.display = 'flex');
closeGameBtn.addEventListener('click', () => gameModal.style.display = 'none');
gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) gameModal.style.display = 'none';
});

// Xử lý xốc đĩa
rollBtn.addEventListener('click', () => {
    // Reset trạng thái
    boardItems.forEach(item => item.classList.remove('active'));
    diceEls.forEach(dice => {
        dice.innerText = '❓';
        dice.classList.add('shaking');
    });
    rollBtn.disabled = true;

    // Sau 1 giây thì hiện kết quả
    setTimeout(() => {
        const results = [];
        diceEls.forEach(dice => {
            dice.classList.remove('shaking');
            const randomItem = bauCuaItems[Math.floor(Math.random() * bauCuaItems.length)];
            dice.innerText = randomItem.icon;
            results.push(randomItem.id);
        });

        // Highlight kết quả trên bàn cờ
        results.forEach(id => {
            document.querySelector(`.board-item[data-id="${id}"]`).classList.add('active');
        });
        rollBtn.disabled = false;
    }, 1000);
});

// --- GAME LÔ TÔ ---
const lotoModal = document.getElementById('loto-modal');
const lotoBtn = document.getElementById('loto-toggle');
const closeLotoBtn = document.getElementById('close-loto');

const lotoSetup = document.getElementById('loto-setup');
const lotoGameArea = document.getElementById('loto-game-area');
const startLotoBtn = document.getElementById('start-loto-btn');
const playerCountInput = document.getElementById('loto-player-count');
const playerBoardsContainer = document.getElementById('player-boards-container');

const drawLotoBtn = document.getElementById('draw-loto-btn');
const resetLotoBtn = document.getElementById('reset-loto-btn');
const currentLotoNumberEl = document.getElementById('current-loto-number');
const lotoBoard = document.getElementById('loto-board');

let lotoNumbers = [];
let isRolling = false;

// Init board
function initLotoBoard() {
    lotoBoard.innerHTML = '';
    for (let i = 1; i <= 90; i++) {
        const cell = document.createElement('div');
        cell.classList.add('loto-cell');
        cell.innerText = i;
        cell.dataset.number = i;
        lotoBoard.appendChild(cell);
    }
}
initLotoBoard();

function resetLoto() {
    lotoNumbers = Array.from({length: 90}, (_, i) => i + 1);
    currentLotoNumberEl.innerText = '--';
    document.querySelectorAll('.loto-cell').forEach(cell => cell.classList.remove('active'));
    document.querySelectorAll('.ticket-cell').forEach(cell => cell.classList.remove('marked'));
    
    // Quay về màn hình setup
    lotoSetup.style.display = 'block';
    lotoGameArea.style.display = 'none';
}

// Open/Close
lotoBtn.addEventListener('click', () => lotoModal.style.display = 'flex');
closeLotoBtn.addEventListener('click', () => lotoModal.style.display = 'none');
lotoModal.addEventListener('click', (e) => {
    if (e.target === lotoModal) lotoModal.style.display = 'none';
});

// --- LOGIC TẠO VÉ ---
function generateTicket() {
    // Tạo vé gồm 25 số ngẫu nhiên từ 1-90
    const numbers = [];
    while(numbers.length < 25) {
        const r = Math.floor(Math.random() * 90) + 1;
        if(numbers.indexOf(r) === -1) numbers.push(r);
    }
    // Sắp xếp tăng dần cho dễ nhìn
    return numbers.sort((a, b) => a - b);
}

startLotoBtn.addEventListener('click', () => {
    const count = parseInt(playerCountInput.value);
    if (count < 1) return alert("Số lượng người chơi phải ít nhất là 1");

    playerBoardsContainer.innerHTML = '';
    
    for(let i = 1; i <= count; i++) {
        const ticketNums = generateTicket();
        const ticketEl = document.createElement('div');
        ticketEl.classList.add('loto-ticket');
        
        let gridHtml = '<div class="ticket-grid">';
        ticketNums.forEach(num => {
            gridHtml += `<div class="ticket-cell" data-num="${num}">${num}</div>`;
        });
        gridHtml += '</div>';

        ticketEl.innerHTML = `<h4>Người chơi ${i}</h4>${gridHtml}`;
        playerBoardsContainer.appendChild(ticketEl);
    }

    // Reset trạng thái game
    lotoNumbers = Array.from({length: 90}, (_, i) => i + 1);
    currentLotoNumberEl.innerText = '--';
    document.querySelectorAll('.loto-cell').forEach(cell => cell.classList.remove('active'));

    // Chuyển màn hình
    lotoSetup.style.display = 'none';
    lotoGameArea.style.display = 'block';
});

// Draw Logic
drawLotoBtn.addEventListener('click', () => {
    if (lotoNumbers.length === 0 || isRolling) return;
    
    isRolling = true;
    drawLotoBtn.disabled = true;

    // Animation effect
    let count = 0;
    const interval = setInterval(() => {
        const randomTemp = Math.floor(Math.random() * 90) + 1;
        currentLotoNumberEl.innerText = randomTemp;
        count++;
        if (count > 20) {
            clearInterval(interval);
            const randomIndex = Math.floor(Math.random() * lotoNumbers.length);
            const finalNumber = lotoNumbers[randomIndex];
            lotoNumbers.splice(randomIndex, 1);
            currentLotoNumberEl.innerText = finalNumber;
            
            // Đánh dấu trên bảng nhà cái
            const cell = document.querySelector(`.loto-cell[data-number="${finalNumber}"]`);
            if (cell) cell.classList.add('active');

            // Đánh dấu trên vé người chơi
            document.querySelectorAll(`.ticket-cell[data-num="${finalNumber}"]`).forEach(tCell => {
                tCell.classList.add('marked');
            });

            // --- KIỂM TRA CHIẾN THẮNG (KINH) ---
            const winners = [];
            document.querySelectorAll('.loto-ticket').forEach(ticket => {
                const total = ticket.querySelectorAll('.ticket-cell').length;
                const marked = ticket.querySelectorAll('.ticket-cell.marked').length;
                if (total > 0 && total === marked) {
                    winners.push(ticket.querySelector('h4').innerText);
                }
            });

            if (winners.length > 0) {
                fireworksActive = true; // Bắn pháo hoa
                setTimeout(() => alert(`KINH! ${winners.join(', ')} đã chiến thắng!`), 100);
            }

            isRolling = false;
            drawLotoBtn.disabled = false;
        }
    }, 50);
});

resetLotoBtn.addEventListener('click', () => {
    if(confirm("Bạn có chắc muốn chơi lại từ đầu không?")) resetLoto();
});

// --- GAME XIN XĂM ---
const xinXamModal = document.getElementById('xin-xam-modal');
const xinXamBtn = document.getElementById('xin-xam-toggle');
const closeXinXamBtn = document.getElementById('close-xin-xam');
const shakeXamBtn = document.getElementById('shake-xam-btn');
const xamContainer = document.getElementById('xam-container');
const xamResult = document.getElementById('xam-result');
const xamTitle = document.getElementById('xam-title');
const xamContent = document.getElementById('xam-content');

const fortunes = [
    { title: "Đại Cát", content: "Năm nay tài lộc dồi dào, công danh thăng tiến, vạn sự như ý. Tiền vào như nước sông Đà." },
    { title: "Thượng Cát", content: "Gia đạo bình an, quý nhân phù trợ, gặp dữ hóa lành. Mọi việc hanh thông." },
    { title: "Trung Bình", content: "Mọi việc bình ổn, cần kiên nhẫn chờ thời cơ, chớ vội vàng hấp tấp mà hỏng việc lớn." },
    { title: "Tiểu Cát", content: "Có lộc nhỏ, tình duyên khởi sắc, sức khỏe dồi dào. Niềm vui đến từ những điều giản dị." },
    { title: "Hạ Hạ", content: "Cẩn trọng lời ăn tiếng nói, đề phòng tiểu nhân, giữ gìn sức khỏe. Nên làm việc thiện tích đức." },
    { title: "Thượng Thượng", content: "Cầu được ước thấy, thi cử đỗ đạt, kinh doanh phát tài. Một năm rực rỡ đang chờ đón." },
    { title: "Quẻ Tình Duyên", content: "Hoa đào nở rộ, người độc thân sớm gặp ý trung nhân, người có đôi thêm phần gắn kết." },
    { title: "Quẻ Tài Lộc", content: "Công việc làm ăn thuận lợi, có cơ hội thăng chức tăng lương. Chú ý quản lý chi tiêu." }
];

if (xinXamBtn) {
    xinXamBtn.addEventListener('click', () => {
        xinXamModal.style.display = 'flex';
        xamResult.style.display = 'none';
    });
}
if (closeXinXamBtn) {
    closeXinXamBtn.addEventListener('click', () => xinXamModal.style.display = 'none');
}
if (xinXamModal) {
    xinXamModal.addEventListener('click', (e) => {
        if (e.target === xinXamModal) xinXamModal.style.display = 'none';
    });
}

function shakeXam() {
    if (shakeXamBtn.disabled) return;
    
    shakeXamBtn.disabled = true;
    xamResult.style.display = 'none';
    xamContainer.classList.add('shaking-xam');

    // Lắc trong 2 giây
    setTimeout(() => {
        xamContainer.classList.remove('shaking-xam');
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        
        xamTitle.innerText = randomFortune.title;
        xamContent.innerText = randomFortune.content;
        
        // Phát âm thanh ting khi ra quẻ
        const tingAudio = document.getElementById('ting-sound');
        if (tingAudio) {
            tingAudio.currentTime = 0;
            tingAudio.play().catch(e => {});
        }

        xamResult.style.display = 'block';
        shakeXamBtn.disabled = false;
    }, 2000); 
}

if (shakeXamBtn) {
    shakeXamBtn.addEventListener('click', shakeXam);
}

// Cho phép click vào ống xăm để lắc
if (xamContainer) {
    xamContainer.addEventListener('click', shakeXam);
}

// --- GAME THẢ ĐÈN TRỜI ---
const lanternModal = document.getElementById('lantern-modal');
const lanternBtn = document.getElementById('lantern-toggle');
const closeLanternBtn = document.getElementById('close-lantern');
const releaseLanternBtn = document.getElementById('release-lantern-btn');
const wishNameInput = document.getElementById('wish-name');
const wishContentInput = document.getElementById('wish-content');

if (lanternBtn) {
    lanternBtn.addEventListener('click', () => {
        lanternModal.style.display = 'flex';
    });
}
if (closeLanternBtn) {
    closeLanternBtn.addEventListener('click', () => lanternModal.style.display = 'none');
}
if (lanternModal) {
    lanternModal.addEventListener('click', (e) => {
        if (e.target === lanternModal) lanternModal.style.display = 'none';
    });
}

function createLantern(name, wish) {
    const lantern = document.createElement('div');
    lantern.classList.add('flying-lantern');
    
    // Random vị trí xuất phát theo chiều ngang
    const startLeft = Math.random() * 80 + 10; // 10% - 90%
    lantern.style.left = `${startLeft}vw`;

    lantern.innerHTML = `
        <div class="lantern-wish">${wish}</div>
        <div class="lantern-name">${name}</div>
    `;

    document.body.appendChild(lantern);

    // Xóa sau khi bay xong (20s)
    setTimeout(() => {
        lantern.remove();
    }, 20000);
}

if (releaseLanternBtn) {
    releaseLanternBtn.addEventListener('click', () => {
        const name = wishNameInput.value.trim() || "Bạn";
        const wish = wishContentInput.value.trim() || "Vạn sự như ý";

        createLantern(name, wish);
        
        // Đóng modal
        lanternModal.style.display = 'none';
        
        // Reset input
        wishNameInput.value = '';
        wishContentInput.value = '';

        // Phát âm thanh nhẹ
        const tingAudio = document.getElementById('ting-sound');
        if (tingAudio) {
            tingAudio.currentTime = 0;
            tingAudio.play().catch(e => {});
        }
    });
}

// --- TÍNH NĂNG HÁI LỘC ---
const lixiTreeItems = document.querySelectorAll('.lixi-tree');
const wishes = [
    "Vạn sự như ý",
    "An khang thịnh vượng",
    "Phát tài phát lộc",
    "Sức khỏe dồi dào",
    "Tiền vào như nước",
    "Gia đình hạnh phúc",
    "Công thành danh toại",
    "Tấn tài tấn lộc",
    "May mắn cả năm",
    "Sự nghiệp thăng tiến"
];

// Modal Lời Chúc
const wishModal = document.getElementById('wish-modal');
const closeWishBtn = document.getElementById('close-wish');
const wishContentText = document.getElementById('wish-content-text');

if (closeWishBtn) {
    closeWishBtn.addEventListener('click', () => wishModal.style.display = 'none');
}
if (wishModal) {
    wishModal.addEventListener('click', (e) => {
        if (e.target === wishModal) wishModal.style.display = 'none';
    });
}

lixiTreeItems.forEach(item => {
    item.addEventListener('click', function() {
        if (this.classList.contains('picked')) return;
        
        this.classList.add('picked');
        
        // Hiệu ứng âm thanh
        const tingAudio = document.getElementById('ting-sound');
        if (tingAudio) {
            tingAudio.currentTime = 0;
            tingAudio.play().catch(e => {});
        }

        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        
        // Hiển thị lên khung thư pháp thay vì alert
        if (wishContentText && wishModal) {
            wishContentText.innerText = randomWish;
            wishModal.style.display = 'flex';
        }
    });
});

// --- GAME HỨNG XU ---
const catchCoinModal = document.getElementById('catch-coin-modal');
const catchCoinBtn = document.getElementById('catch-coin-toggle');
const closeCatchCoinBtn = document.getElementById('close-catch-coin');
const startCatchCoinBtn = document.getElementById('start-catch-coin-btn');
const catchCoinCanvas = document.getElementById('catch-coin-canvas');
const catchCoinScoreEl = document.getElementById('catch-coin-score');
const catchCoinCtx = catchCoinCanvas ? catchCoinCanvas.getContext('2d') : null;

let catchCoinGameRunning = false;
let catchCoinScore = 0;
let catchCoinItems = [];
let catchCoinPlayerX = catchCoinCanvas ? catchCoinCanvas.width / 2 : 0;
let catchCoinAnimationId;

// Trạng thái bàn phím
const keys = {
    a: false,
    d: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Player (Túi tiền)
const playerWidth = 60;
let playerY = catchCoinCanvas ? catchCoinCanvas.height - 160 : 480;

function resizeCatchCoin() {
    if (catchCoinCanvas) {
        catchCoinCanvas.width = window.innerWidth;
        catchCoinCanvas.height = window.innerHeight;
        playerY = catchCoinCanvas.height - 160; // Đưa lên cao hơn để dễ nhìn (cách đáy 160px)
        
        // Vẽ ngay túi tiền để người chơi thấy vị trí
        if (!catchCoinGameRunning) {
            catchCoinPlayerX = catchCoinCanvas.width / 2; // Căn giữa
            drawStaticGame();
        }
    }
}
window.addEventListener('resize', resizeCatchCoin);

// Xử lý di chuyển (Chuột & Cảm ứng)
function updatePlayerPosition(clientX) {
    const rect = catchCoinCanvas.getBoundingClientRect();
    const scaleX = catchCoinCanvas.width / rect.width; // Tỉ lệ scale nếu canvas bị co lại trên mobile
    let x = (clientX - rect.left) * scaleX;
    
    // Giới hạn trong khung
    if (x < playerWidth / 2) x = playerWidth / 2;
    if (x > catchCoinCanvas.width - playerWidth / 2) x = catchCoinCanvas.width - playerWidth / 2;
    catchCoinPlayerX = x;
}

if (catchCoinCanvas) {
    // Sử dụng Pointer Events để hỗ trợ cả chuột và cảm ứng mượt mà
    catchCoinCanvas.addEventListener('pointerdown', (e) => {
        updatePlayerPosition(e.clientX);
        if (!catchCoinGameRunning) drawStaticGame(); // Di chuyển được ngay cả khi chưa start
    });
    catchCoinCanvas.addEventListener('pointermove', (e) => {
        updatePlayerPosition(e.clientX);
        if (!catchCoinGameRunning) drawStaticGame();
    });
    
    // Ngăn chặn hành vi mặc định của cảm ứng (cuộn, zoom)
    catchCoinCanvas.addEventListener('touchstart', (e) => e.preventDefault(), {passive: false});
    catchCoinCanvas.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
}

// Hàm vẽ tĩnh (khi chưa bấm Start)
function drawStaticGame() {
    if (!catchCoinCtx) return;
    catchCoinCtx.clearRect(0, 0, catchCoinCanvas.width, catchCoinCanvas.height);
    catchCoinCtx.font = "40px Arial";
    catchCoinCtx.textAlign = "center";
    catchCoinCtx.fillText("💰", catchCoinPlayerX, playerY + 35);
}

function spawnItem() {
    if (Math.random() < 0.03) { // Tỉ lệ xuất hiện
        const type = Math.random() < 0.8 ? 'coin' : 'bomb'; // 80% xu, 20% pháo
        catchCoinItems.push({
            x: Math.random() * (catchCoinCanvas.width - 30) + 15,
            y: -30,
            type: type,
            speed: Math.random() * 2 + 2
        });
    }
}

function updateCatchCoinGame() {
    if (!catchCoinGameRunning) return;
    if (!catchCoinCtx) return;

    catchCoinCtx.clearRect(0, 0, catchCoinCanvas.width, catchCoinCanvas.height);

    // Xử lý di chuyển bằng phím (A/D hoặc Mũi tên)
    const moveSpeed = 10;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        catchCoinPlayerX -= moveSpeed;
    }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        catchCoinPlayerX += moveSpeed;
    }
    
    // Giới hạn trong khung khi dùng phím
    if (catchCoinPlayerX < playerWidth / 2) catchCoinPlayerX = playerWidth / 2;
    if (catchCoinPlayerX > catchCoinCanvas.width - playerWidth / 2) catchCoinPlayerX = catchCoinCanvas.width - playerWidth / 2;

    // Vẽ Người chơi (Túi tiền)
    catchCoinCtx.font = "40px Arial";
    catchCoinCtx.textAlign = "center";
    catchCoinCtx.fillText("💰", catchCoinPlayerX, playerY + 35);

    // Tạo vật phẩm
    spawnItem();

    // Cập nhật & Vẽ vật phẩm
    for (let i = catchCoinItems.length - 1; i >= 0; i--) {
        let item = catchCoinItems[i];
        item.y += item.speed;

        // Vẽ
        catchCoinCtx.font = "30px Arial";
        if (item.type === 'coin') catchCoinCtx.fillText("🟡", item.x, item.y);
        else catchCoinCtx.fillText("🧨", item.x, item.y);

        // Xử lý chạm đáy
        if (item.y > catchCoinCanvas.height) {
            catchCoinItems.splice(i, 1);
            continue;
        }

        // Xử lý va chạm
        if (item.y > playerY && item.y < playerY + 50 &&
            item.x > catchCoinPlayerX - 30 && item.x < catchCoinPlayerX + 30) {
            
            if (item.type === 'coin') {
                catchCoinScore++;
                catchCoinScoreEl.innerText = catchCoinScore;
            } else {
                // Chạm pháo -> Game Over
                catchCoinGameRunning = false;
                alert("Bùm! Bạn đã chạm phải pháo nổ.\nĐiểm của bạn: " + catchCoinScore);
                startCatchCoinBtn.style.display = 'inline-block';
                startCatchCoinBtn.innerText = "Chơi Lại";
                return;
            }
            catchCoinItems.splice(i, 1);
        }
    }

    catchCoinAnimationId = requestAnimationFrame(updateCatchCoinGame);
}

// Sự kiện nút bấm
catchCoinBtn.addEventListener('click', () => {
    catchCoinModal.style.display = 'flex';
    resizeCatchCoin(); // Cập nhật kích thước và vẽ túi tiền ngay
});
closeCatchCoinBtn.addEventListener('click', () => {
    catchCoinModal.style.display = 'none';
    catchCoinGameRunning = false;
});
startCatchCoinBtn.addEventListener('click', () => {
    catchCoinScore = 0;
    catchCoinScoreEl.innerText = '0';
    catchCoinItems = [];
    catchCoinGameRunning = true;
    startCatchCoinBtn.style.display = 'none';
    updateCatchCoinGame();
});