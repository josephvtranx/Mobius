// Subject → card banner tint / accent / icon (design-handoff seed mapping;
// keyword match so real tenant subject names land on the same families).
// Shared by the family "My classes" cards and the staff Classes grid so a
// subject keeps one visual identity everywhere.
export const SUBJECT_LOOKS = [
  { match: /math|algebra|calc|geometr/i, icon: 'fa-solid fa-square-root-variable', band: '#e6f3f0', accent: '#2e9d8d' },
  { match: /chem/i, icon: 'fa-solid fa-flask', band: '#eef1fb', accent: '#5b6bc0' },
  { match: /english|lit|read|essay|writ/i, icon: 'fa-solid fa-book-open', band: '#fbeef1', accent: '#b95a76' },
  { match: /physic|science|bio/i, icon: 'fa-solid fa-atom', band: '#e6f3f0', accent: '#2e9d8d' },
  { match: /sat|test|prep/i, icon: 'fa-solid fa-graduation-cap', band: '#fff4e0', accent: '#9c6a1d' },
];

export const lookFor = (subject) =>
  SUBJECT_LOOKS.find((l) => l.match.test(subject)) ??
  { icon: 'fa-solid fa-bookmark', band: '#e6f3f0', accent: '#2e9d8d' };
