import { getStepInFrozenBackgroundSummarySource } from "./deep-stage-context.js";

function formatCsv(values) {
  return values.length > 0 ? values.join(", ") : "(none)";
}

function formatPackLine(prefix, pack, index) {
  const id = pack?.id || `${prefix}-${index + 1}`;
  const coreExpression = pack?.coreExpression || "";
  const meaningChinese = pack?.meaningChinese || "";
  const example = pack?.baseExample?.english || "";
  const parts = [`- ${id}`];

  if (coreExpression) {
    parts.push(coreExpression);
  }

  if (meaningChinese) {
    parts.push(meaningChinese);
  }

  const line = parts.join(" | ");
  return example ? `${line}\n  example: ${example}` : line;
}

function formatTaskPackLine(taskPack, index) {
  const id = taskPack?.id || `task-${index + 1}`;
  const taskTitle = taskPack?.taskTitle || "";
  const scenePrompt = taskPack?.scenePrompt || "";
  const scenePromptChinese = taskPack?.scenePromptChinese || "";
  const needCoreExpression = taskPack?.need?.coreExpression || "";
  const handleCoreExpression = taskPack?.handle?.coreExpression || "";
  const parts = [`- ${id}`];

  if (taskTitle) {
    parts.push(taskTitle);
  }

  if (scenePrompt) {
    parts.push(scenePrompt);
  }

  if (scenePromptChinese) {
    parts.push(scenePromptChinese);
  }

  if (needCoreExpression || handleCoreExpression) {
    parts.push(`need: ${needCoreExpression || "(missing)"}`, `handle: ${handleCoreExpression || "(missing)"}`);
  }

  return parts.join(" | ");
}

export function formatStepInFrozenBackgroundSummary(background = {}, level = "") {
  const summarySource = getStepInFrozenBackgroundSummarySource(background);
  const overview = summarySource.overview || {};
  const noticePacks = Array.isArray(summarySource.notice?.expressionPacks) ? summarySource.notice.expressionPacks : [];
  const interpretPacks = Array.isArray(summarySource.interpret?.expressionPacks) ? summarySource.interpret.expressionPacks : [];
  const taskPacks = Array.isArray(summarySource.interact?.taskPacks) ? summarySource.interact.taskPacks : [];
  const lines = [
    "AVAILABLE PRE-STAGE CONTENT",
    "",
    "STEP IN SUMMARY",
    "",
    "OVERVIEW",
    `- level: ${level || "normal"}`,
    `- keywords: ${formatCsv(Array.isArray(overview.keywords) ? overview.keywords : [])}`,
    `- sceneDescriptionChinese: ${overview.sceneDescriptionChinese || "(missing)"}`,
    `- startPromptChinese: ${overview.startPromptChinese || "(missing)"}`,
    "",
    "NOTICE CANDIDATES",
    noticePacks.length > 0 ? noticePacks.map((pack, index) => formatPackLine("notice", pack, index)) : ["- (none)"],
    "",
    "INTERPRET CANDIDATES",
    interpretPacks.length > 0 ? interpretPacks.map((pack, index) => formatPackLine("interpret", pack, index)) : ["- (none)"],
    "",
    "INTERACT TASK PACKS",
    taskPacks.length > 0 ? taskPacks.map((pack, index) => formatTaskPackLine(pack, index)) : ["- (none)"],
  ];

  return lines.flat().join("\n");
}

