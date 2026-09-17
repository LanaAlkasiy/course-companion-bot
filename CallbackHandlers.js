function handleIncomingCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const telegramUserId = callbackQuery.from.id;
  const data = callbackQuery.data;

  answerCallbackQuery(callbackQuery.id);

  if (data === 'menu_courses') {
    showCourseList_(chatId, telegramUserId);
    return;
  }

  if (data === 'menu_newcourse') {
    setUserState_(telegramUserId, USER_STATES.WAITING_COURSE_NAME, {});
    sendTelegramMessage(chatId, 'Enter the course name.');
    return;
  }

  if (data === 'menu_help') {
    sendTelegramMessage(chatId, "Use ➕ New Course to add a course, or 📚 My Courses to pick your active one. Send /cancel any time to stop what you're doing.");
    return;
  }

  if (data.indexOf('select_course_') === 0) {
    const courseId = data.substring('select_course_'.length);
    handleCourseSelection_(chatId, telegramUserId, courseId);
    return;
  }

  sendTelegramMessage(chatId, "That option isn't available yet.");
}

function showCourseList_(chatId, telegramUserId) {
  const courses = getUserCourses_(telegramUserId);

  if (courses.length === 0) {
    sendTelegramMessage(chatId, "You don't have any courses yet. Tap ➕ New Course to add one.", {
      replyMarkup: { inline_keyboard: [[{ text: '➕ New Course', callback_data: 'menu_newcourse' }]] }
    });
    return;
  }

  const buttons = courses.map(function (course) {
    return [{ text: course.courseCode + ' — ' + course.courseName, callback_data: 'select_course_' + course.courseId }];
  });

  sendTelegramMessage(chatId, 'Pick a course:', { replyMarkup: { inline_keyboard: buttons } });
}

function handleCourseSelection_(chatId, telegramUserId, courseId) {
  const course = getCourseById_(telegramUserId, courseId);

  if (!course) {
    sendTelegramMessage(chatId, "That course wasn't found — it may belong to a different account. Tap 📚 My Courses to try again.");
    return;
  }

  setActiveCourse_(telegramUserId, course.courseId);
  sendTelegramMessage(chatId, '✅ Switched to ' + escapeHtml(course.courseCode) + ' — ' + escapeHtml(course.courseName) + '.\n\nSend the lecture files or pictures you want to add to this course.');
}