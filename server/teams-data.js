export const TEAMS = {
  A: ['Mexiko', 'Sydafrika', 'Sydkorea', 'Tjeckien'],
  B: ['Kanada', 'Schweiz', 'Qatar', 'Bosnien-Hercegovina'],
  C: ['Brasilien', 'Marocko', 'Haiti', 'Skottland'],
  D: ['USA', 'Paraguay', 'Australien', 'Turkiet'],
  E: ['Tyskland', 'Curaçao', 'Elfenbenskusten', 'Ecuador'],
  F: ['Nederländerna', 'Japan', 'Sverige', 'Tunisien'],
  G: ['Belgien', 'Egypten', 'Iran', 'Nya Zeeland'],
  H: ['Spanien', 'Kap Verde', 'Saudiarabien', 'Uruguay'],
  I: ['Frankrike', 'Senegal', 'Norge', 'Irak'],
  J: ['Argentina', 'Algeriet', 'Österrike', 'Jordanien'],
  K: ['Portugal', 'DR Kongo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Kroatien', 'Ghana', 'Panama'],
};

export const GROUP_NAMES = Object.keys(TEAMS);

// All times in CEST (UTC+2)
export const GROUP_SCHEDULE = {
  A: [
    { home: 'Mexiko', away: 'Sydafrika', date: '2026-06-11', time: '21:00', venue: 'Mexico City' },
    { home: 'Sydkorea', away: 'Tjeckien', date: '2026-06-12', time: '04:00', venue: 'Guadalajara' },
    { home: 'Tjeckien', away: 'Sydafrika', date: '2026-06-18', time: '18:00', venue: 'Atlanta' },
    { home: 'Mexiko', away: 'Sydkorea', date: '2026-06-19', time: '03:00', venue: 'Guadalajara' },
    { home: 'Tjeckien', away: 'Mexiko', date: '2026-06-25', time: '03:00', venue: 'Mexico City' },
    { home: 'Sydafrika', away: 'Sydkorea', date: '2026-06-25', time: '03:00', venue: 'Monterrey' },
  ],
  B: [
    { home: 'Kanada', away: 'Bosnien-Hercegovina', date: '2026-06-12', time: '21:00', venue: 'Toronto' },
    { home: 'Schweiz', away: 'Qatar', date: '2026-06-13', time: '21:00', venue: 'San Francisco' },
    { home: 'Schweiz', away: 'Bosnien-Hercegovina', date: '2026-06-18', time: '21:00', venue: 'Los Angeles' },
    { home: 'Kanada', away: 'Qatar', date: '2026-06-19', time: '00:00', venue: 'Vancouver' },
    { home: 'Schweiz', away: 'Kanada', date: '2026-06-24', time: '21:00', venue: 'Vancouver' },
    { home: 'Bosnien-Hercegovina', away: 'Qatar', date: '2026-06-24', time: '21:00', venue: 'Seattle' },
  ],
  C: [
    { home: 'Brasilien', away: 'Marocko', date: '2026-06-14', time: '00:00', venue: 'New York/New Jersey' },
    { home: 'Haiti', away: 'Skottland', date: '2026-06-14', time: '03:00', venue: 'Boston' },
    { home: 'Skottland', away: 'Marocko', date: '2026-06-20', time: '00:00', venue: 'Boston' },
    { home: 'Brasilien', away: 'Haiti', date: '2026-06-20', time: '02:30', venue: 'Philadelphia' },
    { home: 'Skottland', away: 'Brasilien', date: '2026-06-25', time: '00:00', venue: 'Miami' },
    { home: 'Marocko', away: 'Haiti', date: '2026-06-25', time: '00:00', venue: 'Atlanta' },
  ],
  D: [
    { home: 'USA', away: 'Paraguay', date: '2026-06-13', time: '03:00', venue: 'Los Angeles' },
    { home: 'Australien', away: 'Turkiet', date: '2026-06-14', time: '06:00', venue: 'Vancouver' },
    { home: 'USA', away: 'Australien', date: '2026-06-19', time: '21:00', venue: 'Seattle' },
    { home: 'Turkiet', away: 'Paraguay', date: '2026-06-20', time: '05:00', venue: 'San Francisco' },
    { home: 'Turkiet', away: 'USA', date: '2026-06-26', time: '04:00', venue: 'Los Angeles' },
    { home: 'Paraguay', away: 'Australien', date: '2026-06-26', time: '04:00', venue: 'San Francisco' },
  ],
  E: [
    { home: 'Tyskland', away: 'Curaçao', date: '2026-06-14', time: '19:00', venue: 'Houston' },
    { home: 'Elfenbenskusten', away: 'Ecuador', date: '2026-06-15', time: '01:00', venue: 'Philadelphia' },
    { home: 'Tyskland', away: 'Elfenbenskusten', date: '2026-06-20', time: '22:00', venue: 'Toronto' },
    { home: 'Ecuador', away: 'Curaçao', date: '2026-06-21', time: '02:00', venue: 'Kansas City' },
    { home: 'Ecuador', away: 'Tyskland', date: '2026-06-25', time: '22:00', venue: 'New York/New Jersey' },
    { home: 'Curaçao', away: 'Elfenbenskusten', date: '2026-06-25', time: '22:00', venue: 'Philadelphia' },
  ],
  F: [
    { home: 'Nederländerna', away: 'Japan', date: '2026-06-14', time: '22:00', venue: 'Dallas' },
    { home: 'Sverige', away: 'Tunisien', date: '2026-06-15', time: '04:00', venue: 'Monterrey' },
    { home: 'Nederländerna', away: 'Sverige', date: '2026-06-20', time: '19:00', venue: 'Houston' },
    { home: 'Tunisien', away: 'Japan', date: '2026-06-21', time: '06:00', venue: 'Monterrey' },
    { home: 'Japan', away: 'Sverige', date: '2026-06-26', time: '01:00', venue: 'Dallas' },
    { home: 'Tunisien', away: 'Nederländerna', date: '2026-06-26', time: '01:00', venue: 'Kansas City' },
  ],
  G: [
    { home: 'Belgien', away: 'Egypten', date: '2026-06-15', time: '21:00', venue: 'Seattle' },
    { home: 'Iran', away: 'Nya Zeeland', date: '2026-06-16', time: '03:00', venue: 'Los Angeles' },
    { home: 'Belgien', away: 'Iran', date: '2026-06-21', time: '21:00', venue: 'Los Angeles' },
    { home: 'Nya Zeeland', away: 'Egypten', date: '2026-06-22', time: '03:00', venue: 'Vancouver' },
    { home: 'Egypten', away: 'Iran', date: '2026-06-27', time: '05:00', venue: 'Seattle' },
    { home: 'Nya Zeeland', away: 'Belgien', date: '2026-06-27', time: '05:00', venue: 'Vancouver' },
  ],
  H: [
    { home: 'Spanien', away: 'Kap Verde', date: '2026-06-15', time: '18:00', venue: 'Atlanta' },
    { home: 'Saudiarabien', away: 'Uruguay', date: '2026-06-16', time: '00:00', venue: 'Miami' },
    { home: 'Spanien', away: 'Saudiarabien', date: '2026-06-21', time: '18:00', venue: 'Atlanta' },
    { home: 'Uruguay', away: 'Kap Verde', date: '2026-06-22', time: '00:00', venue: 'Miami' },
    { home: 'Kap Verde', away: 'Saudiarabien', date: '2026-06-27', time: '02:00', venue: 'Houston' },
    { home: 'Uruguay', away: 'Spanien', date: '2026-06-27', time: '02:00', venue: 'Guadalajara' },
  ],
  I: [
    { home: 'Frankrike', away: 'Senegal', date: '2026-06-16', time: '21:00', venue: 'New York/New Jersey' },
    { home: 'Irak', away: 'Norge', date: '2026-06-17', time: '00:00', venue: 'Boston' },
    { home: 'Frankrike', away: 'Irak', date: '2026-06-22', time: '23:00', venue: 'Philadelphia' },
    { home: 'Norge', away: 'Senegal', date: '2026-06-23', time: '02:00', venue: 'New York/New Jersey' },
    { home: 'Norge', away: 'Frankrike', date: '2026-06-26', time: '21:00', venue: 'Boston' },
    { home: 'Senegal', away: 'Irak', date: '2026-06-26', time: '21:00', venue: 'Toronto' },
  ],
  J: [
    { home: 'Argentina', away: 'Algeriet', date: '2026-06-17', time: '03:00', venue: 'Kansas City' },
    { home: 'Österrike', away: 'Jordanien', date: '2026-06-17', time: '06:00', venue: 'San Francisco' },
    { home: 'Argentina', away: 'Österrike', date: '2026-06-22', time: '19:00', venue: 'Dallas' },
    { home: 'Jordanien', away: 'Algeriet', date: '2026-06-23', time: '05:00', venue: 'San Francisco' },
    { home: 'Algeriet', away: 'Österrike', date: '2026-06-28', time: '04:00', venue: 'Kansas City' },
    { home: 'Jordanien', away: 'Argentina', date: '2026-06-28', time: '04:00', venue: 'Dallas' },
  ],
  K: [
    { home: 'Portugal', away: 'DR Kongo', date: '2026-06-17', time: '19:00', venue: 'Houston' },
    { home: 'Uzbekistan', away: 'Colombia', date: '2026-06-18', time: '04:00', venue: 'Mexico City' },
    { home: 'Portugal', away: 'Uzbekistan', date: '2026-06-23', time: '19:00', venue: 'Houston' },
    { home: 'Colombia', away: 'DR Kongo', date: '2026-06-24', time: '04:00', venue: 'Guadalajara' },
    { home: 'Colombia', away: 'Portugal', date: '2026-06-28', time: '01:30', venue: 'Miami' },
    { home: 'DR Kongo', away: 'Uzbekistan', date: '2026-06-28', time: '01:30', venue: 'Atlanta' },
  ],
  L: [
    { home: 'England', away: 'Kroatien', date: '2026-06-17', time: '22:00', venue: 'Dallas' },
    { home: 'Ghana', away: 'Panama', date: '2026-06-18', time: '01:00', venue: 'Toronto' },
    { home: 'England', away: 'Ghana', date: '2026-06-23', time: '22:00', venue: 'Boston' },
    { home: 'Panama', away: 'Kroatien', date: '2026-06-24', time: '01:00', venue: 'Toronto' },
    { home: 'Panama', away: 'England', date: '2026-06-27', time: '23:00', venue: 'New York/New Jersey' },
    { home: 'Kroatien', away: 'Ghana', date: '2026-06-27', time: '23:00', venue: 'Philadelphia' },
  ],
};

