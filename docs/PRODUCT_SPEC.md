# Lingua. Product Specification — v0.1

## Core navigation

1. Home
2. Learn
   - Vocabulary
   - Grammar
   - Idioms & Phrases
   - Everyday Sentences
3. Practice
   - Flashcards
   - Multiple Choice
   - Word → Meaning
   - Meaning → Word
   - Type Answer
   - Timed Practice
   - Custom Practice
   - Mistake Review
4. Speak
   - AI Conversation
   - Pronunciation
   - Speaking Practice
5. Progress
6. Profile / Settings

## Vocabulary library

Vocabulary is a reusable learning object. It can contain:
- word
- pronunciation
- meaning
- translations
- synonyms
- example sentence
- part of speech
- difficulty
- collection/tags
- source provenance

Learning state and practice history must be stored separately from source content.

## Bulk import

Supported source formats planned: DOCX, XLSX, CSV, TXT and JSON.

Flow:

`Upload → Detect → Parse → Normalize → Preview → Duplicate Check → User Decision → Import`

Duplicate actions:
- Skip
- Replace existing
- Keep both
- Merge/review

Import must preserve source filename and source row where possible.

## Practice customization

A session can configure:
- collection(s)
- practice mode
- question count
- question order
- difficulty
- include new/review/mistake/mastered words
- repeat mistakes
- question timer
- answer/reveal duration
- auto-advance

Example requested behavior:
- question time: 5 seconds
- on wrong answer or timeout: show correct answer for 2 seconds
- then advance

All timing values must be configurable.

## Cross-device target

The product should work across Android phones/tablets, iPhone/iPad, and responsive desktop/web. User data and learning progress belong in a backend so the same account can sync across devices.

## Branding

Display the product as **Lingua.**. Do not use an all-caps wordmark. Keep the existing prototype's blue/violet visual direction. The final period may be slightly larger and theme-colored; no extra dot above the letter `a`.
