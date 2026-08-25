(() => {
  const clientId = '03bebaa2';
  const frame = document.querySelector('iframe');
  frame.addEventListener('load', async () => {
    const d = frame.contentDocument;
    const $ = selector => d.querySelector(selector);
    const audio = new Audio();
    let songs = [], current = 0;
    const favoritesKey = 'aurora-jamendo-favorites-v1';
    const getFavorites = () => JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    const saveFavorites = items => localStorage.setItem(favoritesKey, JSON.stringify(items));
    const cover = track => track.image || track.album_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80';
    function notify(message) {
      const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800);
    }
    function refreshFavorites() {
      const favorites = getFavorites();
      $('#likes').textContent = favorites.length ? `已收藏 ${favorites.length} 首真实 Jamendo 曲目` : '还没有收藏歌曲';
      let list = $('#favoriteList');
      if (!list) {
        list = d.createElement('div'); list.id = 'favoriteList'; list.className = 'tracks';
        $('#likes').closest('.card').after(list);
      }
      list.innerHTML = favorites.length ? favorites.map((track, index) => `<button class="track" data-favorite="${index}"><span class="art" style="background-image:url('${cover(track)}')"></span><span><b>${track.name}</b><small>${track.artist_name}</small><small class="badge">Jamendo · 已收藏</small></span><i>▶</i></button>`).join('') : '<p class="empty">点击播放页的 ♥，将真实曲目保存到这里。</p>';
      list.onclick = event => {
        const row = event.target.closest('[data-favorite]'); if (!row) return;
        const track = getFavorites()[+row.dataset.favorite];
        let index = songs.findIndex(item => item.id === track.id);
        if (index < 0) { songs.unshift(track); index = 0; }
        setTrack(index, true); $('#sheet').classList.add('open');
      };
    }
    function setTrack(index, autoplay = false) {
      if (!songs.length) return;
      current = (index + songs.length) % songs.length;
      const track = songs[current];
      audio.src = track.audio;
      ['miniart', 'big'].forEach(id => { const el = $('#'+id); if (el) el.style.backgroundImage = `url('${cover(track)}')`; });
      $('#mtitle').textContent = $('#title').textContent = track.name;
      $('#artist').textContent = track.artist_name;
      $('#martist').textContent = `${track.artist_name} · Jamendo`;
      $('#source').textContent = `Jamendo · ${track.license_ccurl ? 'Creative Commons' : '独立音乐'}`;
      $('#heart').classList.toggle('liked', getFavorites().some(item => item.id === track.id));
      $('#prog').style.width = '0%'; $('#time').textContent = '0:00';
      if (autoplay) audio.play().catch(() => notify('点击播放按钮开始试听'));
    }
    function setPlaying(play) {
      if (!audio.src) return;
      if (play) audio.play().catch(() => notify('浏览器需要再次点击以开始播放'));
      else audio.pause();
    }
    function paintTracks(items) {
      const tracks = $('#tracks');
      const fresh = tracks.cloneNode(false); tracks.replaceWith(fresh);
      fresh.innerHTML = items.length ? items.map(track => {
        const index = songs.indexOf(track);
        return `<button class="track" data-live="${index}"><span class="art" style="background-image:url('${cover(track)}')"></span><span><b>${track.name}</b><small>${track.artist_name}</small><small class="badge">Jamendo · ${track.license_ccurl ? 'CC 授权' : '独立音乐'}</small></span><i>▶</i></button>`;
      }).join('') : '<p class="empty">没有找到可播放的免费音乐</p>';
      fresh.addEventListener('click', event => {
        const row = event.target.closest('[data-live]'); if (!row) return;
        setTrack(+row.dataset.live, true); $('#sheet').classList.add('open');
      });
    }
    async function load(query = '', language = '') {
      $('#tracks').innerHTML = '<p class="empty">正在载入 Jamendo 真实曲库…</p>';
      const params = new URLSearchParams({ client_id: clientId, format: 'json', limit: '30', imagesize: '300', audioformat: 'mp31', include: 'musicinfo' });
      if (query) params.set('search', query);
      if (language) params.set('lang', language);
      try {
        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`);
        const data = await response.json();
        songs = (data.results || []).filter(track => track.audio && (language !== 'zh' || /[\u3400-\u9fff]/.test(`${track.name}${track.artist_name}`)));
        paintTracks(songs); if (songs.length) setTrack(0);
      } catch (error) { $('#tracks').innerHTML = '<p class="empty">无法连接 Jamendo，请检查网络后重试。</p>'; }
    }
    d.addEventListener('click', event => {
      const button = event.target.closest('#mplay,#play,#prev,#next,#daily,#bar,#heart');
      if (!button) return;
      event.stopImmediatePropagation();
      if (button.id === 'mplay' || button.id === 'play') setPlaying(audio.paused);
      else if (button.id === 'prev') { setTrack(current - 1, true); notify('上一首'); }
      else if (button.id === 'next') { setTrack(current + 1, true); notify('下一首'); }
      else if (button.id === 'daily') { setTrack(0, true); $('#sheet').classList.add('open'); }
      else if (button.id === 'bar' && audio.duration) { audio.currentTime = audio.duration * (event.offsetX / button.offsetWidth); }
      else if (button.id === 'heart') {
        const track = songs[current]; const favorites = getFavorites(); const index = favorites.findIndex(item => item.id === track.id);
        if (index >= 0) { favorites.splice(index, 1); notify('已取消收藏'); } else { favorites.unshift(track); notify('已收藏到资料库'); }
        saveFavorites(favorites); $('#heart').classList.toggle('liked', index < 0); refreshFavorites();
      }
    }, true);
    audio.addEventListener('play', () => { $('#mplay').textContent = $('#play').textContent = '❚❚'; });
    audio.addEventListener('pause', () => { $('#mplay').textContent = $('#play').textContent = '▶'; });
    audio.addEventListener('timeupdate', () => { if (!audio.duration) return; const ratio = audio.currentTime / audio.duration; $('#prog').style.width = `${ratio * 100}%`; const s = Math.floor(audio.currentTime); $('#time').textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; });
    audio.addEventListener('ended', () => setTrack(current + 1, true));
    $('#search').addEventListener('input', event => { const q = event.target.value.trim(); clearTimeout(window.__auroraSearch); window.__auroraSearch = setTimeout(() => load(q), 500); });
    $('#chips').addEventListener('click', event => {
      const button = event.target.closest('[data-f]'); if (!button) return;
      const map = { '华语': { query: '', language: 'zh' }, '粤语': { query: 'cantonese', language: '' }, 'English': { query: '', language: 'en' } };
      if (button.dataset.f === 'Apple Music') { notify('当前版本仅展示 Jamendo 免费独立音乐'); return; }
      const choice = map[button.dataset.f] || { query: '', language: '' };
      load(choice.query, choice.language);
    }, true);
    $('#tabs').addEventListener('click', event => { if (event.target.closest('[data-v="library"]')) setTimeout(refreshFavorites, 0); }, true);
    refreshFavorites();
    await load();
  });
})();
