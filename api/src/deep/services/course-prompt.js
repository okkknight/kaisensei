export function buildDeepCoursePrompt({ level, repairNotes } = {}) {
  const lines = [
    "Generate one complete kaisensei Deep Mode course from the attached image.",
    "",
    `USER LEVEL: ${String(level || "Normal")}`,
    "",
    "COURSE RULES:",
    "- Return only valid JSON.",
    "- Use mode=deep.",
    "- Follow the Deep Mode course schema exactly.",
    "- Keep the course grounded in the image.",
  ];

  if (repairNotes) {
    lines.push("", "REPAIR NOTES:", String(repairNotes));
  }

  lines.push("", "Return only JSON. No markdown. No commentary.");

  return lines.join("\n");
}
