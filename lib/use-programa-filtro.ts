'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'profesor:programa-filtro'

export function useProgramaFiltro() {
  const [programaFiltro, setProgramaFiltroState] = useState('todos')

  useEffect(() => {
    const guardado = window.localStorage.getItem(STORAGE_KEY)
    if (guardado) setProgramaFiltroState(guardado)
  }, [])

  const setProgramaFiltro = useCallback((value: string) => {
    setProgramaFiltroState(value)
    window.localStorage.setItem(STORAGE_KEY, value)
  }, [])

  return [programaFiltro, setProgramaFiltro] as const
}
