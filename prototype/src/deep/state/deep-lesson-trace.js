export function createDeepLessonTraceId() {
  return `flow_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logDeepLessonTrace(event, data = {}) {
  console.info(
    `[kaisensei][client] ${JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...data,
    })}`,
  );
}

export function roundDeepLessonMs(value) {
  return Math.round(value);
}
