export class AIProviderError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "AIProviderError";
    this.details = details;
  }
}

export class LessonValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LessonValidationError";
    this.code = "lesson_validation_error";
    this.details = details;
  }
}
