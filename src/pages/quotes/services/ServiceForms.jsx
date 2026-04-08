// All service assessment forms in one file, each as a named export.
// Each receives: formData (object) + onChange((patch) => void)

const ipt = {
  background: 'var(--bg-base)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', borderRadius: 6, padding: '7px 11px',
  fontSize: 13, width: '100%', outline: 'none',
}
const sel = { ...ipt, cursor: 'pointer' }
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }

function FG({ label: l, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={lbl}>{l}</label>
      {children}
    </div>
  )
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  )
}

function Sel({ value, onChange, children }) {
  return (
    <select style={sel} value={value} onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.style.borderColor = 'var(--teal-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    >
      {children}
    </select>
  )
}

function NumInput({ value, onChange, min = 0 }) {
  return (
    <input style={{ ...ipt, textAlign: 'right' }} type="number" min={min} value={value}
      onChange={e => onChange(Number(e.target.value))}
      onFocus={e => e.target.style.borderColor = 'var(--teal-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

function CheckGroup({ options, selected = [], onChange }) {
  const toggle = (val) => {
    const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
    onChange(next)
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
      {options.map(o => {
        const active = selected.includes(o.value)
        return (
          <button key={o.value} type="button" onClick={() => toggle(o.value)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: active ? 'rgba(20,184,166,0.15)' : 'var(--bg-raised)',
            border: `1px solid ${active ? 'var(--teal-500)' : 'var(--border)'}`,
            color: active ? 'var(--teal-400)' : 'var(--text-secondary)',
          }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
      {options.map(o => {
        const active = value === o.value
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: active ? 'rgba(20,184,166,0.15)' : 'var(--bg-raised)',
            border: `1px solid ${active ? 'var(--teal-500)' : 'var(--border)'}`,
            color: active ? 'var(--teal-400)' : 'var(--text-secondary)',
          }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────
function SectionHead({ title, sub }) {
  return (
    <div style={{
      background: 'var(--navy-800)', borderRadius: 8,
      padding: '10px 14px', marginBottom: 14,
      borderLeft: '3px solid var(--teal-500)',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── House Wash ───────────────────────────────────────────────────────
export function HouseWashForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="House Wash — Exterior Soft Wash" sub="Base $250 · stories/size/condition add-ons" />
      <Grid>
        <FG label="Square Footage">
          <Sel value={d.sqftRange} onChange={v => set('sqftRange', v)}>
            <option value="<1500">Under 1,500 sqft</option>
            <option value="1500-2500">1,500 – 2,500 sqft</option>
            <option value="2500-3500">2,500 – 3,500 sqft</option>
            <option value="3500+">3,500+ sqft</option>
          </Sel>
        </FG>
        <FG label="Stories">
          <RadioGroup
            options={[{value:'1',label:'1 Story'},{value:'2',label:'2 Story'},{value:'3+',label:'3+ Stories'}]}
            value={d.stories} onChange={v => set('stories', v)}
          />
        </FG>
        <FG label="Siding Type">
          <Sel value={d.sidingType} onChange={v => set('sidingType', v)}>
            <option value="vinyl">Vinyl</option>
            <option value="wood">Wood</option>
            <option value="brick">Brick</option>
            <option value="stucco">Stucco (+$50)</option>
            <option value="cedar">Cedar (+$50)</option>
          </Sel>
        </FG>
        <FG label="Buildup / Condition">
          <RadioGroup
            options={[{value:'light',label:'Light'},{value:'moderate',label:'Moderate'},{value:'heavy',label:'Heavy (+20%)'}]}
            value={d.condition} onChange={v => set('condition', v)}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Gutter Cleaning ──────────────────────────────────────────────────
export function GutterForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="Gutter Cleaning — Interior Flush" sub="Base $85 + $25/side · stories & condition add-ons" />
      <Grid>
        <FG label="Number of Sides (1–4)">
          <RadioGroup
            options={[{value:1,label:'1'},{value:2,label:'2'},{value:3,label:'3'},{value:4,label:'4'}].map(o => ({...o, value: String(o.value)}))}
            value={String(d.sides)} onChange={v => set('sides', parseInt(v))}
          />
        </FG>
        <FG label="Stories">
          <RadioGroup
            options={[{value:'single',label:'Single Story'},{value:'double',label:'Double Story (+$40)'}]}
            value={d.stories} onChange={v => set('stories', v)}
          />
        </FG>
        <FG label="Linear Feet (optional override)">
          <input style={ipt} type="number" min={0} placeholder="Leave blank to use side count"
            value={d.linearFt} onChange={e => set('linearFt', e.target.value)}
            onFocus={e => e.target.style.borderColor='var(--teal-500)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </FG>
        <FG label="Clog Condition">
          <RadioGroup
            options={[{value:'clear',label:'Clear/Light'},{value:'moderate',label:'Moderate'},{value:'heavy',label:'Heavily Clogged (+$30)'}]}
            value={d.condition} onChange={v => set('condition', v)}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Roof Soft Wash ───────────────────────────────────────────────────
export function RoofWashForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="Roof Soft Wash" sub="Base by size · material, age, organics, shade add-ons" />
      <Grid>
        <FG label="Roof Size">
          <Sel value={d.sqftRange} onChange={v => set('sqftRange', v)}>
            <option value="<1500">Under 1,500 sqft — $350</option>
            <option value="1500-2500">1,500–2,500 sqft — $500</option>
            <option value="2500-3500">2,500–3,500 sqft — $700</option>
            <option value="3500+">3,500+ sqft — $950</option>
          </Sel>
        </FG>
        <FG label="Roof Material">
          <Sel value={d.roofType} onChange={v => set('roofType', v)}>
            <option value="asphalt">Asphalt Shingle</option>
            <option value="cedar">Cedar Shake (+$50)</option>
            <option value="metal">Metal</option>
            <option value="tile">Tile (+$50)</option>
          </Sel>
        </FG>
        <FG label="Roof Age">
          <RadioGroup
            options={[{value:'<5yr',label:'< 5 yr'},{value:'5-10yr',label:'5–10 yr'},{value:'10-15yr',label:'10–15 yr'},{value:'15+yr',label:'15+ yr (+$75)'}]}
            value={d.roofAge} onChange={v => set('roofAge', v)}
          />
        </FG>
        <FG label="Shade Level">
          <RadioGroup
            options={[{value:'full-sun',label:'Full Sun'},{value:'partial',label:'Partial Shade'},{value:'heavy',label:'Heavy Shade (+$50)'}]}
            value={d.shade} onChange={v => set('shade', v)}
          />
        </FG>
        <FG label="Organics Present (+$30 each)" span={2}>
          <CheckGroup
            options={[{value:'mold',label:'Mold'},{value:'algae',label:'Algae'},{value:'lichen',label:'Lichen'},{value:'moss',label:'Moss'}]}
            selected={d.organics} onChange={v => set('organics', v)}
          />
        </FG>
        <FG label="Manufacturer (optional)" span={2}>
          <input style={ipt} type="text" placeholder="e.g. GAF, Owens Corning…"
            value={d.manufacturer} onChange={e => set('manufacturer', e.target.value)}
            onFocus={e => e.target.style.borderColor='var(--teal-500)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Driveway ─────────────────────────────────────────────────────────
export function DrivewayForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="Driveway Pressure Wash" sub="$100 small · $175 medium · $250 large + surface & stain add-ons" />
      <Grid>
        <FG label="Driveway Size">
          <RadioGroup
            options={[{value:'small',label:'Small (< 500 sqft)'},{value:'medium',label:'Medium (500–1000)'},{value:'large',label:'Large (1000+)'}]}
            value={d.size} onChange={v => set('size', v)}
          />
        </FG>
        <FG label="Surface Material">
          <Sel value={d.surface} onChange={v => set('surface', v)}>
            <option value="concrete">Concrete</option>
            <option value="pavers">Pavers (+$30)</option>
            <option value="asphalt">Asphalt</option>
            <option value="stone">Stone</option>
          </Sel>
        </FG>
        <FG label="Oil / Grease Stains?" span={2}>
          <RadioGroup
            options={[{value:false,label:'No'},{value:true,label:'Yes (+$40)'}]}
            value={d.oilStains} onChange={v => set('oilStains', v === true || v === 'true')}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Window Cleaning ──────────────────────────────────────────────────
export function WindowForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="Window Cleaning" sub="1F window $8 · 2F window $12 · screen $4 · heavy buildup +20%" />
      <Grid cols={2}>
        <FG label="1st Floor Windows">
          <NumInput value={d.floor1Windows} onChange={v => set('floor1Windows', v)} />
        </FG>
        <FG label="2nd Floor Windows">
          <NumInput value={d.floor2Windows} onChange={v => set('floor2Windows', v)} />
        </FG>
        <FG label="1st Floor Screens">
          <NumInput value={d.floor1Screens} onChange={v => set('floor1Screens', v)} />
        </FG>
        <FG label="2nd Floor Screens">
          <NumInput value={d.floor2Screens} onChange={v => set('floor2Screens', v)} />
        </FG>
        <FG label="Glass Buildup" span={2}>
          <RadioGroup
            options={[{value:'light',label:'Light'},{value:'moderate',label:'Moderate'},{value:'heavy',label:'Heavy Buildup (+20%)'}]}
            value={d.condition} onChange={v => set('condition', v)}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Deck Wash ────────────────────────────────────────────────────────
export function DeckForm({ formData: d, onChange }) {
  const set = (k, v) => onChange({ ...d, [k]: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionHead title="Deck Wash" sub="$100–$350 by size · material & condition add-ons · sealing +$100" />
      <Grid>
        <FG label="Deck Size">
          <RadioGroup
            options={[{value:'<200',label:'< 200 sqft'},{value:'200-400',label:'200–400'},{value:'400-600',label:'400–600'},{value:'600+',label:'600+ sqft'}]}
            value={d.sqftRange} onChange={v => set('sqftRange', v)}
          />
        </FG>
        <FG label="Decking Material">
          <Sel value={d.material} onChange={v => set('material', v)}>
            <option value="wood">Wood</option>
            <option value="composite">Composite (−$20)</option>
            <option value="concrete">Concrete</option>
          </Sel>
        </FG>
        <FG label="Condition">
          <RadioGroup
            options={[{value:'light',label:'Light'},{value:'moderate',label:'Moderate'},{value:'heavy',label:'Heavy (+$30)'}]}
            value={d.condition} onChange={v => set('condition', v)}
          />
        </FG>
        <FG label="Sealing Needed?">
          <RadioGroup
            options={[{value:false,label:'No'},{value:true,label:'Yes (+$100)'}]}
            value={d.sealing} onChange={v => set('sealing', v === true || v === 'true')}
          />
        </FG>
      </Grid>
    </div>
  )
}

// ─── Bundle (composed) ────────────────────────────────────────────────
export function BundleForm({ formData: d, onChange }) {
  const setHouse    = (v) => onChange({ ...d, house:    v })
  const setGutter   = (v) => onChange({ ...d, gutter:   v })
  const setDriveway = (v) => onChange({ ...d, driveway: v })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)',
        borderRadius: 8, padding: '10px 14px',
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--teal-400)' }}>
          ⚡ Full Exterior Bundle — 10% discount applied to combined total
        </span>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
          Fill in all three services below. The 10% bundle savings will be reflected in the final price.
        </p>
      </div>
      <HouseWashForm formData={d.house || {}} onChange={setHouse} />
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
      <GutterForm formData={d.gutter || {}} onChange={setGutter} />
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
      <DrivewayForm formData={d.driveway || {}} onChange={setDriveway} />
    </div>
  )
}
