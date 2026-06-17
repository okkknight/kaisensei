# AGENTS.md

## Project

Build a mobile-first web prototype for **kaisensei**.

kaisensei is a photo-based English micro-lesson product.

Product idea:

> Take one photo, learn one useful English sentence from that real-world scene.

The app should turn a user's photo into a short, friendly, 1-minute English lesson.

Core lesson path:

```text
See → Learn → Build → Use
```

---

## Product Positioning

kaisensei is not a generic AI photo describer.

It is not:

- a chatbot
- a camera filter app
- a vocabulary list app
- a grammar textbook app
- a test-prep product
- a serious corporate learning tool

It should feel like:

> A friendly, slightly playful English coach that helps the user learn from the real world.

The app should be light, warm, human, and useful.

---

## Target Platform

Build for **mobile web first**.

Recommended stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion for small transitions if useful
- lucide-react for icons if needed

Main target viewport:

```text
390px - 430px wide
844px - 932px tall
```

Desktop can show a centered phone-like preview, but mobile is the real target.

---

## Visual Direction

The design should feel closer to a light, friendly learning app such as Duolingo, but less noisy and less gamified.

Style keywords:

```text
friendly
playful
soft
warm
cartoon-light
clean
encouraging
not childish
not corporate
not flashy
```

Use:

- rounded cards
- soft pastel colors
- large touch targets
- light cartoon accents
- small friendly mascot moments
- simple progress indicators
- chunk chips that feel like small blocks
- gentle positive feedback

Avoid:

- serious textbook style
- exam-app style
- dense text
- complex glassmorphism
- cyber/AI/tech aesthetic
- overly decorative gradients
- heavy gamification
- One Piece / anime references in UI copy

The name **kaisensei** is inspired by a joke, but the product UI should not reference copyrighted characters or anime directly.

---

## Suggested Color Direction

You may tune the palette, but keep it warm and friendly.

```css
--bg: #F7F8FC;
--surface: #FFFFFF;
--surface-warm: #FFF9EE;
--text: #102033;
--muted: #6B7280;

--primary: #6F5BFF;
--primary-soft: #EDE9FF;

--yellow: #FFD24A;
--yellow-soft: #FFF3BF;

--green: #78C96F;
--green-soft: #E9F8E7;

--pink: #FF8AAE;
--pink-soft: #FFE8F0;

--blue-soft: #E8F1FF;

--border: rgba(16, 32, 51, 0.08);
```

Typography:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "PingFang SC", sans-serif;
```

---

## Core Flow

```text
Open app
↓
Camera Mode
↓
Take photo / upload image
↓
Generate Quick Lesson
↓
Step 1: See
↓
Step 2: Learn
↓
Step 3: Build
↓
Step 4: Use
↓
Finish / Retake photo
```

The user should feel they are completing one small lesson, not browsing AI outputs.

---

## Main States

There are three visible states:

1. **Camera Mode**
2. **Loading Mode** - a short transition after photo capture, before the lesson appears
3. **Lesson Mode**

---

## State 1: Camera Mode

### Goal

Let the user start instantly.

The first screen should feel like a friendly camera app with a learning purpose.

### Required Elements

- Camera preview or high-quality mock photo preview
- App name: `kaisensei`
- Friendly microcopy:
  - `Take a photo. Learn one sentence.`
  - or `Snap a scene. Build the English.`
- Difficulty selector:
  - `Normal`
  - `Advanced`
- Big shutter button
- Upload image button
- Optional settings button

### Behavior

Default:

```ts
level = "Normal";
currentPhoto = null;
lesson = null;
```

Tap shutter or upload image:

```text
capture/select image
↓
show loading state
↓
generate lesson
↓
enter Lesson Mode at See step
```

For UI prototyping, mock image and mock lesson data are acceptable.

---

## State 2: Lesson Mode

Lesson Mode is a step-based micro-lesson.

Steps:

```ts
type LessonStep = "See" | "Learn" | "Build" | "Use";
```

Show progress:

```text
1 / 4 See
2 / 4 Learn
3 / 4 Build
4 / 4 Use
```

### Navigation

Preferred MVP navigation:

- `Continue` button as primary navigation
- back button to previous step
- optional step dots/progress bar
- swipe navigation can be added later

The lesson has an intended order, so do not make it feel like random tabs.

---

## Step 1: See

### Goal

Show one natural English sentence based on the photo.

This is the main sentence the user should learn.

### UI Content

- Step label: `See`
- Friendly subtitle:
  - `Here's a natural sentence for this scene.`
