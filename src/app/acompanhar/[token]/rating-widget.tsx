'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export function RatingWidget() {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="text-center py-2">
        <p className="font-semibold text-[var(--color-success)]">Obrigado pela avaliação! ⭐</p>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">Sua opinião é muito importante para nós.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            onMouseEnter={() => setHover(nota)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setSelected(nota)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`size-9 transition-colors ${
                nota <= (hover || selected)
                  ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                  : 'text-[var(--color-border)]'
              }`}
            />
          </button>
        ))}
      </div>
      {selected > 0 && (
        <button
          onClick={() => setSubmitted(true)}
          className="mt-4 w-full rounded-[var(--radius-md)] bg-[var(--color-brand-600)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-700)] transition-colors"
        >
          Enviar avaliação
        </button>
      )}
    </>
  )
}
