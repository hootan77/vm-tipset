import { useTournament } from '../context/TournamentContext';
import { useLanguage } from '../context/LanguageContext';
import { getMatchWinner } from '../logic/knockout';
import { scoreKnockoutMatch } from '../logic/scoring';
import { getFlag, getTeamName } from '../data/flags';
import KnockoutMatch from './KnockoutMatch';

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];
const POINTS_PER_TEAM = 5;

function getTeamsInRound(bracket, round) {
  const teams = new Set();
  if (!bracket?.[round]) return teams;
  for (const match of bracket[round]) {
    if (match.home) teams.add(match.home);
    if (match.away) teams.add(match.away);
  }
  return teams;
}

function getRoundPoints(userBracket, adminBracket, round) {
  const userTeams = getTeamsInRound(userBracket, round);
  const adminTeams = getTeamsInRound(adminBracket, round);
  if (adminTeams.size === 0) return null;
  let correct = 0;
  for (const team of userTeams) {
    if (adminTeams.has(team)) correct++;
  }
  return { correct, total: adminTeams.size, points: correct * POINTS_PER_TEAM };
}

export default function KnockoutBracket({ isAdmin }) {
  const { t } = useLanguage();
  const { computed } = useTournament();
  const bracket = isAdmin ? computed.adminBracket : computed.userBracket;
  const adminBracket = computed.adminBracket;
  const allGroupsComplete = isAdmin ? computed.allAdminGroupsComplete : computed.allUserGroupsComplete;

  if (!allGroupsComplete) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">⚽</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('ko.title')}</h3>
        <p className="text-gray-500">
          {t('ko.fillGroups')}
        </p>
      </div>
    );
  }

  const showPoints = !isAdmin && computed.allAdminGroupsComplete;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600">
        <h3 className="text-white font-bold text-xl">{t('ko.title')}</h3>
        <p className="text-amber-100 text-sm">
          {isAdmin ? t('ko.adminSubtitle') : t('ko.userSubtitle')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-[1200px]">
          {ROUND_ORDER.map(round => (
            <RoundColumn
              key={round}
              round={round}
              matches={bracket[round]}
              isAdmin={isAdmin}
              roundPoints={showPoints ? getRoundPoints(bracket, adminBracket, round) : null}
              adminMatches={showPoints ? adminBracket[round] : null}
            />
          ))}
          <WinnerColumn bracket={bracket} adminBracket={adminBracket} showPoints={showPoints} />
        </div>
      </div>

      {bracket.bronze && (
        <div className="border-t px-6 py-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            {t('ko.bronze')}
          </h4>
          <div className="max-w-xs">
            <KnockoutMatch
              match={bracket.bronze[0]}
              isAdmin={isAdmin}
              points={showPoints && adminBracket.bronze?.[0] ? scoreKnockoutMatch(bracket.bronze[0], adminBracket.bronze[0]) : null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RoundColumn({ round, matches, isAdmin, roundPoints, adminMatches }) {
  const { t } = useLanguage();
  const spacingClass = {
    r32: 'gap-2',
    r16: 'gap-6',
    qf: 'gap-14',
    sf: 'gap-30',
    final: '',
  }[round];

  return (
    <div className="flex-shrink-0 w-52">
      <div className="flex items-center justify-center gap-2 mb-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {t(`ko.${round}`)}
        </h4>
        {roundPoints && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            roundPoints.points > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {roundPoints.points}p
          </span>
        )}
      </div>
      <div className={`flex flex-col ${spacingClass} justify-center min-h-full`}>
        {matches.map(match => {
          let matchPoints = null;
          if (adminMatches) {
            const adminMatch = adminMatches.find(m => m.id === match.id);
            if (adminMatch) matchPoints = scoreKnockoutMatch(match, adminMatch);
          }
          return <KnockoutMatch key={match.id} match={match} isAdmin={isAdmin} points={matchPoints} />;
        })}
      </div>
    </div>
  );
}

function WinnerColumn({ bracket, adminBracket, showPoints }) {
  const { t, lang } = useLanguage();
  const finalMatch = bracket.final?.[0];
  const winner = finalMatch ? getMatchWinner(finalMatch) : null;

  let winnerPoints = null;
  if (showPoints && winner) {
    const adminFinal = adminBracket?.final?.[0];
    const adminWinner = adminFinal ? getMatchWinner(adminFinal) : null;
    if (adminWinner) {
      winnerPoints = winner === adminWinner ? POINTS_PER_TEAM : 0;
    }
  }

  return (
    <div className="flex-shrink-0 w-44 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('ko.winner')}</h4>
        {winnerPoints !== null && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            winnerPoints > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
          }`}>
            {winnerPoints}p
          </span>
        )}
      </div>
      <div className={`rounded-xl border-2 px-6 py-6 text-center ${
        winner
          ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-100 shadow-lg'
          : 'border-dashed border-gray-300 bg-gray-50'
      }`}>
        {winner ? (
          <>
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold text-lg text-gray-800">{getFlag(winner)} {getTeamName(winner, lang)}</div>
          </>
        ) : (
          <div className="text-gray-400 text-sm">{t('ko.predict')}</div>
        )}
      </div>
    </div>
  );
}