- Main sentence
- Play sentence button
- Optional Chinese explanation, visually secondary
- Continue button

### Example

```text
A coffee mug is sitting next to a laptop on the desk.
```

### Rules

- Only one core sentence
- Do not list many objects
- Keep it natural and useful
- English must be visually dominant
- Chinese should not overpower the English

---

## Step 2: Learn

### Goal

Teach reusable chunks from the sentence.

Do not teach isolated words unless necessary.

### UI Content

- Step label: `Learn`
- Subtitle:
  - `Learn the useful chunks.`
- 3-5 chunk cards
- Each chunk has:
  - English chunk
  - short Chinese explanation
  - optional mini play icon
- Optional note

### Example Chunks

```text
a coffee mug
is sitting next to
a laptop
on the desk
```

### Rules

- Chunks should feel like building blocks
- Avoid grammar jargon
- Keep Chinese short
- Prefer phrases and collocations

---

## Step 3: Build

### Goal

The user reconstructs the sentence by ordering chunks.

This is the core exercise of the MVP.

### Interaction

MVP interaction should use click/tap ordering first.

Flow:

```text
Show shuffled chunks
↓
User taps a chunk
↓
Chunk moves to answer area
↓
User can tap selected chunk to remove it
↓
User taps Check
↓
Show friendly feedback
```

Dragging is optional and can be added later.

### UI Content

- Step label: `Build`
- Subtitle:
  - `Put the chunks in order.`
- Shuffled chunk area
- Answer area
- Check button
- Reset button
- Feedback card

### Feedback

Correct:

```text
Nice. This sentence is yours now.
```

Alternative correct copy:

```text
Great job. You built the sentence.
```

Incorrect:

```text
Almost. Try again.
```

More specific if possible:

```text
Almost. Try putting the place at the end.
```

### Rules

- Use chunks, not word-by-word fragments
- Do not split sentences into too many pieces
- Wrong feedback should not feel like an exam
- Let the user retry easily

---

## Step 4: Use

### Goal

Show how the expression can be used in real life through a practical question.

This step turns photo-based learning into practical English use.

### UI Content

- Step label: `Use`
- Subtitle: `Answer the question with the chunks.`
- Situation card
- Real-life question
- Chinese hint, visually secondary
- Shuffled answer chunks
- Answer area
- Check button
- Reset button
- Feedback card
- Finish button

### Example

Situation:

```text
When talking about your workspace, you can say:
```

Question:

```text
What do you usually keep next to your laptop while you work?
```

### Rules

- Do not just comment on the photo
- Show a real communication situation
- The answer should be practical and reusable
- Use a full chunk reordering exercise, not just a displayed sentence
- The answer can be slightly more conversational than the See sentence
- Keep the question short and concrete

---

## Difficulty Levels

Only two levels:

```ts
type Level = "Normal" | "Advanced";
```

### Normal

Default.

- natural
- clear
- short enough
- everyday spoken English
- good for most users

Example:

```text
A coffee mug is sitting next to a laptop on the desk.
```

### Advanced

- richer expression
- more natural phrasing
- may include atmosphere or context
- still should not be too long

Example:

```text
A coffee mug sits beside the laptop, making the desk feel like a calm workspace.
```

### Level Switching

MVP rule:

```text
Switching level regenerates the whole lesson for the current photo.
```

