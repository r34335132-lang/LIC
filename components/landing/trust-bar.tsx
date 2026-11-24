'use client'

import { motion } from 'framer-motion'
import { MapPin, MonitorPlay, Wallet } from 'lucide-react'

const items = [
  { icon: MapPin, title: 'Cobertura nacional', text: 'Estudia desde cualquier estado de México' },
  { icon: MonitorPlay, title: 'Modalidad virtual', text: 'Horarios flexibles para adultos que trabajan' },
  { icon: Wallet, title: 'Mensualidad desde $600', text: 'Pre-inscripción sin pago en línea' },
]

export function TrustBar() {
  return (
    <section aria-label="Ventajas principales" className="border-b border-slate-200 bg-white">
      <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-3 md:px-6 sm:py-10">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black text-slate-950">{item.title}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-600">{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
