/**
 * 第7回ミナミの綾野剛コンペ 参加申込 API（Google Apps Script）
 *
 * スプレッドシートの「拡張機能 → Apps Script」に貼り付け、
 * ウェブアプリ（実行ユーザー：自分／アクセス：全員）としてデプロイする。
 * 手順は README.md の「参加申込フォーム（GAS）」を参照。
 *
 * GET  … 回答一覧を返す
 * POST … { action: 'save', entry: {...} } で登録・更新、{ action: 'delete', id } で削除
 */

const SHEET_NAME = '回答';
const HEADERS = ['ID', 'お名前', 'ゴルフ', '表彰式・2次会', 'コメント', '登録日時', '更新日時'];
const ANSWERS = ['○', '△', '×'];
const MAX_NAME_LENGTH = 20;
const MAX_COMMENT_LENGTH = 100;
const MAX_ENTRIES = 200;

/** 新しい回答があったときの通知先。空欄なら通知しない */
const NOTIFY_EMAIL = '';

function doGet() {
  return toJson({ ok: true, entries: listEntries() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const request = JSON.parse(e.postData.contents);

    // ボット対策：画面に表示しない入力欄に値が入っていたら保存せずに終える
    if (request.website) {
      return toJson({ ok: true, entries: listEntries() });
    }

    if (request.action === 'save') {
      saveEntry(request.entry || {});
    } else if (request.action === 'delete') {
      deleteEntry(String(request.id || ''));
    } else {
      throw new Error('不明な操作です。');
    }
    return toJson({ ok: true, entries: listEntries() });
  } catch (err) {
    return toJson({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function listEntries() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues().map(function (row) {
    return { id: row[0], name: row[1], golf: row[2], party: row[3], comment: row[4] };
  });
}

function saveEntry(input) {
  const entry = validateEntry(input);
  const sheet = getSheet();
  const now = new Date();
  const values = [entry.name, entry.golf, entry.party, entry.comment].map(escapeFormula);

  const rowIndex = input.id ? findRow(sheet, String(input.id)) : -1;
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2, 1, values.length).setValues([values]);
    sheet.getRange(rowIndex, 7).setValue(now);
    return;
  }

  if (sheet.getLastRow() - 1 >= MAX_ENTRIES) {
    throw new Error('受付件数の上限に達しました。主催者にご連絡ください。');
  }
  sheet.appendRow([Utilities.getUuid()].concat(values, [now, now]));
  notifyNewEntry(entry);
}

function deleteEntry(id) {
  const sheet = getSheet();
  const rowIndex = findRow(sheet, id);
  if (rowIndex < 0) throw new Error('対象の回答が見つかりません。');
  sheet.deleteRow(rowIndex);
}

function validateEntry(input) {
  const name = String(input.name || '').trim();
  const comment = String(input.comment || '').trim();

  if (!name) throw new Error('お名前を入力してください。');
  if (name.length > MAX_NAME_LENGTH) throw new Error('お名前は' + MAX_NAME_LENGTH + '文字以内で入力してください。');
  if (comment.length > MAX_COMMENT_LENGTH) throw new Error('コメントは' + MAX_COMMENT_LENGTH + '文字以内で入力してください。');
  if (ANSWERS.indexOf(input.golf) < 0 || ANSWERS.indexOf(input.party) < 0) {
    throw new Error('○・△・× を選んでください。');
  }
  return { name: name, golf: input.golf, party: input.party, comment: comment };
}

/** ID が一致する行番号（見つからなければ -1） */
function findRow(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return -1;
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** 「=」などで始まる文字列が数式として実行されないようにする */
function escapeFormula(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function notifyNewEntry(entry) {
  if (!NOTIFY_EMAIL) return;
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    '【綾野剛コンペ】新しい回答：' + entry.name,
    'ゴルフ：' + entry.golf + '\n表彰式・2次会：' + entry.party + '\nコメント：' + (entry.comment || '（なし）') +
      '\n\n' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  );
}

function toJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