If there is no backend yet, switch mock lesson data.

---

## Lesson Data Structure

Use this structure or something very close to it.

```ts
export type Level = "Normal" | "Advanced";

export type LessonStep = "See" | "Learn" | "Build" | "Use";

export type Chunk = {
  id: string;
  text: string;
  chinese: string;
};

export type BuildExercise = {
  targetSentence: string;
  chunks: Chunk[];
  correctOrder: string[];
};

export type UseExercise = {
  situation: string;
  question: string;
  questionChinese: string;
  targetAnswer: string;
  answerChunks: Chunk[];
  correctOrder: string[];
  speakText: string;
};

export type KaisenLesson = {
  level: Level;
  photoSummary: string;
  see: {
    sentence: string;
    chinese: string;
    speakText: string;
  };
  learn: {
    chunks: Chunk[];
    note: string;
  };
  build: BuildExercise;
  use: UseExercise;
};
```

---

## Mock Lesson Data

Create mock lesson data for at least:

- Normal
- Advanced

Default scene:

```text
a desk with a coffee mug, laptop, notebook, and plant
```

Normal example:

```ts
const normalLesson = {
  level: "Normal",
  photoSummary: "A desk with a coffee mug and a laptop.",
  see: {
    sentence: "A coffee mug is sitting next to a laptop on the desk.",
    chinese: "一个咖啡杯放在桌上，旁边是一台笔记本电脑。",
    speakText: "A coffee mug is sitting next to a laptop on the desk."
  },
  learn: {
    chunks: [
      { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯" },
      { id: "c2", text: "is sitting next to", chinese: "放在……旁边" },
      { id: "c3", text: "a laptop", chinese: "一台笔记本电脑" },
      { id: "c4", text: "on the desk", chinese: "在桌上" }
    ],
    note: "Use 'next to' when two things are close together."
  },
  build: {
    targetSentence: "A coffee mug is sitting next to a laptop on the desk.",
    chunks: [
      { id: "c4", text: "on the desk", chinese: "在桌上" },
      { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯" },
      { id: "c3", text: "a laptop", chinese: "一台笔记本电脑" },
      { id: "c2", text: "is sitting next to", chinese: "放在……旁边" }
    ],
    correctOrder: ["c1", "c2", "c3", "c4"]
  },
  use: {
    situation: "You are talking about your workspace.",
    question: "What do you usually keep next to your laptop while you work?",
    questionChinese: "你工作时通常把什么放在笔记本电脑旁边？",
    targetAnswer: "I usually keep a coffee mug next to my laptop while I work.",
    answerChunks: [
      { id: "u1", text: "I usually keep", chinese: "我通常放" },
      { id: "u2", text: "a coffee mug", chinese: "一个咖啡杯" },
      { id: "u3", text: "next to", chinese: "在……旁边" },
      { id: "u4", text: "my laptop", chinese: "我的笔记本电脑" },
      { id: "u5", text: "while I work", chinese: "当我工作时" }
    ],
    correctOrder: ["u1", "u2", "u3", "u4", "u5"],
    speakText: "I usually keep a coffee mug next to my laptop while I work."
  }
};
```

---

## Voice Playback

MVP can use browser TTS.

```ts
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "en-US";
speechSynthesis.speak(utterance);
```

Rules:

- See sentence can be played
- Use question and answer can be played
- Learn chunks may be played later
- Build step does not need voice playback
- Never read Chinese by default

---

## AI Prompt

When connecting a real AI model, generate the full lesson as JSON.

System prompt:

```text
You are kaisensei, a friendly photo-based English coach.

The user will provide one photo.
Your job is to turn the photo into a short English micro-lesson.

The lesson must follow this path:
See -> Learn -> Build -> Use.

Return JSON only.
Do not include markdown.
Do not include extra commentary.
```

User prompt template:

