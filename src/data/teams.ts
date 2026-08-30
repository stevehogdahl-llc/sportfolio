import type { League, TeamRef } from '@/api/types';

/**
 * Bundled team directory for the favorites picker.
 *
 * ESPN's team-list endpoint (`site.api.espn.com/.../teams`) sends no CORS
 * header, so the web build can't fetch it. The list is tiny and changes at
 * most once a year (relocations / rebrands), so a snapshot is shipped instead.
 * Logo URLs follow `a.espncdn.com/i/teamlogos/<sport>/500/<abbrev>.png`.
 *
 * Sorted by `name`. Refresh with the ESPN `/teams` endpoint when rosters change.
 */

type TeamSeed = Omit<TeamRef, 'league'>;

const MLB: TeamSeed[] = [
  { id: '3', name: 'Angels', fullName: 'Los Angeles Angels', abbrev: 'LAA', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/laa.png' },
  { id: '18', name: 'Astros', fullName: 'Houston Astros', abbrev: 'HOU', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png' },
  { id: '11', name: 'Athletics', fullName: 'Athletics', abbrev: 'ATH', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/ath.png' },
  { id: '14', name: 'Blue Jays', fullName: 'Toronto Blue Jays', abbrev: 'TOR', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png' },
  { id: '15', name: 'Braves', fullName: 'Atlanta Braves', abbrev: 'ATL', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png' },
  { id: '8', name: 'Brewers', fullName: 'Milwaukee Brewers', abbrev: 'MIL', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png' },
  { id: '24', name: 'Cardinals', fullName: 'St. Louis Cardinals', abbrev: 'STL', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png' },
  { id: '16', name: 'Cubs', fullName: 'Chicago Cubs', abbrev: 'CHC', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { id: '29', name: 'Diamondbacks', fullName: 'Arizona Diamondbacks', abbrev: 'ARI', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/ari.png' },
  { id: '19', name: 'Dodgers', fullName: 'Los Angeles Dodgers', abbrev: 'LAD', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png' },
  { id: '26', name: 'Giants', fullName: 'San Francisco Giants', abbrev: 'SF', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/sf.png' },
  { id: '5', name: 'Guardians', fullName: 'Cleveland Guardians', abbrev: 'CLE', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png' },
  { id: '12', name: 'Mariners', fullName: 'Seattle Mariners', abbrev: 'SEA', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png' },
  { id: '28', name: 'Marlins', fullName: 'Miami Marlins', abbrev: 'MIA', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png' },
  { id: '21', name: 'Mets', fullName: 'New York Mets', abbrev: 'NYM', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png' },
  { id: '20', name: 'Nationals', fullName: 'Washington Nationals', abbrev: 'WSH', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/wsh.png' },
  { id: '1', name: 'Orioles', fullName: 'Baltimore Orioles', abbrev: 'BAL', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png' },
  { id: '25', name: 'Padres', fullName: 'San Diego Padres', abbrev: 'SD', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png' },
  { id: '22', name: 'Phillies', fullName: 'Philadelphia Phillies', abbrev: 'PHI', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png' },
  { id: '23', name: 'Pirates', fullName: 'Pittsburgh Pirates', abbrev: 'PIT', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/pit.png' },
  { id: '13', name: 'Rangers', fullName: 'Texas Rangers', abbrev: 'TEX', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/tex.png' },
  { id: '30', name: 'Rays', fullName: 'Tampa Bay Rays', abbrev: 'TB', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png' },
  { id: '2', name: 'Red Sox', fullName: 'Boston Red Sox', abbrev: 'BOS', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png' },
  { id: '17', name: 'Reds', fullName: 'Cincinnati Reds', abbrev: 'CIN', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png' },
  { id: '27', name: 'Rockies', fullName: 'Colorado Rockies', abbrev: 'COL', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png' },
  { id: '7', name: 'Royals', fullName: 'Kansas City Royals', abbrev: 'KC', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png' },
  { id: '6', name: 'Tigers', fullName: 'Detroit Tigers', abbrev: 'DET', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png' },
  { id: '9', name: 'Twins', fullName: 'Minnesota Twins', abbrev: 'MIN', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png' },
  { id: '4', name: 'White Sox', fullName: 'Chicago White Sox', abbrev: 'CHW', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
  { id: '10', name: 'Yankees', fullName: 'New York Yankees', abbrev: 'NYY', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png' },
];

const NFL: TeamSeed[] = [
  { id: '25', name: '49ers', fullName: 'San Francisco 49ers', abbrev: 'SF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png' },
  { id: '3', name: 'Bears', fullName: 'Chicago Bears', abbrev: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { id: '4', name: 'Bengals', fullName: 'Cincinnati Bengals', abbrev: 'CIN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png' },
  { id: '2', name: 'Bills', fullName: 'Buffalo Bills', abbrev: 'BUF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png' },
  { id: '7', name: 'Broncos', fullName: 'Denver Broncos', abbrev: 'DEN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png' },
  { id: '5', name: 'Browns', fullName: 'Cleveland Browns', abbrev: 'CLE', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png' },
  { id: '27', name: 'Buccaneers', fullName: 'Tampa Bay Buccaneers', abbrev: 'TB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png' },
  { id: '22', name: 'Cardinals', fullName: 'Arizona Cardinals', abbrev: 'ARI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png' },
  { id: '24', name: 'Chargers', fullName: 'Los Angeles Chargers', abbrev: 'LAC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png' },
  { id: '12', name: 'Chiefs', fullName: 'Kansas City Chiefs', abbrev: 'KC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png' },
  { id: '11', name: 'Colts', fullName: 'Indianapolis Colts', abbrev: 'IND', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png' },
  { id: '28', name: 'Commanders', fullName: 'Washington Commanders', abbrev: 'WSH', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png' },
  { id: '6', name: 'Cowboys', fullName: 'Dallas Cowboys', abbrev: 'DAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png' },
  { id: '15', name: 'Dolphins', fullName: 'Miami Dolphins', abbrev: 'MIA', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png' },
  { id: '21', name: 'Eagles', fullName: 'Philadelphia Eagles', abbrev: 'PHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png' },
  { id: '1', name: 'Falcons', fullName: 'Atlanta Falcons', abbrev: 'ATL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png' },
  { id: '19', name: 'Giants', fullName: 'New York Giants', abbrev: 'NYG', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png' },
  { id: '30', name: 'Jaguars', fullName: 'Jacksonville Jaguars', abbrev: 'JAX', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png' },
  { id: '20', name: 'Jets', fullName: 'New York Jets', abbrev: 'NYJ', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png' },
  { id: '8', name: 'Lions', fullName: 'Detroit Lions', abbrev: 'DET', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png' },
  { id: '9', name: 'Packers', fullName: 'Green Bay Packers', abbrev: 'GB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png' },
  { id: '29', name: 'Panthers', fullName: 'Carolina Panthers', abbrev: 'CAR', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png' },
  { id: '17', name: 'Patriots', fullName: 'New England Patriots', abbrev: 'NE', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png' },
  { id: '13', name: 'Raiders', fullName: 'Las Vegas Raiders', abbrev: 'LV', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png' },
  { id: '14', name: 'Rams', fullName: 'Los Angeles Rams', abbrev: 'LAR', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png' },
  { id: '33', name: 'Ravens', fullName: 'Baltimore Ravens', abbrev: 'BAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png' },
  { id: '18', name: 'Saints', fullName: 'New Orleans Saints', abbrev: 'NO', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png' },
  { id: '26', name: 'Seahawks', fullName: 'Seattle Seahawks', abbrev: 'SEA', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png' },
  { id: '23', name: 'Steelers', fullName: 'Pittsburgh Steelers', abbrev: 'PIT', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png' },
  { id: '34', name: 'Texans', fullName: 'Houston Texans', abbrev: 'HOU', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png' },
  { id: '10', name: 'Titans', fullName: 'Tennessee Titans', abbrev: 'TEN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png' },
  { id: '16', name: 'Vikings', fullName: 'Minnesota Vikings', abbrev: 'MIN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png' },
];

const withLeague = (league: League, seeds: TeamSeed[]): TeamRef[] =>
  seeds.map((t) => ({ ...t, league }));

export const LEAGUE_TEAMS: Record<League, TeamRef[]> = {
  mlb: withLeague('mlb', MLB),
  nfl: withLeague('nfl', NFL),
};

export function getLeagueTeams(league: League): TeamRef[] {
  return LEAGUE_TEAMS[league];
}
