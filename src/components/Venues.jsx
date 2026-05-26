import { useLanguage } from '../context/LanguageContext';

const VENUES = [
  {
    country: { sv: 'USA', en: 'USA' },
    stadiums: [
      { name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 87157, image: '/stadiums/metlife.jpg', fact: { sv: 'Värd för VM-finalen 2026. Har varit värd för Super Bowl, fotbollslandskamper och stora konserter.', en: 'Host of the 2026 World Cup Final. Has hosted Super Bowls, international football matches, and major concerts.' } },
      { name: 'AT&T Stadium', city: 'Dallas', capacity: 92967, image: '/stadiums/att.jpg', fact: { sv: 'Infällbart tak med klimatkontroll. Värd för semifinal. Allt är större i Texas.', en: 'Retractable roof with climate control. Semi-final venue. Everything is bigger in Texas.' } },
      { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 75000, image: '/stadiums/mercedes-benz.jpg', fact: { sv: 'Åttapanelers infällbart tak och 335 meter lång LED-resultattavla. Värd för semifinal.', en: 'Eight-panel retractable roof and 335-meter LED scoreboard. Semi-final venue.' } },
      { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240, image: '/stadiums/sofi.jpg', fact: { sv: 'Kostade 5 miljarder dollar att bygga. Translucent tak och 6 500 kvm videoskärm. Värd för kvartsfinal.', en: 'Cost $5 billion to build. Translucent roof and 6,500 sqm video screen. Quarter-final venue.' } },
      { name: 'Lumen Field', city: 'Seattle', capacity: 69000, image: '/stadiums/lumen.jpg', fact: { sv: 'Utökad kapacitet med utsikt över stadens centrum.', en: 'Expanded capacity with views over the city center.' } },
      { name: 'Gillette Stadium', city: 'Boston', capacity: 70000, image: '/stadiums/gillette.jpg', fact: { sv: 'Nyligen renoverad. Har ett 66 meter högt fyrtorn med observationsdäck. Värd för kvartsfinal.', en: 'Recently renovated. Features a 66-meter lighthouse with observation deck. Quarter-final venue.' } },
      { name: 'NRG Stadium', city: 'Houston', capacity: 72220, image: '/stadiums/nrg.jpg', fact: { sv: 'Del av NRG Park-komplexet. Infällbart tak och toppmodern teknik.', en: 'Part of the NRG Park complex. Retractable roof and state-of-the-art technology.' } },
      { name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76640, image: '/stadiums/arrowhead.jpg', fact: { sv: 'Guinness rekordinnehavare för högsta publikljud på en idrottsarena. Värd för kvartsfinal.', en: 'Guinness record holder for loudest crowd roar at a sports arena. Quarter-final venue.' } },
      { name: 'Hard Rock Stadium', city: 'Miami', capacity: 67518, image: '/stadiums/hardrock.jpg', fact: { sv: 'Renovering för 350 miljoner dollar slutförd 2016. Har varit värd för sex Super Bowls. Värd för kvartsfinal.', en: '$350 million renovation completed in 2016. Has hosted six Super Bowls. Quarter-final venue.' } },
      { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 69328, image: '/stadiums/lincoln.jpg', fact: { sv: 'Första evenemanget 2003 var Manchester United mot Barcelona. Historisk fotbollsarena.', en: 'First event in 2003 was Manchester United vs Barcelona. Historic football venue.' } },
      { name: "Levi's Stadium", city: 'San Francisco', capacity: 70909, image: '/stadiums/levis.jpg', fact: { sv: 'Värd för Super Bowl 2026. Bay Area firar även San Franciscos 250-årsjubileum.', en: "Super Bowl 2026 host. Bay Area also celebrates San Francisco's 250th anniversary." } },
    ],
  },
  {
    country: { sv: 'Mexiko', en: 'Mexico' },
    stadiums: [
      { name: 'Estadio Azteca', city: 'Mexico City', capacity: 87523, image: '/stadiums/azteca.jpg', fact: { sv: 'Mest ikoniska arenan — värd för två VM-finaler (1970, 1986), OS 1968 och dam-VM 1971. Värd för öppningsmatchen.', en: 'Most iconic stadium — hosted two World Cup Finals (1970, 1986), 1968 Olympics and 1971 Women\'s WC. Opening match venue.' } },
      { name: 'Estadio Akron', city: 'Guadalajara', capacity: 48071, image: '/stadiums/akron.jpg', fact: { sv: 'En av Mexikos största arenor. Var värd för Copa Libertadores-finalen 2010 och Panamerikanska spelen 2011.', en: 'One of Mexico\'s largest stadiums. Hosted the 2010 Copa Libertadores Final and 2011 Pan American Games.' } },
      { name: 'Estadio BBVA', city: 'Monterrey', capacity: 53460, image: '/stadiums/bbva.jpg', fact: { sv: 'Öppnade 2015. Kallas "Ståljätten" och designad för närhet till publiken. Bergsutsikt från läktarna.', en: 'Opened in 2015. Known as "The Steel Giant", designed for fan proximity. Mountain views from the stands.' } },
    ],
  },
  {
    country: { sv: 'Kanada', en: 'Canada' },
    stadiums: [
      { name: 'BMO Field', city: 'Toronto', capacity: 45736, image: '/stadiums/bmo.jpg', fact: { sv: 'Renovering för 120 miljoner dollar slutförd. Kapaciteten utökad för VM.', en: '$120 million renovation completed. Capacity expanded for the World Cup.' } },
      { name: 'BC Place', city: 'Vancouver', capacity: 54500, image: '/stadiums/bcplace.jpg', fact: { sv: 'Var värd för vinter-OS 2010 öppnings- och avslutningsceremonier. Infällbart tak efter renovering.', en: 'Hosted the 2010 Winter Olympics opening and closing ceremonies. Retractable roof after renovation.' } },
    ],
  },
];

