'use client'

import { ChevronDown } from 'lucide-react'
import { SECTOR_GROUPS } from '@/lib/constants'

interface Props {
  value: string
  onChange: (v: string) => void
  style?: React.CSSProperties
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  placeholder?: string
}

export function SectorSelect({ value, onChange, style, onFocus, onBlur, placeholder = 'Seleccioná el rubro de tu negocio' }: Props) {
  const base: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    padding: '10px 36px 10px 14px', color: value ? 'white' : 'rgba(255,255,255,0.3)',
    fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s', appearance: 'none', WebkitAppearance: 'none',
    cursor: 'pointer',
    ...style,
  }

  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={base} onFocus={onFocus} onBlur={onBlur}>
        <option value="" disabled style={{ background: '#0a0a18', color: 'rgba(255,255,255,0.4)' }}>
          {placeholder}
        </option>
        {SECTOR_GROUPS.map(group => (
          <optgroup key={group.label} label={group.label} style={{ background: '#0a0a18', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
            {group.sectors.map(s => (
              <option key={s} value={s} style={{ background: '#0d0d1a', color: 'white', padding: '4px 0' }}>
                {s}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
    </div>
  )
}
