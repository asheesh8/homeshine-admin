// Shared market data — used by MarketComparison page and PDF export

export const COMPETITORS = [
  { id: 'mansfield',  name: 'Mansfield Services VT',   url: 'https://mansfieldservicesvt.com', area: 'Vermont' },
  { id: 'sparkles',   name: 'Sparkles VT',             url: 'https://sparklesvt.com',          area: 'S. Burlington' },
  { id: 'grime',      name: 'Grime Busters VT',        url: 'https://grimebustersvt.com',      area: 'Vermont' },
  { id: 'vthomewash', name: 'VT Home Wash',            url: 'https://vthomewash.com',          area: 'Vermont' },
  { id: 'asap',       name: 'ASAP Pressure Washing',   url: null,                              area: 'Williston, VT' },
  { id: 'champlain',  name: 'Champlain Powerwashing',  url: null,                              area: 'Burlington' },
  { id: 'fhpw',       name: 'FH Pressure Washing',     url: null,                              area: 'Burlington' },
  { id: 'vtpw',       name: 'Vermont Pressure Washing', url: 'https://vtpressurewashing.com',  area: 'Vermont' },
]

export const SERVICES = [
  {
    id: 'house-wash',
    name: 'House Wash',
    description: 'Exterior soft wash',
    marketLow: 250, marketHigh: 600, vtAvg: 400,
    nationalNote: '$0.15–$0.30 / sqft',
    defaultRate: 325,
    keywords: ['house', 'exterior', 'siding', 'soft wash', 'pressure wash'],
    competitorIds: ['mansfield', 'sparkles', 'vthomewash', 'champlain', 'fhpw', 'vtpw'],
  },
  {
    id: 'roof-wash',
    name: 'Roof Soft Wash',
    description: 'Low-pressure roof treatment',
    marketLow: 350, marketHigh: 750, vtAvg: 550,
    nationalNote: null,
    defaultRate: 495,
    keywords: ['roof'],
    competitorIds: ['mansfield', 'vthomewash', 'asap', 'champlain', 'vtpw'],
  },
  {
    id: 'driveway',
    name: 'Driveway Pressure Wash',
    description: 'Concrete & asphalt surfaces',
    marketLow: 100, marketHigh: 250, vtAvg: 175,
    nationalNote: null,
    defaultRate: 149,
    keywords: ['driveway', 'concrete', 'asphalt', 'walkway', 'pavement'],
    competitorIds: ['mansfield', 'sparkles', 'grime', 'asap', 'champlain', 'fhpw'],
  },
  {
    id: 'gutters',
    name: 'Gutter Cleaning',
    description: 'Interior flush & inspection',
    marketLow: 95, marketHigh: 185, vtAvg: 140,
    nationalNote: null,
    defaultRate: 119,
    keywords: ['gutter'],
    competitorIds: ['mansfield', 'sparkles', 'vthomewash', 'fhpw', 'vtpw'],
  },
  {
    id: 'deck',
    name: 'Deck Wash',
    description: 'Wood & composite decking',
    marketLow: 150, marketHigh: 300, vtAvg: 225,
    nationalNote: null,
    defaultRate: 199,
    keywords: ['deck', 'patio'],
    competitorIds: ['grime', 'asap', 'champlain', 'fhpw', 'vtpw'],
  },
  {
    id: 'windows',
    name: 'Window Cleaning',
    description: 'Interior & exterior glass',
    marketLow: 150, marketHigh: 350, vtAvg: 220,
    nationalNote: null,
    defaultRate: 195,
    keywords: ['window'],
    competitorIds: ['sparkles', 'grime', 'vthomewash', 'fhpw'],
  },
  {
    id: 'bundle',
    name: 'Full Exterior Bundle',
    description: 'House + gutters + driveway',
    marketLow: 450, marketHigh: 900, vtAvg: 650,
    nationalNote: 'Best-value upsell',
    defaultRate: 575,
    keywords: ['bundle', 'full exterior', 'package'],
    competitorIds: ['mansfield', 'vthomewash', 'champlain', 'vtpw'],
  },
]

/** Match a free-text line item description to a market service id. */
export function matchDescriptionToService(description) {
  if (!description) return null
  const d = description.toLowerCase()
  // Order matters — more specific checks first
  if (d.includes('roof'))                                      return 'roof-wash'
  if (d.includes('gutter'))                                    return 'gutters'
  if (d.includes('deck') || d.includes('patio'))               return 'deck'
  if (d.includes('window'))                                    return 'windows'
  if (d.includes('bundle') || d.includes('full exterior'))     return 'bundle'
  if (d.includes('driveway') || d.includes('concrete')
    || d.includes('asphalt') || d.includes('walkway'))         return 'driveway'
  if (d.includes('house') || d.includes('siding')
    || d.includes('exterior') || d.includes('wash')
    || d.includes('pressure'))                                 return 'house-wash'
  return null
}

/** Competitive / At Market / Premium classification. */
export function getPositioning(rate, vtAvg) {
  const r = rate / vtAvg
  if (r <= 0.93) return { label: 'Competitive', hex: '#0d7a5f' }
  if (r <= 1.08) return { label: 'At Market',   hex: '#b45309' }
  return               { label: 'Premium',       hex: '#1d4ed8' }
}
