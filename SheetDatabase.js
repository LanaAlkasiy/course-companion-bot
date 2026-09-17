const SHEET_HEADERS = {
  Users: ['telegram_user_id', 'username', 'first_name', 'active_course_id', 'current_state', 'state_data', 'created_at'],
  Courses: ['course_id', 'telegram_user_id', 'course_name', 'course_code', 'created_at'],
  Files: ['file_id', 'telegram_user_id', 'course_id', 'telegram_file_id', 'original_filename', 'drive_file_id', 'extracted_text_file_id', 'created_at'],
  QuizResults: ['result_id', 'telegram_user_id', 'course_id', 'score', 'total_questions', 'difficulty', 'created_at']
};

function getSpreadsheet_() {
  return SpreadsheetApp.openById(getSpreadsheetId());
}

function getOrCreateSheet_(name) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  ensureHeaders_(sheet, SHEET_HEADERS[name]);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = headers.every(function (h, i) { return firstRow[i] === h; });
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function initializeAllSheets_() {
  Object.keys(SHEET_HEADERS).forEach(function (name) {
    getOrCreateSheet_(name);
  });
}