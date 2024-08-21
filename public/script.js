document.addEventListener('DOMContentLoaded', () => {
    const roomListSection = document.getElementById('room-list-section');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const createRoomSection = document.getElementById('create-room-section');
    const teacherKeyInput = document.getElementById('teacherKey');
    const roomTitleInput = document.getElementById('roomTitle');
    const confirmCreateRoomBtn = document.getElementById('confirmCreateRoomBtn');
    const roomPasswordDisplay = document.getElementById('roomPasswordDisplay');
    const backToListBtn = document.getElementById('backToListBtn');
    const roomList = document.getElementById('roomList');
    const drawingSection = document.getElementById('drawing-section');
    const roomTitleDisplay = document.getElementById('roomTitleDisplay');
    const drawCanvas = document.getElementById('drawCanvas');
    const submitBtn = document.getElementById('submitBtn');
    const gallerySection = document.getElementById('gallery-section');
    const gallery = document.getElementById('gallery');
    const ctx = drawCanvas.getContext('2d');

    let currentRoom = null;

    // 방 만들기 버튼 클릭
    createRoomBtn.addEventListener('click', () => {
        roomListSection.style.display = 'none';
        createRoomSection.style.display = 'block';
    });

    // 방 생성 확인 버튼 클릭
    confirmCreateRoomBtn.addEventListener('click', () => {
        const teacherKey = teacherKeyInput.value;
        const roomTitle = roomTitleInput.value;

        fetch('/create-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherKey, roomTitle })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                roomPasswordDisplay.innerText = `방 암호: ${data.roomPassword}`;
                roomPasswordDisplay.style.display = 'block';
                updateRoomList();
            } else {
                alert(data.message);
            }
        });
    });

    // 방 목록으로 돌아가기
    backToListBtn.addEventListener('click', () => {
        teacherKeyInput.value = '';
        roomTitleInput.value = '';
        roomPasswordDisplay.style.display = 'none';
        createRoomSection.style.display = 'none';
        roomListSection.style.display = 'block';
        updateRoomList();
    });

    // 방 목록 업데이트
    function updateRoomList() {
        fetch('/rooms')
            .then(response => response.json())
            .then(data => {
                roomList.innerHTML = '';
                data.forEach((room, index) => {
                    const roomButton = document.createElement('button');
                    roomButton.innerText = room.title;
                    roomButton.className = 'room-item';
                    roomButton.addEventListener('click', () => joinRoom(room, index));
                    roomList.appendChild(roomButton);
                });
            });
    }

    // 방 접속
    function joinRoom(room) {
        const enteredPassword = prompt('방 암호를 입력하세요:');

        if (enteredPassword === room.password) {
            currentRoom = room;
            roomTitleDisplay.innerText = room.title;
            roomListSection.style.display = 'none';
            drawingSection.style.display = 'block';
        } else {
            alert('잘못된 암호입니다.');
        }
    }

    // 그림 그리기 로직
    let drawing = false;
    drawCanvas.addEventListener('mousedown', () => { drawing = true; });
    drawCanvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
    drawCanvas.addEventListener('mousemove', draw);

    function draw(event) {
        if (!drawing) return;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        ctx.lineTo(event.clientX - drawCanvas.offsetLeft, event.clientY - drawCanvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.clientX - drawCanvas.offsetLeft, event.clientY - drawCanvas.offsetTop);
    }

    // 그림 제출
    submitBtn.addEventListener('click', () => {
        const image = drawCanvas.toDataURL('image/png');

        fetch('/submit-drawing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image, roomTitle: currentRoom.title })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadGallery();
            }
        });

        drawingSection.style.display = 'none';
        gallerySection.style.display = 'block';
    });

    // 갤러리 로드
    function loadGallery() {
        fetch('/gallery')
            .then(response => response.json())
            .then(data => {
                gallery.innerHTML = '';
                data.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'image-card';

                    const img = document.createElement('img');
                    img.src = item.image;
                    img.style.width = '200px';
                    img.style.height = '200px';
                    img.style.margin = '10px';

                    const scoreDisplay = document.createElement('div');
                    scoreDisplay.className = 'score-display';
                    scoreDisplay.innerText = `점수: 0`;

                    const rateButton = document.createElement('button');
                    rateButton.innerText = '평가';
                    rateButton.className = 'rate-button';
                    rateButton.addEventListener('click', () => showRatingOptions(card));

                    card.appendChild(scoreDisplay);
                    card.appendChild(img);
                    card.appendChild(rateButton);
                    gallery.appendChild(card);
                });
            });
    }

    function showRatingOptions(card) {
        if (card.getAttribute('data-rated') === 'true') {
            return;
        }

        const rateButton = card.querySelector('.rate-button');
        rateButton.style.display = 'none';

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating-options';

        for (let i = 1; i <= 5; i++) {
            const rateOptionButton = document.createElement('button');
            rateOptionButton.innerText = i;
            rateOptionButton.addEventListener('click', () => rateImage(card, i));
            ratingDiv.appendChild(rateOptionButton);
        }

        card.appendChild(ratingDiv);
    }

    function rateImage(card, score) {
        let ratings = card.getAttribute('data-ratings') ? JSON.parse(card.getAttribute('data-ratings')) : [];
        ratings.push(score);
        card.setAttribute('data-ratings', JSON.stringify(ratings));

        const avgScore = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;
        card.querySelector('.score-display').innerText = `점수: ${avgScore.toFixed(2)}`;

        const rateButton = card.querySelector('.rate-button');
        rateButton.innerText = '평가 완료';
        rateButton.style.display = 'block';
        rateButton.disabled = true;
        card.setAttribute('data-rated', 'true');

        card.querySelector('.rating-options').remove();
    }

    updateRoomList();
});