```text
Generate a photo-based English micro-lesson.

Level: {Normal | Advanced}

Rules:
- Focus on one useful sentence from the photo.
- The sentence should be natural spoken English.
- Prefer practical, high-frequency vocabulary and sentence patterns, but avoid babyish phrasing.
- Do not list too many objects.
- Teach chunks, not isolated words.
- Build exercise should use chunks from the sentence.
- Use step should ask one real-life question and provide a chunk-reordering answer exercise.
- Keep the answer practical and reusable.
- Keep Chinese explanations short.
- Avoid grammar jargon.
- If something is uncertain in the image, say what seems visible instead of guessing.

Return this JSON shape:
{
  "level": "Normal" | "Advanced",
  "photoSummary": string,
  "see": {
    "sentence": string,
    "chinese": string,
    "speakText": string
  },
  "learn": {
    "chunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "note": string
  },
  "build": {
    "targetSentence": string,
    "chunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "correctOrder": string[]
  },
  "use": {
    "situation": string,
    "question": string,
    "questionChinese": string,
    "targetAnswer": string,
    "answerChunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "correctOrder": string[],
    "speakText": string
  }
}
```

---

## Component Suggestions

Suggested structure:

```text
src/
  App.tsx
  types/
    lesson.ts
  data/
    mockLessons.ts
  components/
    CameraScreen.tsx
    LessonScreen.tsx
    StepProgress.tsx
    LevelSelector.tsx
    MascotBubble.tsx
    PrimaryButton.tsx
    PhotoPreview.tsx
    SeeStep.tsx
    LearnStep.tsx
    BuildStep.tsx
    UseStep.tsx
    ChunkChip.tsx
    ChunkCard.tsx
    ReorderExercise.tsx
    VoiceButton.tsx
    FeedbackCard.tsx
    LoadingLesson.tsx
    ErrorState.tsx
```

Keep components small and readable.

---

## Required MVP Features

Implement:

- Mobile-first layout
- Camera / upload entry
- Lesson generation loading state
- See step
- Learn step
- Build step
- Use step
- Step progress
- Normal / Advanced selector
- Chunk reorder exercise
- Use question + answer reorder exercise
- Check answer
- Correct / incorrect feedback
- Voice playback for English
- Tolerant checking that ignores capitalization, punctuation, and extra spaces
- Retake photo
- Friendly UI style

---

## Do Not Implement Yet

Do not implement:

- login
- payment
- history
- spaced repetition
- user accounts
- long course system
- speech scoring
- recording
- social sharing
- iOS native app
- real-time camera AI streaming
- copyrighted anime references

---

## Loading And Error Copy

Use friendly copy.

Loading:

```text
Looking at your scene...
Building your mini lesson...
```

Image unclear:

```text
I couldn't read this scene clearly.
Try another photo with better light.
```

AI request failed:

```text
The lesson got lost on the way.
Try again.
```

---

## Acceptance Criteria

The implementation is acceptable when:

1. The app feels mobile-first.
2. The first screen lets the user take or upload a photo.
3. After photo input, the user enters a 4-step micro-lesson.
4. The lesson path is See → Learn → Build → Use.
5. The old Describe / Explain / Comment / Practice structure is not used.
6. Normal / Advanced switching works.
7. See shows one strong natural sentence.
8. Learn shows reusable chunks.
9. Build lets the user reorder chunks.
10. Check gives friendly feedback.
11. Use asks a real-life question and lets the user reorder the answer chunks.
12. English can be played with TTS.
13. Chinese is present but visually secondary.
14. The visual style is friendly, warm, slightly cartoon, and not childish.
15. The app can be completed in about one minute per photo.

---

## Development Priority

Build in this order:

1. Data types and mock lesson data
2. CameraScreen visual
3. LessonScreen shell
4. StepProgress and navigation
5. SeeStep
6. LearnStep
7. BuildStep with click-to-order interaction
8. UseStep with click-to-order interaction
9. VoiceButton
10. Level switching
11. Loading/error states
12. Visual polish and micro-interactions

Focus on product feel before adding complexity.
