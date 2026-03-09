import { useState, useCallback } from 'react'
import Head from 'next/head'

const SPORTS = [
  { value: 'basketball_nba', label: '🏀 NBA', key: 'nba' },
  { value: 'americanfootball_nfl', label: '🏈 NFL', key: 'nfl' },
  { value: 'baseball_mlb', label: '⚾ MLB', key: 'mlb' },
  { value: 'icehockey_nhl', label: '🏒 NHL', key: 'nhl' },
  { value: 'basketball_ncaab', label: '🏀 NCAA BB', key: 'ncaa' },
  { value: 'mma_mixed_martial_arts', label: '🥊 MMA/UFC', key: 'mma' },
  { value: 'soccer_epl', label: '⚽ EPL', key: 'soccer' },
]

function fmtOdds(price) {
  if (price == null) return '—'
  const n = Math.round(price)
  return n > 0 ? '+' + n : '' + n
}

function shortName(full) {
  if (!full) return ''
  return full.trim().split(' ').pop()
}

function fmtTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch { return '' }
}

function oddsColor(price) {
  if (price == null) return '#55576E'
  if (price > 0) return '#C8FF00'
  if (Math.abs(price) <= 110) return '#FFD060'
  return '#ECEDF5'
}

function GameCard({ game }) {
  const [expanded, setExpanded] = useState(false)
  const [pick, setPick] = useState(null)
  const [loading, setLoading] = useState(false)

  const books = game.bookmakers || []
  const db = books[0]
  const getM = (k) => db?.markets?.find(m => m.key === k)
  const h2h = getM('h2h'), spread = getM('spreads'), total = getM('totals')

  const handlePick = async () => {
    if (!expanded) {
      setExpanded(true)
      if (!pick) {
        setLoading(true)
        try {
          const res = await fetch('/api/pick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game })
          })
          const data = await res.json()
          setPick(data)
        } catch(e) {
          setPick({ error: e.message })
        }
        setLoading(false)
      }
    } else {
      setExpanded(false)
    }
  }

  const OddsCell = ({ label, mkt, type }) => (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: '.57rem', fontFamily: 'monospace', letterSpacing: '.15em', textTransform: 'uppercase', color: '#55576E', marginBottom: 8 }}>{label}</div>
      {!mkt ? <div style={{ fontSize: '.68rem', color: '#55576E' }}>N/A</div>
        : type === 'totals'
          ? ['Over','Under'].map(side => {
              const o = mkt.outcomes.find(x => x.name === side)
              return <div key={side} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '.7rem' }}>{side}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.9rem', color: oddsColor(o?.price) }}>
                  {o?.point != null && <span style={{ color: '#55576E', fontSize: '.6rem', marginRight: 3 }}>{o.point}</span>}
                  {fmtOdds(o?.price)}
                </span>
              </div>
            })
          : [game.away_team, game.home_team].map(team => {
              const o = mkt.outcomes.find(x => x.name === team)
              return <div key={team} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '.7rem' }}>{shortName(team)}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '.9rem', color: oddsColor(o?.price) }}>
                  {type === 'spreads' && o?.point != null && <span style={{ color: '#55576E', fontSize: '.6rem', marginRight: 3 }}>{o.point > 0 ? '+' : ''}{o.point}</span>}
                  {fmtOdds(o?.price)}
                </span>
              </div>
            })
      }
      {db && <div style={{ fontSize: '.52rem', color: '#2A2B3A', marginTop: 5, textAlign: 'right' }}>via {db.title}</div>}
    </div>
  )

  return (
    <div style={{ background: '#13141D', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,#C8FF00,transparent)' }} />
      <div style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ background: 'rgba(200,255,0,.1)', color: '#C8FF00', fontFamily: 'monospace', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.15em', padding: '3px 10px', borderRadius: 3, textTransform: 'uppercase' }}>{game.sport_key?.split('_').pop().toUpperCase()}</span>
          <span style={{ color: '#55576E', fontSize: '.67rem', fontFamily: 'monospace' }}>{fmtTime(game.commence_time)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1 }}>{shortName(game.away_team)}</div>
            <div style={{ fontSize: '.6rem', color: '#55576E', marginTop: 2 }}>{game.away_team}</div>
          </div>
          <div style={{ fontSize: '.7rem', color: '#2A2B3A', fontWeight: 700 }}>@</div>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1 }}>{shortName(game.home_team)}</div>
            <div style={{ fontSize: '.6rem', color: '#55576E', marginTop: 2 }}>{game.home_team}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <OddsCell label="Moneyline" mkt={h2h} type="h2h" />
          <OddsCell label="Spread" mkt={spread} type="spreads" />
          <OddsCell label="Total" mkt={total} type="totals" />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 12 }}>
          <button onClick={handlePick} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ECEDF5', fontFamily: 'monospace', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(200,255,0,.12)', border: '1px solid rgba(200,255,0,.2)', borderRadius: 4, padding: '2px 8px', fontSize: '.58rem', color: '#C8FF00' }}>PICK</span>
              {expanded ? 'Hide' : 'Get'} Pick & Analysis
            </div>
            <span style={{ color: '#55576E', display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>

          {expanded && (
            <div style={{ marginTop: 12 }}>
              {loading ? (
                <div style={{ color: '#C8FF00', fontSize: '.72rem', fontFamily: 'monospace' }}>Analyzing…</div>
              ) : pick?.error ? (
                <div style={{ color: '#FF3B5C', fontSize: '.75rem' }}>⚠️ {pick.error}</div>
              ) : pick ? (
                <>
                  <div style={{ fontSize: '.82rem', color: '#8890A8', lineHeight: 1.7, marginBottom: 12 }}>{pick.analysis}</div>
                  <div style={{ background: 'rgba(200,255,0,.06)', border: '1px solid rgba(200,255,0,.15)', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: '.55rem', fontFamily: 'monospace', letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: 4 }}>⚡ TOP PICK</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 900, marginBottom: 10 }}>{pick.pick}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pick.confidence + '%', background: 'linear-gradient(90deg,#C8FF00,#d9ff33)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '.67rem', fontWeight: 700, color: '#C8FF00' }}>{pick.confidence}% conf</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [sport, setSport] = useState('basketball_nba')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [msg, setMsg] = useState({ type: 'idle', text: 'Select a sport and load live odds.' })

  const handleLoad = useCallback(async () => {
    setLoading(true); setGames([])
    setMsg({ type: 'loading', text: 'Fetching live odds…' })
    try {
      const res = await fetch('/api/odds?sport=' + sport)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error ' + res.status)
      if (data.remaining) setRemaining(data.remaining)
      if (!data.games?.length) {
        setMsg({ type: 'warn', text: 'No games found for this sport right now. Try another.' })
      } else {
        setGames(data.games)
        setMsg({ type: 'ok', text: '✅ ' + data.games.length + ' games loaded · ' + (data.remaining ?? '?') + ' API requests remaining' })
      }
    } catch(e) {
      setMsg({ type: 'err', text: '❌ ' + e.message })
    }
    setLoading(false)
  }, [sport])

  const msgColor = { idle: '#55576E', loading: '#C8FF00', ok: '#C8FF00', err: '#FF3B5C', warn: '#FFD060' }

  return (
    <div style={{ background: '#07080D', minHeight: '100vh', color: '#ECEDF5' }}>
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, height: 54, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,8,13,.96)', borderBottom: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(16px)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '.05em', color: '#C8FF00' }}>Edge<span style={{ color: '#ECEDF5' }}>IQ</span></div>
        {remaining && <div style={{ fontSize: '.62rem', color: '#55576E', fontFamily: 'monospace' }}><span style={{ color: '#C8FF00' }}>{remaining}</span> requests left</div>}
      </div>

      <div style={{ textAlign: 'center', padding: '50px 20px 30px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 'clamp(3rem,10vw,6rem)', fontWeight: 900, lineHeight: .95, marginBottom: 12 }}>
          BEST BETS<br /><span style={{ color: '#C8FF00' }}>TODAY</span>
        </div>
        <div style={{ fontSize: '.9rem', color: '#55576E', maxWidth: 480, margin: '0 auto' }}>
          Live odds from DraftKings, FanDuel, BetMGM & Caesars. Pick analysis on every game.
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px 60px' }}>
        <div style={{ background: '#13141D', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {SPORTS.map(s => (
              <button key={s.value} onClick={() => setSport(s.value)}
                style={{ background: sport === s.value ? '#C8FF00' : 'rgba(255,255,255,.04)', color: sport === s.value ? '#07080D' : '#55576E', border: '1px solid ' + (sport === s.value ? '#C8FF00' : 'rgba(255,255,255,.08)'), borderRadius: 6, padding: '7px 14px', fontFamily: 'monospace', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}>
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={handleLoad} disabled={loading}
            style={{ width: '100%', background: loading ? '#1E1F2A' : '#C8FF00', color: loading ? '#55576E' : '#07080D', border: 'none', borderRadius: 8, padding: '13px', fontFamily: 'monospace', fontSize: '.85rem', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading && <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,.15)', borderTopColor: '#07080D', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
            {loading ? 'Loading…' : '⚡ Load Live Odds'}
          </button>
        </div>

        <div style={{ background: '#13141D', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '9px 15px', marginBottom: 16, fontFamily: 'monospace', fontSize: '.72rem', color: msgColor[msg.type], display: 'flex', alignItems: 'center', gap: 8 }}>
          {msg.type === 'loading' && <div style={{ width: 12, height: 12, border: '2px solid rgba(200,255,0,.2)', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />}
          {msg.text}
        </div>

        {games.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2.5rem', opacity: .2, marginBottom: 12 }}>🎯</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#2A2B3A', letterSpacing: '.08em', marginBottom: 8 }}>READY FOR REAL DATA</div>
            <div style={{ fontSize: '.8rem', color: '#2A2B3A', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>Select a sport and tap Load Live Odds to pull real-time lines.</div>
          </div>
        ) : (
          games.map(game => <GameCard key={game.id} game={game} />)
        )}

        <div style={{ fontSize: '.6rem', color: '#1E1F2A', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,.04)', paddingTop: 14, marginTop: 8 }}>
          ⚠️ For entertainment only. 21+. Problem gambling? Call 1-800-GAMBLER. Not betting advice.
        </div>
      </div>
    </div>
  )
}
