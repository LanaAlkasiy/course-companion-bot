function initializeProject() {
  initializeAllSheets_();
  const rootFolderId = getOrCreateRootDriveFolder_();
  PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', rootFolderId);
  Logger.log('Project initialized. Drive root folder ID: ' + rootFolderId);
  Logger.log('Sheets ready: ' + Object.keys(SHEET_HEADERS).join(', '));
}

function getOrCreateRootDriveFolder_() {
  const folderName = CONFIG.DRIVE_ROOT_FOLDER_NAME;
  const existing = DriveApp.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next().getId();
  return DriveApp.createFolder(folderName).getId();
}

function setWebhook() {
  const result = setTelegramWebhook(getWebAppUrl());
  Logger.log('setWebhook result: ' + JSON.stringify(result));
  return result;
}

function deleteWebhook() {
  const result = deleteTelegramWebhook();
  Logger.log('deleteWebhook result: ' + JSON.stringify(result));
  return result;
}

function getWebhookInfo() {
  const result = getTelegramWebhookInfo();
  Logger.log('Webhook info: ' + JSON.stringify(result));
  return result;
}

function setBotCommands() {
  const commands = [
    { command: 'start', description: 'Show the welcome message and main menu' },
    { command: 'newcourse', description: 'Create a new course' },
    { command: 'courses', description: 'View and select your courses' },
    { command: 'cancel', description: 'Cancel the current action' },
    { command: 'help', description: 'Show instructions' }
  ];
  const result = setTelegramBotCommands(commands);
  Logger.log('setBotCommands result: ' + JSON.stringify(result));
  return result;
}

function testTelegramConnection() {
  const result = callTelegramApi_('getMe', {});
  Logger.log('Bot info: ' + JSON.stringify(result));
  return result;
}
function fixWebhookNow() {
  const del = deleteTelegramWebhook();
  Logger.log('DELETE result: ' + JSON.stringify(del));
  
  Utilities.sleep(1000); // brief pause so Telegram registers the deletion

  const set = setTelegramWebhook(getWebAppUrl());
  Logger.log('SET result: ' + JSON.stringify(set));
}