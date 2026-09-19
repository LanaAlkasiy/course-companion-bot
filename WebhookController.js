function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return webhookResponse_();
    }

    const update = JSON.parse(e.postData.contents);

    if (!isNewUpdate_(update.update_id)) {
      return webhookResponse_();
    }

    if (update.message) {
      handleIncomingMessage(update.message);
    } else if (update.callback_query) {
      handleIncomingCallback(update.callback_query);
    }

  } catch (err) {
    Logger.log(
      'doPost error: ' +
      err.message +
      '\n' +
      err.stack
    );
  }

  return webhookResponse_();
}

function webhookResponse_() {
  return HtmlService.createHtmlOutput('OK');
}

function isNewUpdate_(updateId) {
  if (updateId === undefined || updateId === null) {
    return true;
  }

  const cache = CacheService.getScriptCache();
  const key = 'update_' + updateId;

  if (cache.get(key)) {
    return false;
  }

  cache.put(key, '1', 21600);
  return true;
}