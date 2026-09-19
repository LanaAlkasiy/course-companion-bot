function generateFileSummary_(driveFileId) {
  return generateStudyContent_(
    driveFileId,
    'Analyze these study notes and create a clear student-friendly summary. ' +
      'Include the main topic, important concepts, definitions, formulas, ' +
      'and key points. Use short headings and bullet points. Use plain text.',
    'summary'
  );
}

function generateFileFlashcards_(driveFileId) {
  return generateStudyContent_(
    driveFileId,
    'Create 10 useful flashcards from these study notes. ' +
      'Use only information found in the notes. ' +
      'Format every flashcard exactly like this:\n\n' +
      'Flashcard 1\nQuestion: ...\nAnswer: ...\n\n' +
      'Keep each answer clear and concise. Use plain text.',
    'flashcards'
  );
}

function generateFileQuiz_(driveFileId) {
  return generateStudyContent_(
    driveFileId,
    'Create a 5-question multiple-choice quiz from these study notes. ' +
      'Use only information found in the notes. Each question must have ' +
      'four options labeled A, B, C, and D. Put the answer key at the end. ' +
      'Do not place the correct answer directly under each question. Use plain text.',
    'quiz'
  );
}

function generateStudyContent_(driveFileId, prompt, contentType) {
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
            text: prompt
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
    throw new Error('Gemini did not return the ' + contentType + '.');
  }

  return result.candidates[0].content.parts
    .map(function (part) {
      return part.text || '';
    })
    .join('\n');
}