export function getGroupMatches(groupTeams) {
  return GROUP_SCHEDULE[getGroupKey(groupTeams)] || defaultGroupMatches(groupTeams);
}

function getGroupKey(groupTeams) {
  for (const [key, teams] of Object.entries(TEAMS)) {
    if (teams[0] === groupTeams[0]) return key;
  }
  return null;
}

function defaultGroupMatches(groupTeams) {
  const [a, b, c, d] = groupTeams;
  return [
    { home: a, away: b },
    { home: c, away: d },
    { home: a, away: c },
    { home: b, away: d },
    { home: a, away: d },
    { home: b, away: c },
  ];
}

export function getGroupMatchesForGroup(group) {
  return GROUP_SCHEDULE[group].map(m => ({
    home: m.home,
    away: m.away,
    date: m.date,
    time: m.time,
    venue: m.venue,
  }));
}

// Official FIFA WC2026 Round of 32 bracket (matches 73-88)
// Array order determines the full bracket tree via consecutive pairing:
//   R32[0,1]→R16[0], R32[2,3]→R16[1], ...
//   R16[0,1]→QF[0], R16[2,3]→QF[1], ...
//   QF[0,1]→SF[0], QF[2,3]→SF[1]
//   SF[0,1]→Final
export const ROUND_OF_32_BRACKET = [
  { home: { group: 'E', pos: 1 }, away: { type: 'best3', slot: 1 }, matchNum: 74, date: '2026-06-29', time: '22:30', venue: 'Boston' },
  { home: { group: 'I', pos: 1 }, away: { type: 'best3', slot: 2 }, matchNum: 77, date: '2026-06-30', time: '23:00', venue: 'New York/New Jersey' },
  { home: { group: 'A', pos: 2 }, away: { group: 'B', pos: 2 }, matchNum: 73, date: '2026-06-28', time: '21:00', venue: 'Los Angeles' },
  { home: { group: 'F', pos: 1 }, away: { group: 'C', pos: 2 }, matchNum: 75, date: '2026-06-30', time: '03:00', venue: 'Monterrey' },
  { home: { group: 'K', pos: 2 }, away: { group: 'L', pos: 2 }, matchNum: 83, date: '2026-07-03', time: '01:00', venue: 'Toronto' },
  { home: { group: 'H', pos: 1 }, away: { group: 'J', pos: 2 }, matchNum: 84, date: '2026-07-02', time: '21:00', venue: 'Los Angeles' },
  { home: { group: 'D', pos: 1 }, away: { type: 'best3', slot: 5 }, matchNum: 81, date: '2026-07-02', time: '02:00', venue: 'San Francisco' },
  { home: { group: 'G', pos: 1 }, away: { type: 'best3', slot: 6 }, matchNum: 82, date: '2026-07-01', time: '22:00', venue: 'Seattle' },
  { home: { group: 'C', pos: 1 }, away: { group: 'F', pos: 2 }, matchNum: 76, date: '2026-06-29', time: '19:00', venue: 'Houston' },
  { home: { group: 'E', pos: 2 }, away: { group: 'I', pos: 2 }, matchNum: 78, date: '2026-06-30', time: '19:00', venue: 'Dallas' },
  { home: { group: 'A', pos: 1 }, away: { type: 'best3', slot: 3 }, matchNum: 79, date: '2026-07-01', time: '03:00', venue: 'Mexico City' },
  { home: { group: 'L', pos: 1 }, away: { type: 'best3', slot: 4 }, matchNum: 80, date: '2026-07-01', time: '18:00', venue: 'Atlanta' },
  { home: { group: 'J', pos: 1 }, away: { group: 'H', pos: 2 }, matchNum: 86, date: '2026-07-04', time: '00:00', venue: 'Miami' },
  { home: { group: 'D', pos: 2 }, away: { group: 'G', pos: 2 }, matchNum: 88, date: '2026-07-03', time: '20:00', venue: 'Dallas' },
  { home: { group: 'B', pos: 1 }, away: { type: 'best3', slot: 7 }, matchNum: 85, date: '2026-07-03', time: '05:00', venue: 'Vancouver' },
  { home: { group: 'K', pos: 1 }, away: { type: 'best3', slot: 8 }, matchNum: 87, date: '2026-07-04', time: '03:30', venue: 'Kansas City' },
];