export function buildStepInPromptAddendum() {
  return [
    "STEP IN TASK DEFINITION:",
    "- Step In is the final Deep Mode stage.",
    "- Generate one continuous in-scene conversation built around exactly one Interact Task Pack.",
    "- Reuse exactly one learned Notice coreExpression, one learned Interpret coreExpression, one Need coreExpression, and one Handle coreExpression from the completed modules.",
    "- Need and Handle must come from the same Interact Task Pack.",
    "- Notice and Interpret must naturally support that same event.",
    "- Do not create a new coreExpression, do not modify earlier modules, and do not output planning notes or metadata.",
    "",
    "EXPRESSION SELECTION ORDER:",
    "- Choose the interaction anchor first: review all Interact Task Packs and select the one that can become the most natural complete event in this exact scene.",
    "- Prefer a task with one clear practical goal, one natural Need, and one Handle that can directly respond within a short conversation.",
    "- Do not automatically choose the first Task Pack.",
    "- Then choose one Notice expression that provides visible evidence for that event.",
    "- Then choose one Interpret expression that cautiously explains the Notice fact and motivates the Need.",
    "- Do not select expressions by their original pack order.",
    "- The causal chain must be: visible fact -> plausible meaning -> practical request or action -> useful response -> local resolution.",
    "- If the selected Task Pack does not connect naturally to any Notice and Interpret combination, choose another Task Pack instead of forcing the scene.",
    "- Do not force compatibility by changing location, switching roles, inventing a second problem, or introducing unrelated objects.",
    "- If no combination is perfect, choose the one with the strongest direct causal relationship and build the smallest plausible event supported by the photo.",
    "",
    "INTERNAL EVENT PLAN:",
    "- Define roles, sharedGoal, trigger, interpretation, actionNeed, systemCondition, and resolution internally before writing the dialogue.",
    "- The whole event should be simple enough to summarize as: two people notice X, conclude Y, and decide or attempt Z.",
    "- Treat these labels as prompt-internal planning notes only. Do not emit them in the JSON output.",
    "",
    "EVENT TEMPLATES:",
    "- Choose the template that best fits the selected expressions. Templates define the event relationship, not fixed wording.",
    "- abnormality_resolution: use when something appears blocked, missing, unavailable, broken, closed, unsafe, or different from expected.",
    "- abnormality_resolution flow: visible abnormality -> interpretation of its cause or effect -> request or proposed action -> system gives information, a condition, or a limitation -> learner adjusts and resolves the situation.",
    "- joint_decision: use when two people need to make or adjust a shared choice.",
    "- joint_decision flow: visible situation -> judgment about the situation -> learner proposes or asks about an option -> system expresses a condition, preference, or concern -> learner confirms or adjusts the decision.",
    "- request_assistance: use when the learner needs information, permission, help, or a service.",
    "- request_assistance flow: visible difficulty or missing resource -> judgment that assistance is needed -> learner makes a specific request -> system gives information, asks for clarification, or offers a partial solution -> learner responds and completes the request.",
    "- social_response: use when the learner notices another person's visible state.",
    "- social_response flow: visible personal state -> cautious interpretation of the person's condition or feeling -> learner asks, checks, or offers help -> system explains the situation or states a need -> learner responds naturally.",
    "- generic_event: use only when none of the above fits naturally.",
    "- generic_event flow: visible fact -> plausible interpretation -> practical action -> meaningful response -> natural handling.",
    "- Do not choose a custom flow merely to avoid selecting the best matching template.",
    "",
    "EIGHT-TURN DIALOGUE ROLES:",
    "- Generate exactly eight turns in this order: system, notice, system, interpret, system, interact_need, system, interact_handle.",
    "- The four user turns must use these exact sourceModule values in order: notice, interpret, interact_need, interact_handle.",
    "Turn 1 - System opens the event:",
    "- Open the event, establish the immediate moment or shared goal, and make the Notice line a natural response. The first system turn must establish the Notice trigger, not the Need.",
    "- May: point out that something seems different, refer to what the two people are trying to do, draw attention to the relevant area without stating the learner's observation, or introduce a small practical situation.",
    "- Must not: describe the entire photo, ask the learner to list visible objects, say the selected Notice expression for the learner, behave like a teacher, ask a generic exercise question, or jump directly to the Need.",
    "- Avoid lines such as: What can you see in the photo? Describe the scene. Now use the Notice expression. What should you say next?",
    "Turn 2 - User Notice:",
    "- State one objectively visible fact that is directly relevant to the current event and contains the selected Notice coreExpression verbatim.",
    "Turn 3 - System bridges Notice to Interpret:",
    "- Respond directly to Turn 2 and bridge from Notice to Interpret by adding reaction, uncertainty, or context.",
    "Turn 4 - User Interpret:",
    "- Make a cautious inference supported by the earlier turns and include the selected Interpret coreExpression verbatim.",
    "Turn 5 - System bridges Interpret to action:",
    "- Respond to the interpretation and move the situation toward a practical request, decision, or action without speaking the learner's Need for them.",
    "Turn 6 - User Need:",
    "- Make the selected Need request, question, or proposal verbatim, continuing the same event and immediate goal.",
    "Turn 7 - System responds to Need:",
    "- Give a realistic response, condition, clarification, limitation, or option that gives the final Handle line something specific to answer.",
    "- May: provide a practical option, relevant information, a condition, a mild limitation, a clarification question, a small obstacle, or a suggested adjustment.",
    "- Avoid empty bridge lines such as: Sure. Okay. No problem. I see. That's fine. A short agreement is allowed only if it also gives the final Handle line a clear response target.",
    "Turn 8 - User Handle:",
    "- Respond directly to Turn 7 with the selected Handle coreExpression verbatim and locally resolve or advance the interaction.",
    "- May: accept the option, adjust the request, clarify the plan, confirm the next action, politely reject a condition, or solve the immediate problem.",
    "",
    "LANGUAGE AND STRUCTURE CONSTRAINTS:",
    "System identity:",
    "- The system is a real person inside the scene and does not know that this is an English exercise.",
    "- The same system character must speak in all four system turns.",
    "System bridge rule:",
    "- Every middle system turn must act as a bridge: previous learner line -> natural system reaction -> reason for the next learner line.",
    "- A system turn is invalid if it ignores the previous learner line, acts only as narration, introduces an unrelated detail, sounds like an exercise instruction, or could be replaced by a generic filler reply.",
    "Scene consistency:",
    "- Keep one location, one role pair, one immediate goal, one main event, and one continuous timeline throughout the dialogue.",
    "- Do not move through the photo as a checklist of objects. Do not invent a location change, role change, time jump, or second event.",
    "Core expression rules:",
    "- Each user line must contain its selected coreExpression exactly as learned. Do not shorten it, paraphrase it, swap it for a synonym, or replace part of it with a pronoun.",
    "- The four selected coreExpressions should appear in their corresponding user turns only as needed. Do not unnaturally repeat them in system turns.",
    "- You may rewrite the rest of each user sentence so it fits the new conversation naturally, but do not automatically copy the full earlier example sentence.",
    "Natural language rules:",
    "- The dialogue must sound like two real people reacting in real time, not a vocabulary review list or a teacher-led exercise.",
    "- Prefer short natural spoken English. User lines should usually stay concise, and system turns may use one or two short sentences when that helps the bridge feel real.",
    "- For Normal, prefer direct everyday wording. For Advanced, use smoother spoken phrasing without becoming literary, academic, or long-winded.",
    "",
    "OUTPUT STRUCTURE:",
    "- Keep the final Step In output within the provided schema and do not add any new fields.",
    "- Write one short English scene and one short Chinese sceneChinese that establish who the two roles are, where they are, and what they are trying to do.",
    "- Do not summarize all eight turns, list selected expressions, write an exercise instruction, or reveal the full resolution in scene or sceneChinese.",
    "- Every user turn must contain speaker, text, sourceModule, chunks, distractors, and answer.",
    "User chunk rules:",
    "- Split each user text into natural spoken chunks. Keep fixed expressions together when possible and avoid awkward one-word chunks created only to pad counts.",
    "- Keep punctuation attached to the chunk where it naturally belongs. Sentence-final punctuation should usually stay on the last chunk.",
    "- Do not split punctuation into its own chunk.",
    "- Each answer must reconstruct its text exactly according to the existing app reconstruction rule.",
    "User distractor rules:",
    "- Distractors must be plausible but wrong for this exact sentence, must not duplicate answer chunks, and must not introduce a new coreExpression.",
    "- Distractors may keep natural punctuation when it helps them look like real alternatives, especially at sentence end.",
    "- System turns must contain only speaker and text.",
    "- Return JSON only. Do not output event templates, selection notes, pack IDs unless already required by schema, explanations, comments, or semantic metadata.",
    "",
    "SELF-CHECK BEFORE RETURN:",
    "- Structure: exactly eight turns, strict system/user alternation, canonical sourceModule order, required user fields present, and system turns contain only allowed fields.",
    "- Learned expressions: one Notice, one Interpret, one Need, and one Handle coreExpression are used verbatim; Need and Handle come from the same Interact Task Pack; no new coreExpression is introduced.",
    "- Event coherence: one location, one role pair, one goal, one main event; Notice supports Interpret; Interpret motivates Need; Turn 7 gives Turn 8 something specific to answer.",
    "- Bridge quality: Turns 3, 5, and 7 each respond backward and prepare forward. Turn 1 makes Turn 2 a natural response.",
    "- Dependency test: if removing the immediately preceding line would not weaken the next line, the connection is probably too loose and should be rewritten.",
    "- No content outside the JSON.",
  ].join("\n");
}
