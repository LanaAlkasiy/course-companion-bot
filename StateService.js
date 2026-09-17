const USER_STATES = {
  IDLE: 'IDLE',
  WAITING_COURSE_NAME: 'WAITING_COURSE_NAME',
  WAITING_COURSE_CODE: 'WAITING_COURSE_CODE'
};

function getUserState_(telegramUserId) {
  const raw = CacheService.getScriptCache().get('state_' + telegramUserId);
  if (!raw) return { state: USER_STATES.IDLE, data: {} };
  return JSON.parse(raw);
}

function setUserState_(telegramUserId, state, data) {
  const payload = JSON.stringify({ state: state, data: data || {} });
  CacheService.getScriptCache().put('state_' + telegramUserId, payload, 600);
}

function clearUserState_(telegramUserId) {
  CacheService.getScriptCache().remove('state_' + telegramUserId);
}

function setActiveCourse_(telegramUserId, courseId) {
  PropertiesService.getScriptProperties().setProperty('active_course_' + telegramUserId, courseId);
}

function getActiveCourseId_(telegramUserId) {
  return PropertiesService.getScriptProperties().getProperty('active_course_' + telegramUserId);
}