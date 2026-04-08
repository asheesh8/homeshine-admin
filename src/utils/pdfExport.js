import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SERVICES, COMPETITORS, matchDescriptionToService, getPositioning } from '../data/marketData'
import { lineItemSubtotal, quoteSubtotal, quoteTax, quoteTotal, formatCurrency, formatDate } from './calculations'

// Map assessment service type keys → market data service ids
const ASSESSMENT_TO_MARKET = {
  'house-wash': 'house-wash',
  'gutter':     'gutters',
  'roof-wash':  'roof-wash',
  'driveway':   'driveway',
  'window':     'windows',
  'deck':       'deck',
  'bundle':     'bundle',
}

// ─── Brand colors (RGB) ───────────────────────────────────────────────
const NAVY       = [15,  31,  61]   // #0f1f3d
const NAVY_MID   = [30,  57,  99]   // slightly lighter navy for alternates
const TEAL       = [13, 122,  95]   // #0d7a5f  (user-specified)
const TEAL_LIGHT = [45, 185, 160]   // lighter teal for text on dark bg
const WHITE      = [255, 255, 255]
const SLATE      = [51,  65,  85]   // body text
const GRAY       = [100, 116, 139]  // muted text
const LIGHT_BG   = [248, 250, 252]  // alternating table rows
const BORDER_RGB = [226, 232, 240]  // dividers

const PAGE_W  = 210
const PAGE_H  = 297
const MARGIN  = 18
const COL_W   = PAGE_W - MARGIN * 2  // 174mm

// ─── Helpers ─────────────────────────────────────────────────────────
const rgb  = (arr) => ({ r: arr[0], g: arr[1], b: arr[2] })
const hex3 = (arr) => `#${arr.map(v => v.toString(16).padStart(2,'0')).join('')}`

function setFill(doc, arr)  { doc.setFillColor(arr[0], arr[1], arr[2]) }
function setDraw(doc, arr)  { doc.setDrawColor(arr[0], arr[1], arr[2]) }
function setText(doc, arr)  { doc.setTextColor(arr[0], arr[1], arr[2]) }

function hrule(doc, y, color = BORDER_RGB, lw = 0.25) {
  setDraw(doc, color)
  doc.setLineWidth(lw)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
}

function label(doc, txt, x, y, size = 7.5, color = GRAY, style = 'bold') {
  doc.setFontSize(size)
  doc.setFont('helvetica', style)
  setText(doc, color)
  doc.text(txt, x, y)
}

function body(doc, txt, x, y, size = 9.5, color = SLATE, maxW = null) {
  doc.setFontSize(size)
  doc.setFont('helvetica', 'normal')
  setText(doc, color)
  if (maxW) {
    const lines = doc.splitTextToSize(txt, maxW)
    doc.text(lines, x, y)
    return lines.length
  }
  doc.text(txt, x, y)
  return 1
}

