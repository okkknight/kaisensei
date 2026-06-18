export function traceLog(scope, event, data = {}) {
  const entry = {
    at: new Date().toISOString(),
    scope,
    event,
    ...data,
  };

  console.info(`[kaisensei][api] ${JSON.stringify(entry)}`);
}
