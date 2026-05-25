const CATEGORIES = [
  {
    title: 'VM 2026 — Fakta',
    icon: '🎉',
    facts: [
      { label: 'Upplaga', value: '23:e VM-turneringen' },
      { label: 'Antal lag', value: '48 lag (första gången, utökat från 32)' },
      { label: 'Antal matcher', value: '104 matcher' },
      { label: 'Värdländer', value: 'USA, Mexiko & Kanada' },
      { label: 'Mexiko som värd', value: 'Tredje gången (1970, 1986, 2026)' },
      { label: 'Senaste värdland att vinna', value: 'Frankrike 1998' },
    ],
  },
  {
    title: 'Målrekord',
    icon: '⚽',
    facts: [
      { label: 'Flest mål totalt', value: 'Miroslav Klose (Tyskland) — 16 mål' },
      { label: 'Flest mål i ett VM', value: 'Just Fontaine (Frankrike) — 13 mål (1958)' },
      { label: 'Flest mål i en match', value: 'Oleg Salenko (Ryssland) — 5 mål mot Kamerun (1994)' },
      { label: 'Äldste målskytt', value: 'Roger Milla (Kamerun) — 42 år, 39 dagar' },
      { label: 'Yngste målskytt', value: 'Pelé (Brasilien) — 17 år, 239 dagar' },
      { label: 'Snabbaste mål', value: 'Hakan Şükür (Turkiet) — 11 sekunder (2002)' },
    ],
  },
  {
    title: 'Snabbast i VM-historien',
    icon: '⚡',
    facts: [
      { label: 'Snabbaste mål', value: 'Hakan Şükür (Turkiet) — 11 sekunder (2002)' },
      { label: 'Snabbaste gula kort', value: 'Jesús Gallardo (Mexiko) — 11 sekunder (2018)' },
      { label: 'Snabbaste utvisning', value: 'José Batista (Uruguay) — 52 sekunder (1986)' },
    ],
  },
  {
    title: 'Landslagsrekord',
    icon: '🏆',
    facts: [
      { label: 'Flest titlar', value: 'Brasilien — 5 VM-titlar' },
      { label: 'Flest finalplatser', value: 'Tyskland — 8 finaler' },
      { label: 'Flest segrar', value: 'Brasilien — 76 matcher' },
      { label: 'Flest mål', value: 'Brasilien — 237 mål totalt' },
      { label: 'Flest förluster', value: 'Mexiko — 28 förluster' },
      { label: 'Enda laget i varje VM', value: 'Brasilien — alla 22 turneringar' },
    ],
  },
  {
    title: 'Spelarrekord',
    icon: '🌟',
    facts: [
      { label: 'Flest matcher', value: 'Lionel Messi — 26 matcher' },
      { label: 'Flest VM-turneringar', value: '6 spelare har spelat 5 VM (bl.a. Messi, Ronaldo, Matthäus)' },
      { label: 'Äldste spelare', value: 'Essam El-Hadary (Egypten) — 45 år, 161 dagar' },
      { label: 'Yngste spelare', value: 'Norman Whiteside (Nordirland) — 17 år, 41 dagar' },
      { label: 'Flest VM-titlar', value: 'Pelé — 3 titlar (1958, 1962, 1970)' },
      { label: 'Hattrick i final', value: 'Kylian Mbappé (2022) och Geoff Hurst (1966)' },
    ],
  },
  {
    title: 'Målvaktsrekord',
    icon: '🧤',
    facts: [
      { label: 'Flest hållna nollor', value: 'Peter Shilton & Fabien Barthez — 10 var' },
      { label: 'Flest räddningar i en match', value: 'Tim Howard (USA) — 16 räddningar mot Belgien (2014)' },
      { label: 'Enda målvakt med Guldbollen', value: 'Oliver Kahn (Tyskland, 2002)' },
    ],
  },
  {
    title: 'Publikrekord',
    icon: '👥',
    facts: [
      { label: 'Högsta publiksiffra', value: 'Uruguay–Brasilien 1950 — 173 850 åskådare (Maracanã)' },
      { label: 'Högsta snitt per match', value: 'VM 1994 i USA — 68 991 per match' },
    ],
  },
  {
    title: 'Unika fakta',
    icon: '🤯',
    facts: [
      { label: 'Mål i olika åldrar', value: 'Messi — enda spelaren att göra mål som tonåring, i 20- och 30-årsåldern' },
      { label: 'Mål i flest VM', value: 'Cristiano Ronaldo — mål i 5 olika VM' },
      { label: 'Längst utan vinst i final', value: 'Nederländerna — 3 finaler utan seger' },
      { label: 'Bästa afrikanska laget', value: 'Marocko — semifinal 2022' },
      { label: 'Bästa asiatiska laget', value: 'Sydkorea — semifinal 2002' },
      { label: 'VAR introducerades', value: '2018 i Ryssland' },
      { label: 'Mållinjeteknik infördes', value: '2014 i Brasilien' },
    ],
  },
];

export default function FunFacts() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h3 className="text-white font-bold text-xl">VM Fun Facts</h3>
          <p className="text-amber-100 text-sm">
            Rekord, statistik och kuriosa från VM-historien
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map(cat => (
          <div key={cat.title} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xl">{cat.icon}</span>
              <h4 className="font-bold text-gray-800">{cat.title}</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {cat.facts.map((fact, i) => (
                <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 shrink-0">
                    {fact.label}
                  </span>
                  <span className="text-sm text-gray-800">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