// ─── Page 1: Quote Receipt ────────────────────────────────────────────
function drawPage1(doc, quote, customer) {
  // ── Header band ──
  setFill(doc, NAVY)
  doc.rect(0, 0, PAGE_W, 46, 'F')

  // HomeSHINE wordmark
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  setText(doc, WHITE)
  doc.text('Home', MARGIN, 20)

  // SHINE in teal
  const homeW = doc.getTextWidth('Home')
  setText(doc, TEAL_LIGHT)
  doc.text('SHINE', MARGIN + homeW, 20)

  // Tagline
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  setText(doc, [140, 175, 195])
  doc.text('Professional Vermont Exterior Cleaning', MARGIN, 28)

  // Right side: QUOTE label
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  setText(doc, WHITE)
  doc.text('QUOTE', PAGE_W - MARGIN, 20, { align: 'right' })

  // Quote meta
  const quoteNum = `#${quote.id.toUpperCase().slice(-6)}`
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  setText(doc, [140, 175, 195])
  doc.text(quoteNum,                           PAGE_W - MARGIN, 28, { align: 'right' })
  doc.text(`Date: ${formatDate(quote.createdAt)}`, PAGE_W - MARGIN, 34, { align: 'right' })
  doc.text(`Status: ${quote.status.toUpperCase()}`, PAGE_W - MARGIN, 40, { align: 'right' })

  // ── Bill To ──
  let y = 56
  label(doc, 'BILL TO', MARGIN, y)
  y += 5

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  setText(doc, SLATE)
  doc.text(customer?.name || 'Valued Customer', MARGIN, y)
  y += 5

  const addrParts = [
    customer?.address,
    [customer?.city, customer?.state, customer?.zip].filter(Boolean).join(', '),
    customer?.phone,
    customer?.email,
  ].filter(Boolean)

  addrParts.forEach(line => {
    body(doc, line, MARGIN, y, 9, GRAY)
    y += 5
  })

  // ── Quote info box (right) ──
  const boxX = PAGE_W - MARGIN - 72
  const boxY = 54
  setFill(doc, LIGHT_BG)
  setDraw(doc, BORDER_RGB)
  doc.setLineWidth(0.25)
  doc.roundedRect(boxX, boxY, 72, 28, 2, 2, 'FD')

  label(doc, 'QUOTE REFERENCE', boxX + 5, boxY + 6, 7, GRAY, 'bold')
  body(doc, quoteNum, boxX + 5, boxY + 12, 11, SLATE)
  label(doc, 'ISSUED', boxX + 5, boxY + 19, 7, GRAY, 'bold')
  body(doc, formatDate(quote.createdAt), boxX + 5, boxY + 25, 9, SLATE)

  y = Math.max(y, boxY + 36) + 4
  hrule(doc, y)
  y += 8

  // ── Line items table ──
  const subtotal = quoteSubtotal(quote.lineItems)
  const tax      = quoteTax(subtotal, quote.taxRate)
  const total    = quoteTotal(subtotal, tax)

  const tableRows = quote.lineItems.map(item => [
    item.description || '—',
    item.type.charAt(0).toUpperCase() + item.type.slice(1),
    String(item.quantity),
    formatCurrency(item.rate),
    formatCurrency(lineItemSubtotal(item)),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Type', 'Qty', 'Rate', 'Subtotal']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: SLATE,
      cellPadding: { top: 4.5, right: 5, bottom: 4.5, left: 5 },
    },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 26 },
      2: { cellWidth: 16, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: BORDER_RGB,
    tableLineWidth: 0.1,
  })

  y = doc.lastAutoTable.finalY + 8

  // ── Totals ──
  const totX   = PAGE_W - MARGIN - 82
  const totW   = 82
  const totEnd = PAGE_W - MARGIN

  // Subtotal
  label(doc, 'Subtotal', totX, y, 9, GRAY, 'normal')
  body(doc, formatCurrency(subtotal), totEnd, y, 9, SLATE)
  doc.text(formatCurrency(subtotal), totEnd, y, { align: 'right' })
  y += 7

  // Tax
  label(doc, `Tax (${quote.taxRate}%)`, totX, y, 9, GRAY, 'normal')
  doc.text(formatCurrency(tax), totEnd, y, { align: 'right' })
  y += 6

  // Divider
  setDraw(doc, TEAL)
  doc.setLineWidth(0.5)
  doc.line(totX, y, totEnd, y)
  y += 4

  // Total pill
  setFill(doc, NAVY)
  doc.roundedRect(totX - 2, y, totW + 2, 14, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setText(doc, WHITE)
  doc.text('TOTAL DUE', totX + 3, y + 9)

  doc.setFontSize(12)
  setText(doc, TEAL_LIGHT)
  doc.text(formatCurrency(total), totEnd - 2, y + 9, { align: 'right' })
  y += 22

  // ── Notes ──
  if (quote.notes?.trim()) {
    label(doc, 'NOTES', MARGIN, y)
    y += 5
    const noteLines = doc.splitTextToSize(quote.notes, COL_W - 10)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'italic')
    setText(doc, SLATE)
    doc.text(noteLines, MARGIN, y)
    y += noteLines.length * 5.5 + 4
  }

  // ── Footer band ──
  const footY = PAGE_H - 22
  setFill(doc, NAVY)
  doc.rect(0, footY, PAGE_W, 22, 'F')

  // Teal accent bar
  setFill(doc, TEAL)
  doc.rect(0, footY, PAGE_W, 1.5, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  setText(doc, WHITE)
  doc.text('Thank you for choosing HomeSHINE!', PAGE_W / 2, footY + 9, { align: 'center' })

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  setText(doc, TEAL_LIGHT)
  doc.text(
    'homeshine.com  ·  (802) 555-0100  ·  Vermont, USA',
    PAGE_W / 2, footY + 16, { align: 'center' }
  )
}

