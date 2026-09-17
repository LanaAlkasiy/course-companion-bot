function handleIncomingMessage(message) {
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const text = (message.text || '').trim();

  if (text === '/start') {
    clearUserState_(telegramUserId);
    handleStartCommand_(message);
    return;
  }

  if (text === '/cancel') {
    clearUserState_(telegramUserId);
    sendTelegramMessage(chatId, 'Cancelled. Send /start to see the menu.');
    return;
  }

  const userState = getUserState_(telegramUserId);

  if (userState.state === USER_STATES.WAITING_COURSE_NAME) {
    handleCourseNameReply_(chatId, telegramUserId, text);
    return;
  }

  if (userState.state === USER_STATES.WAITING_COURSE_CODE) {
    handleCourseCodeReply_(chatId, telegramUserId, userState.data, text);
    return;
  }

  sendTelegramMessage(chatId, "I didn't understand that. Send /start to see the menu.");
}

function handleStartCommand_(message) {
  const chatId = message.chat.id;
  const firstName = escapeHtml(message.from.first_name || 'there');

  const welcomeText =
    '👋 Hi ' + firstName + '! I\'m your <b>Course Companion</b>.\n\n' +
    'I turn your lecture notes into summaries, flashcards, and quizzes.\n\n' +
    '<i>This is an early build — more features are coming soon.</i>';

  sendTelegramMessage(chatId, welcomeText, { replyMarkup: buildMainMenuKeyboard_() });
}

function buildMainMenuKeyboard_() {
  return {
    inline_keyboard: [
      [{ text: '📚 My Courses', callback_data: 'menu_courses' }],
      [{ text: '➕ New Course', callback_data: 'menu_newcourse' }],
      [{ text: 'ℹ️ Help', callback_data: 'menu_help' }]
    ]
  };
}

function handleCourseNameReply_(chatId, telegramUserId, courseName) {
  if (!courseName) {
    sendTelegramMessage(chatId, "Course name can't be empty. Enter the course name.");
    return;
  }
  setUserState_(telegramUserId, USER_STATES.WAITING_COURSE_CODE, { courseName: courseName });
  sendTelegramMessage(chatId, 'Got it. Now enter the course code (e.g. CMPS 251).');
}

function handleCourseCodeReply_(chatId, telegramUserId, stateData, courseCode) {
  if (!courseCode) {
    sendTelegramMessage(chatId, "Course code can't be empty. Enter the course code.");
    return;
  }

  const course = createCourse_(telegramUserId, stateData.courseName, courseCode);
  setActiveCourse_(telegramUserId, course.courseId);
  clearUserState_(telegramUserId);

  const confirmation =
    '✅ ' + escapeHtml(course.courseCode) + ' — ' + escapeHtml(course.courseName) + ' was created and selected.\n\n' +
    'Now send the lecture files or pictures you want to add to this course.';

  sendTelegramMessage(chatId, confirmation);
}