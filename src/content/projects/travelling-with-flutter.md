---
title: Travelling with Flutter
slug: travelling-with-flutter
start: "2026-02"
end: "2026-06"
featured: true
summary: A collaborative trip planner in Flutter and Firebase, with an AI agent that plans and edits trips.
about:
  - Travelling with Flutter is a group travel-planning app with shared trips, real-time group chat and trip memories. You create a trip, fill in the itinerary and invite friends as owners, editors or viewers. Everything is stored in Firestore, so changes show up for everyone in real time, on a phone, a tablet, a desktop or in a browser.
  - AI-assisted planning and location search come from an agent we built ourselves on the OpenAI API. It chats, writes a full trip plan, edits a single day and suggests transport, and it runs through Firebase Cloud Functions, so no provider key ships inside the app. A trip can also have its own group chat, and the app has maps and place search.
play:
  - "Create a trip and fill in its itinerary: days, activities, bookings, budget categories and checklists."
  - Invite friends as owner, editor or viewer.
  - Chat with the group, in the trip's own chat or in a standalone group chat.
  - Search for places on the map.
  - Ask the AI agent for a full trip plan, a change to a single day or transport suggestions.
playHeading: How to use
built:
  - I built the interface and the backend.
  - The app is written in Dart with Flutter, for Android, iOS, web and desktop.
  - Firebase handles sign-in (Authentication, with Google Sign-In), data (Cloud Firestore), files (Cloud Storage) and push notifications (Cloud Messaging).
  - The AI agent and the place search (Geoapify) run in Cloud Functions on Node.js 22. The agent's output is checked before it is saved, and owner and editor permissions are enforced in code.
  - flutter_map draws the maps, and flutter_earth_globe draws the interactive 3D globe.
members:
  - Albert Jonathan
  - Bradley Chandra
  - Patrick Kosasih
  - Vincent Jefferson
stack:
  - Flutter
  - Dart
  - Firebase
  - OpenAI API
repo: https://github.com/Fincarson/Travelling_with_Flutter
media:
  - src: ../../assets/projects/travelling-with-flutter/cover.webp
    alt: "Travelling with Flutter cover. It reads: Travel planner · Flutter · Firebase. Travelling with Flutter. Plan trips together, in sync across every device. Beside the words, a dotted route joins two points on blue circles."
---
