// ─── Pricing calculations — all numbers come from COG ─────────────────
// Each calc function reads getCOG() at call time so changes in the COG
// page take effect immediately on the next calculation.

import { getCOG } from '../../../data/cogDefaults'

export const SERVICE_TYPES = {
  'house-wash': { label: 'House Wash',            icon: '🏠', range: '$250–$700'    },
  'gutter':     { label: 'Gutter Cleaning',        icon: '🍂', range: '$110–$195'   },
  'roof-wash':  { label: 'Roof Soft Wash',         icon: '🏗️',  range: '$350–$1,025' },
  'driveway':   { label: 'Driveway Pressure Wash', icon: '🚗', range: '$100–$290'   },
  'window':     { label: 'Window Cleaning',        icon: '🪟', range: '$32–varies'  },
  'deck':       { label: 'Deck Wash',              icon: '🪵', range: '$100–$480'   },
  'bundle':     { label: 'Full Exterior Bundle',   icon: '⚡',  range: 'Save 10%'   },
}

export function calcHouseWash(d = {}) {
  const cog = getCOG()
  const BASE = {
    '<1500':     cog.house_base_under_1500,
    '1500-2500': cog.house_base_1500_2500,
    '2500-3500': cog.house_base_2500_3500,
    '3500+':     cog.house_base_3500_plus,
  }
  let p = BASE[d.sqftRange] ?? cog.house_minimum
  if (d.stories === '2')             p += cog.house_story_2_upcharge
  if (d.stories === '3+')            p += cog.house_story_3_upcharge
  if (d.sidingType === 'stucco')     p += cog.house_stucco_upcharge
  if (d.sidingType === 'cedar')      p += cog.house_cedar_upcharge
  if (d.condition === 'heavy')       p = Math.round(p * (1 + cog.house_heavy_buildup_pct / 100))
  return Math.max(p, cog.house_minimum)
}

export function calcGutter(d = {}) {
  const cog   = getCOG()
  const sides = parseInt(d.sides) || 2
  let p = cog.gutter_base_rate + sides * cog.gutter_rate_per_side
  if (d.stories === 'double')    p += cog.gutter_double_story_upcharge
  if (d.condition === 'heavy')   p += cog.gutter_heavy_clog_surcharge
  return Math.max(p, cog.gutter_minimum)
}

export function calcRoofWash(d = {}) {
  const cog = getCOG()
  const BASE = {
    '<1500':     cog.roof_base_under_1500,
    '1500-2500': cog.roof_base_1500_2500,
    '2500-3500': cog.roof_base_2500_3500,
    '3500+':     cog.roof_base_3500_plus,
  }
  let p = BASE[d.sqftRange] ?? cog.roof_minimum
  if (d.roofType === 'cedar' || d.roofType === 'tile') p += cog.roof_cedar_tile_upcharge
  if (d.roofAge === '15+yr')   p += cog.roof_age_15_plus_upcharge
  if (d.shade === 'heavy')     p += cog.roof_heavy_shade_upcharge
  const organics = Array.isArray(d.organics) ? d.organics : []
  p += organics.length * cog.roof_per_organic_upcharge
  return Math.max(p, cog.roof_minimum)
}

export function calcDriveway(d = {}) {
  const cog = getCOG()
  const BASE = {
    small:  cog.driveway_small_rate,
    medium: cog.driveway_medium_rate,
    large:  cog.driveway_large_rate,
  }
  let p = BASE[d.size] ?? cog.driveway_minimum
  if (d.surface === 'pavers') p += cog.driveway_pavers_upcharge
  if (d.oilStains)            p += cog.driveway_oil_stain_surcharge
  return Math.max(p, cog.driveway_minimum)
}

export function calcWindow(d = {}) {
  const cog = getCOG()
  const f1w = parseInt(d.floor1Windows) || 0
  const f2w = parseInt(d.floor2Windows) || 0
  const f1s = parseInt(d.floor1Screens) || 0
  const f2s = parseInt(d.floor2Screens) || 0
  let p = f1w * cog.window_floor1_rate
        + f2w * cog.window_floor2_rate
        + (f1s + f2s) * cog.window_screen_rate
  if (d.condition === 'heavy') p = Math.round(p * (1 + cog.window_heavy_buildup_pct / 100))
  return p > 0 ? Math.max(p, cog.window_minimum) : 0
}

