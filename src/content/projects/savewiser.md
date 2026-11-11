---
title: SaveWiser
slug: savewiser
start: "2025-05"
end: "2025-08"
featured: false
summary: A savings and budgeting app for students and young people.
about:
  - SaveWiser is a mobile app for students and young people who want to take control of their money. It splits money into needs, wants and savings by the 50/30/20 rule and shows on the home screen whether you are on track. You can set savings goals, log daily spending and get an alert when you go over budget.
  - To make saving a habit, the app can lock a chosen share of income into savings automatically, with an optional guardian passcode for withdrawals. It also sends a daily reminder at a time you choose and can give optional AI savings advice. All financial data stays on the device.
play:
  - Set a savings goal with a target amount, a deadline and a purpose.
  - Log what you spend. Each expense is sorted into needs, wants or savings.
  - Check the home screen to see whether you are on track.
  - Choose a share of income to lock into savings, and add a guardian passcode if you want one.
playHeading: How to use
playSteps: true
built:
  - I built the user interface (front end) in Flutter.
  - The app is written in Dart with Flutter, with Android as the main target.
  - Hive stores transactions on the device, and shared_preferences stores the profile and settings.
  - fl_chart and pie_chart draw the charts.
  - flutter_local_notifications sends the daily reminders.
  - The optional AI savings advice uses OpenRouter and stays off unless an API key is supplied.
members:
  - Team project. Vincent Jefferson built the user interface (front end).
stack:
  - Flutter
  - Dart
  - Hive
  - fl_chart
repo: https://github.com/Fincarson/SaveWiser
media:
  - src: ../../assets/projects/savewiser/cover.png
    alt: "SaveWiser cover: the app's home screen on a phone, with a 50/30/20 expenses chart marked On Track and a list of recent spending."
---
