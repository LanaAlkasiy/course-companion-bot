function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput('OK');
    }

    const update = JSON.parse(e.postData.contents);

    if (!isNewUpdate_(update.update_id)) {
      return ContentService.createTextOutput('OK');
    }

    if (update.message) {
      handleIncomingMessage(update.message);
    } else if (update.callback_query) {
      handleIncomingCallback(update.callback_query);
    }
  } catch (err) {
    Logger.log('doPost error: ' + err.message + '\n' + err.stack);
  }

  return ContentService.createTextOutput('OK');
}

function isNewUpdate_(updateId) {
  if (updateId === undefined || updateId === null) return true;
  const cache = CacheService.getScriptCache();
  const key = 'update_' + updateId;
  if (cache.get(key)) return false;
  cache.put(key, '1', 600);
  return true;
}