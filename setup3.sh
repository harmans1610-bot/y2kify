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
    
    let errorLog = '';
    subprocess.stderr.on('data', d => errorLog += d.toString());
    
    subprocess.stdout.on('data', d => {
        if (!res.headersSent) {
            res.writeHead(200, {
                'Content-Type': 'audio/mp4',
                'Transfer-Encoding': 'chunked'
            });
        }
        res.write(d);
    });
    
    subprocess.on('close', code => {
        if (code !== 0 && !res.headersSent) {
            console.error('Crash log:', errorLog);
            res.status(500).send(errorLog);
        } else {
            res.end();
        }
    });
});
app.listen(3000, () => console.log('Audio Server running on port 3000'));
EOF
npx pm2 restart all
