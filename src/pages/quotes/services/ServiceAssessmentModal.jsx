import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import ServicePicker from './ServicePicker'
import {
  HouseWashForm, GutterForm, RoofWashForm, DrivewayForm,
  WindowForm, DeckForm, BundleForm,
} from './ServiceForms'
import { SERVICE_TYPES, calculatePrice, defaultFormData } from './pricingEngine'
import { formatCurrency } from '../../../utils/calculations'
import { generateId } from '../../../utils/calculations'

function getForm(type) {
  switch (type) {
    case 'house-wash': return HouseWashForm
    case 'gutter':     return GutterForm
    case 'roof-wash':  return RoofWashForm
    case 'driveway':   return DrivewayForm
    case 'window':     return WindowForm
    case 'deck':       return DeckForm
    case 'bundle':     return BundleForm
    default:           return null
  }
}

export default function ServiceAssessmentModal({ existing, onSave, onClose }) {
  // Step 1 = pick type, Step 2 = fill form
  const [step, setStep]         = useState(existing ? 2 : 1)
  const [type, setType]         = useState(existing?.type || null)
  const [formData, setFormData] = useState(existing?.formData || (existing ? defaultFormData(existing.type) : {}))

  const selectType = (t) => {
    setType(t)
    if (!existing) setFormData(defaultFormData(t))
    setStep(2)
  }

  const price = type ? calculatePrice(type, formData) : 0
  const FormComp = type ? getForm(type) : null
  const def = type ? SERVICE_TYPES[type] : null

  const handleSave = () => {
    if (!type) return
    onSave({
      id:       existing?.id || generateId(),
      type,
      formData,
      price,
    })
    onClose()
  }

  const footer = step === 2 ? (
    <>
      {!existing && (
        <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginRight: 'auto' }}>
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={price === 0}
      >
        {existing ? 'Update Service' : 'Add to Quote'} — {formatCurrency(price)}
      </button>
    </>
  ) : (
    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
  )

  return (
    <Modal
      title={
        step === 1
          ? 'Add Service'
          : def
            ? `${def.icon}  ${def.label}`
            : 'Configure Service'
      }
      onClose={onClose}
      size="lg"
      footer={footer}
    >
      {step === 1 && <ServicePicker onSelect={selectType} />}

      {step === 2 && FormComp && (
        <div>
          <FormComp formData={formData} onChange={setFormData} />

          {/* Live price preview */}
          <div style={{
            marginTop: 20,
            background: 'var(--navy-800)',
            border: '1px solid var(--navy-700)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Calculated Price
              </div>
              {type === 'bundle' && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Includes 10% bundle discount
                </div>
              )}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal-400)', letterSpacing: '-0.5px' }}>
              {formatCurrency(price)}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
