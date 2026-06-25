import { DEEP_COURSE_SCHEMA } from "../schema/deep-course-schema.js";

function createMockPhotoPreviewUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef7e8"/>
          <stop offset="100%" stop-color="#ece7ff"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffd34d"/>
          <stop offset="100%" stop-color="#ffb347"/>
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="56" fill="url(#bg)"/>
      <circle cx="500" cy="120" r="74" fill="url(#sun)" opacity="0.88"/>
      <rect x="92" y="348" width="456" height="170" rx="32" fill="#ffffff" opacity="0.9"/>
      <rect x="140" y="396" width="220" height="24" rx="12" fill="#6c4ef6" opacity="0.24"/>
      <rect x="140" y="434" width="300" height="20" rx="10" fill="#6c4ef6" opacity="0.16"/>
      <circle cx="470" cy="416" r="52" fill="#67c587" opacity="0.24"/>
      <text x="96" y="140" fill="#14213d" font-family="Arial, sans-serif" font-size="34" font-weight="700">Step In Mock</text>
      <text x="96" y="184" fill="#6b7280" font-family="Arial, sans-serif" font-size="20">Local deep-mode preview</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const DEEP_MOCK_STEP_IN_LESSON = DEEP_COURSE_SCHEMA;
export const DEEP_MOCK_STEP_IN_PHOTO_URL = createMockPhotoPreviewUrl();
