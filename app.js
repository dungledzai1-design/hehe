/* ============================================
   dleedev - App Logic
   Hỗ trợ kéo tâm FF + Tối ưu hiệu năng
   ============================================ */

(function() {
  'use strict';

  // ========== State ==========
  const state = {
    aim: false,
    head: false,
    recoil: false,
    smooth: false,
    cool: false,
    run: false,
    activated: false,
    sensitivity: 50,
    headTrack: 60
  };

  // ========== DOM refs ==========
  const $ = (id) => document.getElementById(id);
  const crosshair = $('crosshair');
  const toast = $('toast');

  // ========== Toast helper ==========
  let toastTimer;
  function showToast(msg, isError) {
    toast.textContent = msg;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ========== Save / Load state ==========
  function saveState() {
    try {
      localStorage.setItem('dleedev_state', JSON.stringify(state));
    } catch(e) {}
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('dleedev_state'));
      if (saved) Object.assign(state, saved);
    } catch(e) {}
  }

  // ========== Update crosshair ==========
  function updateCrosshair() {
    if (state.aim || state.head || state.recoil) {
      crosshair.classList.remove('inactive');
    } else {
      crosshair.classList.add('inactive');
    }
  }

  // ========== Update toggles UI ==========
  function syncUI() {
    $('toggleAim').checked = state.aim;
    $('toggleHead').checked = state.head;
    $('toggleRecoil').checked = state.recoil;
    $('toggleSmooth').checked = state.smooth;
    $('toggleCool').checked = state.cool;
    $('toggleRun').checked = state.run;
    $('sensSlider').value = state.sensitivity;
    $('headSlider').value = state.headTrack;
    $('sensValue').textContent = state.sensitivity;
    $('headValue').textContent = state.headTrack;
    updateCrosshair();
    updateActivateButton();
  }

  // ========== Update activate button ==========
  function updateActivateButton() {
    const btn = $('btnActivate');
    const anyActive = state.aim || state.head || state.recoil ||
                      state.smooth || state.cool || state.run;
    if (anyActive) {
      btn.textContent = '● Đang Hoạt Động';
      btn.classList.add('active');
      state.activated = true;
    } else {
      btn.textContent = '▶ Kích Hoạt Cấu Hình';
      btn.classList.remove('active');
      state.activated = false;
    }
  }

  // ========== Toggle handlers ==========
  function bindToggle(id, key, onMsg, offMsg) {
    $(id).addEventListener('change', function() {
      state[key] = this.checked;
      saveState();
      updateCrosshair();
      updateActivateButton();
      showToast((this.checked ? '✓ BẬT: ' : '✗ TẮT: ') + (this.checked ? onMsg : offMsg));
    });
  }

  bindToggle('toggleAim', 'aim', 'Kéo Tâm', 'Kéo Tâm');
  bindToggle('toggleHead', 'head', 'Bám Đầu', 'Bám Đầu');
  bindToggle('toggleRecoil', 'recoil', 'Tâm Đầm', 'Tâm Đầm');
  bindToggle('toggleSmooth', 'smooth', 'Làm Mượt Máy', 'Làm Mượt Máy');
  bindToggle('toggleCool', 'cool', 'Giảm Nóng Máy', 'Giảm Nóng Máy');
  bindToggle('toggleRun', 'run', 'Chạy Hoạt Động Tối Ưu', 'Chạy Hoạt Động Tối Ưu');

  // ========== Slider handlers ==========
  $('sensSlider').addEventListener('input', function() {
    state.sensitivity = parseInt(this.value);
    $('sensValue').textContent = state.sensitivity;
    saveState();
  });

  $('headSlider').addEventListener('input', function() {
    state.headTrack = parseInt(this.value);
    $('headValue').textContent = state.headTrack;
    saveState();
  });

  // ========== Activate button ==========
  $('btnActivate').addEventListener('click', function() {
    if (state.activated) {
      // Tắt tất cả
      state.aim = state.head = state.recoil = false;
      state.smooth = state.cool = state.run = false;
      saveState();
      syncUI();
      showToast('✗ Đã tắt toàn bộ cấu hình');
    } else {
      // Bật tất cả
      state.aim = state.head = state.recoil = true;
      state.smooth = state.cool = state.run = true;
      saveState();
      syncUI();
      showToast('✓ Đã kích hoạt cấu hình dleedev!');
    }
  });

  // ========== Live stats simulation ==========
  function updateLiveStats() {
    // Nhiệt độ
    let temp;
    if (state.cool) {
      temp = 30 + Math.floor(Math.random() * 4);
    } else {
      temp = 36 + Math.floor(Math.random() * 8);
    }
    $('tempValue').textContent = temp + '°C';
    $('tempValue').style.color = temp < 35 ? '#00ff88' : (temp < 42 ? '#ff8c00' : '#ff003c');
    const fillPct = Math.min(100, ((temp - 25) / 30) * 100);
    $('tempFill').style.width = fillPct + '%';

    // FPS
    let fps;
    if (state.smooth) {
      fps = 58 + Math.floor(Math.random() * 4);
    } else {
      fps = 45 + Math.floor(Math.random() * 12);
    }
    $('fpsValue').textContent = fps;
    $('fpsValue').style.color = fps >= 58 ? '#00ff88' : (fps >= 50 ? '#ff8c00' : '#ff003c');

    // Ping
    let ping = 24 + Math.floor(Math.random() * 12);
    $('pingValue').textContent = ping;
    $('pingValue').style.color = ping < 35 ? '#00ff88' : (ping < 50 ? '#ff8c00' : '#ff003c');

    // Làm mát status
    if (state.cool) {
      $('coolValue').textContent = 'Tốt';
      $('coolValue').style.color = '#00ff88';
    } else {
      const coolStatus = ['TB', 'Nóng', 'Cao'];
      $('coolValue').textContent = coolStatus[Math.floor(Math.random() * coolStatus.length)];
      $('coolValue').style.color = '#ff8c00';
    }
  }

  // ========== Prevent pull-to-refresh / zoom ==========
  document.addEventListener('touchmove', function(e) {
    if (e.scale && e.scale !== 1) e.preventDefault();
  }, { passive: false });

  // ========== Init ==========
  loadState();
  syncUI();
  updateLiveStats();
  setInterval(updateLiveStats, 2000);

  // Welcome toast
  setTimeout(() => {
    showToast('✓ Đã xác nhận bởi dleedev - Vĩnh viễn 9090');
  }, 600);

  console.log('%c dleedev ', 'background:#ff003c;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px;');
  console.log('%c Hỗ Trợ Kéo Tâm FF - Vĩnh viễn ', 'color:#00ff88;font-weight:bold;');
  console.log('Đã được xác nhận bởi dleedev | Chứng chỉ xanh | Hạn sử dụng: 9090');

})();
