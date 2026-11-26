// What the archive's file list may hold, shared by the script that builds it
// and the script that checks it.

/** The only top-level folders that are read. */
export const SOURCES = { Courses: 'Courses', OCW: 'OCW', Graduate_Entrance_Exams: 'Graduate entrance exams' };

/** Folder names that are never read or listed, wherever they appear in a path. */
export const EXCLUDED_FOLDERS = [
  'ChuanTi',
  'Staff',
  '_Misc',
  '_Private',
  'Personal_Information',
  'Transcripts',
  'Tuition',
  'TA',
  'Dormitories',
  'Moments',
];

/** Words that must not appear anywhere in the list. */
export const FORBIDDEN_TEXT = ['@', 'mailto', '修課人數', 'Enrollment', 'GPA', 'Std Dev'];

/** Type folders that are listed, and the name each is shown under. */
export const TYPES = {
  Exams: 'Exams',
  Assignments: 'Homework',
  Homework: 'Homework',
  Quizzes: 'Quizzes',
  Notes: 'Notes',
  Slides: 'Slides',
  Tutorials: 'Tutorials',
};

/** A nine-digit run, the shape of a student number: a path that holds one is never listed. */
export const STUDENT_ID = /(?<!\d)\d{9}(?!\d)/;

export const OUTPUT = 'public/data/archive/files.json';
