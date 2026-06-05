// ─── Sector groups (for <optgroup> selects) ─────────────────────
export const SECTOR_GROUPS = [
  {
    label: 'Salud y Bienestar',
    sectors: [
      'Kinesiología / Fisioterapia',
      'Clínica / Consultorio Médico',
      'Odontología / Dental',
      'Psicología / Terapia',
      'Nutricionista / Dietista',
      'Veterinaria',
      'Optometría / Oftalmología',
      'Fonoaudiología',
    ],
  },
  {
    label: 'Estética y Belleza',
    sectors: [
      'Centro de Estética & Belleza',
      'Peluquería / Barbería',
      'Spa / Masoterapia',
      'Uñas / Nail Art',
      'Tatuajes & Piercing',
      'Maquillaje & Cejas',
    ],
  },
  {
    label: 'Fitness y Deporte',
    sectors: [
      'Gimnasio / Fitness & Wellness',
      'Personal Trainer',
      'Yoga / Pilates / Danza',
      'Fisioterapia Deportiva',
      'Artes Marciales / Crossfit',
    ],
  },
  {
    label: 'Gastronomía y Hospitalidad',
    sectors: [
      'Restaurante / Bar',
      'Catering / Eventos',
      'Pastelería / Panadería',
      'Hotel / Alojamiento',
      'Rotisería / Delivery',
    ],
  },
  {
    label: 'Negocios Digitales',
    sectors: [
      'Agencia Digital / Marketing',
      'Desarrollo Web / Software',
      'Diseño Gráfico / UX/UI',
      'Community Manager',
      'E-commerce / Tienda Online',
      'SaaS / Startup Tech',
      'Consultoría / Coaching Online',
      'Creador de Contenido / Influencer',
      'SEO / Performance Marketing',
      'Producción Audiovisual',
    ],
  },
  {
    label: 'Servicios Profesionales',
    sectors: [
      'Estudio Contable / Auditoría',
      'Estudio Jurídico / Legal',
      'Arquitectura / Diseño de Interiores',
      'Fotografía / Videografía',
      'Inmobiliaria',
      'Seguro / Asesor Financiero',
      'Recursos Humanos / Headhunting',
      'Traducción / Redacción',
    ],
  },
  {
    label: 'Comercio y Retail',
    sectors: [
      'Comercio / Tienda Física',
      'Indumentaria / Moda',
      'Tecnología / Electrónica',
      'Librería / Papelería',
      'Ferretería / Materiales',
    ],
  },
  {
    label: 'Educación',
    sectors: [
      'Academia / Instituto de Idiomas',
      'Tutoría / Clases Particulares',
      'Cursos Online / E-learning',
      'Capacitación Empresarial',
      'Jardín / Guardería',
    ],
  },
  {
    label: 'Bienestar Espiritual',
    sectors: [
      'Tarot / Astrología',
      'Reiki / Sanación Energética',
      'Numerología / Adivinación',
      'Meditación / Mindfulness',
      'Constelaciones / Terapia Holística',
    ],
  },
  {
    label: 'Otro',
    sectors: ['Otro / No está en la lista'],
  },
]

// Flat list for simple use cases
export const SECTORS = SECTOR_GROUPS.flatMap(g => g.sectors)

// ─── Sector colors ───────────────────────────────────────────────
export const SECTOR_COLORS: Record<string, string> = {
  // Salud
  'Kinesiología / Fisioterapia':       '#34d399',
  'Clínica / Consultorio Médico':      '#60a5fa',
  'Odontología / Dental':              '#22d3ee',
  'Psicología / Terapia':              '#a78bfa',
  'Nutricionista / Dietista':          '#4ade80',
  'Veterinaria':                        '#f97316',
  'Optometría / Oftalmología':         '#38bdf8',
  'Fonoaudiología':                     '#86efac',
  // Estética
  'Centro de Estética & Belleza':      '#f472b6',
  'Peluquería / Barbería':             '#e879f9',
  'Spa / Masoterapia':                 '#fb7185',
  'Uñas / Nail Art':                   '#f9a8d4',
  'Tatuajes & Piercing':               '#6366f1',
  'Maquillaje & Cejas':                '#ec4899',
  // Fitness
  'Gimnasio / Fitness & Wellness':     '#fb923c',
  'Personal Trainer':                  '#f97316',
  'Yoga / Pilates / Danza':            '#fbbf24',
  'Fisioterapia Deportiva':            '#34d399',
  'Artes Marciales / Crossfit':        '#ef4444',
  // Gastronomía
  'Restaurante / Bar':                 '#fbbf24',
  'Catering / Eventos':                '#f59e0b',
  'Pastelería / Panadería':            '#fde68a',
  'Hotel / Alojamiento':               '#a78bfa',
  'Rotisería / Delivery':              '#fb923c',
  // Digital
  'Agencia Digital / Marketing':       '#06b6d4',
  'Desarrollo Web / Software':         '#2563FF',
  'Diseño Gráfico / UX/UI':            '#8b5cf6',
  'Community Manager':                 '#3b82f6',
  'E-commerce / Tienda Online':        '#10b981',
  'SaaS / Startup Tech':               '#6366f1',
  'Consultoría / Coaching Online':     '#0ea5e9',
  'Creador de Contenido / Influencer': '#f472b6',
  'SEO / Performance Marketing':       '#22d3ee',
  'Producción Audiovisual':            '#7c3aed',
  // Profesionales
  'Estudio Contable / Auditoría':      '#2563FF',
  'Estudio Jurídico / Legal':          '#64748b',
  'Arquitectura / Diseño de Interiores': '#d97706',
  'Fotografía / Videografía':          '#7c3aed',
  'Inmobiliaria':                      '#a78bfa',
  'Seguro / Asesor Financiero':        '#0284c7',
  'Recursos Humanos / Headhunting':    '#0ea5e9',
  'Traducción / Redacción':            '#94a3b8',
  // Comercio
  'Comercio / Tienda Física':          '#f87171',
  'Indumentaria / Moda':               '#f472b6',
  'Tecnología / Electrónica':          '#3b82f6',
  'Librería / Papelería':              '#fbbf24',
  'Ferretería / Materiales':           '#94a3b8',
  // Educación
  'Academia / Instituto de Idiomas':   '#10b981',
  'Tutoría / Clases Particulares':     '#4ade80',
  'Cursos Online / E-learning':        '#06b6d4',
  'Capacitación Empresarial':          '#0ea5e9',
  'Jardín / Guardería':                '#fbbf24',
  // Bienestar Espiritual
  'Tarot / Astrología':                '#a855f7',
  'Reiki / Sanación Energética':       '#d946ef',
  'Numerología / Adivinación':         '#c084fc',
  'Meditación / Mindfulness':          '#e879f9',
  'Constelaciones / Terapia Holística': '#f0abfc',
  // Otro
  'Otro / No está en la lista':        '#94a3b8',
}