// ─── Page 2: Market Comparison ────────────────────────────────────────
function drawPage2(doc, quote, customer) {
  doc.addPage()

  // ── Header band ──
  setFill(doc, NAVY)
  doc.rect(0, 0, PAGE_W, 44, 'F')

  setFill(doc, TEAL)
  doc.rect(0, 44, PAGE_W, 2, 'F')

  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  setText(doc, WHITE)
  doc.text('Why HomeSHINE?', MARGIN, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  setText(doc, TEAL_LIGHT)
  doc.text("Here's how we compare to the Vermont market.", MARGIN, 28)

  doc.setFontSize(8)
  setText(doc, [140, 175, 195])
  doc.text(`Prepared for: ${customer?.name || 'Customer'}  ·  Quote ${quote.id.toUpperCase().slice(-6)}  ·  ${formatDate(quote.createdAt)}`, MARGIN, 37)

  let y = 56

  // ── Match to market services ──
  // If quote has assessmentData (new format), use direct type mapping — much more accurate.
  // Otherwise fall back to keyword matching on line item descriptions.
  const matchedIds = new Set()
  if (quote.assessmentData?.length) {
    quote.assessmentData.forEach(item => {
      const marketId = ASSESSMENT_TO_MARKET[item.type]
      if (marketId) {
        // Bundle expands to its component services
        if (item.type === 'bundle') {
          matchedIds.add('house-wash'); matchedIds.add('gutters'); matchedIds.add('driveway')
        } else {
          matchedIds.add(marketId)
        }
      }
    })
  } else {
    quote.lineItems.forEach(item => {
      const id = matchDescriptionToService(item.description)
      if (id) matchedIds.add(id)
    })
  }
  const servicesToShow = matchedIds.size > 0
    ? SERVICES.filter(s => matchedIds.has(s.id))
    : SERVICES

  // ── Get HomeSHINE rates from localStorage ──
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem('homeshine_market')) || {} } catch {}

  // ── Comparison table ──
  const compRows = servicesToShow.map(svc => {
    const rate    = saved[svc.id]?.rate ?? svc.defaultRate
    const pos     = getPositioning(rate, svc.vtAvg)
    const savings = svc.vtAvg - rate
    const pct     = Math.round(Math.abs(savings / svc.vtAvg) * 100)
    const vsAvg   = savings > 0
      ? `${pct}% below avg`
      : savings < 0
        ? `${pct}% above avg`
        : 'At avg'
    return [
      svc.name,
      `$${svc.marketLow} – $${svc.marketHigh}`,
      `$${svc.vtAvg}`,
      formatCurrency(rate),
      pos.label,
      vsAvg,
    ]
  })

  // Custom cell colors for Positioning column
  const positioningColors = servicesToShow.map(svc => {
    const rate = saved[svc.id]?.rate ?? svc.defaultRate
    return getPositioning(rate, svc.vtAvg)
  })

  autoTable(doc, {
    startY: y,
    head: [['Service', 'VT Market Range', 'VT Average', 'HomeSHINE Rate', 'Positioning', 'vs. Market']],
    body: compRows,
    theme: 'plain',
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 5 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: SLATE,
      cellPadding: { top: 4.5, right: 4, bottom: 4.5, left: 5 },
    },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold' },
      1: { cellWidth: 34, halign: 'center' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: TEAL },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: BORDER_RGB,
    tableLineWidth: 0.1,
    // Color the positioning cell per row
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const pos = positioningColors[data.row.index]
        if (!pos) return
        // Parse hex to rgb for fill
        const h = pos.hex.replace('#', '')
        const r = parseInt(h.slice(0, 2), 16)
        const g = parseInt(h.slice(2, 4), 16)
        const b = parseInt(h.slice(4, 6), 16)
        // Draw colored pill background
        doc.setFillColor(r, g, b, 0.12)
        // jsPDF doesn't support alpha easily, so use a light tint calculation
        const blend = (ch) => Math.round(ch * 0.15 + 248 * 0.85)
        doc.setFillColor(blend(r), blend(g), blend(b))
        const { x, y: cy, width, height } = data.cell
        doc.roundedRect(x + 1.5, cy + 1.5, width - 3, height - 3, 2, 2, 'F')
        // Redraw the text in the correct color
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(r, g, b)
        doc.text(
          pos.label,
          x + width / 2,
          cy + height / 2 + 1.5,
          { align: 'center' }
        )
      }
    },
  })

  y = doc.lastAutoTable.finalY + 14

  // ── Competitors section ──
  const compIds = new Set()
  servicesToShow.forEach(svc => svc.competitorIds.forEach(id => compIds.add(id)))
  const relevantComps = COMPETITORS.filter(c => compIds.has(c.id))

  setFill(doc, LIGHT_BG)
  setDraw(doc, BORDER_RGB)
  doc.setLineWidth(0.25)
  doc.roundedRect(MARGIN, y, COL_W, 4 + relevantComps.length * 6, 2, 2, 'FD')

  label(doc, 'LOCAL COMPETITORS IN THIS MARKET', MARGIN + 5, y + 7, 7.5, GRAY, 'bold')
  y += 12

  relevantComps.forEach((c, i) => {
    const col = i % 2 === 0 ? MARGIN + 5 : PAGE_W / 2 + 2
    body(doc, `${c.name}  ·  ${c.area}`, col, y, 8.5, SLATE)
    if (i % 2 === 1 || i === relevantComps.length - 1) y += 6
  })

  y += 10

  // ── Teal divider ──
  setFill(doc, TEAL)
  doc.rect(MARGIN, y, COL_W, 1.5, 'F')
  y += 10

  // ── Closing statement ──
  const closing = '"HomeSHINE delivers premium Vermont exterior cleaning at fair, transparent pricing."'
  const closingLines = doc.splitTextToSize(closing, COL_W - 10)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bolditalic')
  setText(doc, NAVY)
  doc.text(closingLines, PAGE_W / 2, y, { align: 'center' })
  y += closingLines.length * 7 + 8

  // Why us bullet points
  const bullets = [
    '✓  Transparent line-item pricing — no hidden fees',
    '✓  Fully insured, Vermont-based crew',
    '✓  Eco-friendly, biodegradable cleaning solutions',
  ]
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  setText(doc, GRAY)
  bullets.forEach(b => {
    doc.text(b, PAGE_W / 2, y, { align: 'center' })
    y += 6
  })

  // ── Footer band ──
  const footY = PAGE_H - 22
  setFill(doc, NAVY)
  doc.rect(0, footY, PAGE_W, 22, 'F')
  setFill(doc, TEAL)
  doc.rect(0, footY, PAGE_W, 1.5, 'F')

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  setText(doc, TEAL_LIGHT)
  doc.text(
    'homeshine.com  ·  (802) 555-0100  ·  Vermont, USA',
    PAGE_W / 2, footY + 13, { align: 'center' }
  )
}

// ─── Public export ────────────────────────────────────────────────────
export function exportQuotePDF({ quote, customer }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawPage1(doc, quote, customer)
  drawPage2(doc, quote, customer)

  const safeName = (customer?.name || 'Customer')
    .replace(/[^a-z0-9 ]/gi, '')
    .trim()
    .replace(/\s+/g, '_')

  const quoteShort = quote.id.toUpperCase().slice(-6)
  doc.save(`HomeSHINE_Quote_${quoteShort}_${safeName}.pdf`)
}
