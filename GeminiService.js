function generateFileSummary_(driveFileId) {
  const file = DriveApp.getFileById(driveFileId);
  const blob = file.getBlob();

  const url =
    CONFIG.GEMINI_API_BASE +
    CONFIG.GEMINI_MODEL +
    ':generateContent?key=' +
    encodeURIComponent(getGeminiApiKey());

  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              'Analyze these study notes. Create a clear student-friendly summary. ' +
              'Include the main topic, important concepts, definitions, formulas, ' +
              'and key points. Use short headings and bullet points. Use plain text.'
          },
          {
            inline_data: {
              mime_type: blob.getContentType(),
              data: Utilities.base64Encode(blob.getBytes())
            }
          }
        ]
      }
    ]
  };

  let response;
let statusCode;
let responseText;

for (let attempt = 1; attempt <= 3; attempt++) {
  response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  statusCode = response.getResponseCode();
  responseText = response.getContentText();

  if (statusCode === 200) {
    break;
  }

  if (statusCode === 429 || statusCode >= 500) {
    Utilities.sleep(2000 * attempt);
    continue;
  }

  break;
}

if (statusCode !== 200) {
  throw new Error(
    'Gemini returned ' + statusCode + ': ' + responseText
  );
}

  const result = JSON.parse(responseText);

  if (
    !result.candidates ||
    !result.candidates[0] ||
    !result.candidates[0].content ||
    !result.candidates[0].content.parts
  ) {
    throw new Error('Gemini did not return a summary.');
  }

  return result.candidates[0].content.parts
    .map(function (part) {
      return part.text || '';
    })
    .join('\n');
}