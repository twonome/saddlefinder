const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정: 다른 도메인에서의 요청을 허용하기 위해 설정합니다.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 클라이언트의 요청에 따라 URL에서 이미지를 파싱하여 반환하는 엔드포인트를 설정합니다.
app.get('/get-image', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const imageUrl = $('meta[property="og:image"]').attr('content');

        if (imageUrl) {
            res.json({ imageUrl });
        } else {
            res.status(404).send('Image not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching the image: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
