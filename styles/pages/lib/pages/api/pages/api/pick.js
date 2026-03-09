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
  const notes = {​​​​​​​​​​​​​​​​