export const KNOCKOUT_SCHEDULE = {
  r16_0: { matchNum: 89, date: '2026-07-04', time: '23:00', venue: 'Philadelphia' },
  r16_1: { matchNum: 90, date: '2026-07-04', time: '19:00', venue: 'Houston' },
  r16_2: { matchNum: 93, date: '2026-07-06', time: '21:00', venue: 'Dallas' },
  r16_3: { matchNum: 94, date: '2026-07-07', time: '02:00', venue: 'Seattle' },
  r16_4: { matchNum: 91, date: '2026-07-05', time: '22:00', venue: 'New York/New Jersey' },
  r16_5: { matchNum: 92, date: '2026-07-06', time: '02:00', venue: 'Mexico City' },
  r16_6: { matchNum: 95, date: '2026-07-07', time: '18:00', venue: 'Atlanta' },
  r16_7: { matchNum: 96, date: '2026-07-07', time: '22:00', venue: 'Vancouver' },
  qf_0: { matchNum: 97, date: '2026-07-09', time: '22:00', venue: 'Boston' },
  qf_1: { matchNum: 98, date: '2026-07-10', time: '21:00', venue: 'Los Angeles' },
  qf_2: { matchNum: 99, date: '2026-07-11', time: '23:00', venue: 'Miami' },
  qf_3: { matchNum: 100, date: '2026-07-12', time: '03:00', venue: 'Kansas City' },
  sf_0: { matchNum: 101, date: '2026-07-14', time: '21:00', venue: 'Dallas' },
  sf_1: { matchNum: 102, date: '2026-07-15', time: '21:00', venue: 'Atlanta' },
  bronze_0: { matchNum: 103, date: '2026-07-18', time: '23:00', venue: 'Miami' },
  final_0: { matchNum: 104, date: '2026-07-19', time: '21:00', venue: 'New York/New Jersey' },
};