// ─── Sector capabilities ─────────────────────────────────────────

// Sectores que usan obras sociales / prepagas
export const OBRA_SOCIAL_SECTORS = new Set([
  'Kinesiología / Fisioterapia',
  'Clínica / Consultorio Médico',
  'Odontología / Dental',
  'Psicología / Terapia',
  'Nutricionista / Dietista',
  'Optometría / Oftalmología',
  'Fonoaudiología',
  'Fisioterapia Deportiva',
])

// Sectores que son 100% digitales (sin atención presencial)
export const DIGITAL_SECTORS = new Set([
  'Agencia Digital / Marketing',
  'Desarrollo Web / Software',
  'Diseño Gráfico / UX/UI',
  'Community Manager',
  'E-commerce / Tienda Online',
  'SaaS / Startup Tech',
  'Consultoría / Coaching Online',
  'Creador de Contenido / Influencer',
  'SEO / Performance Marketing',
  'Cursos Online / E-learning',
  'Traducción / Redacción',
])

// Sectores que trabajan con turnos / agenda
export const TURNOS_SECTORS = new Set([
  'Kinesiología / Fisioterapia',
  'Clínica / Consultorio Médico',
  'Odontología / Dental',
  'Psicología / Terapia',
  'Nutricionista / Dietista',
  'Optometría / Oftalmología',
  'Fonoaudiología',
  'Centro de Estética & Belleza',
  'Peluquería / Barbería',
  'Spa / Masoterapia',
  'Uñas / Nail Art',
  'Maquillaje & Cejas',
  'Gym / Fitness & Wellness',
  'Personal Trainer',
  'Yoga / Pilates / Danza',
  'Fisioterapia Deportiva',
  'Artes Marciales / Crossfit',
  'Veterinaria',
  'Fotografía / Videografía',
  'Tarot / Astrología',
  'Reiki / Sanación Energética',
  'Numerología / Adivinación',
  'Meditación / Mindfulness',
  'Constelaciones / Terapia Holística',
])

// Helpers
export const needsObraSocial = (sector: string) => OBRA_SOCIAL_SECTORS.has(sector)
export const isDigital       = (sector: string) => DIGITAL_SECTORS.has(sector)
export const usesTurnos      = (sector: string) => TURNOS_SECTORS.has(sector)

// Etiquetas de factura según rubro
export const invoiceLabels = (sector: string) => {
  if (OBRA_SOCIAL_SECTORS.has(sector)) {
    return { clientLabel: 'Paciente', itemsLabel: 'Prestaciones / Servicios', numberLabel: 'N° de Consulta' }
  }
  if (sector === 'Estudio Jurídico / Legal') {
    return { clientLabel: 'Cliente / Comitente', itemsLabel: 'Honorarios', numberLabel: 'N° de Factura' }
  }
  if (sector === 'Estudio Contable / Auditoría') {
    return { clientLabel: 'Cliente', itemsLabel: 'Honorarios / Servicios', numberLabel: 'N° de Factura' }
  }
  if (sector === 'Inmobiliaria') {
    return { clientLabel: 'Parte', itemsLabel: 'Operaciones / Comisiones', numberLabel: 'N° de Comprobante' }
  }
  if (DIGITAL_SECTORS.has(sector)) {
    return { clientLabel: 'Cliente', itemsLabel: 'Servicios Digitales', numberLabel: 'Invoice #' }
  }
  return { clientLabel: 'Cliente', itemsLabel: 'Servicios / Productos', numberLabel: 'N° de Factura' }
}
