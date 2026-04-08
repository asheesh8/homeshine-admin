// ─── Cost of Goods — shared defaults & helpers ───────────────────────
// Single source of truth. Both CostOfGoods.jsx and pricingEngine.js
// read from this. All keys are namespaced by service to avoid collisions
// in the flat localStorage JSON.

export const COG_DEFAULTS = {
  // ── Window Cleaning ──────────────────────────────────────────────
  window_floor1_rate:        8,
  window_floor2_rate:        12,
  window_screen_rate:        4,
  window_heavy_buildup_pct:  20,
  window_minimum:            80,

  // ── Gutter Cleaning ──────────────────────────────────────────────
  gutter_base_rate:              85,
  gutter_rate_per_side:          25,
  gutter_double_story_upcharge:  40,
  gutter_heavy_clog_surcharge:   30,
  gutter_minimum:                95,

  // ── Roof Soft Wash ───────────────────────────────────────────────
  roof_base_under_1500:       350,
  roof_base_1500_2500:        500,
  roof_base_2500_3500:        700,
  roof_base_3500_plus:        950,
  roof_cedar_tile_upcharge:   50,
  roof_age_15_plus_upcharge:  75,
  roof_heavy_shade_upcharge:  50,
  roof_per_organic_upcharge:  30,
  roof_minimum:               350,

  // ── House Wash ───────────────────────────────────────────────────
  house_base_under_1500:    250,
  house_base_1500_2500:     350,
  house_base_2500_3500:     500,
  house_base_3500_plus:     700,
  house_story_2_upcharge:   50,
  house_story_3_upcharge:   100,
  house_stucco_upcharge:    50,
  house_cedar_upcharge:     50,
  house_heavy_buildup_pct:  20,
  house_minimum:            250,

  // ── Driveway Wash ────────────────────────────────────────────────
  driveway_small_rate:          100,
  driveway_medium_rate:         175,
  driveway_large_rate:          250,
  driveway_pavers_upcharge:     30,
  driveway_oil_stain_surcharge: 40,
  driveway_minimum:             100,

  // ── Deck Wash ────────────────────────────────────────────────────
  deck_small_rate:                100,
  deck_medium_rate:               175,
  deck_large_rate:                250,
  deck_xl_rate:                   350,
  deck_composite_discount:        20,
  deck_heavy_condition_upcharge:  30,
  deck_sealing_addon:             100,
  deck_minimum:                   100,

  // ── Bundle ───────────────────────────────────────────────────────
  bundle_discount_pct:      10,
  bundle_minimum_services:  3,

  // ── Tax & Labor ──────────────────────────────────────────────────
  default_tax_rate:    6,
  tax_label:           'VT Sales Tax',
  hourly_labor_rate:   25,
  travel_surcharge:    15,
}

const STORAGE_KEY = 'homeshine_cog'

/** Read COG from localStorage, merging with defaults for any missing keys. */
export function getCOG() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...COG_DEFAULTS }
    return { ...COG_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...COG_DEFAULTS }
  }
}

/** Persist COG to localStorage. Returns the saved timestamp string. */
export function saveCOG(data) {
  const payload = { ...data, _savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload._savedAt
}

/** Read just the last-saved timestamp without loading the full object. */
export function getCOGSavedAt() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw)._savedAt || null : null
  } catch { return null }
}
