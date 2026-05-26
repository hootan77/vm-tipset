import { useLanguage } from '../context/LanguageContext';

const BALLS = [
  { year: 1930, host: 'Uruguay', name: 'T-Model', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Läder', en: 'Leather' },
    fact: { sv: 'I finalen användes två olika bollar — Argentinas 12-panelsboll i första halvlek och Uruguays T-modell i andra. Uruguay vann 4–2.', en: 'Two different balls were used in the final — Argentina\'s 12-panel ball in the first half and Uruguay\'s T-model in the second. Uruguay won 4–2.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1930-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1934, host: { sv: 'Italien', en: 'Italy' }, name: 'Federale 102', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Läder med bomullssnören', en: 'Leather with cotton laces' },
    fact: { sv: '13 polygonala handsydda paneler. Lädersnören ersattes av bruna bomullssnören vilket gjorde nickningar bekvämare.', en: '13 polygonal hand-sewn panels. Leather laces replaced by brown cotton laces, making headers more comfortable.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/1934-FIFA-World-Cup-Italy-Federale-102-1024x731.jpg' },
  { year: 1938, host: { sv: 'Frankrike', en: 'France' }, name: 'Allen', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Läder med vita bomullssnören', en: 'Leather with white cotton laces' },
    fact: { sv: '13 paneler, handsydd. De vita snörena blev bruna av regn och lera. Handpumpning kunde påverka bollens form.', en: '13 panels, hand-sewn. White laces turned brown from rain and mud. Hand inflation could affect the ball\'s shape.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/04/pre-adidas-world-cup-match-ball-fifa-world-cup-1938-france-allen-1024x731.jpg' },
  { year: 1950, host: { sv: 'Brasilien', en: 'Brazil' }, name: 'Superball', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Brunt läder', en: 'Brown leather' },
    fact: { sv: 'Första VM-bollen utan snörning! 12 identiska paneler med böjda kanter. FIFA tillät varumärkeslogotyper för första gången.', en: 'First laceless World Cup ball! 12 identical panels with curved edges. FIFA allowed brand logos for the first time.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1950-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1954, host: { sv: 'Schweiz', en: 'Switzerland' }, name: 'Swiss World Champion', manufacturer: 'Kost Sports (Basel)', material: { sv: 'Läder', en: 'Leather' },
    fact: { sv: '18 paneler med sicksack-kanter i gulaktig/orange färg. Förbättrad synlighet vid regniga matcher.', en: '18 panels with zigzag edges in yellowish/orange color. Improved visibility during rainy matches.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1954-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1958, host: { sv: 'Sverige', en: 'Sweden' }, name: 'Top Star', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Läder med vattentåligt vax', en: 'Leather with waterproof wax' },
    fact: { sv: 'Fanns i gul, ljusbrun och vit. De vita användes i regniga matcher som finalen mellan Brasilien och Sverige.', en: 'Available in yellow, light brown, and white. White ones were used in rainy matches like the Brazil-Sweden final.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1958-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1962, host: 'Chile', name: 'Crack', manufacturer: { sv: 'Okänd', en: 'Unknown' }, material: { sv: 'Läder med latexventil', en: 'Leather with latex valve' },
    fact: { sv: 'Den mest komplexa VM-bollen att beskriva — 18 oregelbundna paneler. 100 reservbollar skickades efter europeiska lags oro.', en: 'The most complex World Cup ball to describe — 18 irregular panels. 100 backup balls sent after concerns from European teams.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1962-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1966, host: 'England', name: 'Slazenger Challenge', manufacturer: 'Slazenger', material: { sv: 'Högkvalitativt läder', en: 'High-quality leather' },
    fact: { sv: '25 rektangulära handsydda paneler. Den orange bollen från Wembley-finalen är ikonisk i fotbollshistorien.', en: '25 rectangular hand-sewn panels. The orange ball from the Wembley final is iconic in football history.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/04/pre-adidas-world-cup-match-ball-game-used-fifa-world-cup-1966-england-slazenger-challenge-england-germany-1024x731.jpg' },
  { year: 1970, host: { sv: 'Mexiko', en: 'Mexico' }, name: 'adidas Telstar', manufacturer: 'Adidas', material: { sv: 'Läder med Durlast-beläggning', en: 'Leather with Durlast coating' },
    fact: { sv: 'Första Adidas VM-bollen! Namngiven "Television Star" för synlighet på TV. 32 paneler — 20 vita hexagoner, 12 svarta pentagoner.', en: 'First Adidas World Cup ball! Named "Television Star" for TV visibility. 32 panels — 20 white hexagons, 12 black pentagons.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1970-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1974, host: { sv: 'Tyskland', en: 'Germany' }, name: 'adidas Telstar Durlast', manufacturer: 'Adidas', material: { sv: 'Läder med starkare Durlast-beläggning', en: 'Leather with stronger Durlast coating' },
    fact: { sv: 'Identisk design som 1970 — ett bevis på hur framgångsrik originalet var. Starkare vattentätning förhindrade vattenabsorption.', en: 'Identical design to 1970 — proof of how successful the original was. Stronger waterproofing prevented water absorption.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1974-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1978, host: 'Argentina', name: 'adidas Tango', manufacturer: 'Adidas', material: { sv: 'Läder med Durlast-beläggning', en: 'Leather with Durlast coating' },
    fact: { sv: 'Inspirerad av den argentinska tangon. 20 svarta böjda trianglar skapade en optisk illusion av cirklar. Tango-designen användes ända till EM 2000.', en: 'Inspired by the Argentine tango. 20 black curved triangles created an optical illusion of circles. Tango design used until Euro 2000.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1978-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1982, host: { sv: 'Spanien', en: 'Spain' }, name: 'adidas Tango España', manufacturer: 'Adidas', material: { sv: 'Läder med Durlast-beläggning', en: 'Leather with Durlast coating' },
    fact: { sv: 'Första Adidas VM-bollen namngiven efter värdlandet. 32 handsydda paneler med klassisk Tango-design.', en: 'First Adidas World Cup ball named after the host country. 32 hand-sewn panels with classic Tango design.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1982-spain-adidas-tango-espana-1024x731.jpg' },
  { year: 1986, host: { sv: 'Mexiko', en: 'Mexico' }, name: 'adidas Azteca', manufacturer: 'Adidas', material: { sv: 'Syntetisk', en: 'Synthetic' },
    fact: { sv: 'Första VM-bollen gjord helt av syntetiskt material! Återhämtade formen direkt, lämplig för hög höjd och grova underlag.', en: 'First World Cup ball made entirely of synthetic material! Recovered shape instantly, suitable for high altitude and rough surfaces.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1986-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 1990, host: { sv: 'Italien', en: 'Italy' }, name: 'adidas Etrusco Unico', manufacturer: 'Adidas', material: { sv: 'Flerskikts syntetisk', en: 'Multi-layer synthetic' },
    fact: { sv: 'Dekorerad med etruskiska lejon. Bollen fick skulden för turneringens anmärkningsvärt få mål.', en: 'Decorated with Etruscan lions. The ball was blamed for the tournament\'s remarkably few goals.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1990-italy-adidas-etrusco-unico-1024x731.jpg' },
  { year: 1994, host: 'USA', name: 'adidas Questra', manufacturer: 'Adidas', material: { sv: 'Fem olika syntetiska material', en: 'Five different synthetic materials' },
    fact: { sv: 'Namngiven "Quest of Stars" — referens till USA:s flagga och Apollo 11:s 25-årsjubileum. Sista svartvita VM-bollen.', en: 'Named "Quest of Stars" — referencing the US flag and Apollo 11\'s 25th anniversary. Last black and white World Cup ball.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1994-usa-adidas-questra-1024x731.jpg' },
  { year: 1998, host: { sv: 'Frankrike', en: 'France' }, name: 'adidas Tricolore', manufacturer: 'Adidas', material: { sv: 'Syntetisk med vattenbaserad beläggning', en: 'Synthetic with water-based coating' },
    fact: { sv: 'Första färgade VM-bollen! Fransk tupp på Tango-paneler med röd Adidas-logotyp. Tillverkad i Marocko.', en: 'First colored World Cup ball! French rooster on Tango panels with red Adidas logo. Made in Morocco.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-morocco-match-ball-fifa-world-cup-1998-france-adidas-tricolore-1024x731.jpg' },
  { year: 2002, host: { sv: 'Sydkorea/Japan', en: 'South Korea/Japan' }, name: 'adidas Fevernova', manufacturer: 'Adidas', material: { sv: 'Syntetisk med flera lager', en: 'Synthetic with multiple layers' },
    fact: { sv: 'Den allra sista handsydda VM-bollen. Frångick Tango-designen men behöll 32-panelsstrukturen.', en: 'The very last hand-sewn World Cup ball. Departed from the Tango design but kept the 32-panel structure.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2002-FIFA-World-Cup-South-Korea-Japan-made-in-Morocco-adidas-Fevernova-1024x731.jpg' },
  { year: 2006, host: { sv: 'Tyskland', en: 'Germany' }, name: 'adidas Teamgeist', manufacturer: 'Adidas', material: { sv: 'Syntetisk', en: 'Synthetic' },
    fact: { sv: 'Revolutionär! Bara 14 paneler istället för 32. Större paneler ger mer exakta skott. Finalbollar hade guldfinish.', en: 'Revolutionary! Only 14 panels instead of 32. Larger panels allow more accurate shots. Final balls had gold finish.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2006-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 2010, host: { sv: 'Sydafrika', en: 'South Africa' }, name: 'adidas Jabulani', manufacturer: 'Adidas', material: { sv: 'Syntetisk', en: 'Synthetic' },
    fact: { sv: 'Bara 8 paneler med 11 färger. "Jabulani" betyder "fira" på zulu. Spelarna klagade — bollen rörde sig oförutsägbart i luften.', en: 'Only 8 panels with 11 colors. "Jabulani" means "celebrate" in Zulu. Players complained — the ball moved unpredictably in the air.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2010-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 2014, host: { sv: 'Brasilien', en: 'Brazil' }, name: 'adidas Brazuca', manufacturer: 'Adidas', material: { sv: 'Syntetisk', en: 'Synthetic' },
    fact: { sv: 'Bara 6 paneler! Den mest testade bollen någonsin. Namnet valdes av fans och betyder "brasiliansk livsstil".', en: 'Only 6 panels! The most tested ball ever. The name was chosen by fans and means "Brazilian way of life".' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2014-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 2018, host: { sv: 'Ryssland', en: 'Russia' }, name: 'adidas Telstar 18', manufacturer: 'Adidas', material: { sv: 'Syntetisk (återvinningsbar)', en: 'Synthetic (recyclable)' },
    fact: { sv: 'Hyllning till den ursprungliga Telstar från 1970. Innehåller inbyggt NFC-chip för smartphoneinteraktion.', en: 'Tribute to the original 1970 Telstar. Features embedded NFC chip for smartphone interaction.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2018-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 2022, host: 'Qatar', name: 'adidas Al Rihla', manufacturer: 'Adidas', material: { sv: 'Syntetisk med vattenbaserat bläck och lim', en: 'Synthetic with water-based inks and glues' },
    fact: { sv: 'Världens första fotboll gjord uteslutande med vattenbaserat bläck och lim — den mest miljövänliga VM-bollen någonsin.', en: 'World\'s first football made exclusively with water-based inks and glues — the most environmentally friendly World Cup ball ever.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2022/09/2022-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg' },
  { year: 2026, host: { sv: 'Kanada/Mexiko/USA', en: 'Canada/Mexico/USA' }, name: 'adidas Trionda', manufacturer: 'Adidas', material: { sv: 'Syntetisk', en: 'Synthetic' },
    fact: { sv: 'Namnet kombinerar "Tri" (tre värdnationer) och "Onda" (spanska för våg). Den mest tekniskt avancerade bollen i turneringens historia.', en: 'Name combines "Tri" (three host nations) and "Onda" (Spanish for wave). The most technically advanced ball in tournament history.' },
    image: 'https://www.worldcupballs.info/wp-content/uploads/2026/01/adidas_Trionda_official_match_ball_World_Cup_2026_Canada_Mexico_USA-1024x731.jpg' },
];

const loc = (val, lang) => typeof val === 'object' ? (val[lang] || val.sv) : val;

export default function WorldCupBalls() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-700 px-6 py-4">
          <h3 className="text-white font-bold text-xl">{t('balls.title')}</h3>
          <p className="text-amber-100 text-sm">
            {t('balls.subtitle').replace('{count}', BALLS.length)}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{BALLS.length}</div>
              <div className="text-xs text-gray-500">{t('balls.count')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">96</div>
              <div className="text-xs text-gray-500">{t('balls.years')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">1970</div>
              <div className="text-xs text-gray-500">{t('balls.adidasTakeover')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">6</div>
              <div className="text-xs text-gray-500">{t('balls.panels')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {BALLS.map(ball => (
          <BallCard key={ball.year} ball={ball} lang={lang} t={t} />
        ))}
      </div>
    </div>
  );
}

function BallCard({ ball, lang, t }) {
  const isModern = ball.year >= 1970;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
          <img src={ball.image} alt={`${ball.name} — ${ball.year}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="font-bold text-lg text-gray-800">{ball.name}</h4>
              <p className="text-sm text-gray-500">{loc(ball.host, lang)} {ball.year}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${isModern ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {ball.year}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-sm">
            <div><span className="text-gray-400">{t('balls.manufacturer')}</span> <span className="text-gray-700 font-medium">{loc(ball.manufacturer, lang)}</span></div>
            <div><span className="text-gray-400">{t('balls.material')}</span> <span className="text-gray-700 font-medium">{loc(ball.material, lang)}</span></div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{loc(ball.fact, lang)}</p>
        </div>
      </div>
    </div>
  );
}
