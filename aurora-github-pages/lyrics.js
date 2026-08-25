(() => {
  const frame = document.querySelector('iframe');
  const demoLyrics = {
    '晨光未醒': ['凌晨的城市还没醒来', '耳机里藏着微小星海', '慢一点走吧 不必追赶', '让此刻的光停在窗台', '风从远方轻轻吹来'],
    '慢慢靠近': ['在喧闹里听见你的呼吸', '每一步都靠近一点距离', '不急着说出答案', '让旋律替我们保密', '在夜色里慢慢靠近'],
    'Paper Planes': ['Fold a little hope into the blue', 'Leave the sky a message just for you', 'Every quiet corner knows the way', 'Paper planes can carry us away']
  };
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    const sheet = doc.querySelector('#sheet');
    const source = doc.querySelector('#source');
    const title = doc.querySelector('#title');
    if (!sheet || !source || !title) return;
    const style = doc.createElement('style');
    style.textContent = `.big{cursor:pointer}.lyrics-panel{display:none;position:absolute;inset:0;background:#17141eea;backdrop-filter:blur(16px);padding:58px 28px 30px;z-index:12}.lyrics-panel.open{display:block}.lyrics-panel h3{margin:0 0 18px;font-size:22px}.lyrics-panel button{position:absolute;right:19px;top:48px;border:0;background:transparent;color:#fff;font-size:24px}.lyrics-list{height:72vh;overflow:auto;padding:12px 0 120px;scroll-behavior:smooth}.lyrics-list p{margin:0;padding:14px 0;color:#9e9aa8;font-size:19px;font-weight:600;line-height:1.4}.lyrics-list p.current{color:#c9ff57;font-size:23px}.lyrics-note{color:#a8a4af;line-height:1.55;font-size:15px;padding-top:60px}.lyrics-note b{color:#c9ff57}`;
    doc.head.appendChild(style);
    const panel = doc.createElement('section'); panel.className = 'lyrics-panel';
    panel.innerHTML = '<button aria-label="关闭歌词">×</button><h3>歌词</h3><div class="lyrics-list"></div>';
    sheet.appendChild(panel);
    const list = panel.querySelector('.lyrics-list');
    let tick, position = 0;
    function renderLyrics() {
      clearInterval(tick); position = 0;
      const lines = demoLyrics[title.textContent];
      if (!lines) {
        list.innerHTML = '<p class="lyrics-note"><b>Apple Music 歌曲</b><br><br>为尊重版权，此处不展示或复制第三方完整歌词。点击播放器的“···”菜单，选择“在 Apple Music 中打开”即可查看官方提供的歌词。</p>';
        return;
      }
      list.innerHTML = lines.map((line, i) => `<p class="${i === 0 ? 'current' : ''}">${line}</p>`).join('');
      tick = setInterval(() => {
        const all = [...list.querySelectorAll('p')];
        all[position].classList.remove('current'); position = (position + 1) % all.length;
        all[position].classList.add('current'); all[position].scrollIntoView({behavior:'smooth',block:'center'});
      }, 3600);
    }
    doc.querySelector('#big').onclick = () => { renderLyrics(); panel.classList.add('open'); };
    panel.querySelector('button').onclick = () => { panel.classList.remove('open'); clearInterval(tick); };
    doc.addEventListener('click', event => {
      if (event.target.closest('[data-i],#prev,#next')) setTimeout(() => { if (panel.classList.contains('open')) renderLyrics(); }, 40);
    });
  });
})();
