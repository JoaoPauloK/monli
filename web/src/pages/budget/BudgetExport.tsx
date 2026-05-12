import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  Download,
  Minus,
  Percent,
  Plus,
  Share2,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import jsPDF from 'jspdf'
import { useProductList } from '@/hooks/useProducts'
import { useCustomerList } from '@/hooks/useCustomers'
import Combobox from '@/components/ui/Combobox'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useAuthStore } from '@/store/authStore'
import type { CustomerRead } from '@/types/customer'

interface BudgetItem {
  product_id: string
  name: string
  quantity: number
  unit_price: number
  key: string
}

type DiscountType = 'percent' | 'flat'

function buildPdf(params: {
  userName: string
  tenantName: string
  customerName: string
  customerInfo: CustomerRead | null
  items: BudgetItem[]
  subtotal: number
  discountEnabled: boolean
  discountType: DiscountType
  discountAmount: string
  discountValue: number
  total: number
  notes: string
  today: string
}) {
  const {
    userName,
    tenantName,
    customerName,
    customerInfo,
    items,
    subtotal,
    discountEnabled,
    discountType,
    discountAmount,
    discountValue,
    total,
    notes,
    today,
  } = params

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const PW = 210
  const M = 14
  const CW = PW - M * 2

  // Header bar
  doc.setFillColor(234, 29, 44)
  doc.rect(0, 0, PW, 24, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(tenantName + ' - Orçamento', M, 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const num = `ORC-${today.replace(/-/g, '')}`
  doc.text(num, PW - M, 10, { align: 'right' })
  doc.text(`Data: ${formatDate(today)}`, PW - M, 17, { align: 'right' })

  // Company / brand
  let y = 34
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(tenantName || userName || 'Empresa', M, y)
  if (tenantName && userName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(userName, M, y + 5)
    y += 3
  }

  // Customer (right side)
  if (customerName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('Para:', PW - M, y - 6, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text(customerName, PW - M, y, { align: 'right' })

    let infoY = y + 5
    if (customerInfo?.email) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(customerInfo.email, PW - M, infoY, { align: 'right' })
      infoY += 4
    }
    if (customerInfo?.phone) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(customerInfo.phone, PW - M, infoY, { align: 'right' })
    }
  }

  y += 14
  doc.setDrawColor(220, 220, 220)
  doc.line(M, y, PW - M, y)
  y += 8

  // Table header
  doc.setFillColor(248, 248, 248)
  doc.rect(M, y - 4, CW, 9, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  const C1 = M + 2
  const C2 = M + CW * 0.6
  const C3 = M + CW * 0.78
  const C4 = M + CW
  doc.text('PRODUTO', C1, y + 1)
  doc.text('QTD', C2, y + 1, { align: 'right' })
  doc.text('PREÇO UNIT.', C3, y + 1, { align: 'right' })
  doc.text('TOTAL', C4, y + 1, { align: 'right' })
  y += 8

  // Table rows
  items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(252, 252, 252)
      doc.rect(M, y - 4, CW, 9, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)

    const maxW = CW * 0.55
    let name = item.name
    while (doc.getTextWidth(name) > maxW && name.length > 4) {
      name = name.slice(0, -1)
    }
    if (name !== item.name) name += '…'

    doc.text(name, C1, y + 1)
    doc.text(String(item.quantity), C2, y + 1, { align: 'right' })
    doc.text(formatCurrency(item.unit_price), C3, y + 1, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(item.quantity * item.unit_price), C4, y + 1, { align: 'right' })
    y += 9
  })

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.line(M, y, PW - M, y)
  y += 7

  // Summary
  const LX = PW - M - 72
  const VX = PW - M

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Subtotal', LX, y)
  doc.text(formatCurrency(subtotal), VX, y, { align: 'right' })
  y += 7

  if (discountEnabled && discountValue > 0) {
    doc.setTextColor(200, 30, 30)
    const lbl =
      discountType === 'percent' ? `Desconto (${discountAmount}%)` : 'Desconto'
    doc.text(lbl, LX, y)
    doc.text(`- ${formatCurrency(discountValue)}`, VX, y, { align: 'right' })
    y += 7
  }

  // Total box
  y += 2
  doc.setFillColor(234, 29, 44)
  doc.roundedRect(LX - 4, y - 5, VX - LX + 8, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TOTAL', LX - 2, y + 3)
  doc.setFontSize(11)
  doc.text(formatCurrency(total), VX, y + 3, { align: 'right' })
  y += 20

  // Notes
  if (notes.trim()) {
    doc.setDrawColor(240, 240, 240)
    doc.line(M, y - 2, PW - M, y - 2)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text('Observações', M, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(60, 60, 60)
    const lines = doc.splitTextToSize(notes, CW)
    doc.text(lines, M, y)
  }

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.text(
    `Gerado em ${new Date().toLocaleString('pt-BR')} · Monli`,
    PW / 2,
    287,
    { align: 'center' },
  )

  return doc
}

export default function BudgetExport() {
  const user = useAuthStore((s) => s.user)
  console.log(user)
  const { data: products = [] } = useProductList()
  const { data: customers = [] } = useCustomerList()

  // Customer combobox
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRead | null>(null)
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const customerRef = useRef<HTMLDivElement>(null)

  const customerName = selectedCustomer ? selectedCustomer.name : customerSearch

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers
    const q = customerSearch.toLowerCase()
    return customers.filter((c) => c.name.toLowerCase().includes(q))
  }, [customers, customerSearch])

  useEffect(() => {
    if (!showCustomerDrop) return
    const handler = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showCustomerDrop])

  const selectCustomer = (c: CustomerRead) => {
    setSelectedCustomer(c)
    setCustomerSearch(c.name)
    setShowCustomerDrop(false)
  }

  const clearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerSearch('')
  }

  const productOptions = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .map((p) => ({ value: p.id, label: p.name, sublabel: formatCurrency(p.sale_price) })),
    [products],
  )

  // Product add
  const [selectedProductId, setSelectedProductId] = useState('')
  const [qty, setQty] = useState('1')
  const [items, setItems] = useState<BudgetItem[]>([])
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const addItem = useCallback(() => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + Math.max(1, Number(qty)) }
            : i,
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          quantity: Math.max(1, Number(qty)),
          unit_price: Number(product.sale_price),
          key: `${product.id}-${Date.now()}`,
        },
      ]
    })
    setSelectedProductId('')
    setQty('1')
  }, [products, selectedProductId, qty])

  const removeItem = (productId: string) => {
    setRemovingIds((prev) => new Set([...prev, productId]))
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }, 260)
  }

  const updateQty = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }

  const setQtyDirect = (productId: string, value: number) => {
    if (value < 1) return
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity: value } : i)),
    )
  }

  // Discount
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountAmount, setDiscountAmount] = useState('')

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.unit_price, 0),
    [items],
  )

  const discountValue = useMemo(() => {
    if (!discountEnabled) return 0
    const amt = Number(discountAmount)
    if (!amt || amt <= 0) return 0
    if (discountType === 'percent') return (subtotal * Math.min(amt, 100)) / 100
    return Math.min(amt, subtotal)
  }, [discountEnabled, discountAmount, discountType, subtotal])

  const total = subtotal - discountValue

  // Notes
  const [notes, setNotes] = useState('')

  // PDF generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing'>('idle')

  const today = new Date().toISOString().split('T')[0]

  const getParams = useCallback(
    () => ({
      userName: user?.full_name ?? '',
      tenantName: user?.tenant_name ?? '',
      customerName,
      customerInfo: selectedCustomer,
      items,
      subtotal,
      discountEnabled,
      discountType,
      discountAmount,
      discountValue,
      total,
      notes,
      today,
    }),
    [
      user,
      customerName,
      selectedCustomer,
      items,
      subtotal,
      discountEnabled,
      discountType,
      discountAmount,
      discountValue,
      total,
      notes,
      today,
    ],
  )

  const handleExportPdf = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 80))
    const doc = buildPdf(getParams())
    const slug = (customerName || 'cliente').toLowerCase().replace(/\s+/g, '-')
    doc.save(`orcamento-${slug}.pdf`)
    setIsGenerating(false)
  }

  const handleShare = async () => {
    setShareStatus('sharing')
    await new Promise((r) => setTimeout(r, 80))
    const doc = buildPdf(getParams())
    const blob = doc.output('blob')
    const slug = (customerName || 'cliente').toLowerCase().replace(/\s+/g, '-')
    const file = new File([blob], `orcamento-${slug}.pdf`, {
      type: 'application/pdf',
    })

    const canShareFile =
      typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

    if (canShareFile) {
      try {
        await navigator.share({
          title: `Orçamento${customerName ? ` - ${customerName}` : ''}`,
          text: 'Segue o orçamento conforme solicitado.',
          files: [file],
        })
      } catch {
        // user cancelled or error — fall back to download
        doc.save(`orcamento-${slug}.pdf`)
      }
    } else {
      doc.save(`orcamento-${slug}.pdf`)
    }

    setShareStatus('idle')
  }

  const hasItems = items.length > 0

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0)   scale(1); }
          to   { opacity: 0; transform: translateX(24px) scale(0.96); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes expandDown {
          from { opacity: 0; max-height: 0; transform: translateY(-6px); }
          to   { opacity: 1; max-height: 200px; transform: translateY(0); }
        }
        .item-enter { animation: slideDown 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .item-exit  { animation: slideOut 0.26s ease-in forwards; }
        .fade-in    { animation: fadeIn 0.3s ease forwards; }
        .expand-down { animation: expandDown 0.25s ease forwards; overflow: hidden; }
      `}</style>

      <TopBar
        title="Orçamento"
        back
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShare}
              disabled={!hasItems || shareStatus === 'sharing'}
              loading={shareStatus === 'sharing'}
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExportPdf}
              disabled={!hasItems || isGenerating}
              loading={isGenerating}
            >
              <Download size={15} />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        }
      />

      <PageContainer>
        <div className="flex flex-col gap-5">

          {/* ── HERO BANNER ── */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand to-[#C0111E] px-5 py-5 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-4 right-8 h-16 w-16 rounded-full bg-white/10" />
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">Novo</p>
            <h2 className="mt-0.5 text-xl font-bold">Orçamento</h2>
            <p className="mt-1 text-sm text-white/75">
              Monte, calcule e compartilhe com seus clientes em segundos.
            </p>
          </div>

          {/* ── SEÇÃO 1: CLIENTE ── */}
          <section>
            <SectionLabel icon={<User size={14} />} label="Cliente" />
            <Card className="mt-2">
              <div ref={customerRef} className="relative">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nome do cliente
                </label>
                <div className="relative flex items-center">
                  <input
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                    placeholder="Buscar ou digitar nome do cliente"
                    value={customerSearch}
                    onFocus={() => setShowCustomerDrop(true)}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setSelectedCustomer(null)
                      setShowCustomerDrop(true)
                    }}
                  />
                  <span className="pointer-events-none absolute right-3 text-gray-400">
                    {customerSearch ? (
                      <button
                        type="button"
                        className="pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={clearCustomer}
                      >
                        <X size={15} />
                      </button>
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </span>
                </div>

                {showCustomerDrop && filteredCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-xl border border-gray-100 bg-white shadow-xl fade-in">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        onMouseDown={() => selectCustomer(c)}
                      >
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        {(c.email || c.phone) && (
                          <span className="text-xs text-gray-400">
                            {c.email ?? c.phone}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 expand-down">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <User size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-green-800">
                      {selectedCustomer.name}
                    </p>
                    {(selectedCustomer.email || selectedCustomer.phone) && (
                      <p className="truncate text-xs text-green-600">
                        {selectedCustomer.email ?? selectedCustomer.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Observações <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="Prazo de entrega, condições especiais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </Card>
          </section>

          {/* ── SEÇÃO 2: PRODUTOS ── */}
          <section>
            <SectionLabel icon={<Tag size={14} />} label="Produtos" />
            <Card className="mt-2">
              {/* Add product row */}
              <div className="flex gap-2">
                <Combobox
                  options={productOptions}
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  placeholder="Selecionar produto"
                  className="min-w-0 flex-1"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Qtd"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="h-11 w-16 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-center text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  disabled={!selectedProductId}
                  onClick={addItem}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#C0111E]"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Item list */}
              {items.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 ${
                        removingIds.has(item.product_id) ? 'item-exit' : 'item-enter'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 rounded-lg bg-white border border-gray-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors active:scale-90"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            setQtyDirect(item.product_id, Number(e.target.value))
                          }
                          className="w-8 bg-transparent text-center text-sm font-semibold text-gray-800 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors active:scale-90"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <p className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && (
                <div className="mt-4 flex flex-col items-center gap-1 py-6 text-center">
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Tag size={18} />
                  </div>
                  <p className="text-sm text-gray-400">
                    Selecione produtos para incluir no orçamento
                  </p>
                </div>
              )}
            </Card>
          </section>

          {/* ── SEÇÃO 3: RESUMO ── */}
          {hasItems && (
            <section className="fade-in">
              <SectionLabel icon={<Percent size={14} />} label="Resumo" />
              <Card className="mt-2 overflow-hidden">

                {/* Subtotal */}
                <div className="flex items-center justify-between py-1">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatCurrency(subtotal)}
                  </p>
                </div>

                {/* Discount toggle */}
                <div className="mt-1 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setDiscountEnabled((v) => !v)}
                    className="flex w-full items-center justify-between text-sm transition-colors"
                  >
                    <span
                      className={`font-medium transition-colors ${
                        discountEnabled ? 'text-brand' : 'text-gray-500'
                      }`}
                    >
                      Desconto
                    </span>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        discountEnabled ? 'bg-brand' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          discountEnabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                  </button>

                  {discountEnabled && (
                    <div className="mt-3 flex gap-2 expand-down">
                      {/* Type toggle */}
                      <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setDiscountType('percent')}
                          className={`flex h-10 w-11 items-center justify-center text-sm font-medium transition-all ${
                            discountType === 'percent'
                              ? 'bg-brand text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('flat')}
                          className={`flex h-10 w-11 items-center justify-center text-sm font-medium transition-all ${
                            discountType === 'flat'
                              ? 'bg-brand text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          R$
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={discountType === 'percent' ? 'Ex: 10' : 'Ex: 25,00'}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  )}

                  {discountEnabled && discountValue > 0 && (
                    <div className="mt-2 flex items-center justify-between text-sm text-red-500 fade-in">
                      <span>
                        {discountType === 'percent'
                          ? `${discountAmount}% de desconto`
                          : 'Desconto aplicado'}
                      </span>
                      <span>- {formatCurrency(discountValue)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
                  <p className="text-sm font-semibold text-white/70">Total</p>
                  <p className="text-xl font-bold text-white transition-all duration-300">
                    {formatCurrency(total)}
                  </p>
                </div>
              </Card>
            </section>
          )}

          {/* ── ACTION BUTTONS ── */}
          {hasItems && (
            <div className="flex gap-3 fade-in">
              <Button
                variant="secondary"
                onClick={handleShare}
                disabled={shareStatus === 'sharing'}
                loading={shareStatus === 'sharing'}
                className="flex-1"
              >
                <Share2 size={16} />
                Compartilhar
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={isGenerating}
                loading={isGenerating}
                className="flex-1"
              >
                <Download size={16} />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-brand">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  )
}
