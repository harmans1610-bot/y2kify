cat << 'EOF' > server.js
const express = require('express');
const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');
const app = express();
app.get('/api/stream', async (req, res) => {
    try {
        const results = await ytSearch(req.query.q);
        res.json({
            videoId: results.videos[0].videoId,
            title: results.videos[0].title,
            duration: results.videos[0].seconds,
            streamUrl: `/api/proxy-stream?v=${results.videos[0].videoId}`
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/proxy-stream', (req, res) => {
    const subprocess = youtubedl.exec(`https://www.youtube.com/watch?v=${req.query.v}`, {
        output: '-', format: 'bestaudio/best', noCheckCertificates: true,
        cookies: 'cookies.txt'
    }, { stdio: ['ignore', 'pipe', 'pipe'] });
    subprocess.stdout.pipe(res);
    subprocess.stderr.on('data', d => console.log('ERROR:', d.toString()));
});
app.listen(3000, () => console.log('Audio Server running on port 3000'));
EOF
npx pm2 restart all
