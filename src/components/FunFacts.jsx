import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  {
    title: { sv: 'VM 2026 — Fakta', en: 'World Cup 2026 — Facts' },
    icon: '🎉',
    facts: [
      { label: { sv: 'Upplaga', en: 'Edition' }, value: { sv: '23:e VM-turneringen', en: '23rd World Cup tournament' } },
      { label: { sv: 'Antal lag', en: 'Teams' }, value: { sv: '48 lag (första gången, utökat från 32)', en: '48 teams (first time, expanded from 32)' } },
      { label: { sv: 'Antal matcher', en: 'Matches' }, value: { sv: '104 matcher', en: '104 matches' } },
      { label: { sv: 'Värdländer', en: 'Host countries' }, value: { sv: 'USA, Mexiko & Kanada', en: 'USA, Mexico & Canada' } },
      { label: { sv: 'Mexiko som värd', en: 'Mexico as host' }, value: { sv: 'Tredje gången (1970, 1986, 2026)', en: 'Third time (1970, 1986, 2026)' } },
      { label: { sv: 'Senaste värdland att vinna', en: 'Last host to win' }, value: { sv: 'Frankrike 1998', en: 'France 1998' } },
    ],
  },
  {
    title: { sv: 'Målrekord', en: 'Goal Records' },
    icon: '⚽',
    facts: [
      { label: { sv: 'Flest mål totalt', en: 'Most goals total' }, value: { sv: 'Miroslav Klose (Tyskland) — 16 mål', en: 'Miroslav Klose (Germany) — 16 goals' } },
      { label: { sv: 'Flest mål i ett VM', en: 'Most goals in one WC' }, value: { sv: 'Just Fontaine (Frankrike) — 13 mål (1958)', en: 'Just Fontaine (France) — 13 goals (1958)' } },
      { label: { sv: 'Flest mål i en match', en: 'Most goals in a match' }, value: { sv: 'Oleg Salenko (Ryssland) — 5 mål mot Kamerun (1994)', en: 'Oleg Salenko (Russia) — 5 goals vs Cameroon (1994)' } },
      { label: { sv: 'Äldste målskytt', en: 'Oldest scorer' }, value: { sv: 'Roger Milla (Kamerun) — 42 år, 39 dagar', en: 'Roger Milla (Cameroon) — 42 years, 39 days' } },
      { label: { sv: 'Yngste målskytt', en: 'Youngest scorer' }, value: { sv: 'Pelé (Brasilien) — 17 år, 239 dagar', en: 'Pelé (Brazil) — 17 years, 239 days' } },
      { label: { sv: 'Snabbaste mål', en: 'Fastest goal' }, value: { sv: 'Hakan Şükür (Turkiet) — 11 sekunder (2002)', en: 'Hakan Şükür (Turkey) — 11 seconds (2002)' } },
    ],
  },
  {
    title: { sv: 'Snabbast i VM-historien', en: 'Fastest in WC History' },
    icon: '⚡',
    facts: [
      { label: { sv: 'Snabbaste mål', en: 'Fastest goal' }, value: { sv: 'Hakan Şükür (Turkiet) — 11 sekunder (2002)', en: 'Hakan Şükür (Turkey) — 11 seconds (2002)' } },
      { label: { sv: 'Snabbaste gula kort', en: 'Fastest yellow card' }, value: { sv: 'Jesús Gallardo (Mexiko) — 11 sekunder (2018)', en: 'Jesús Gallardo (Mexico) — 11 seconds (2018)' } },
      { label: { sv: 'Snabbaste utvisning', en: 'Fastest red card' }, value: { sv: 'José Batista (Uruguay) — 52 sekunder (1986)', en: 'José Batista (Uruguay) — 52 seconds (1986)' } },
    ],
  },
  {
    title: { sv: 'Landslagsrekord', en: 'National Team Records' },
    icon: '🏆',
    facts: [
      { label: { sv: 'Flest titlar', en: 'Most titles' }, value: { sv: 'Brasilien — 5 VM-titlar', en: 'Brazil — 5 World Cup titles' } },
      { label: { sv: 'Flest finalplatser', en: 'Most finals' }, value: { sv: 'Tyskland — 8 finaler', en: 'Germany — 8 finals' } },
      { label: { sv: 'Flest segrar', en: 'Most wins' }, value: { sv: 'Brasilien — 76 matcher', en: 'Brazil — 76 matches' } },
      { label: { sv: 'Flest mål', en: 'Most goals' }, value: { sv: 'Brasilien — 237 mål totalt', en: 'Brazil — 237 goals total' } },
      { label: { sv: 'Flest förluster', en: 'Most losses' }, value: { sv: 'Mexiko — 28 förluster', en: 'Mexico — 28 losses' } },
      { label: { sv: 'Enda laget i varje VM', en: 'Only team in every WC' }, value: { sv: 'Brasilien — alla 22 turneringar', en: 'Brazil — all 22 tournaments' } },
    ],
  },
  {
    title: { sv: 'Spelarrekord', en: 'Player Records' },
    icon: '🌟',
    facts: [
      { label: { sv: 'Flest matcher', en: 'Most matches' }, value: { sv: 'Lionel Messi — 26 matcher', en: 'Lionel Messi — 26 matches' } },
      { label: { sv: 'Flest VM-turneringar', en: 'Most WC tournaments' }, value: { sv: '6 spelare har spelat 5 VM (bl.a. Messi, Ronaldo, Matthäus)', en: '6 players have played 5 World Cups (incl. Messi, Ronaldo, Matthäus)' } },
      { label: { sv: 'Äldste spelare', en: 'Oldest player' }, value: { sv: 'Essam El-Hadary (Egypten) — 45 år, 161 dagar', en: 'Essam El-Hadary (Egypt) — 45 years, 161 days' } },
      { label: { sv: 'Yngste spelare', en: 'Youngest player' }, value: { sv: 'Norman Whiteside (Nordirland) — 17 år, 41 dagar', en: 'Norman Whiteside (N. Ireland) — 17 years, 41 days' } },
      { label: { sv: 'Flest VM-titlar', en: 'Most WC titles' }, value: { sv: 'Pelé — 3 titlar (1958, 1962, 1970)', en: 'Pelé — 3 titles (1958, 1962, 1970)' } },
      { label: { sv: 'Hattrick i final', en: 'Hat-trick in final' }, value: { sv: 'Kylian Mbappé (2022) och Geoff Hurst (1966)', en: 'Kylian Mbappé (2022) and Geoff Hurst (1966)' } },
    ],
  },
  {
    title: { sv: 'Målvaktsrekord', en: 'Goalkeeper Records' },
    icon: '🧤',
    facts: [
      { label: { sv: 'Flest hållna nollor', en: 'Most clean sheets' }, value: { sv: 'Peter Shilton & Fabien Barthez — 10 var', en: 'Peter Shilton & Fabien Barthez — 10 each' } },
      { label: { sv: 'Flest räddningar i en match', en: 'Most saves in a match' }, value: { sv: 'Tim Howard (USA) — 16 räddningar mot Belgien (2014)', en: 'Tim Howard (USA) — 16 saves vs Belgium (2014)' } },
      { label: { sv: 'Enda målvakt med Guldbollen', en: 'Only GK with Golden Ball' }, value: { sv: 'Oliver Kahn (Tyskland, 2002)', en: 'Oliver Kahn (Germany, 2002)' } },
    ],
  },
  {
    title: { sv: 'Publikrekord', en: 'Attendance Records' },
    icon: '👥',
    facts: [
      { label: { sv: 'Högsta publiksiffra', en: 'Highest attendance' }, value: { sv: 'Uruguay–Brasilien 1950 — 173 850 åskådare (Maracanã)', en: 'Uruguay–Brazil 1950 — 173,850 spectators (Maracanã)' } },
      { label: { sv: 'Högsta snitt per match', en: 'Highest avg per match' }, value: { sv: 'VM 1994 i USA — 68 991 per match', en: 'World Cup 1994 in USA — 68,991 per match' } },
    ],
  },
  {
    title: { sv: 'Unika fakta', en: 'Unique Facts' },
    icon: '🤯',
    facts: [
      { label: { sv: 'Mål i olika åldrar', en: 'Goals at different ages' }, value: { sv: 'Messi — enda spelaren att göra mål som tonåring, i 20- och 30-årsåldern', en: 'Messi — only player to score as a teenager, in his 20s and 30s' } },
      { label: { sv: 'Mål i flest VM', en: 'Goals in most WCs' }, value: { sv: 'Cristiano Ronaldo — mål i 5 olika VM', en: 'Cristiano Ronaldo — goals in 5 different World Cups' } },
      { label: { sv: 'Längst utan vinst i final', en: 'Most finals without win' }, value: { sv: 'Nederländerna — 3 finaler utan seger', en: 'Netherlands — 3 finals without a win' } },
      { label: { sv: 'Bästa afrikanska laget', en: 'Best African team' }, value: { sv: 'Marocko — semifinal 2022', en: 'Morocco — semi-final 2022' } },
      { label: { sv: 'Bästa asiatiska laget', en: 'Best Asian team' }, value: { sv: 'Sydkorea — semifinal 2002', en: 'South Korea — semi-final 2002' } },
      { label: { sv: 'VAR introducerades', en: 'VAR introduced' }, value: { sv: '2018 i Ryssland', en: '2018 in Russia' } },
      { label: { sv: 'Mållinjeteknik infördes', en: 'Goal-line tech introduced' }, value: { sv: '2014 i Brasilien', en: '2014 in Brazil' } },
    ],
  },
];

const loc = (val, lang) => typeof val === 'object' ? (val[lang] || val.sv) : val;

export default function FunFacts() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h3 className="text-white font-bold text-xl">{t('ff.title')}</h3>
          <p className="text-amber-100 text-sm">{t('ff.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map(cat => (
          <div key={cat.title.sv} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xl">{cat.icon}</span>
              <h4 className="font-bold text-gray-800">{loc(cat.title, lang)}</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {cat.facts.map((fact, i) => (
                <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 shrink-0">
                    {loc(fact.label, lang)}
                  </span>
                  <span className="text-sm text-gray-800">{loc(fact.value, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
