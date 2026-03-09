function fmtOdds(price) {
  if (price == null) return '-'
  const n = Math.round(price)
  return n > 0 ? '+' + n : '' + n
}

function shortName(full) {
  if (!full) return ''
  return full.trim().split(' ').pop()
}

function getFavDog(bookmakers, homeTeam, awayTeam) {
  const bk = bookmakers[0]
  const h2h = bk && bk.markets && bk.markets.find(function(m) { return m.key === 'h2h' })
  if (!h2h) return { fav: homeTeam, dog: awayTeam, favPrice: -110, dogPrice: 110 }
  const home = h2h.outcomes.find(function(o) { return o.name === homeTeam })
  const away = h2h.outcomes.find(function(o) { return o.name === awayTeam })
  if (!home || !away) return { fav: homeTeam, dog: awayTeam, favPrice: -110, dogPrice: 110 }
  if (home.price < away.price) {
    return { fav: homeTeam, dog: awayTeam, favPrice: home.price, dogPrice: away.price }
  }
  return { fav: awayTeam, dog: homeTeam, favPrice: away.price, dogPrice: home.price }
}

function getSpread(bookmakers, team) {
  const bk = bookmakers[0]
  const spreads = bk && bk.markets && bk.markets.find(function(m) { return m.key === 'spreads' })
  if (!spreads) return null
  return spreads.outcomes.find(function(o) { return o.name === team })
}

function getTotal(bookmakers) {
  const bk = bookmakers[0]
  const totals = bk && bk.markets && bk.markets.find(function(m) { return m.key === 'totals' })
  if (!totals) return null
  const over = totals.outcomes.find(function(o) { return o.name === 'Over' })
  return over ? over.point : null
}

function generatePick(game) {
  const books = game.bookmakers || []
  const home = game.home_team
  const away = game.away_team
  const sport = (game.sport_key || '').toLowerCase()
  const fd = getFavDog(books, home, away)
  const fav = fd.fav, dog = fd.dog
  const favPrice = fd.favPrice, dogPrice = fd.dogPrice
  const shortFav = shortName(fav), shortDog = shortName(dog)
  const favSpread = getSpread(books, fav)
  const total = getTotal(books)
  const seed = (home + away).length
  const pickDog = !( Math.abs(favPrice) > 200) && (seed % 3 === 0)
  const pickTotal = total && (seed % 3 === 1)
  const notes = {
    basketball_nba: ['Pace and three-point rate will be key.', 'Rest advantage could be decisive.', 'Home court worth ~3 points this season.'],
    americanfootball_nfl: ['Weather could suppress scoring.', 'Turnover differential has been the biggest predictor.', 'Sharp money has moved this line.'],
    baseball_mlb: ['Starting pitching favors the favourite.', 'Bullpen depth is a key angle.', 'Park factor elevates the total slightly.'],
    icehockey_nhl: ['Goaltender matchup is the defining edge.', 'Special teams efficiency has been predictive.', 'Similar spots have gone under 54% this season.'],
  }
  const sportNotes = notes[sport] || ['Recent form and splits point the same direction.']
  const sportNote = sportNotes[seed % sportNotes.length]
  const sharpNote = 'Public money balanced with slight lean toward ' + shortFav + '.'
  var pick, confidence, analysis
  if (pickDog) {
    pick = dog + ' ML'
    confidence = 58 + (seed % 10)
    analysis = shortDog + ' at ' + fmtOdds(dogPrice) + ' is genuine value here. ' + sportNote + ' ' + sharpNote
  } else if (pickTotal && total) {
    const goOver = seed % 2 === 0
    pick = (goOver ? 'Over ' : 'Under ') + total
    confidence = 62 + (seed % 12)
    analysis = (goOver ? 'Both offences running hot, total looks low.' : 'Defensive efficiency makes the under the sharper play.') + ' ' + sportNote + ' ' + sharpNote
  } else if (favSpread) {
    const sp = favSpread.point > 0 ? '+' + favSpread.point : '' + favSpread.point
    pick = fav + ' ' + sp
    confidence = 64 + (seed % 14)
    analysis = shortFav + ' at ' + fmtOdds(favSpread.price) + ' looks correctly priced. ' + sportNote + ' ' + sharpNote
  } else {
    pick = fav + ' ML'
    confidence = 61 + (seed % 12)
    analysis = shortFav + ' at ' + fmtOdds(favPrice) + ' is the play. ' + sportNote + ' ' + sharpNote
  }
  return { analysis: analysis, pick: pick, confidence: confidence }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { game } = req.body
  if (!game) return res.status(400).json({ error: 'No game data' })
  const pick = generatePick(game)
  return res.status(200).json(Object.assign({}, pick, { ai: false }))
}
