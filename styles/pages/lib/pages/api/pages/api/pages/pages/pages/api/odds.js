export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { sport = 'basketball_nba', markets = 'h2h,spreads,totals' } = req.query
  const apiKey = process.env.ODDS_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'ODDS_API_KEY not configured. Add it in Vercel Environment Variables.' })
  }

  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm,caesars,williamhill_us`

  try {
    const oddsRes = await fetch(url)
    const remaining = oddsRes.headers.get('x-requests-remaining')
    const used = oddsRes.headers.get('x-requests-used')

    if (!oddsRes.ok) {
      const err = await oddsRes.json().catch(() => ({}))
      return res.status(oddsRes.status).json({
        error: err.message || `Odds API returned ${oddsRes.status}`
      })
    }

    const data = await oddsRes.json()
    return res.status(200).json({ games: data, remaining, used })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
