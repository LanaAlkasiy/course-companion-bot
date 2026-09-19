function handleFileUpload_(message) {
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const activeCourseId = getActiveCourseId_(telegramUserId);

  if (!activeCourseId) {
    sendTelegramMessage(
      chatId,
      'Please select a course from 📚 My Courses before uploading a file.'
    );
    return;
  }

  const course = getCourseById_(telegramUserId, activeCourseId);

  if (!course) {
    sendTelegramMessage(chatId, 'The selected course could not be found.');
    return;
  }

  let telegramFileId;
  let fileName;
  let fileSize = 0;

  if (message.document) {
    telegramFileId = message.document.file_id;
    fileName = message.document.file_name || 'document';
    fileSize = message.document.file_size || 0;
  } else if (message.photo && message.photo.length > 0) {
    const photo = message.photo[message.photo.length - 1];

    telegramFileId = photo.file_id;
    fileName = 'photo_' + new Date().getTime() + '.jpg';
    fileSize = photo.file_size || 0;
  } else {
    sendTelegramMessage(chatId, 'Please upload a document or picture.');
    return;
  }

  const maximumBytes = CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;

  if (fileSize > maximumBytes) {
    sendTelegramMessage(
      chatId,
      'This file is too large. The maximum size is ' +
        CONFIG.MAX_FILE_SIZE_MB +
        ' MB.'
    );
    return;
  }

  try {
    sendTelegramMessage(chatId, '⏳ Uploading your file...');

    const fileInfo = callTelegramApi_('getFile', {
      file_id: telegramFileId
    });

    if (!fileInfo.ok || !fileInfo.result.file_path) {
      throw new Error('Telegram did not return the file path.');
    }

    const downloadUrl =
      'https://api.telegram.org/file/bot' +
      getTelegramToken() +
      '/' +
      fileInfo.result.file_path;

    const blob = UrlFetchApp.fetch(downloadUrl).getBlob().setName(fileName);

    const rootFolder = DriveApp.getFolderById(getDriveFolderId());
    const folderName = course.courseCode + ' - ' + course.courseName;
    const existingFolders = rootFolder.getFoldersByName(folderName);

    const courseFolder = existingFolders.hasNext()
      ? existingFolders.next()
      : rootFolder.createFolder(folderName);

    const driveFile = courseFolder.createFile(blob);

    recordUploadedFile_(
      telegramUserId,
      activeCourseId,
      telegramFileId,
      fileName,
      driveFile.getId()
    );

    sendTelegramMessage(
  chatId,
  '✅ <b>' +
    escapeHtml(fileName) +
    '</b> was added to ' +
    escapeHtml(course.courseCode) +
    '.',
  {
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: '📝 Generate Summary',
            callback_data: 'summarize_' + driveFile.getId()
          }
        ]
      ]
    }
  }
  );
  } catch (error) {
    Logger.log('File upload error: ' + error.message + '\n' + error.stack);

    sendTelegramMessage(
      chatId,
      'I couldn’t upload that file. Please try again.'
    );
  }
}

function recordUploadedFile_(
  telegramUserId,
  courseId,
  telegramFileId,
  fileName,
  driveFileId
) {
  const sheet = getOrCreateSheet_(CONFIG.SHEET_NAMES.FILES);

  sheet.appendRow([
    Utilities.getUuid(),
    String(telegramUserId),
    courseId,
    telegramFileId,
    fileName,
    driveFileId,
    '',
    new Date().toISOString()
  ]);
}