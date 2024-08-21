const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 간단한 데이터베이스 역할을 할 객체 (실제로는 MongoDB, MySQL 등을 사용할 수 있음)
let rooms = [];
let gallery = [];

// 라우트: 홈 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 라우트: 방 생성
app.post('/create-room', (req, res) => {
    const { teacherKey, roomTitle } = req.body;

    if (teacherKey === '1235' && roomTitle) {
        const roomPassword = Math.floor(1000 + Math.random() * 9000).toString(); // 4자리 암호 생성
        const newRoom = { title: roomTitle, password: roomPassword };
        rooms.push(newRoom);
        res.json({ success: true, roomPassword });
    } else {
        res.json({ success: false, message: 'Invalid teacher key or room title.' });
    }
});

// 라우트: 방 목록 가져오기
app.get('/rooms', (req, res) => {
    res.json(rooms);
});

// 라우트: 그림 저장
app.post('/submit-drawing', (req, res) => {
    const { image, roomTitle } = req.body;
    gallery.push({ image, roomTitle, ratings: [] });
    res.json({ success: true });
});

// 라우트: 갤러리 가져오기
app.get('/gallery', (req, res) => {
    res.json(gallery);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