function getCountryFlag(country) {
  const name = typeof country === 'object' ? country.sv : country;
  if (name === 'USA') return '🇺🇸';
  if (name === 'Mexiko' || name === 'Mexico') return '🇲🇽';
  if (name === 'Kanada' || name === 'Canada') return '🇨🇦';
  return '';
}

export default function Venues() {
  const { t, lang } = useLanguage();
  const totalCapacity = VENUES.flatMap(c => c.stadiums).reduce((sum, s) => sum + s.capacity, 0);
  const totalVenues = VENUES.flatMap(c => c.stadiums).length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4">
          <h3 className="text-white font-bold text-xl">{t('venues.title')}</h3>
          <p className="text-sky-100 text-sm">
            {t('venues.subtitle').replace('{count}', totalVenues).replace('{capacity}', totalCapacity.toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-US'))}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          {VENUES.map(c => (
            <div key={c.country.sv} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">{getCountryFlag(c.country)}</div>
              <div className="font-bold text-gray-800">{c.country[lang]}</div>
              <div className="text-sm text-gray-500">{c.stadiums.length} {c.stadiums.length === 1 ? t('venues.arena') : t('venues.arenas')}</div>
            </div>
          ))}
        </div>
      </div>

      {VENUES.map(c => (
        <div key={c.country.sv} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {getCountryFlag(c.country)} {c.country[lang]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.stadiums.map(stadium => (
              <StadiumCard key={stadium.name} stadium={stadium} lang={lang} />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-bold text-gray-800">{t('venues.hostCities')}</h4>
        </div>
        <div className="p-4">
          <img
            src="/stadiums/venues-map.webp"
            alt={t('venues.mapAlt')}
            className="w-full rounded-lg"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function StadiumCard({ stadium, lang }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 overflow-hidden bg-gray-200">
        <img
          src={stadium.image}
          alt={stadium.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center justify-between">
        <h5 className="text-white font-bold text-sm truncate">{stadium.name}</h5>
        <span className="text-gray-300 text-xs whitespace-nowrap ml-2">{stadium.city}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600">{stadium.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{stadium.capacity.toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-US')}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{stadium.fact[lang]}</p>
      </div>
    </div>
  );
}
