const VENUES = [
  {
    country: 'USA',
    stadiums: [
      { name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 87157, image: '/stadiums/metlife.jpg', fact: 'Värd för VM-finalen 2026. Har varit värd för Super Bowl, fotbollslandskamper och stora konserter.' },
      { name: 'AT&T Stadium', city: 'Dallas', capacity: 92967, image: '/stadiums/att.jpg', fact: 'Infällbart tak med klimatkontroll. Värd för semifinal. Allt är större i Texas.' },
      { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 75000, image: '/stadiums/mercedes-benz.jpg', fact: 'Åttapanelers infällbart tak och 335 meter lång LED-resultattavla. Värd för semifinal.' },
      { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240, image: '/stadiums/sofi.jpg', fact: 'Kostade 5 miljarder dollar att bygga. Translucent tak och 6 500 kvm videoskärm. Värd för kvartsfinal.' },
      { name: 'Lumen Field', city: 'Seattle', capacity: 69000, image: '/stadiums/lumen.jpg', fact: 'Utökad kapacitet med utsikt över stadens centrum.' },
      { name: 'Gillette Stadium', city: 'Boston', capacity: 70000, image: '/stadiums/gillette.jpg', fact: 'Nyligen renoverad. Har ett 66 meter högt fyrtorn med observationsdäck. Värd för kvartsfinal.' },
      { name: 'NRG Stadium', city: 'Houston', capacity: 72220, image: '/stadiums/nrg.jpg', fact: 'Del av NRG Park-komplexet. Infällbart tak och toppmodern teknik.' },
      { name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76640, image: '/stadiums/arrowhead.jpg', fact: 'Guinness rekordinnehavare för högsta publikljud på en idrottsarena. Värd för kvartsfinal.' },
      { name: 'Hard Rock Stadium', city: 'Miami', capacity: 67518, image: '/stadiums/hardrock.jpg', fact: 'Renovering för 350 miljoner dollar slutförd 2016. Har varit värd för sex Super Bowls. Värd för kvartsfinal.' },
      { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 69328, image: '/stadiums/lincoln.jpg', fact: 'Första evenemanget 2003 var Manchester United mot Barcelona. Historisk fotbollsarena.' },
      { name: "Levi's Stadium", city: 'San Francisco', capacity: 70909, image: '/stadiums/levis.jpg', fact: 'Värd för Super Bowl 2026. Bay Area firar även San Franciscos 250-årsjubileum.' },
    ],
  },
  {
    country: 'Mexiko',
    stadiums: [
      { name: 'Estadio Azteca', city: 'Mexico City', capacity: 87523, image: '/stadiums/azteca.jpg', fact: 'Mest ikoniska arenan — värd för två VM-finaler (1970, 1986), OS 1968 och dam-VM 1971. Värd för öppningsmatchen.' },
      { name: 'Estadio Akron', city: 'Guadalajara', capacity: 48071, image: '/stadiums/akron.jpg', fact: 'En av Mexikos största arenor. Var värd för Copa Libertadores-finalen 2010 och Panamerikanska spelen 2011.' },
      { name: 'Estadio BBVA', city: 'Monterrey', capacity: 53460, image: '/stadiums/bbva.jpg', fact: 'Öppnade 2015. Kallas "Ståljätten" och designad för närhet till publiken. Bergsutsikt från läktarna.' },
    ],
  },
  {
    country: 'Kanada',
    stadiums: [
      { name: 'BMO Field', city: 'Toronto', capacity: 45736, image: '/stadiums/bmo.jpg', fact: 'Renovering för 120 miljoner dollar slutförd. Kapaciteten utökad för VM.' },
      { name: 'BC Place', city: 'Vancouver', capacity: 54500, image: '/stadiums/bcplace.jpg', fact: 'Var värd för vinter-OS 2010 öppnings- och avslutningsceremonier. Infällbart tak efter renovering.' },
    ],
  },
];

function getCountryFlag(country) {
  if (country === 'USA') return '🇺🇸';
  if (country === 'Mexiko') return '🇲🇽';
  if (country === 'Kanada') return '🇨🇦';
  return '';
}

export default function Venues() {
  const totalCapacity = VENUES.flatMap(c => c.stadiums).reduce((sum, s) => sum + s.capacity, 0);
  const totalVenues = VENUES.flatMap(c => c.stadiums).length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4">
          <h3 className="text-white font-bold text-xl">VM Arenor 2026</h3>
          <p className="text-sky-100 text-sm">
            {totalVenues} arenor i 3 länder — total kapacitet {totalCapacity.toLocaleString('sv-SE')} platser
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          {VENUES.map(country => (
            <div key={country.country} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">{getCountryFlag(country.country)}</div>
              <div className="font-bold text-gray-800">{country.country}</div>
              <div className="text-sm text-gray-500">{country.stadiums.length} {country.stadiums.length === 1 ? 'arena' : 'arenor'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-bold text-gray-800">Värdstäder</h4>
        </div>
        <div className="p-4">
          <img
            src="/stadiums/venues-map.webp"
            alt="Karta över VM 2026 värdstäder"
            className="w-full rounded-lg"
            loading="lazy"
          />
        </div>
      </div>

      {VENUES.map(country => (
        <div key={country.country} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {getCountryFlag(country.country)} {country.country}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {country.stadiums.map(stadium => (
              <StadiumCard key={stadium.name} stadium={stadium} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StadiumCard({ stadium }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 overflow-hidden bg-gray-200">
        <img
          src={stadium.image}
          alt={`Flygbild av ${stadium.name}`}
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
            <span className="text-sm font-semibold text-gray-700">{stadium.capacity.toLocaleString('sv-SE')}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{stadium.fact}</p>
      </div>
    </div>
  );
}
