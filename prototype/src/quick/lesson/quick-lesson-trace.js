export function createQuickLessonTraceId() {
  return `flow_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logQuickLessonTrace(event, data = {}) {
  console.info(
    `[kaisensei][client] ${JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...data,
    })}`,
  );
}

export function roundQuickLessonMs(value) {
  return Math.round(value);
}
