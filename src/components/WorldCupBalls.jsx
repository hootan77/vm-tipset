const BALLS = [
  {
    year: 1930,
    host: 'Uruguay',
    name: 'T-Model',
    manufacturer: 'Okänd',
    material: 'Läder',
    fact: 'I finalen användes två olika bollar — Argentinas 12-panelsboll i första halvlek och Uruguays T-modell i andra. Uruguay vann 4–2.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1930-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1934,
    host: 'Italien',
    name: 'Federale 102',
    manufacturer: 'Okänd',
    material: 'Läder med bomullssnören',
    fact: '13 polygonala handsydda paneler. Lädersnören ersattes av bruna bomullssnören vilket gjorde nickningar bekvämare.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/1934-FIFA-World-Cup-Italy-Federale-102-1024x731.jpg',
  },
  {
    year: 1938,
    host: 'Frankrike',
    name: 'Allen',
    manufacturer: 'Okänd',
    material: 'Läder med vita bomullssnören',
    fact: '13 paneler, handsydd. De vita snörena blev bruna av regn och lera. Handpumpning kunde påverka bollens form.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/04/pre-adidas-world-cup-match-ball-fifa-world-cup-1938-france-allen-1024x731.jpg',
  },
  {
    year: 1950,
    host: 'Brasilien',
    name: 'Superball',
    manufacturer: 'Okänd',
    material: 'Brunt läder',
    fact: 'Första VM-bollen utan snörning! 12 identiska paneler med böjda kanter. FIFA tillät varumärkeslogotyper för första gången.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1950-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1954,
    host: 'Schweiz',
    name: 'Swiss World Champion',
    manufacturer: 'Kost Sports (Basel)',
    material: 'Läder',
    fact: '18 paneler med sicksack-kanter i gulaktig/orange färg. Förbättrad synlighet vid regniga matcher.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1954-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1958,
    host: 'Sverige',
    name: 'Top Star',
    manufacturer: 'Okänd',
    material: 'Läder med vattentåligt vax',
    fact: 'Fanns i gul, ljusbrun och vit. De vita användes i regniga matcher som finalen mellan Brasilien och Sverige.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1958-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1962,
    host: 'Chile',
    name: 'Crack',
    manufacturer: 'Okänd',
    material: 'Läder med latexventil',
    fact: 'Den mest komplexa VM-bollen att beskriva — 18 oregelbundna paneler. 100 reservbollar skickades efter europeiska lags oro.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1962-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1966,
    host: 'England',
    name: 'Slazenger Challenge',
    manufacturer: 'Slazenger',
    material: 'Högkvalitativt läder',
    fact: '25 rektangulära handsydda paneler. Den orange bollen från Wembley-finalen är ikonisk i fotbollshistorien.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/04/pre-adidas-world-cup-match-ball-game-used-fifa-world-cup-1966-england-slazenger-challenge-england-germany-1024x731.jpg',
  },
  {
    year: 1970,
    host: 'Mexiko',
    name: 'adidas Telstar',
    manufacturer: 'Adidas',
    material: 'Läder med Durlast-beläggning',
    fact: 'Den första Adidas VM-bollen! Namngiven "Television Star" för synlighet på TV. 32 paneler — 20 vita hexagoner, 12 svarta pentagoner. En av de mest ikoniska bollarna någonsin.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1970-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1974,
    host: 'Tyskland',
    name: 'adidas Telstar Durlast',
    manufacturer: 'Adidas',
    material: 'Läder med starkare Durlast-beläggning',
    fact: 'Identisk design som 1970 — ett bevis på hur framgångsrik originalet var. Starkare vattentätning förhindrade vattenabsorption.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1974-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1978,
    host: 'Argentina',
    name: 'adidas Tango',
    manufacturer: 'Adidas',
    material: 'Läder med Durlast-beläggning',
    fact: 'Inspirerad av den argentinska tangon. 20 svarta böjda trianglar skapade en optisk illusion av cirklar. Tango-designen användes ända till EM 2000.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1978-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1982,
    host: 'Spanien',
    name: 'adidas Tango España',
    manufacturer: 'Adidas',
    material: 'Läder med Durlast-beläggning',
    fact: 'Första Adidas VM-bollen namngiven efter värdlandet. 32 handsydda paneler med klassisk Tango-design.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1982-spain-adidas-tango-espana-1024x731.jpg',
  },
  {
    year: 1986,
    host: 'Mexiko',
    name: 'adidas Azteca',
    manufacturer: 'Adidas',
    material: 'Syntetisk',
    fact: 'Första VM-bollen gjord helt av syntetiskt material! Återhämtade formen direkt, lämplig för hög höjd och grova underlag.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/1986-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 1990,
    host: 'Italien',
    name: 'adidas Etrusco Unico',
    manufacturer: 'Adidas',
    material: 'Flerskikts syntetisk',
    fact: 'Dekorerad med etruskiska lejon. Bollen fick skulden för turneringens anmärkningsvärt få mål.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1990-italy-adidas-etrusco-unico-1024x731.jpg',
  },
  {
    year: 1994,
    host: 'USA',
    name: 'adidas Questra',
    manufacturer: 'Adidas',
    material: 'Fem olika syntetiska material',
    fact: 'Namngiven "Quest of Stars" — referens till USA:s flagga och Apollo 11:s 25-årsjubileum. Sista svartvita VM-bollen.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-france-match-ball-fifa-world-cup-1994-usa-adidas-questra-1024x731.jpg',
  },
  {
    year: 1998,
    host: 'Frankrike',
    name: 'adidas Tricolore',
    manufacturer: 'Adidas',
    material: 'Syntetisk med vattenbaserad beläggning',
    fact: 'Första färgade VM-bollen! Fransk tupp på Tango-paneler med röd Adidas-logotyp. Tillverkad i Marocko.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2017/11/made-in-morocco-match-ball-fifa-world-cup-1998-france-adidas-tricolore-1024x731.jpg',
  },
  {
    year: 2002,
    host: 'Sydkorea/Japan',
    name: 'adidas Fevernova',
    manufacturer: 'Adidas',
    material: 'Syntetisk med flera lager',
    fact: 'Den allra sista handsydda VM-bollen. Frångick Tango-designen men behöll 32-panelsstrukturen. Namnet refererar till fotbollsfebern i Asien.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2002-FIFA-World-Cup-South-Korea-Japan-made-in-Morocco-adidas-Fevernova-1024x731.jpg',
  },
  {
    year: 2006,
    host: 'Tyskland',
    name: 'adidas Teamgeist',
    manufacturer: 'Adidas',
    material: 'Syntetisk',
    fact: 'Revolutionär! Bara 14 paneler istället för 32. Större paneler ger mer exakta skott. Finalbollar hade guldfinish som symboliserade trofén.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2006-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 2010,
    host: 'Sydafrika',
    name: 'adidas Jabulani',
    manufacturer: 'Adidas',
    material: 'Syntetisk',
    fact: 'Bara 8 paneler med 11 färger (representerar 11 spelare). "Jabulani" betyder "fira" på zulu. Spelarna klagade — bollen rörde sig oförutsägbart i luften.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2010-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 2014,
    host: 'Brasilien',
    name: 'adidas Brazuca',
    manufacturer: 'Adidas',
    material: 'Syntetisk',
    fact: 'Bara 6 paneler! Den mest testade bollen någonsin. Namnet valdes av fans och betyder "brasiliansk livsstil". Designen symboliserar traditionella önskningsarmband.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2014-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 2018,
    host: 'Ryssland',
    name: 'adidas Telstar 18',
    manufacturer: 'Adidas',
    material: 'Syntetisk (återvinningsbar)',
    fact: 'Hyllning till den ursprungliga Telstar från 1970. Innehåller inbyggt NFC-chip för smartphoneinteraktion. Både bollen och förpackningen är återvinningsbara.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2018/04/2018-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 2022,
    host: 'Qatar',
    name: 'adidas Al Rihla',
    manufacturer: 'Adidas',
    material: 'Syntetisk med vattenbaserat bläck och lim',
    fact: 'Världens första fotboll gjord uteslutande med vattenbaserat bläck och lim — den mest miljövänliga VM-bollen någonsin. 20 paneler med texturerad polyuretan.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2022/09/2022-world-cup-ball-photo-Peter-Pesti-worldcupballs-info-1024x731.jpg',
  },
  {
    year: 2026,
    host: 'Kanada/Mexiko/USA',
    name: 'adidas Trionda',
    manufacturer: 'Adidas',
    material: 'Syntetisk',
    fact: 'Namnet kombinerar "Tri" (tre värdnationer) och "Onda" (spanska för våg). Röd, grön och blå färgschema med nationella symboler. Den mest tekniskt avancerade bollen i turneringens historia.',
    image: 'https://www.worldcupballs.info/wp-content/uploads/2026/01/adidas_Trionda_official_match_ball_World_Cup_2026_Canada_Mexico_USA-1024x731.jpg',
  },
];

