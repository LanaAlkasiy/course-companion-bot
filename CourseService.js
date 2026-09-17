function createCourse_(telegramUserId, courseName, courseCode) {
  const sheet = getOrCreateSheet_(CONFIG.SHEET_NAMES.COURSES);
  const courseId = Utilities.getUuid();
  const createdAt = new Date().toISOString();

  sheet.appendRow([courseId, String(telegramUserId), courseName, courseCode, createdAt]);

  return { courseId: courseId, courseName: courseName, courseCode: courseCode };
}

function getUserCourses_(telegramUserId) {
  const sheet = getOrCreateSheet_(CONFIG.SHEET_NAMES.COURSES);
  const rows = sheet.getDataRange().getValues();
  const courses = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[1]) === String(telegramUserId)) {
      courses.push({ courseId: row[0], courseName: row[2], courseCode: row[3] });
    }
  }
  return courses;
}

function getCourseById_(telegramUserId, courseId) {
  const courses = getUserCourses_(telegramUserId);
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].courseId === courseId) return courses[i];
  }
  return null;
}