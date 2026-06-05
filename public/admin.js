// 管理后台逻辑
(function() {
  'use strict';

  var currentPlatform = 'xiaohongshu';
  var selectedSpaces = [];
  var selectedStyles = [];

  // 平台切换
  document.querySelectorAll('.platform-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.platform-btn').forEach(function(b) {
        b.classList.remove('active', 'bg-accent-900', 'text-white');
      });
      btn.classList.add('active', 'bg-accent-900', 'text-white');
      currentPlatform = btn.dataset.platform;
    });
  });
  var firstPlatform = document.querySelector('[data-platform="xiaohongshu"]');
  if (firstPlatform) firstPlatform.classList.add('bg-accent-900', 'text-white');

  // 标签切换
  function setupTags(containerId, arr) {
    document.querySelectorAll('#' + containerId + ' .tag-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        btn.classList.toggle('bg-accent-900');
        btn.classList.toggle('text-white');
        var slug = btn.dataset.slug;
        var idx = arr.indexOf(slug);
        if (idx > -1) arr.splice(idx, 1);
        else arr.push(slug);
      });
    });
  }
  setupTags('spaces-tags', selectedSpaces);
  setupTags('styles-tags', selectedStyles);

  // 加载在线案例
  function loadKvCases() {
    fetch('/api/cases')
      .then(function(res) { return res.json(); })
      .then(function(cases) {
        var countEl = document.getElementById('kv-count');
        var listEl = document.getElementById('kv-list');
        if (!countEl || !listEl) return;
        countEl.textContent = '共 ' + cases.length + ' 个案例';
        if (cases.length === 0) {
          listEl.innerHTML = '<p class="text-sm text-accent-400">暂无在线案例，添加第一个吧</p>';
          return;
        }
        var labels;
        try {
          labels = JSON.parse(document.getElementById('space-labels-json')?.textContent || '{}');
        } catch(e) { labels = {}; }
        listEl.innerHTML = cases.map(function(c) {
          var spaceText = (c.spaces || []).map(function(s) { return labels[s] || s; }).join(' · ');
          return '<div class="flex items-center justify-between p-3 bg-accent-50 rounded-lg">' +
            '<div>' +
            '<span class="text-sm font-medium text-accent-900">' + escapeHtml(c.title) + '</span>' +
            '<span class="text-xs text-accent-400 ml-2">' + spaceText + '</span>' +
            '<span class="text-xs text-accent-400 ml-2">| ' + c.publishDate + '</span>' +
            '</div>' +
            '<button class="text-xs text-red-500 hover:text-red-700" data-delete="' + c.id + '">删除</button>' +
            '</div>';
        }).join('');
        // 绑定删除按钮
        listEl.querySelectorAll('[data-delete]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.dataset.delete;
            if (!confirm('确定删除该案例？')) return;
            var pw = prompt('输入管理密码：');
            if (!pw) return;
            fetch('/api/cases', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id, password: pw }),
            }).then(function(res) {
              if (res.ok) { alert('已删除'); loadKvCases(); }
              else alert('删除失败');
            });
          });
        });
      })
      .catch(function() {
        var el = document.getElementById('kv-count');
        if (el) el.textContent = '加载失败（需先配置 KV）';
      });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // 保存
  var saveBtn = document.getElementById('btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var status = document.getElementById('form-status');
      if (!status) return;
      status.className = 'mt-3 text-sm';
      status.classList.remove('hidden');

      var title = getVal('title');
      var description = getVal('description');
      var password = getVal('password');

      if (!title || !description) { status.textContent = '标题和描述不能为空'; status.classList.add('text-red-500'); return; }
      if (!password) { status.textContent = '请输入管理密码'; status.classList.add('text-red-500'); return; }
      if (selectedSpaces.length === 0) { status.textContent = '请至少选一个空间标签'; status.classList.add('text-red-500'); return; }
      if (selectedStyles.length === 0) { status.textContent = '请至少选一个风格标签'; status.classList.add('text-red-500'); return; }

      status.textContent = '保存中...';
      status.classList.add('text-accent-500');

      fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          password: password,
          sourceUrl: getVal('sourceUrl') || null,
          sourcePlatform: currentPlatform,
          spaces: selectedSpaces,
          styles: selectedStyles,
          area: parseInt(getVal('area')) || null,
          location: getVal('location') || null,
          cover: getVal('cover') || null,
        }),
      }).then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            status.textContent = '✅ 保存成功！';
            status.classList.add('text-green-600');
            var resetBtn = document.getElementById('btn-reset');
            if (resetBtn) resetBtn.click();
            loadKvCases();
          } else {
            status.textContent = '❌ ' + (data.error || '保存失败');
            status.classList.add('text-red-500');
          }
        }).catch(function() {
          status.textContent = '❌ 网络错误，请重试';
          status.classList.add('text-red-500');
        });
    });
  }

  // 重置
  var resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      ['title','description','sourceUrl','area','location','cover','password'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      selectedSpaces.length = 0;
      selectedStyles.length = 0;
      document.querySelectorAll('.tag-btn').forEach(function(b) {
        b.classList.remove('bg-accent-900', 'text-white');
      });
      currentPlatform = 'xiaohongshu';
      document.querySelectorAll('.platform-btn').forEach(function(b) {
        b.classList.remove('bg-accent-900', 'text-white');
      });
      var xhs = document.querySelector('[data-platform="xiaohongshu"]');
      if (xhs) xhs.classList.add('bg-accent-900', 'text-white');
    });
  }

  loadKvCases();
})();
