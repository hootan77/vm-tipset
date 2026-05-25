import { getFlag } from '../data/flags';

export default function StandingsTable({ standings }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 border-b">
            <th className="text-left py-1 px-1">#</th>
            <th className="text-left py-1 px-1">Lag</th>
            <th className="py-1 px-1">S</th>
            <th className="py-1 px-1">V</th>
            <th className="py-1 px-1">O</th>
            <th className="py-1 px-1">F</th>
            <th className="py-1 px-1">GM</th>
            <th className="py-1 px-1">IM</th>
            <th className="py-1 px-1">MS</th>
            <th className="py-1 px-1 font-bold">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr
              key={row.team}
              className={`border-b last:border-0 ${
                i < 2 ? 'bg-green-50' : i === 2 ? 'bg-yellow-50' : ''
              }`}
            >
              <td className="py-1.5 px-1 text-gray-500 font-medium">{row.position}</td>
              <td className="py-1.5 px-1 text-left font-medium text-gray-800 whitespace-nowrap">{getFlag(row.team)} {row.team}</td>
              <td className="py-1.5 px-1 text-center">{row.played}</td>
              <td className="py-1.5 px-1 text-center">{row.wins}</td>
              <td className="py-1.5 px-1 text-center">{row.draws}</td>
              <td className="py-1.5 px-1 text-center">{row.losses}</td>
              <td className="py-1.5 px-1 text-center">{row.gf}</td>
              <td className="py-1.5 px-1 text-center">{row.ga}</td>
              <td className="py-1.5 px-1 text-center">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="py-1.5 px-1 text-center font-bold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
