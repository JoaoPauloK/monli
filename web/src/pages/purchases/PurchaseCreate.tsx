import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Plus, Camera, Trash2, CheckCircle, X, Loader2, Sparkles } from 'lucide-react'
import { useCreatePurchase } from '@/hooks/usePurchases'
import { useIngredientList } from '@/hooks/useIngredients'
import PageContainer from '@/components/layout/PageContainer'
import TopBar from '@/components/layout/TopBar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Combobox from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { purchaseSchema, type PurchaseFormData } from '@/lib/validators'
import { formatCurrency, today } from '@/lib/formatters'
import { confirmPurchaseFromImage, previewPurchaseFromImage } from '@/api/services/purchases'
import type { ExtractedItemConfirm, PurchaseExtraction } from '@/types/purchase'

export default function PurchaseCreate() {
  const navigate = useNavigate()
  const mutation = useCreatePurchase()
  const { data: ingredients = [] } = useIngredientList()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      ingredients: [{ ingredient_id: '', quantity: '', unit_cost: '' }],
      purchased_on: today(),
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })
  const watchedItems = useWatch({ control, name: 'ingredients' })

  const ingredientOptions = useMemo(
    () => ingredients.map((ing) => ({ value: ing.id, label: ing.name, sublabel: ing.unit })),
    [ingredients],
  )

  const total = (watchedItems ?? []).reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0)
    const cost = Number(item?.unit_cost ?? 0)
    return sum + qty * cost
  }, 0)

  const onSubmit = (data: PurchaseFormData) => {
    mutation.mutate(
      {
        ingredients: data.ingredients.map((i) => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
        purchased_on: data.purchased_on ?? null,
        notes: data.notes ?? null,
      },
      { onSuccess: () => navigate(-1) },
    )
  }

  const [isExtracting, setIsExtracting] = useState(false)
  const [extraction, setExtraction] = useState<PurchaseExtraction | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItems, setPreviewItems] = useState<ExtractedItemConfirm[]>([])
  const [previewDate, setPreviewDate] = useState<string | null>(null)
  const [removingIndex, setRemovingIndex] = useState<Set<number>>(new Set())
  const [newItemIndexes, setNewItemIndexes] = useState<Set<number>>(new Set())
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const openCamera = () => cameraRef.current?.click()

  const onCameraInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. Por favor, escolha uma foto menor que 5MB.')
      return
    }
    setIsExtracting(true)
    try {
      const data = await previewPurchaseFromImage(file)
      setExtraction(data)
      setPreviewDate(data.purchase_date)
      setPreviewItems(
        data.ingredients.map((item) => ({
          matched_ingredient_id: item.matched_ingredient_id,
          name: item.name,
          unit: item.unit,
          quantity: String(item.quantity),
          unit_cost: String(item.unit_cost),
        })),
      )
      setNewItemIndexes(new Set())
      setRemovingIndex(new Set())
      setConfirmError(null)
      // Small delay so the loading overlay fades out before sheet slides up
      setTimeout(() => {
        setIsExtracting(false)
        setPreviewOpen(true)
      }, 300)
    } catch {
      setIsExtracting(false)
      alert('Não foi possível extrair os dados da nota. Tente novamente.')
    } finally {
      event.target.value = ''
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setTimeout(() => {
      setExtraction(null)
      setPreviewItems([])
      setPreviewDate(null)
      setConfirmError(null)
    }, 350)
  }

  const removePreviewItem = (index: number) => {
    setRemovingIndex((prev) => new Set(prev).add(index))
    setTimeout(() => {
      setPreviewItems((prev) => prev.filter((_, i) => i !== index))
      setNewItemIndexes((prev) => {
        const next = new Set<number>()
        prev.forEach((i) => { if (i !== index) next.add(i > index ? i - 1 : i) })
        return next
      })
      setRemovingIndex((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }, 220)
  }

  const addPreviewItem = () => {
    const newIndex = previewItems.length
    setPreviewItems((prev) => [
      ...prev,
      { matched_ingredient_id: null, name: '', unit: 'kg', quantity: '', unit_cost: '' },
    ])
    setNewItemIndexes((prev) => new Set(prev).add(newIndex))
    setTimeout(() => {
      setNewItemIndexes((prev) => {
        const next = new Set(prev)
        next.delete(newIndex)
        return next
      })
    }, 400)
  }

  const updatePreviewItem = (index: number, field: keyof ExtractedItemConfirm, value: string) => {
    setPreviewItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: value, matched_ingredient_id: field === 'name' ? null : item.matched_ingredient_id }
          : item,
      ),
    )
  }

  const previewTotal = previewItems.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.unit_cost || 0)
  }, 0)

  const onConfirm = async () => {
    const validItems = previewItems.filter((i) => i.name.trim() && Number(i.quantity) > 0)
    if (validItems.length === 0) {
      setConfirmError('Adicione ao menos um item com nome e quantidade.')
      return
    }
    setIsConfirming(true)
    setConfirmError(null)
    try {
      await confirmPurchaseFromImage({
        ingredients: validItems,
        purchase_date: previewDate,
        notes: null,
      })
      navigate('/purchases')
    } catch {
      setConfirmError('Erro ao registrar a compra. Verifique os dados e tente novamente.')
      setIsConfirming(false)
    }
  }

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (previewOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [previewOpen])

  return (
    <>
      <TopBar
        title="Nova Compra"
        back
        action={
          <Button variant="ghost" onClick={openCamera} title="Escanear nota fiscal">
            <Camera size={28} />
          </Button>
        }
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onCameraInputChange}
        hidden
      />

      {/* ── Extraction loading overlay ── */}
      <div
        className={[
          'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm',
          'transition-opacity duration-300',
          isExtracting ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Loader2 size={32} className="animate-spin text-brand" />
            <Sparkles size={14} className="absolute bottom-2 right-2 text-brand" />
          </div>
          <p className="text-base font-semibold text-gray-800">Analisando sua nota...</p>
          <p className="text-sm text-gray-500">Identificando itens da compra</p>
        </div>
      </div>

      {/* ── Preview bottom sheet ── */}
      {extraction !== null && (
        <>
          {/* Backdrop */}
          <div
            onClick={closePreview}
            className={[
              'fixed inset-0 z-59 bg-black/40 backdrop-blur-[2px]',
              'transition-opacity duration-350',
              previewOpen ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />

          {/* Sheet */}
          <div
            className={[
              'fixed inset-x-0 bottom-0 z-60 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-2xl',
              'transition-transform duration-400 ease-out',
              previewOpen ? 'translate-y-0' : 'translate-y-full',
            ].join(' ')}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand" />
                <h2 className="text-lg font-bold text-gray-900">Itens identificados</h2>
              </div>
              <button
                onClick={closePreview}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Date row */}
            <div className="px-5 pb-3">
              <Input
                label="Data da compra"
                type="date"
                value={previewDate ?? ''}
                onChange={(e) => setPreviewDate(e.target.value || null)}
              />
            </div>

            {/* Items list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
              <div className="flex flex-col gap-3">
                {previewItems.map((item, index) => {
                  const isRemoving = removingIndex.has(index)
                  const isNew = newItemIndexes.has(index)
                  return (
                    <div
                      key={index}
                      style={{ transitionDelay: isNew ? '0ms' : `${index * 40}ms` }}
                      className={[
                        'rounded-2xl border border-gray-100 bg-gray-50 p-3',
                        'transition-all duration-250',
                        isRemoving
                          ? 'opacity-0 translate-x-4 scale-95'
                          : previewOpen
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.matched_ingredient_id ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle size={10} /> Existente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            <Plus size={10} /> Novo
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removePreviewItem(index)}
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-500">Ingrediente</label>
                          <input
                            type="text"
                            placeholder="Nome do ingrediente"
                            value={item.name}
                            onChange={(e) => updatePreviewItem(index, 'name', e.target.value)}
                            className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Quantidade</label>
                            <input
                              type="number"
                              placeholder="0"
                              step="0.001"
                              value={item.quantity}
                              onChange={(e) => updatePreviewItem(index, 'quantity', e.target.value)}
                              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Valor unit.</label>
                            <input
                              type="number"
                              placeholder="0,00"
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) => updatePreviewItem(index, 'unit_cost', e.target.value)}
                              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Unidade</label>
                            <input
                              type="text"
                              placeholder="kg"
                              value={item.unit}
                              onChange={(e) => updatePreviewItem(index, 'unit', e.target.value)}
                              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-400">Total do item</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {formatCurrency(Number(item.quantity || 0) * Number(item.unit_cost || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={addPreviewItem}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand"
              >
                <Plus size={16} /> Adicionar item
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 pt-4 pb-6 safe-area-bottom">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total estimado</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(previewTotal)}</span>
              </div>

              {confirmError && (
                <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{confirmError}</p>
              )}

              <Button
                onClick={onConfirm}
                loading={isConfirming}
                disabled={isConfirming}
                className="w-full"
              >
                {isConfirming ? 'Registrando...' : 'Confirmar compra'}
              </Button>
            </div>
          </div>
        </>
      )}

      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Data da compra" type="date" {...register('purchased_on')} />

          <Card padding="sm">
            <p className="mb-3 text-sm font-medium text-gray-700">Ingredientes</p>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`ingredients.${index}.ingredient_id`}
                      render={({ field }) => (
                        <Combobox
                          options={ingredientOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecionar ingrediente"
                          className="flex-1"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl text-red-400 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Quantidade"
                      type="number"
                      step="0.001"
                      error={errors.ingredients?.[index]?.quantity?.message}
                      {...register(`ingredients.${index}.quantity`)}
                    />
                    <Input
                      placeholder="Custo unit. R$"
                      type="number"
                      step="0.01"
                      error={errors.ingredients?.[index]?.unit_cost?.message}
                      {...register(`ingredients.${index}.unit_cost`)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ ingredient_id: '', quantity: '', unit_cost: '' })}
              className="mt-3 w-full"
            >
              <Plus size={16} /> Adicionar ingrediente
            </Button>
          </Card>

          <Card padding="sm" className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Total da compra</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
          </Card>

          <Textarea
            label="Observações (opcional)"
            placeholder="Fornecedor, número da nota..."
            rows={2}
            {...register('notes')}
          />

          {mutation.error && <p className="text-sm text-red-500">Erro ao registrar compra.</p>}

          <Button type="submit" loading={mutation.isPending} className="w-full">
            Registrar compra
          </Button>
        </form>
      </PageContainer>
    </>
  )
}
