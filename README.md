# Lingua.

A production-focused, cross-platform English-learning app.

## Product direction

- **Brand:** Lingua.
- **Theme:** existing blue/violet prototype direction.
- **Vocabulary:** no artificial product limit; bulk import is a first-class feature.
- **Practice:** flashcards, MCQ, word↔meaning, typing, timed sessions, custom practice and mistake review.
- **Learning:** grammar, idioms & phrases, everyday sentences.
- **Speaking:** AI conversation and pronunciation capabilities planned as core modules.
- **Premium:** reserved for future advanced features.

## Initial vocabulary collection

The supplied collection has been audited separately and normalized without silently deleting duplicate records. The source files are not committed as raw documents; a seed dataset can be generated/imported from the normalized records.

## Architecture target

The client is intended to be cross-platform (Android, iOS and web/desktop responsive UI) with a backend data layer for accounts, vocabulary, learning state, practice history and future AI features.

## Repository boundary

This repository is **completely independent** from `habit-tracker-ultra/habit-forge`. Do not merge the two projects.

## Status

Project foundation initialized. Next work is the production app scaffold, vocabulary data layer/import pipeline, practice engine, and test/release setup.