export function calcDeck(d = {}) {
  const cog = getCOG()
  const BASE = {
    '<200':    cog.deck_small_rate,
    '200-400': cog.deck_medium_rate,
    '400-600': cog.deck_large_rate,
    '600+':    cog.deck_xl_rate,
  }
  let p = BASE[d.sqftRange] ?? cog.deck_minimum
  if (d.material === 'composite') p -= cog.deck_composite_discount
  if (d.condition === 'heavy')    p += cog.deck_heavy_condition_upcharge
  if (d.sealing)                  p += cog.deck_sealing_addon
  return Math.max(p, cog.deck_minimum)
}

export function calcBundle(houseData = {}, gutterData = {}, drivewayData = {}) {
  const cog = getCOG()
  const sub = calcHouseWash(houseData) + calcGutter(gutterData) + calcDriveway(drivewayData)
  return Math.round(sub * (1 - cog.bundle_discount_pct / 100))
}

/** Dispatch to the right calculator given a service type and formData. */
export function calculatePrice(type, formData) {
  switch (type) {
    case 'house-wash': return calcHouseWash(formData)
    case 'gutter':     return calcGutter(formData)
    case 'roof-wash':  return calcRoofWash(formData)
    case 'driveway':   return calcDriveway(formData)
    case 'window':     return calcWindow(formData)
    case 'deck':       return calcDeck(formData)
    case 'bundle':
      return calcBundle(formData.house || {}, formData.gutter || {}, formData.driveway || {})
    default: return 0
  }
}

/** Human-readable spec summary for an assessment card. */
export function describeService(type, formData) {
  switch (type) {
    case 'house-wash': {
      const { sqftRange = '', stories = '1', sidingType = '', condition = '' } = formData
      return [sqftRange && `${sqftRange} sqft`, stories && `${stories}-story`, sidingType, condition && `${condition} buildup`]
        .filter(Boolean).join(' · ')
    }
    case 'gutter': {
      const { sides, stories, condition } = formData
      return [`${sides || 2} sides`, stories === 'double' ? '2-story' : '1-story', condition && `${condition} clog`]
        .filter(Boolean).join(' · ')
    }
    case 'roof-wash': {
      const { sqftRange = '', roofType = '', organics = [] } = formData
      return [sqftRange && `${sqftRange} sqft`, roofType, organics.length && `${organics.join('/')} present`]
        .filter(Boolean).join(' · ')
    }
    case 'driveway': {
      const { size = '', surface = '', oilStains } = formData
      return [size, surface, oilStains && 'oil stains'].filter(Boolean).join(' · ')
    }
    case 'window': {
      const { floor1Windows = 0, floor2Windows = 0, condition = '' } = formData
      return [`${floor1Windows} 1F / ${floor2Windows} 2F windows`, condition && `${condition} buildup`]
        .filter(Boolean).join(' · ')
    }
    case 'deck': {
      const { sqftRange = '', material = '', condition = '', sealing } = formData
      return [sqftRange && `${sqftRange} sqft`, material, condition, sealing && '+sealing']
        .filter(Boolean).join(' · ')
    }
    case 'bundle': {
      const cog = getCOG()
      return `House wash + gutters + driveway · ${cog.bundle_discount_pct}% bundle discount`
    }
    default: return ''
  }
}

/** Default empty formData per type. */
export function defaultFormData(type) {
  switch (type) {
    case 'house-wash': return { sqftRange: '<1500', stories: '1', sidingType: 'vinyl', condition: 'light' }
    case 'gutter':     return { sides: 2, stories: 'single', linearFt: '', condition: 'clear' }
    case 'roof-wash':  return { roofType: 'asphalt', sqftRange: '<1500', roofAge: '<5yr', organics: [], shade: 'full-sun', manufacturer: '' }
    case 'driveway':   return { size: 'small', surface: 'concrete', oilStains: false }
    case 'window':     return { floor1Windows: 0, floor2Windows: 0, floor1Screens: 0, floor2Screens: 0, condition: 'light' }
    case 'deck':       return { sqftRange: '<200', material: 'wood', condition: 'light', sealing: false }
    case 'bundle':     return {
      house:    { sqftRange: '<1500', stories: '1', sidingType: 'vinyl', condition: 'light' },
      gutter:   { sides: 2, stories: 'single', condition: 'clear' },
      driveway: { size: 'small', surface: 'concrete', oilStains: false },
    }
    default: return {}
  }
}
