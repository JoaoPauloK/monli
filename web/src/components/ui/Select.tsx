import Combobox, { type ComboboxOption } from './Combobox'

interface SelectProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
  disabled?: boolean
}

export default function Select(props: SelectProps) {
  return <Combobox {...props} />
}

export type { ComboboxOption }
