'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Receipt, Plus, Trash2, Download, Eye, Heart } from 'lucide-react'
import { needsObraSocial, isDigital, invoiceLabels } from '@/lib/constants'

interface Item { id: string; description: string; qty: number; price: number }
interface ObraSocial {
  nombre: string; afiliado: string; autorizacion: string
  cobertura: number; copago: number; codigo: string
}

const newItem = (): Item => ({ id: Date.now().toString(), description: '', qty: 1, price: 0 })
const CURRENCIES = ['ARS', 'USD', 'EUR', 'MXN', 'CLP', 'UYU']

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
  padding: '9px 13px', color: 'white', fontSize: 13,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}
const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14, padding: '18px 18px 16px', marginBottom: 12,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em',
  textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(37,99,255,0.5)'
const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  e.target.style.borderColor = 'rgba(255,255,255,0.08)'

function Section({ title, children, color = 'rgba(37,99,255,0.25)' }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div style={sectionStyle}>
      <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.28)' }}>{title}</p>
      {children}
    </div>
  )
}

export default function FacturacionPage() {
  const { user } = useAuth()
  const [sector, setSector] = useState('')
  const [labels, setLabels] = useState(invoiceLabels(''))

  // Business info from config
  const [companyName,    setCompanyName]    = useState('')
  const [companyEmail,   setCompanyEmail]   = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyCuit,    setCompanyCuit]    = useState('')
  const [matrícula,      setMatrícula]      = useState('')

  // Client/Patient
  const [clientName,    setClientName]    = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail,   setClientEmail]   = useState('')
  const [clientDni,     setClientDni]     = useState('')

  // Invoice
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-001')
  const [date,          setDate]          = useState(new Date().toISOString().split('T')[0])
  const [dueDate,       setDueDate]       = useState('')
  const [currency,      setCurrency]      = useState('ARS')
  const [taxRate,       setTaxRate]       = useState(21)
  const [notes,         setNotes]         = useState('')
  const [items,         setItems]         = useState<Item[]>([newItem()])

  // Obra Social (solo para sectores de salud)
  const [obraSocial, setObraSocial] = useState<ObraSocial>({
    nombre: '', afiliado: '', autorizacion: '', cobertura: 0, copago: 0, codigo: ''
  })

  const [generating, setGenerating] = useState(false)

  const showObraSocial = needsObraSocial(sector)
  const isDigitalBiz   = isDigital(sector)

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`bos_config_${user.id}`)
    if (stored) {
      const cfg = JSON.parse(stored)
      setSector(cfg.sector || user.sector || '')
      setCompanyName(cfg.businessName || user.company || '')
    } else {
      setSector(user.sector || '')
      setCompanyName(user.company || '')
    }
  }, [user])

  useEffect(() => {
    setLabels(invoiceLabels(sector))
    if (!isDigital(sector)) {
      setTaxRate(21)
      setCurrency('ARS')
    }
  }, [sector])

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const obraSocialDesc = showObraSocial && obraSocial.cobertura > 0
    ? subtotal * (obraSocial.cobertura / 100)
    : 0
  const baseImponible = subtotal - obraSocialDesc
  const tax = baseImponible * (taxRate / 100)
  const totalCalculado = baseImponible + tax
  const total = showObraSocial && obraSocial.copago > 0 ? obraSocial.copago : totalCalculado

  const fmt = (n: number) => `${currency} ${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

  const updateItem = (id: string, field: keyof Item, val: string | number) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i))

  const setOS = (field: keyof ObraSocial) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setObraSocial(p => ({ ...p, [field]: field === 'cobertura' || field === 'copago' ? Number(e.target.value) : e.target.value }))

  const downloadPDF = async () => {
    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const accentColor: [number,number,number] = [37, 99, 255]
      const darkBg:      [number,number,number] = [7, 7, 15]

      // Header bg
      doc.setFillColor(...darkBg)
      doc.rect(0, 0, 210, 45, 'F')
      doc.setFillColor(...accentColor)
      doc.rect(0, 0, 7, 297, 'F')

      // Company
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18); doc.setFont('helvetica', 'bold')
      doc.text(companyName || 'Mi Negocio', 18, 16)
      if (sector) {
        doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.setTextColor(150, 170, 220)
        doc.text(sector, 18, 23)
      }
      if (matrícula) {
        doc.setFontSize(7)
        doc.text(`Mat.: ${matrícula}`, 18, 29)
      }
      doc.setTextColor(...accentColor)
      doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text(labels.numberLabel, 18, 36)
      doc.setTextColor(37, 99, 255)
      doc.text(invoiceNumber, 60, 36)
      doc.setTextColor(130, 150, 200); doc.setFontSize(8)
      doc.text(`Fecha: ${date}`, 140, 16)
      if (dueDate) doc.text(`Vencimiento: ${dueDate}`, 140, 23)

      // From/To
      doc.setFillColor(245, 245, 255)
      doc.rect(14, 52, 84, 52, 'F'); doc.rect(112, 52, 84, 52, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 120, 180)
      doc.text('PRESTADOR / EMISOR', 20, 62)
      doc.text(labels.clientLabel.toUpperCase(), 118, 62)
      doc.setTextColor(20, 20, 40); doc.setFontSize(10)
      doc.text(companyName || '-', 20, 72)
      doc.text(clientCompany || clientName || '-', 118, 72)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 100, 130)
      if (companyEmail) doc.text(companyEmail, 20, 80)
      if (companyAddress) doc.text(companyAddress, 20, 87)
      if (companyCuit) doc.text(`CUIT: ${companyCuit}`, 20, 94)
      if (clientDni) doc.text(`DNI/CUIT: ${clientDni}`, 118, 80)
      if (clientName && clientCompany) doc.text(clientName, 118, 87)
      if (clientEmail) doc.text(clientEmail, 118, 94)

      // Obra Social block
      let y = 116
      if (showObraSocial && obraSocial.nombre) {
        doc.setFillColor(240, 245, 255)
        doc.rect(14, y, 182, 28, 'F')
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...accentColor)
        doc.text('OBRA SOCIAL / PREPAGA', 18, y + 7)
        doc.setTextColor(30, 30, 50); doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
        doc.text(`${obraSocial.nombre}`, 18, y + 15)
        if (obraSocial.afiliado) doc.text(`Afiliado N°: ${obraSocial.afiliado}`, 18, y + 22)
        if (obraSocial.autorizacion) doc.text(`Autorización: ${obraSocial.autorizacion}`, 80, y + 22)
        if (obraSocial.codigo) doc.text(`Código prestación: ${obraSocial.codigo}`, 140, y + 22)
        y += 32
      }

      // Table
      doc.setFillColor(...darkBg)
      doc.rect(14, y, 182, 9, 'F')
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
      doc.text(labels.itemsLabel, 18, y + 6)
      doc.text('Cant.', 128, y + 6); doc.text('Precio', 148, y + 6)
      doc.text('Total', 193, y + 6, { align: 'right' })
      y += 13
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 50)
      items.forEach((item, i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 248, 255); doc.rect(14, y - 5, 182, 11, 'F') }
        doc.setFontSize(8)
        doc.text(item.description || '-', 18, y + 1)
        doc.text(String(item.qty), 132, y + 1)
        doc.text(fmt(item.price), 150, y + 1)
        doc.text(fmt(item.qty * item.price), 193, y + 1, { align: 'right' })
        y += 11
      })

      // Totals
      y += 4
      doc.setDrawColor(200, 210, 240); doc.line(14, y, 196, y); y += 8
      doc.setFontSize(9); doc.setTextColor(100, 110, 150)
      doc.text('Subtotal:', 138, y); doc.text(fmt(subtotal), 193, y, { align: 'right' }); y += 7
      if (showObraSocial && obraSocialDesc > 0) {
        doc.setTextColor(37, 99, 255)
        doc.text(`Cobertura OS (${obraSocial.cobertura}%):`, 138, y)
        doc.text(`- ${fmt(obraSocialDesc)}`, 193, y, { align: 'right' }); y += 7
        doc.setTextColor(100, 110, 150)
        doc.text('Base imponible:', 138, y); doc.text(fmt(baseImponible), 193, y, { align: 'right' }); y += 7
      }
      doc.setTextColor(100, 110, 150)
      doc.text(`IVA (${taxRate}%):`, 138, y); doc.text(fmt(tax), 193, y, { align: 'right' }); y += 8

      doc.setFillColor(...accentColor)
      doc.rect(132, y - 5, 65, 11, 'F')
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
      const totalLabel = showObraSocial && obraSocial.copago > 0 ? 'COPAGO:' : 'TOTAL:'
      doc.text(totalLabel, 138, y + 3); doc.text(fmt(total), 193, y + 3, { align: 'right' })

      if (notes) {
        y += 18
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 110, 150)
        doc.text('Notas:', 18, y); doc.setFont('helvetica', 'normal'); y += 6
        doc.setTextColor(60, 65, 90)
        doc.text(doc.splitTextToSize(notes, 170), 18, y)
      }
      doc.setFontSize(7); doc.setTextColor(150, 160, 200)
      doc.text('Generado con Vision OS', 105, 285, { align: 'center' })
      doc.save(`${invoiceNumber}.pdf`)
    } catch (err) { console.error(err) }
    setGenerating(false)
  }

  const canDownload = !generating && companyName && clientName

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: "'Orbitron', sans-serif" }}>
          Vision OS · Finanzas
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} style={{ color: '#06b6d4' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Facturación</h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>
              {sector ? `Configurado para: ${sector}` : 'Creá y descargá facturas profesionales en PDF'}
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(6,182,212,0.25),transparent 60%)', marginTop: 16 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* LEFT */}
        <div>
          {/* Emisor */}
          <Section title="Datos del emisor (tu negocio)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <input placeholder={`Nombre ${showObraSocial ? 'del profesional / centro' : 'de tu negocio'} *`} value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <input placeholder="Email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                <input placeholder="CUIT / NIF" value={companyCuit} onChange={e => setCompanyCuit(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
              {showObraSocial && (
                <input placeholder="Matrícula profesional" value={matrícula} onChange={e => setMatrícula(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
              )}
              <input placeholder="Dirección / Consultorio" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </Section>

          {/* Cliente / Paciente */}
          <Section title={`Datos del ${labels.clientLabel.toLowerCase()}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <input placeholder={`${labels.clientLabel} *`} value={clientName} onChange={e => setClientName(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                {showObraSocial ? (
                  <input placeholder="DNI" value={clientDni} onChange={e => setClientDni(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                ) : (
                  <input placeholder="Empresa / Razón social" value={clientCompany} onChange={e => setClientCompany(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                )}
              </div>
              <input placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </Section>

          {/* Obra Social — solo para sectores de salud */}
          {showObraSocial && (
            <div style={{ ...sectionStyle, border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Heart size={13} style={{ color: '#34d399', flexShrink: 0 }} />
                <p style={{ ...labelStyle, color: '#34d399', margin: 0 }}>Obra Social / Prepaga</p>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(52,211,153,0.5)', fontStyle: 'italic' }}>opcional</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <input placeholder="Nombre de la obra social / prepaga" value={obraSocial.nombre} onChange={setOS('nombre')} style={inputStyle} onFocus={focus} onBlur={blur} />
                  <input placeholder="N° de afiliado" value={obraSocial.afiliado} onChange={setOS('afiliado')} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <input placeholder="N° de autorización" value={obraSocial.autorizacion} onChange={setOS('autorizacion')} style={inputStyle} onFocus={focus} onBlur={blur} />
                  <input placeholder="Código de prestación" value={obraSocial.codigo} onChange={setOS('codigo')} style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 5px' }}>% cobertura de la OS</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" min={0} max={100} value={obraSocial.cobertura} onChange={setOS('cobertura')} style={inputStyle} onFocus={focus} onBlur={blur} />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, flexShrink: 0 }}>%</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 5px' }}>Copago del paciente</p>
                    <input type="number" min={0} placeholder="0" value={obraSocial.copago || ''} onChange={setOS('copago')} style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                {obraSocial.cobertura > 0 && (
                  <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#34d399' }}>
                    OS cubre {fmt(subtotal * obraSocial.cobertura / 100)} · Paciente abona {fmt(obraSocial.copago || totalCalculado)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detalle de factura */}
          <Section title="Detalle">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 9 }}>
              <input placeholder={labels.numberLabel} value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} title="Vencimiento" onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" placeholder="IVA" value={taxRate} min={0} onChange={e => setTaxRate(Number(e.target.value))} style={inputStyle} onFocus={focus} onBlur={blur} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, whiteSpace: 'nowrap' }}>% IVA</span>
              </div>
            </div>
          </Section>

          {/* Items */}
          <Section title={labels.itemsLabel}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <input placeholder={showObraSocial ? 'Prestación / tratamiento' : 'Descripción'} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} style={{ ...inputStyle, flex: 1 }} onFocus={focus} onBlur={blur} />
                  <input type="number" placeholder="Cant" value={item.qty} min={1} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} style={{ ...inputStyle, width: 58 }} onFocus={focus} onBlur={blur} />
                  <input type="number" placeholder="Precio" value={item.price} min={0} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} style={{ ...inputStyle, width: 100 }} onFocus={focus} onBlur={blur} />
                  <button onClick={() => items.length > 1 && setItems(p => p.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 6, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setItems(p => [...p, newItem()])} style={{ marginTop: 10, background: 'none', border: 'none', color: '#2563FF', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={13} /> Agregar {showObraSocial ? 'prestación' : 'ítem'}
            </button>
          </Section>

          {/* Notes */}
          <Section title="Notas (opcional)">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: 'none', height: 70 }} placeholder={showObraSocial ? 'Diagnóstico, indicaciones, observaciones...' : 'Condiciones de pago, aclaraciones...'} onFocus={focus} onBlur={blur} />
          </Section>

          {/* Totals */}
          <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {showObraSocial && obraSocialDesc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontSize: 12 }}>
                  <span>Cobertura OS ({obraSocial.cobertura}%)</span><span>- {fmt(obraSocialDesc)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                <span>IVA ({taxRate}%)</span><span>{fmt(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(6,182,212,0.15)', marginTop: 4 }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, letterSpacing: '0.08em' }}>
                  {showObraSocial && obraSocial.copago > 0 ? 'COPAGO' : 'TOTAL'}
                </span>
                <span style={{ color: '#06b6d4' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            disabled={!canDownload}
            style={{ width: '100%', background: canDownload ? 'linear-gradient(135deg,#0891b2,#06b6d4)' : 'rgba(6,182,212,0.2)', color: 'white', border: 'none', borderRadius: 11, padding: '13px 0', fontSize: 13, fontWeight: 700, cursor: canDownload ? 'pointer' : 'not-allowed', boxShadow: canDownload ? '0 0 24px rgba(6,182,212,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            <Download size={15} />
            {generating ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>

        {/* RIGHT — Preview */}
        <div style={{ position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Eye size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, fontFamily: "'Orbitron', sans-serif" }}>
                Vista previa
              </p>
              {sector && <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{sector}</span>}
            </div>

            {/* White invoice */}
            <div style={{ background: 'white', borderRadius: 10, padding: 16, fontSize: 10, color: '#1a1a2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563FF', paddingBottom: 10, marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{companyName || 'Tu negocio'}</p>
                  {sector && <p style={{ color: '#2563FF', fontSize: 8, margin: '1px 0' }}>{sector}</p>}
                  {matrícula && <p style={{ color: '#6b7280', fontSize: 8, margin: 0 }}>Mat.: {matrícula}</p>}
                  <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: 9 }}>{labels.numberLabel} · {invoiceNumber}</p>
                </div>
                <div style={{ textAlign: 'right', color: '#6b7280', fontSize: 9 }}>
                  <p style={{ margin: 0 }}>Fecha: {date}</p>
                  {dueDate && <p style={{ margin: 0 }}>Vence: {dueDate}</p>}
                </div>
              </div>

              {/* Obra social in preview */}
              {showObraSocial && obraSocial.nombre && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: 7, marginBottom: 8 }}>
                  <p style={{ color: '#0284c7', fontWeight: 700, fontSize: 8, margin: '0 0 3px', textTransform: 'uppercase' }}>Obra Social</p>
                  <p style={{ fontWeight: 600, margin: 0 }}>{obraSocial.nombre}</p>
                  <div style={{ display: 'flex', gap: 10, color: '#6b7280', fontSize: 8 }}>
                    {obraSocial.afiliado && <span>Afil: {obraSocial.afiliado}</span>}
                    {obraSocial.autorizacion && <span>Aut: {obraSocial.autorizacion}</span>}
                    {obraSocial.codigo && <span>Cód: {obraSocial.codigo}</span>}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 9 }}>
                {[
                  { label: 'EMISOR', name: companyName || '-', sub: companyCuit ? `CUIT: ${companyCuit}` : companyEmail },
                  { label: labels.clientLabel.toUpperCase(), name: clientName || '-', sub: clientDni ? `DNI: ${clientDni}` : clientEmail },
                ].map(b => (
                  <div key={b.label} style={{ background: '#eff6ff', borderRadius: 6, padding: 7 }}>
                    <p style={{ color: '#2563FF', fontWeight: 700, fontSize: 8, margin: '0 0 2px', textTransform: 'uppercase' }}>{b.label}</p>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: 9 }}>{b.name}</p>
                    {b.sub && <p style={{ color: '#6b7280', margin: 0, fontSize: 8 }}>{b.sub}</p>}
                  </div>
                ))}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                  <tr style={{ background: '#07070F', color: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '4px 7px', borderRadius: '5px 0 0 5px', fontWeight: 600, fontSize: 8 }}>{labels.itemsLabel}</th>
                    <th style={{ padding: '4px 2px', textAlign: 'center', fontWeight: 600, fontSize: 8 }}>Cant</th>
                    <th style={{ padding: '4px 2px', textAlign: 'right', fontWeight: 600, fontSize: 8 }}>Precio</th>
                    <th style={{ textAlign: 'right', padding: '4px 7px', borderRadius: '0 5px 5px 0', fontWeight: 600, fontSize: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ background: i % 2 === 0 ? '#f8faff' : 'white' }}>
                      <td style={{ padding: '3px 7px', fontSize: 8 }}>{item.description || '—'}</td>
                      <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 8 }}>{item.qty}</td>
                      <td style={{ padding: '3px 2px', textAlign: 'right', fontSize: 8 }}>{fmt(item.price)}</td>
                      <td style={{ padding: '3px 7px', textAlign: 'right', fontSize: 8 }}>{fmt(item.qty * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 2, fontSize: 9 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {showObraSocial && obraSocialDesc > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', marginBottom: 2, fontSize: 9 }}>
                    <span>Cobertura OS ({obraSocial.cobertura}%)</span><span>- {fmt(obraSocialDesc)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 3, fontSize: 9 }}><span>IVA ({taxRate}%)</span><span>{fmt(tax)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, background: '#eff6ff', padding: '5px 7px', borderRadius: 5, marginTop: 3 }}>
                  <span style={{ fontSize: 9 }}>{showObraSocial && obraSocial.copago > 0 ? 'COPAGO' : 'TOTAL'}</span>
                  <span style={{ color: '#2563FF', fontSize: 10 }}>{fmt(total)}</span>
                </div>
              </div>
              {notes && (
                <div style={{ marginTop: 8, background: '#f8faff', borderRadius: 6, padding: 7 }}>
                  <p style={{ color: '#2563FF', fontSize: 7, fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase' }}>NOTAS</p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: 8 }}>{notes}</p>
                </div>
              )}
              <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 7, margin: '8px 0 0' }}>Generado con Vision OS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
