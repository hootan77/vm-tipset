import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  sv: {
    // Header / Nav
    'nav.predict': 'Tippa',
    'nav.leaderboard': 'Ställning',
    'nav.venues': 'VM Arenor',
    'nav.funfacts': 'Fun Facts',
    'nav.balls': 'VM Bollar',
    'nav.admin': 'Admin',
    'nav.logout': 'Logga ut',
    'header.loggedInAs': 'Inloggad som',

    // Login
    'login.title': 'VM Tips 2026',
    'login.subtitle.register': 'Skapa ett konto för att börja tippa',
    'login.subtitle.login': 'Logga in för att tippa',
    'login.name': 'Namn',
    'login.namePlaceholder': 'Ditt riktiga namn',
    'login.username': 'Användarnamn',
    'login.usernamePlaceholder': 'Ditt användarnamn',
    'login.password': 'Lösenord',
    'login.passwordPlaceholder': 'Ditt lösenord',
    'login.confirmPassword': 'Bekräfta lösenord',
    'login.confirmPlaceholder': 'Upprepa lösenord',
    'login.passwordMismatch': 'Lösenorden matchar inte',
    'login.createAccount': 'Skapa konto',
    'login.login': 'Logga in',
    'login.hasAccount': 'Har redan ett konto? Logga in',
    'login.noAccount': 'Inget konto? Registrera dig',

    // Predict page
    'predict.groupTitle': 'Gruppspel — Dina tips',
    'predict.topScorer': 'Skyttekung',
    'predict.topScorerAdmin': 'Ange den verkliga skyttekungen',
    'predict.topScorerUser': 'Vem tror du blir skyttekung?',
    'predict.topScorerPlaceholder': 'T.ex. Kylian Mbappé',
    'predict.redCard': 'Första röda kortet',
    'predict.redCardAdmin': 'Vilken nation fick det första röda kortet?',
    'predict.redCardUser': 'Vilken nation tror du får det första röda kortet?',
    'predict.redCardPlaceholder': 'T.ex. Argentina',
    'predict.goldenGlove': 'Golden Glove',
    'predict.goldenGloveAdmin': 'Ange den verkliga Golden Glove-vinnaren',
    'predict.goldenGloveUser': 'Vilken målvakt tror du vinner Golden Glove?',
    'predict.goldenGlovePlaceholder': 'T.ex. Thibaut Courtois',
    'predict.tiebreaker': 'Utslagsfråga',
    'predict.tiebreakerQuestion': 'Publiksiffra i den högintressanta matchen mellan DR Congo – Uzbekistan',
    'predict.tiebreakerPlaceholder': 'T.ex. 45000',
    'predict.tiebreakerAdmin': 'Ange den verkliga publiksiffran',
    'predict.tiebreakerUser': 'Gissa publiksiffran — närmast vinner vid lika poäng',
    'predict.remaining': 'tips kvar att fylla i',
    'predict.allDone': 'Alla tips ifyllda!',
    'predict.missingGroups': 'gruppmatcher',
    'predict.missingKnockout': 'slutspelsmatcher',
    'predict.missingBonus': 'bonusfrågor',
    'predict.missingBronze': 'Bronsmatch saknas!',
    'predict.locked': 'Tippningen är låst',
    'predict.lockedDesc': 'Du kan inte längre ändra dina tips.',
    'predict.lockedToast': 'Tippningen är låst – ändringen sparades inte.',
    'predict.realResult': 'Facit',
    'predict.unlock': 'Lås upp tippning',
    'predict.lock': 'Lås tippning',

    // Scoring rules
    'rules.title': 'Regler & Poängfördelning',
    'rules.groupStage': 'Gruppspel',
    'rules.exactResult': 'Exakt resultat',
    'rules.correctOutcome': 'Rätt utfall (1X2)',
    'rules.knockoutMatch': 'Slutspel — Matchresultat',
    'rules.knockoutTeams': 'Slutspel — Rätt lag i omgång',
    'rules.r32': 'Rätt lag i 16-delsfinaler',
    'rules.r16': 'Rätt lag i åttondelsfinaler',
    'rules.qf': 'Rätt lag i kvartsfinaler',
    'rules.sf': 'Rätt lag i semifinaler',
    'rules.final': 'Rätt lag i final',
    'rules.bonus': 'Bonus',
    'rules.winner': 'Rätt VM-vinnare',
    'rules.bronze': 'Rätt bronsmedaljör',
    'rules.redCard': 'Rätt nation — första röda kortet',
    'rules.goldenGlove': 'Rätt Golden Glove-vinnare',
    'rules.topScorer': 'Rätt skyttekung',
    'rules.tiebreakerTitle': 'Utslagsfråga',
    'rules.tiebreakerDesc': 'Vid lika poäng och antal exakta resultat avgör utslagsfrågan. Närmast den verkliga publiksiffran i matchen DR Congo – Uzbekistan vinner.',
    'rules.tiebreaker': 'Vid lika poäng avgör antal exakta resultat, sedan utslagsfrågan, placeringen.',
    'rules.perTeam': 'poäng/lag',
    'rules.points': 'poäng',

    // Leaderboard
    'lb.title': 'Ställning',
    'lb.subtitle': 'Vem leder tippningen?',
    'lb.refresh': 'Uppdatera',
    'lb.filter': 'Filtrera:',
    'lb.all': 'Alla',
    'lb.loading': 'Laddar leaderboard...',
    'lb.empty': 'Inga tippare har registrerat sig ännu.',
    'lb.noRole': 'Inga tippare med den rollen.',
    'lb.col.rank': '#',
    'lb.col.player': 'Tippare',
    'lb.col.role': 'Roll',
    'lb.col.group': 'Gruppspel',
    'lb.col.knockout': 'Slutspel',
    'lb.col.bonus': 'Bonus',
    'lb.col.total': 'Totalt',
    'lb.col.exact': 'Exakta',
    'lb.col.outcome': 'Rätt utfall',
    'lb.col.tips': 'Tips',
    'lb.nextMatch': 'Nästa match',
    'lb.lastThree': 'Senaste 3',
    'lb.match': 'Match',
    'lb.tbd': 'TBD',
    'lb.sortReset': 'Återställ sortering (ställning)',

    // Group stage
    'group.title': 'Grupp',
    'group.matches': 'Matcher',
    'group.advances': 'Går vidare',

    // Standings table
    'st.team': 'Lag',
    'st.played': 'S',
    'st.wins': 'V',
    'st.draws': 'O',
    'st.losses': 'F',
    'st.gf': 'GM',
    'st.ga': 'IM',
    'st.gd': 'MS',
    'st.points': 'P',

    // Knockout
    'ko.title': 'Slutspelsträd',
    'ko.fillGroups': 'Fyll i alla gruppspelsmatcher för att automatiskt generera slutspelsträdet.',
    'ko.adminSubtitle': 'Fyll i verkliga resultat',
    'ko.userSubtitle': 'Tippa resultat — vinnaren går automatiskt vidare',
    'ko.winner': 'VM-Vinnare',
    'ko.predict': 'Tippa slutspelet',
    'ko.penaltyWinner': 'Vinner på straffar:',
    'ko.r32': '32-delsfinal',
    'ko.r16': 'Åttondelsfinal',
    'ko.qf': 'Kvartsfinal',
    'ko.sf': 'Semifinal',
    'ko.bronze': 'Bronsmatch',
    'ko.final': 'Final',

    // Best thirds
    'thirds.title': 'Bästa treor (8 av 12 går vidare)',

    // ScoreBoard
    'sb.title': 'Poängberäkning',
    'sb.noData': 'Poäng visas när admin har fyllt i verkliga resultat.',
    'sb.yourScore': 'Din poäng',
    'sb.total': 'Totalt poäng',
    'sb.groups': 'Gruppspel',
    'sb.r32': '32-del',
    'sb.r16': 'Åttondel',
    'sb.qf': 'Kvart',
    'sb.sf': 'Semi',
    'sb.final': 'Final',
    'sb.winner': 'Vinnare',

    // Admin
    'admin.title': 'Admin — Verkliga resultat',
    'admin.subtitle': 'Fyll i de riktiga matchresultaten. Poäng beräknas automatiskt.',

    // Data management
    'dm.title': 'Datahantering',
    'dm.subtitle': 'Visa och rensa facitdata',
    'dm.knockoutResults': 'Slutspelsfacit',
    'dm.groupResults': 'Gruppspelsfacit',
    'dm.bonusResults': 'Bonusfacit',
    'dm.clearAll': 'Rensa alla',
    'dm.clearKnockout': 'Rensa slutspelsfacit',
    'dm.clearGroups': 'Rensa gruppspelsfacit',
    'dm.confirm': 'Är du säker? Detta går inte att ångra.',
    'dm.cleared': 'Rensat!',
    'dm.noData': 'Ingen data',
    'dm.entries': 'poster',
    'dm.delete': 'Ta bort',

    // User Manager
    'um.title': 'Användare',
    'um.subtitle': 'Hantera tippare, ändra roll/lösenord och se deras tips',
    'um.name': 'Namn',
    'um.role': 'Roll',
    'um.org': 'Organisation',
    'um.registered': 'Registrerad',
    'um.newPassword': 'Nytt lösenord',
    'um.viewTips': 'Visa tips',
    'um.save': 'Spara',
    'um.minChars': 'Minst 4 tecken',
    'um.saved': 'Sparat!',
    'um.view': 'Visa',
    'um.delete': 'Ta bort',
    'um.restore': 'Återställ',
    'um.deleted': 'Borttagen',
    'um.confirmDelete': 'Är du säker på att du vill ta bort {name}? Användaren kan återställas senare.',
    'um.confirmRestore': 'Vill du återställa {name}?',
    'um.showDeleted': 'Visa borttagna',
    'um.hideDeleted': 'Dölj borttagna',
    'um.actions': 'Åtgärder',

    // View user predictions
    'vp.back': 'Tillbaka',
    'vp.tipsBy': 'Tips av',
    'vp.topScorer': 'Skyttekung:',
    'vp.loading': 'Laddar...',
    'vp.noKnockout': 'Inga slutspelstips registrerade.',
    'vp.knockoutTitle': 'Slutspelstips',
    'vp.correctTeams': 'rätt lag',
    'vp.col.rank': '#',
    'vp.col.team': 'Lag',
    'vp.col.points': 'P',
    'vp.col.gd': 'MS',

    // Bonus override (admin view)
    'bo.award': 'Godkänn',
    'bo.revoke': 'Ångra',
    'bo.awarded': 'Poäng tilldelad',
    'bo.adminAnswer': 'Facit:',
    'bo.userAnswer': 'Svar:',
    'bo.noAnswer': 'Inget svar',

    // Prediction statistics (admin)
    'ps.title': 'Tippningsstatistik',
    'ps.subtitle': 'Vad spelarna har tippat — uppdelat per organisation',
    'ps.champion': 'Världsmästare',
    'ps.finalists': 'Finalister',
    'ps.bronze': 'Bronsvinnare',
    'ps.topScorer': 'Skyttekung',
    'ps.firstRedCard': 'Första röda kortet',
    'ps.goldenGlove': 'Golden Glove',
    'ps.votes': 'röster',
    'ps.players': 'spelare',
    'ps.noData': 'Ingen data ännu',
    'ps.incompleteNote': 'En spelare räknas för mästare/finalister så snart deras slutspelsträd löser sig fram till en final med vinnare.',

    // Win probabilities (admin)
    'wp.title': 'Vinstsannolikhet',
    'wp.subtitle': 'Chans att vinna tipset per organisation (Monte Carlo)',
    'wp.compute': 'Beräkna',
    'wp.computing': 'Beräknar…',
    'wp.simsWord': 'simuleringar',
    'wp.simsRan': 'simuleringar körda',
    'wp.hint': 'Klicka på "Beräkna" för att simulera resten av VM och räkna ut vinstsannolikheter.',
    'wp.error': 'Något gick fel vid beräkningen.',
    'wp.note': 'Baserat på inmatat facit; oavgjorda matcher simuleras slumpmässigt enligt appens poängregler.',
    'wp.roundTitle': 'Vinnare per rond (antal simuleringar)',
    'wp.champion': 'VM-vinnare',
    'wp.range': 'Intervall (10:e–90:e percentilen)',

    // Stale penalty winners (admin fix tool)
    'sp.title': 'Felaktiga slutspelsträd',
    'sp.subtitle': 'Spelare med en straffvinnare som inte längre är med i matchen',
    'sp.none': 'Inga felaktiga träd hittades 🎉',
    'sp.staleWas': 'Ogiltig straffvinnare',
    'sp.pickWinner': 'Välj straffvinnare:',
    'sp.clear': 'Rensa',

    // Venues
    'venues.title': 'VM Arenor 2026',
    'venues.subtitle': '{count} arenor i 3 länder — total kapacitet {capacity} platser',
    'venues.arena': 'arena',
    'venues.arenas': 'arenor',
    'venues.hostCities': 'Värdstäder',
    'venues.mapAlt': 'Karta över VM 2026 värdstäder',
    'venues.countries': '3 länder',

    // World Cup Balls
    'balls.title': 'VM-bollar genom historien',
    'balls.subtitle': '{count} officiella matchbollar sedan 1930',
    'balls.count': 'VM-bollar',
    'balls.years': 'År av historia',
    'balls.adidasTakeover': 'Adidas tar över',
    'balls.panels': 'Paneler (2014)',
    'balls.manufacturer': 'Tillverkare:',
    'balls.material': 'Material:',
    'balls.unknown': 'Okänd',

    // Fun Facts
    'ff.title': 'VM Fun Facts',
    'ff.subtitle': 'Rekord, statistik och kuriosa från VM-historien',

    // Roles
    'role.spelare': 'Spelare',
    'role.ledare': 'Ledare',
    'role.familj': 'Familj',
  },
  en: {
    // Header / Nav
    'nav.predict': 'Predict',
    'nav.leaderboard': 'Standings',
    'nav.venues': 'WC Venues',
    'nav.funfacts': 'Fun Facts',
    'nav.balls': 'WC Balls',
    'nav.admin': 'Admin',
    'nav.logout': 'Log out',
    'header.loggedInAs': 'Logged in as',

    // Login
    'login.title': 'WC Predictions 2026',
    'login.subtitle.register': 'Create an account to start predicting',
    'login.subtitle.login': 'Log in to predict',
    'login.name': 'Name',
    'login.namePlaceholder': 'Your real name',
    'login.username': 'Username',
    'login.usernamePlaceholder': 'Your username',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Your password',
    'login.confirmPassword': 'Confirm password',
    'login.confirmPlaceholder': 'Repeat password',
    'login.passwordMismatch': 'Passwords do not match',
    'login.createAccount': 'Create account',
    'login.login': 'Log in',
    'login.hasAccount': 'Already have an account? Log in',
    'login.noAccount': 'No account? Register',

    // Predict page
    'predict.groupTitle': 'Group Stage — Your Predictions',
    'predict.topScorer': 'Top Scorer',
    'predict.topScorerAdmin': 'Enter the actual top scorer',
    'predict.topScorerUser': 'Who do you think will be top scorer?',
    'predict.topScorerPlaceholder': 'E.g. Kylian Mbappé',
    'predict.redCard': 'First Red Card',
    'predict.redCardAdmin': 'Which nation received the first red card?',
    'predict.redCardUser': 'Which nation do you think will get the first red card?',
    'predict.redCardPlaceholder': 'E.g. Argentina',
    'predict.goldenGlove': 'Golden Glove',
    'predict.goldenGloveAdmin': 'Enter the actual Golden Glove winner',
    'predict.goldenGloveUser': 'Which goalkeeper do you think will win the Golden Glove?',
    'predict.goldenGlovePlaceholder': 'E.g. Thibaut Courtois',
    'predict.tiebreaker': 'Tiebreaker',
    'predict.tiebreakerQuestion': 'Attendance for the highly anticipated match between DR Congo – Uzbekistan',
    'predict.tiebreakerPlaceholder': 'E.g. 45000',
    'predict.tiebreakerAdmin': 'Enter the actual attendance figure',
    'predict.tiebreakerUser': 'Guess the attendance — closest wins in case of a tie',
    'predict.remaining': 'predictions left to fill',
    'predict.allDone': 'All predictions filled!',
    'predict.missingGroups': 'group matches',
    'predict.missingKnockout': 'knockout matches',
    'predict.missingBonus': 'bonus questions',
    'predict.missingBronze': 'Bronze match missing!',
    'predict.locked': 'Predictions are locked',
    'predict.lockedDesc': 'You can no longer change your predictions.',
    'predict.lockedToast': 'Predictions are locked – your change was not saved.',
    'predict.realResult': 'Actual result',
    'predict.unlock': 'Unlock predictions',
    'predict.lock': 'Lock predictions',

    // Scoring rules
    'rules.title': 'Rules & Scoring',
    'rules.groupStage': 'Group Stage',
    'rules.exactResult': 'Exact result',
    'rules.correctOutcome': 'Correct outcome (1X2)',
    'rules.knockoutMatch': 'Knockout — Match Result',
    'rules.knockoutTeams': 'Knockout — Correct Team in Round',
    'rules.r32': 'Correct team in Round of 32',
    'rules.r16': 'Correct team in Round of 16',
    'rules.qf': 'Correct team in Quarterfinals',
    'rules.sf': 'Correct team in Semi-finals',
    'rules.final': 'Correct team in Final',
    'rules.bonus': 'Bonus',
    'rules.winner': 'Correct World Cup winner',
    'rules.bronze': 'Correct bronze medalist',
    'rules.redCard': 'Correct nation — first red card',
    'rules.goldenGlove': 'Correct Golden Glove winner',
    'rules.topScorer': 'Correct top scorer',
    'rules.tiebreakerTitle': 'Tiebreaker',
    'rules.tiebreakerDesc': 'If points and exact results are tied, the tiebreaker decides. Closest guess to the actual attendance at DR Congo – Uzbekistan wins.',
    'rules.tiebreaker': 'In case of a tie, exact results decide first, then the tiebreaker question.',
    'rules.perTeam': 'pts/team',
    'rules.points': 'points',

    // Leaderboard
    'lb.title': 'Standings',
    'lb.subtitle': 'Who leads the predictions?',
    'lb.refresh': 'Refresh',
    'lb.filter': 'Filter:',
    'lb.all': 'All',
    'lb.loading': 'Loading standings...',
    'lb.empty': 'No players have registered yet.',
    'lb.noRole': 'No players with that role.',
    'lb.col.rank': '#',
    'lb.col.player': 'Player',
    'lb.col.role': 'Role',
    'lb.col.group': 'Group',
    'lb.col.knockout': 'Knockout',
    'lb.col.bonus': 'Bonus',
    'lb.col.total': 'Total',
    'lb.col.exact': 'Exact',
    'lb.col.outcome': 'Correct',
    'lb.col.tips': 'Tips',
    'lb.nextMatch': 'Next match',
    'lb.lastThree': 'Last 3',
    'lb.match': 'Match',
    'lb.tbd': 'TBD',
    'lb.sortReset': 'Reset sorting (standings)',

    // Group stage
    'group.title': 'Group',
    'group.matches': 'Matches',
    'group.advances': 'Advances',

    // Standings table
    'st.team': 'Team',
    'st.played': 'P',
    'st.wins': 'W',
    'st.draws': 'D',
    'st.losses': 'L',
    'st.gf': 'GF',
    'st.ga': 'GA',
    'st.gd': 'GD',
    'st.points': 'Pts',

    // Knockout
    'ko.title': 'Knockout Bracket',
    'ko.fillGroups': 'Fill in all group stage matches to automatically generate the knockout bracket.',
    'ko.adminSubtitle': 'Enter actual results',
    'ko.userSubtitle': 'Predict results — the winner advances automatically',
    'ko.winner': 'World Cup Winner',
    'ko.predict': 'Predict knockout stage',
    'ko.penaltyWinner': 'Wins on penalties:',
    'ko.r32': 'Round of 32',
    'ko.r16': 'Round of 16',
    'ko.qf': 'Quarter-final',
    'ko.sf': 'Semi-final',
    'ko.bronze': 'Bronze match',
    'ko.final': 'Final',

    // Best thirds
    'thirds.title': 'Best third-placed teams (8 of 12 advance)',

    // ScoreBoard
    'sb.title': 'Score Calculation',
    'sb.noData': 'Scores will appear when admin has entered actual results.',
    'sb.yourScore': 'Your Score',
    'sb.total': 'Total points',
    'sb.groups': 'Groups',
    'sb.r32': 'R32',
    'sb.r16': 'R16',
    'sb.qf': 'QF',
    'sb.sf': 'SF',
    'sb.final': 'Final',
    'sb.winner': 'Winner',

    // Admin
    'admin.title': 'Admin — Actual Results',
    'admin.subtitle': 'Enter the real match results. Points are calculated automatically.',

    // Data management
    'dm.title': 'Data Management',
    'dm.subtitle': 'View and clear result data',
    'dm.knockoutResults': 'Knockout Results',
    'dm.groupResults': 'Group Results',
    'dm.bonusResults': 'Bonus Results',
    'dm.clearAll': 'Clear all',
    'dm.clearKnockout': 'Clear knockout results',
    'dm.clearGroups': 'Clear group results',
    'dm.confirm': 'Are you sure? This cannot be undone.',
    'dm.cleared': 'Cleared!',
    'dm.noData': 'No data',
    'dm.entries': 'entries',
    'dm.delete': 'Delete',

    // User Manager
    'um.title': 'Users',
    'um.subtitle': 'Manage players, change roles/passwords and view their predictions',
    'um.name': 'Name',
    'um.role': 'Role',
    'um.org': 'Organisation',
    'um.registered': 'Registered',
    'um.newPassword': 'New password',
    'um.viewTips': 'View tips',
    'um.save': 'Save',
    'um.minChars': 'Min 4 characters',
    'um.saved': 'Saved!',
    'um.view': 'View',
    'um.delete': 'Delete',
    'um.restore': 'Restore',
    'um.deleted': 'Deleted',
    'um.confirmDelete': 'Are you sure you want to delete {name}? The user can be restored later.',
    'um.confirmRestore': 'Restore {name}?',
    'um.showDeleted': 'Show deleted',
    'um.hideDeleted': 'Hide deleted',
    'um.actions': 'Actions',

    // View user predictions
    'vp.back': 'Back',
    'vp.tipsBy': 'Predictions by',
    'vp.topScorer': 'Top scorer:',
    'vp.loading': 'Loading...',
    'vp.noKnockout': 'No knockout predictions registered.',
    'vp.knockoutTitle': 'Knockout predictions',
    'vp.correctTeams': 'correct teams',
    'vp.col.rank': '#',
    'vp.col.team': 'Team',
    'vp.col.points': 'P',
    'vp.col.gd': 'GD',

    // Bonus override (admin view)
    'bo.award': 'Award',
    'bo.revoke': 'Revoke',
    'bo.awarded': 'Points awarded',
    'bo.adminAnswer': 'Correct:',
    'bo.userAnswer': 'Answer:',
    'bo.noAnswer': 'No answer',

    // Prediction statistics (admin)
    'ps.title': 'Prediction statistics',
    'ps.subtitle': 'What players predicted — broken down by organisation',
    'ps.champion': 'World champion',
    'ps.finalists': 'Finalists',
    'ps.bronze': 'Bronze winner',
    'ps.topScorer': 'Top scorer',
    'ps.firstRedCard': 'First red card',
    'ps.goldenGlove': 'Golden Glove',
    'ps.votes': 'votes',
    'ps.players': 'players',
    'ps.noData': 'No data yet',
    'ps.incompleteNote': 'A player is counted for champion/finalists as soon as their bracket resolves to a final with a winner.',

    // Win probabilities (admin)
    'wp.title': 'Win probability',
    'wp.subtitle': 'Chance to win the pool per organisation (Monte Carlo)',
    'wp.compute': 'Calculate',
    'wp.computing': 'Calculating…',
    'wp.simsWord': 'simulations',
    'wp.simsRan': 'simulations run',
    'wp.hint': 'Click "Calculate" to simulate the rest of the World Cup and estimate win probabilities.',
    'wp.error': 'Something went wrong during the calculation.',
    'wp.note': 'Based on entered results; undecided matches are simulated at random using the app scoring rules.',
    'wp.roundTitle': 'Winners per round (number of simulations)',
    'wp.champion': 'World champion',
    'wp.range': 'Range (10th–90th percentile)',

    // Stale penalty winners (admin fix tool)
    'sp.title': 'Broken knockout trees',
    'sp.subtitle': 'Players with a penalty winner no longer in the match',
    'sp.none': 'No broken trees found 🎉',
    'sp.staleWas': 'Invalid penalty winner',
    'sp.pickWinner': 'Pick penalty winner:',
    'sp.clear': 'Clear',

    // Venues
    'venues.title': 'WC Venues 2026',
    'venues.subtitle': '{count} venues in 3 countries — total capacity {capacity} seats',
    'venues.arena': 'venue',
    'venues.arenas': 'venues',
    'venues.hostCities': 'Host Cities',
    'venues.mapAlt': 'Map of World Cup 2026 host cities',
    'venues.countries': '3 countries',

    // World Cup Balls
    'balls.title': 'World Cup Balls Through History',
    'balls.subtitle': '{count} official match balls since 1930',
    'balls.count': 'WC balls',
    'balls.years': 'Years of history',
    'balls.adidasTakeover': 'Adidas takes over',
    'balls.panels': 'Panels (2014)',
    'balls.manufacturer': 'Manufacturer:',
    'balls.material': 'Material:',
    'balls.unknown': 'Unknown',

    // Fun Facts
    'ff.title': 'WC Fun Facts',
    'ff.subtitle': 'Records, statistics and trivia from World Cup history',

    // Roles
    'role.spelare': 'Player',
    'role.ledare': 'Coach',
    'role.familj': 'Family',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('vm-tipset-lang') || 'sv';
    } catch { return 'sv'; }
  });

  useEffect(() => {
    localStorage.setItem('vm-tipset-lang', lang);
  }, [lang]);

  function t(key) {
    return translations[lang]?.[key] || translations.sv[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
