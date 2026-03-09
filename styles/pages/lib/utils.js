export const SPORTS = [
  { value: 'basketball_nba', label: '🏀 NBA', key: 'nba' },
  { value: 'americanfootball_nfl', label: '🏈 NFL', key: 'nfl' },
  { value: 'baseball_mlb', label: '⚾ MLB', key: 'mlb' },
  { value: 'icehockey_nhl', label: '🏒 NHL', key: 'nhl' },
  { value: 'basketball_ncaab', label: '🏀 NCAA BB', key: 'ncaa' },
  { value: 'mma_mixed_martial_arts', label: '🥊 MMA/UFC', key: 'mma' },
  { value: 'soccer_epl', label: '⚽ EPL', key: 'soccer' },
]

export function fmtOdds(price) {
  if (price == null) return '—'
  const n = Math.round(price)
  return n > 0 ? '+' + n : '' + n
}

export function oddsColor(price) {
  if (price == null) return 'var(--muted)'
  if (price > 0) return 'var(--accent)'
  if (Math.abs(price) <= 110) return 'var(--gold)'
  return 'var(--text)'
}

export function shortName(full) {
  if (!full) return ''
  return full.trim().split(' ').pop()
}

export function fmtTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch { return '' }
}

export function isLive(t) {
  const now = Date.now(), start = new Date(t).getTime()
  return now > start && now < start + 4 * 3600 * 1000
}

export function getBestML(bookmakers, homeTeam, awayTeam) {
  let bH = { price: -99999, book: '' }, bA = { price: -99999, book: '' }
  bookmakers.forEach(bk => {
    const mkt = bk.markets?.find(m => m.key === 'h2h')
    if (!​​​​​​​​​​​​​​​​
