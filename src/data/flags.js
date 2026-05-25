const FLAGS = {
  'Mexiko': '\u{1F1F2}\u{1F1FD}',
  'Sydafrika': '\u{1F1FF}\u{1F1E6}',
  'Sydkorea': '\u{1F1F0}\u{1F1F7}',
  'Tjeckien': '\u{1F1E8}\u{1F1FF}',
  'Kanada': '\u{1F1E8}\u{1F1E6}',
  'Schweiz': '\u{1F1E8}\u{1F1ED}',
  'Qatar': '\u{1F1F6}\u{1F1E6}',
  'Bosnien-Hercegovina': '\u{1F1E7}\u{1F1E6}',
  'Brasilien': '\u{1F1E7}\u{1F1F7}',
  'Marocko': '\u{1F1F2}\u{1F1E6}',
  'Haiti': '\u{1F1ED}\u{1F1F9}',
  'Skottland': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  'USA': '\u{1F1FA}\u{1F1F8}',
  'Paraguay': '\u{1F1F5}\u{1F1FE}',
  'Australien': '\u{1F1E6}\u{1F1FA}',
  'Turkiet': '\u{1F1F9}\u{1F1F7}',
  'Tyskland': '\u{1F1E9}\u{1F1EA}',
  'Curaçao': '\u{1F1E8}\u{1F1FC}',
  'Elfenbenskusten': '\u{1F1E8}\u{1F1EE}',
  'Ecuador': '\u{1F1EA}\u{1F1E8}',
  'Nederländerna': '\u{1F1F3}\u{1F1F1}',
  'Japan': '\u{1F1EF}\u{1F1F5}',
  'Sverige': '\u{1F1F8}\u{1F1EA}',
  'Tunisien': '\u{1F1F9}\u{1F1F3}',
  'Belgien': '\u{1F1E7}\u{1F1EA}',
  'Egypten': '\u{1F1EA}\u{1F1EC}',
  'Iran': '\u{1F1EE}\u{1F1F7}',
  'Nya Zeeland': '\u{1F1F3}\u{1F1FF}',
  'Spanien': '\u{1F1EA}\u{1F1F8}',
  'Kap Verde': '\u{1F1E8}\u{1F1FB}',
  'Saudiarabien': '\u{1F1F8}\u{1F1E6}',
  'Uruguay': '\u{1F1FA}\u{1F1FE}',
  'Frankrike': '\u{1F1EB}\u{1F1F7}',
  'Senegal': '\u{1F1F8}\u{1F1F3}',
  'Norge': '\u{1F1F3}\u{1F1F4}',
  'Irak': '\u{1F1EE}\u{1F1F6}',
  'Argentina': '\u{1F1E6}\u{1F1F7}',
  'Algeriet': '\u{1F1E9}\u{1F1FF}',
  'Österrike': '\u{1F1E6}\u{1F1F9}',
  'Jordanien': '\u{1F1EF}\u{1F1F4}',
  'Portugal': '\u{1F1F5}\u{1F1F9}',
  'DR Kongo': '\u{1F1E8}\u{1F1E9}',
  'Uzbekistan': '\u{1F1FA}\u{1F1FF}',
  'Colombia': '\u{1F1E8}\u{1F1F4}',
  'England': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  'Kroatien': '\u{1F1ED}\u{1F1F7}',
  'Ghana': '\u{1F1EC}\u{1F1ED}',
  'Panama': '\u{1F1F5}\u{1F1E6}',
};

export function getFlag(team) {
  return FLAGS[team] || '';
}

export function teamWithFlag(team) {
  if (!team) return 'TBD';
  const flag = FLAGS[team];
  return flag ? `${flag} ${team}` : team;
}
