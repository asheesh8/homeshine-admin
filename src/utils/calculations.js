export const lineItemSubtotal = (item) =>
  parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)

export const quoteSubtotal = (lineItems) =>
  lineItems.reduce((sum, item) => sum + lineItemSubtotal(item), 0)

export const quoteTax = (subtotal, taxRate) =>
  subtotal * (parseFloat(taxRate || 0) / 100)

export const quoteTotal = (subtotal, tax) => subtotal + tax

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export const generateId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
