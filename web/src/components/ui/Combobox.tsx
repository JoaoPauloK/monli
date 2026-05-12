import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
  /** Allow the user to submit a typed value that isn't in the options list */
  allowCustom?: boolean
  disabled?: boolean
}

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecionar',
  label,
  error,
  className = '',
  allowCustom = false,
  disabled = false,
}: ComboboxProps) {
  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q),
    )
  }, [options, query])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, selected, allowCustom, query])

  const handleClose = () => {
    setOpen(false)
    if (allowCustom && query && !selected) {
      onChange(query)
    } else {
      setQuery('')
    }
  }

  const handleFocus = () => {
    if (disabled) return
    setQuery(selected?.label ?? '')
    setOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange('')
  }

  const handleSelect = (e: React.MouseEvent, opt: ComboboxOption) => {
    e.preventDefault()
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const displayValue = open ? query : (selected?.label ?? (allowCustom ? value : ''))

  return (
    <div ref={containerRef} className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onChange={handleInputChange}
          className={[
            'h-11 w-full rounded-xl border bg-white pl-4 pr-9 text-sm text-gray-900 outline-none transition-all',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-brand/20',
            open ? 'border-brand ring-2 ring-brand/20' : 'border-gray-200',
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : '',
            disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer',
          ].join(' ')}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {value || (allowCustom && query) ? (
            <button
              type="button"
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              onMouseDown={handleClear}
            >
              <X size={13} />
            </button>
          ) : (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </span>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-52 overflow-auto rounded-xl border border-gray-100 bg-white shadow-xl">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                {allowCustom ? `Usar "${query}"` : 'Nenhum resultado'}
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => handleSelect(e, opt)}
                  className={[
                    'flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors',
                    'border-b border-gray-50 last:border-0',
                    'hover:bg-gray-50 active:bg-gray-100',
                    opt.value === value ? 'bg-brand/5' : '',
                  ].join(' ')}
                >
                  <span className={`text-sm ${opt.value === value ? 'font-semibold text-brand' : 'font-medium text-gray-800'}`}>
                    {opt.label}
                  </span>
                  {opt.sublabel && (
                    <span className="text-xs text-gray-400">{opt.sublabel}</span>
                  )}
                </button>
              ))
            )}
            {allowCustom && query && filtered.length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(query); setQuery(''); setOpen(false) }}
                className="flex w-full items-start border-t border-gray-100 px-4 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Usar "<span className="font-medium text-gray-800">{query}</span>"
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
