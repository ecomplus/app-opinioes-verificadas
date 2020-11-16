module.exports = (str) => {
  // default pt-br
  let base = 'www.opinioes-verificadas.com.br'
  ;[
    ["FR", "https://www.avis-verifies.com"],
    ["ES", "https://www.opiniones-verificadas.com"],
    ["DE", "https://www.echte-bewertungen.com"],
    ["IT", "https://www.recensioni-verificate.com"],
    ["NL", "https://www.echte-beoordelingen.com "],
    ["UK", "https://www.verified-reviews.co.uk"],
    ["US", "https://www.verified-reviews.com"],
    ["BR", "https://www.opinioes-verificadas.com.br"],
    ["PT", "https://www.opinioes-verificadas.com"],
    ["CO", "https://www.opiniones-verificadas.com.co"],
    ["PL", "https://www.prawdziwe-opinie.com"],
    ["MX", "https://www.opiniones-verificadas.com.mx"]
  ].forEach(([country, url]) => {
    if (country.toLowerCase() === str.toLowerCase()) {
      base = url
    }
  })

  return base
}
