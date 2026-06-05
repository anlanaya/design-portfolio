// 浮动添加案例面板
(function() {
  'use strict';

  var panel = document.getElementById('add-case-panel');
  var overlay = document.getElementById('add-case-overlay');
  var fab = document.getElementById('add-case-fab');
  var closeBtn = document.getElementById('close-panel');
  var saveBtn = document.getElementById('panel-save');
  var statusEl = document.getElementById('panel-status');

  if (!panel || !overlay || !fab || !closeBtn || !saveBtn || !statusEl) return;

  var currentPlatform = 'xiaohongshu';
  var selectedSpaces = [];
  var selectedStyles = [];

  function gv(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  fab.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePanel();
  });

  // 平台切换
  document.querySelectorAll('.panel-platform-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.panel-platform-btn').forEach(function(b) {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');
      currentPlatform = btn.dataset.platform;
    });
  });

  // 标签切换
  function setupPanelTags(containerId, arr) {
    document.querySelectorAll('#' + containerId + ' .panel-tag-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        btn.classList.toggle('selected');
        var slug = btn.dataset.slug;
        var idx = arr.indexOf(slug);
        if (idx > -1) arr.splice(idx, 1);
        else arr.push(slug);
      });
    });
  }
  setupPanelTags('panel-spaces-tags', selectedSpaces);
  setupPanelTags('panel-styles-tags', selectedStyles);

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'text-xs mb-2 ' + (type === 'error' ? 'text-red-500' : 'text-green-600');
    statusEl.classList.remove('hidden');
  }

  function resetForm() {
    ['panel-title', 'panel-description', 'panel-sourceUrl', 'panel-area', 'panel-location', 'panel-cover', 'panel-password'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    selectedSpaces.length = 0;
    selectedStyles.length = 0;
    document.querySelectorAll('.panel-tag-btn').forEach(function(b) {
      b.classList.remove('selected');
    });
    currentPlatform = 'xiaohongshu';
    document.querySelectorAll('.panel-platform-btn').forEach(function(b) {
      b.classList.remove('selected');
    });
    var first = document.querySelector('.panel-platform-btn[data-platform="xiaohongshu"]');
    if (first) first.classList.add('selected');
    statusEl.classList.add('hidden');
  }

  // 保存
  saveBtn.addEventListener('click', function() {
    var title = gv('panel-title');
    var description = gv('panel-description');
    var password = gv('panel-password');

    if (!title || !description) { showStatus('标题和描述不能为空', 'error'); return; }
    if (!password) { showStatus('请输入管理密码', 'error'); return; }
    if (selectedSpaces.length === 0) { showStatus('请至少选一个空间标签', 'error'); return; }
    if (selectedStyles.length === 0) { showStatus('请至少选一个风格标签', 'error'); return; }

    saveBtn.textContent = '保存中...';
    saveBtn.disabled = true;

    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description,
        password: password,
        sourceUrl: gv('panel-sourceUrl') || null,
        sourcePlatform: currentPlatform,
        spaces: selectedSpaces,
        styles: selectedStyles,
        area: parseInt(gv('panel-area')) || null,
        location: gv('panel-location') || null,
        cover: gv('panel-cover') || null,
      }),
    }).then(function(r) { return r.json(); })
      .then(function(data) {
        saveBtn.textContent = '保存案例';
        saveBtn.disabled = false;
        if (data.success) {
          showStatus('✅ 添加成功！', 'success');
          resetForm();
          setTimeout(closePanel, 1500);
        } else {
          showStatus('❌ ' + (data.error || '保存失败'), 'error');
        }
      }).catch(function() {
        saveBtn.textContent = '保存案例';
        saveBtn.disabled = false;
        showStatus('❌ 网络错误（需先配置 KV 存储）', 'error');
      });
  });
})();
