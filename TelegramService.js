const TELEGRAM_MAX_MESSAGE_LENGTH = 4000;

function telegramApiUrl_(method) {
  return CONFIG.TELEGRAM_API_BASE + getTelegramToken() + '/' + method;
}

function callTelegramApi_(method, payload) {
  const url = telegramApiUrl_(method);
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      const body = response.getContentText();

      if (code === 200) return JSON.parse(body);

      Logger.log('Telegram API error. Method: ' + method + ' Code: ' + code + ' Body: ' + body);
      lastError = new Error('Telegram API returned code ' + code + ' for method ' + method);

      if (code < 500 && code !== 429) break;
    } catch (e) {
      lastError = e;
      Logger.log('Telegram API exception on attempt ' + attempt + ': ' + e.message);
    }
    Utilities.sleep(500 * (attempt + 1));
  }

  throw lastError || new Error('Telegram API call failed: ' + method);
}

function splitTextIntoChunks_(text, maxLength) {
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf('\n', maxLength);
    if (splitAt <= 0) splitAt = maxLength;
    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt);
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function sendTelegramMessage(chatId, text, options) {
  options = options || {};
  const chunks = splitTextIntoChunks_(text, TELEGRAM_MAX_MESSAGE_LENGTH);
  let lastResponse = null;

  chunks.forEach(function (chunk, index) {
    const payload = {
      chat_id: chatId,
      text: chunk,
      parse_mode: options.parseMode || 'HTML'
    };
    if (options.replyMarkup && index === chunks.length - 1) {
      payload.reply_markup = options.replyMarkup;
    }
    lastResponse = callTelegramApi_('sendMessage', payload);
  });

  return lastResponse;
}

function answerCallbackQuery(callbackQueryId, text) {
  const payload = { callback_query_id: callbackQueryId };
  if (text) {
    payload.text = text;
    payload.show_alert = false;
  }
  return callTelegramApi_('answerCallbackQuery', payload);
}

function setTelegramWebhook(url, secretToken) {
  const payload = { url: url };
  if (secretToken) payload.secret_token = secretToken;
  return callTelegramApi_('setWebhook', payload);
}

function deleteTelegramWebhook() { return callTelegramApi_('deleteWebhook', {}); }
function getTelegramWebhookInfo() { return callTelegramApi_('getWebhookInfo', {}); }
function setTelegramBotCommands(commands) { return callTelegramApi_('setMyCommands', { commands: commands }); }