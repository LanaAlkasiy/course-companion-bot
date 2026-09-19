const CONFIG = {
  TELEGRAM_API_BASE: 'https://api.telegram.org/bot',
  GEMINI_MODEL: 'gemini-3.6-flash',
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/',
  SHEET_NAMES: {
    USERS: 'Users',
    COURSES: 'Courses',
    FILES: 'Files',
    QUIZ_RESULTS: 'QuizResults'
  },
  DRIVE_ROOT_FOLDER_NAME: 'Course Companion Files',
  MAX_FILE_SIZE_MB: 15
};

function getProp_(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) throw new Error('Missing required Script Property: ' + key);
  return value;
}

function getTelegramToken() { return getProp_('TELEGRAM_BOT_TOKEN'); }
function getGeminiApiKey() { return getProp_('GEMINI_API_KEY'); }
function getWebAppUrl() { return getProp_('WEB_APP_URL'); }
function getSpreadsheetId() { return getProp_('SPREADSHEET_ID'); }
function getDriveFolderId() { return getProp_('DRIVE_FOLDER_ID'); }