const USER_STATES = {
  IDLE: 'IDLE',
  WAITING_COURSE_NAME: 'WAITING_COURSE_NAME',
  WAITING_COURSE_CODE: 'WAITING_COURSE_CODE'
};

function getUserState_(telegramUserId) {
  const key = 'user_state_' + telegramUserId;
  const raw = PropertiesService.getScriptProperties().getProperty(key);

  if (!raw) {
    return {
      state: USER_STATES.IDLE,
      data: {}
    };
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    clearUserState_(telegramUserId);

    return {
      state: USER_STATES.IDLE,
      data: {}
    };
  }
}

function setUserState_(telegramUserId, state, data) {
  const key = 'user_state_' + telegramUserId;

  const value = JSON.stringify({
    state: state,
    data: data || {}
  });

  PropertiesService
    .getScriptProperties()
    .setProperty(key, value);
}

function clearUserState_(telegramUserId) {
  const key = 'user_state_' + telegramUserId;

  PropertiesService
    .getScriptProperties()
    .deleteProperty(key);
}

function setActiveCourse_(telegramUserId, courseId) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      'active_course_' + telegramUserId,
      String(courseId)
    );
}

function getActiveCourseId_(telegramUserId) {
  return PropertiesService
    .getScriptProperties()
    .getProperty('active_course_' + telegramUserId);
}