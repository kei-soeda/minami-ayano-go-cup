/* 参加申込ページ：GAS と連携した参加者一覧と回答フォーム */
(function(){
  /* 【GASのURL】gas/Code.gs をウェブアプリとしてデプロイした URL（https://script.google.com/macros/s/.../exec） */
  var ENTRY_API_URL = '';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var entryBoard = document.getElementById('entryBoard');
  if (entryBoard) setupEntryBoard(entryBoard, ENTRY_API_URL);

  function setupEntryBoard(board, apiUrl){
    var form = board.querySelector('#entryForm');
    var table = board.querySelector('#entryTable');
    var rows = board.querySelector('#entryRows');
    var summary = board.querySelector('#entrySummary');
    var message = board.querySelector('#entryMessage');
    var formTitle = board.querySelector('#entryFormTitle');
    var submitLabel = board.querySelector('#entrySubmitLabel');
    var cancelBtn = board.querySelector('#entryCancel');
    var deleteBtn = board.querySelector('#entryDelete');
    var nameInput = form.elements.namedItem('name');
    var entries = [];
    var editing = null;

    var setBusy = function(busy){
      Array.prototype.forEach.call(form.elements, function(el){ el.disabled = busy; });
    };
    var showMessage = function(text, isError){
      message.textContent = text;
      message.classList.toggle('is-error', Boolean(isError));
    };
    var countAnswers = function(key, answer){
      return entries.filter(function(entry){ return entry[key] === answer; }).length;
    };

    var renderSummary = function(){
      if (!entries.length) { summary.textContent = 'まだ回答はありません。'; return; }
      var golf = document.createElement('span');
      var party = document.createElement('span');
      golf.textContent = 'ゴルフ　○ ' + countAnswers('golf', '○') + '名 ／ △ ' + countAnswers('golf', '△') + '名';
      party.textContent = '表彰式・2次会　○ ' + countAnswers('party', '○') + '名';
      summary.replaceChildren(golf, party);
    };
    var renderRows = function(){
      rows.textContent = '';
      entries.forEach(function(entry){
        var tr = document.createElement('tr');
        var nameCell = document.createElement('th');
        var nameBtn = document.createElement('button');
        nameCell.scope = 'row';
        nameBtn.type = 'button';
        nameBtn.className = 'entry-name';
        nameBtn.textContent = entry.name;
        nameBtn.addEventListener('click', function(){ startEdit(entry); });
        nameCell.appendChild(nameBtn);
        if (entry.comment) {
          var comment = document.createElement('small');
          comment.className = 'entry-comment';
          comment.textContent = entry.comment;
          nameCell.appendChild(comment);
        }
        tr.appendChild(nameCell);
        [entry.golf, entry.party].forEach(function(answer){
          var td = document.createElement('td');
          td.dataset.answer = answer;
          td.textContent = answer;
          tr.appendChild(td);
        });
        rows.appendChild(tr);
      });
      table.hidden = !entries.length;
    };

    /* payload を渡すと POST（登録・更新・削除）、省略すると GET（一覧の取得） */
    var callApi = function(payload){
      var options = payload ? { method: 'POST', body: JSON.stringify(payload) } : undefined;
      return fetch(apiUrl, options)
        .then(function(res){ return res.json(); })
        .then(function(data){
          if (!data.ok) throw new Error(data.error || '送信に失敗しました。');
          entries = data.entries;
          renderSummary();
          renderRows();
        });
    };

    var resetForm = function(){
      editing = null;
      form.reset();
      formTitle.textContent = '回答を入力する';
      submitLabel.textContent = '回答する';
      cancelBtn.hidden = true;
      deleteBtn.hidden = true;
    };
    var startEdit = function(entry){
      editing = entry;
      nameInput.value = entry.name;
      form.elements.namedItem('golf').value = entry.golf;
      form.elements.namedItem('party').value = entry.party;
      form.elements.namedItem('comment').value = entry.comment;
      formTitle.textContent = entry.name + ' さんの回答を変更';
      submitLabel.textContent = '変更する';
      cancelBtn.hidden = false;
      deleteBtn.hidden = false;
      showMessage('');
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      nameInput.focus({ preventScroll: true });
    };

    var send = function(payload, doneMessage){
      setBusy(true);
      showMessage('送信中…');
      return callApi(payload)
        .then(function(){ resetForm(); showMessage(doneMessage); })
        .catch(function(err){ showMessage(err.message, true); })
        .then(function(){ setBusy(false); });
    };

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(form);
      var entry = {
        id: editing ? editing.id : '',
        name: String(data.get('name')).trim(),
        golf: data.get('golf'),
        party: data.get('party'),
        comment: String(data.get('comment')).trim()
      };
      if (!entry.name) { showMessage('お名前を入力してください。', true); nameInput.focus(); return; }
      if (!entry.golf || !entry.party) { showMessage('ゴルフと表彰式・2次会の ○・△・× を選んでください。', true); return; }
      send({ action: 'save', entry: entry, website: data.get('website') },
        editing ? '回答を変更しました。' : '回答を受け付けました。ありがとうございます！');
    });
    cancelBtn.addEventListener('click', function(){ resetForm(); showMessage(''); });
    deleteBtn.addEventListener('click', function(){
      if (!editing || !window.confirm('「' + editing.name + '」さんの回答を削除しますか？')) return;
      send({ action: 'delete', id: editing.id }, '回答を削除しました。');
    });

    if (!apiUrl) {
      summary.textContent = '申込フォームは準備中です。もうしばらくお待ちください。';
      setBusy(true);
      return;
    }
    callApi().catch(function(){
      summary.textContent = '参加者一覧を読み込めませんでした。時間をおいて再度お試しください。';
    });
  }
})();