export default function WorldCupBalls() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-700 px-6 py-4">
          <h3 className="text-white font-bold text-xl">VM-bollar genom historien</h3>
          <p className="text-amber-100 text-sm">
            {BALLS.length} officiella matchbollar sedan 1930
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{BALLS.length}</div>
              <div className="text-xs text-gray-500">VM-bollar</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">96</div>
              <div className="text-xs text-gray-500">År av historia</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">1970</div>
              <div className="text-xs text-gray-500">Adidas tar över</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">6</div>
              <div className="text-xs text-gray-500">Paneler (2014)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {BALLS.map(ball => (
          <BallCard key={ball.year} ball={ball} />
        ))}
      </div>
    </div>
  );
}

function BallCard({ ball }) {
  const isModern = ball.year >= 1970;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
          <img
            src={ball.image}
            alt={`${ball.name} — VM ${ball.year}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h4 className="font-bold text-lg text-gray-800">{ball.name}</h4>
              <p className="text-sm text-gray-500">{ball.host} {ball.year}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              isModern ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {ball.year}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-sm">
            <div>
              <span className="text-gray-400">Tillverkare:</span>{' '}
              <span className="text-gray-700 font-medium">{ball.manufacturer}</span>
            </div>
            <div>
              <span className="text-gray-400">Material:</span>{' '}
              <span className="text-gray-700 font-medium">{ball.material}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{ball.fact}</p>
        </div>
      </div>
    </div>
  );
}
