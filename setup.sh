mkdir -p ~/audio-server && cd ~/audio-server

cat << 'EOF' > cookies.txt
# Netscape HTTP Cookie File
# https://curl.haxx.se/rfc/cookie_spec.html
# This is a generated file! Do not edit.

.youtube.com	TRUE	/	FALSE	1797346912	HSID	ABx8Th7pe4H3zBLnb
.youtube.com	TRUE	/	TRUE	1797346912	SSID	AcbhkdPi5v4VPF8iC
.youtube.com	TRUE	/	FALSE	1797346912	APISID	gV67DfCGoBdGwiLx/As7JkQgavlSPemlxt
.youtube.com	TRUE	/	TRUE	1797346912	SAPISID	BkDchmJmXgA3aTFo/A5XaXmdbXnZRrvbGn
.youtube.com	TRUE	/	TRUE	1797346912	__Secure-1PAPISID	BkDchmJmXgA3aTFo/A5XaXmdbXnZRrvbGn
.youtube.com	TRUE	/	TRUE	1797346912	__Secure-3PAPISID	BkDchmJmXgA3aTFo/A5XaXmdbXnZRrvbGn
.youtube.com	TRUE	/	TRUE	1798419864	PREF	f4=4000000&f6=40000000&tz=Asia.Calcutta&f7=100&f5=30000
.youtube.com	TRUE	/	TRUE	1791203262	__Secure-BUCKET	CPEB
www.youtube.com	FALSE	/	FALSE	1798419864	ext_name	ojplmecpdpgccookcobabopnaifgidhf
.youtube.com	TRUE	/	TRUE	1796476314	LOGIN_INFO	AFmmF2swRgIhAN-ZXTxsq8v2oqkDQs1asBz18S6_0cUoVRq6jz1gfVmoAiEAxD7GU9l5NHtSWvMOu8T4slJUgEQgQ2AjrMUOS8NRA4g:QUQ3MjNmd2VnUVVMVF9ubmhZaXVaMThOUVdteXZobTAxTWdnZE90NG9SWmFab1FoS21aVDlrYklyMnVnTUdSMlBZbGYteC1DWEtldGpoeWxfbGFQTG1DSGEyS2V4YVFhcTFxakNIUWwwN2RkcnZKR21EM3YtZmlwTjJJZDRIblowR1p0TUN3Y1ZfQkZDYVRQbV9ycVVBZDMtVGxSNDBVZC13
.youtube.com	TRUE	/	FALSE	1797346912	SID	g.a000_Ai3McK95SOo1STpffw2HeFMpYbn2KOIAlaXwzVC-cGGNNLf2RIXCXkEei7GCJkTrsMPVAACgYKAUISARASFQHGX2MixB0QYqEyuWB8vODNtsv0MBoVAUF8yKro08nittm7IqiQ1lmqMWYV0076
.youtube.com	TRUE	/	TRUE	1797346912	__Secure-1PSID	g.a000_Ai3McK95SOo1STpffw2HeFMpYbn2KOIAlaXwzVC-cGGNNLfpDsyWomNThpfYqVOutjmQQACgYKAbkSARASFQHGX2Mi0PuiDEmlXbNft0GA5dOTUBoVAUF8yKoNJakBlTKOSHz_1zvtoslo0076
.youtube.com	TRUE	/	TRUE	1797346912	__Secure-3PSID	g.a000_Ai3McK95SOo1STpffw2HeFMpYbn2KOIAlaXwzVC-cGGNNLf2910D_dN6Pg_C2beqlHScgACgYKAdESARASFQHGX2MiS6SH9utroEaLGoszxRSZuhoVAUF8yKp9qf273CZ-RCg99cAC-CxQ0076
.youtube.com	TRUE	/	TRUE	1797596161	__Secure-YENID	16.YTE=mR1_6bo-MtDfi83-K-ZH14EjEwqYuLFXq5qJpqCxtFu0-lXpOpVe_wRLvFeA4ybV0rPu5pMzOJvhFUszhaeLusy3KOvvzX8NUHrGqjiQUM8OGwPn1p6ET47Hqcy7q-P0aQ6eJ0_in4iY7vdOc7dT5zp4kIL-ll3tMsFOP2Hstjqno2CsR8A3Hma9qbGfmxx5MC4qLJEsCkuGTNZR50tTWlZztbGELIOoQ0IP0IJWbQJODw_nhQfqNP30P3l8_AQvuDKZquSQQgvmWPNh4-iecxgNYLg-W1Bc-_zhNKzVs0kK-v0UGGqqCS9KVmvDyOv1KLuyZFBr8KpD2fMffQR2tw
.youtube.com	TRUE	/	TRUE	0	wide	0
.youtube.com	TRUE	/	TRUE	1798419867	__Secure-1PSIDTS	sidts-CjIByojQU5SkL46eEoC43_v-R_yLE_-4E7cEe7yMDIQmHVAsanpfrw1OOoRsVI4higYRrxAA
.youtube.com	TRUE	/	TRUE	1798419867	__Secure-3PSIDTS	sidts-CjIByojQU5SkL46eEoC43_v-R_yLE_-4E7cEe7yMDIQmHVAsanpfrw1OOoRsVI4higYRrxAA
.youtube.com	TRUE	/	FALSE	1798419869	SIDCC	AKEyXzVpPAgt-N4iljIJV98lnLA4snWVvyhtv_Y3biRoAxjdPbceBl6EDpivDo3tGYAvk7b_5h2_
.youtube.com	TRUE	/	TRUE	1798419869	__Secure-1PSIDCC	AKEyXzUrHbWmPEzvnw4GRh0DfVYg1mJukMReSm0R_sKJXW4R7scx2KbqR35-s5YNAfgOZSCi70Zm
.youtube.com	TRUE	/	TRUE	1798419869	__Secure-3PSIDCC	AKEyXzVJfKRohwQ0nLknNqBhGLRWR4roaR_WX1o1XfLYxoi2ZCfL73ooSnZFyAgM50W0rOZfSG45
.youtube.com	TRUE	/	TRUE	1790974798	VISITOR_INFO1_LIVE	Tj-RJc8sgbI
.youtube.com	TRUE	/	TRUE	1790974798	VISITOR_PRIVACY_METADATA	CgJJThIEGgAgXA%3D%3D
.youtube.com	TRUE	/	TRUE	1796504305	__Secure-YNID	19.YT=jIl0zhllhEkul0BEO2vv53IpMXoXLdm52P-Spcy7JvAxTZ_i1sknfA3tHe3X4kmVwPRfQDOa_-hdm1UDSP_h9Mid0dpKHdTa5MZW7XLKet5HumWbeJXdG9Yeu3EB_8-y-Z5KWBqq4RBx5JOJsLnKhYGdtpnBMrH9kETUVA0LLZWVuyLvn1pklX6-jdaxzXZLCUgOcVUlxNgHnDrSbGDeIIh3otaC_v9VaImVibNPk7p9S_D5Iy1kqPzTVipI-mLVZho4lbNggrUcNyw6Sr_cUpF6PtBsAFYSKT_nnbIqFVn8e5NFLB7wC2cRtwIZuxBYA2O9MRUXJz9SSG7PS8uhGg
.youtube.com	TRUE	/	TRUE	1796504305	__Secure-ROLLOUT_TOKEN	CJWN6qrAvc2dbhCg0_GpzdeTAxiBxpWsxPiUAw%3D%3D
.youtube.com	TRUE	/	TRUE	1798419863	VISITOR_INFO1_LIVE	Fgnqv4JXEVQ
.youtube.com	TRUE	/	TRUE	1798419863	VISITOR_PRIVACY_METADATA	CgJJThIEGgAgVw%3D%3D
.youtube.com	TRUE	/	TRUE	0	YSC	Bq3KxBz4ZXs
.youtube.com	TRUE	/	TRUE	1798370705	__Secure-YNID	19.YT=M7_V8M6swwoykdpVgEod8vH1xn_uIvlOPauc6k86l2HrTP7Jl90C04ZUPjtP8XNoTQFXiw8Ldyhmei7lL2wXqg_Ra4RRFCAbQW3RF_pNQPsdZyVgP_86ohQv18DTtYzGG8lwjCvJ_K0YCgc24YuX9uO4SOLNPFBVfDHnfLj7PVYBR0dHkSWN3T9BawdRum8uvug4ZgjoAr0v3HZZm4hTcrXJvwqp0CYMgOXuZUiCalUnyC2gVnkPjx4jB527dmCX3rQdDMgs9JIU1cPNpVT3y4UnIXDuunMrJufTeAeS1RJnUC7e28V6v0bXXC380RhX5rT0vNgumxaz3xkXd9pCLA
.youtube.com	TRUE	/	TRUE	1798370705	__Secure-ROLLOUT_TOKEN	CL7jrdrdq-qmqAEQ9t_ozIbRjQMYmcfvnu2ulQM%3D
EOF

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
        extractorArgs: 'youtube:player_client=android',
        cookies: 'cookies.txt'
    }, { stdio: ['ignore', 'pipe', 'pipe'] });
    subprocess.stdout.pipe(res);
    subprocess.stderr.on('data', d => console.log('ERROR:', d.toString()));
});
app.listen(3000, () => console.log('Audio Server running on port 3000'));
EOF

sudo ufw allow 3000/tcp
npx pm2 restart all
