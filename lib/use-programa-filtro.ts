'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'campus:programa-filtro'

/**
 * Filtro de carrera compartido entre paneles.
 * - Si solo hay 1 carrera: fija esa automáticamente y no guarda "todos".
 * - Si hay varias: recuerda la última selección en localStorage.
 */
export function useProgramaFiltro(programaIds: string[] = []) {
  const [programaFiltro, setProgramaFiltroState] = useState('todos')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const guardado = window.localStorage.getItem(STORAGE_KEY)
    if (guardado) setProgramaFiltroState(guardado)
    setHydrated(true)
  }, [])

  const setProgramaFiltro = useCallback((value: string) => {
    setProgramaFiltroState(value)
    window.localStorage.setItem(STORAGE_KEY, value)
  }, [])

  useEffect(() => {
    if (!hydrated || programaIds.length === 0) return

    if (programaIds.length === 1) {
      if (programaFiltro !== programaIds[0]) {
        setProgramaFiltroState(programaIds[0])
      }
      return
    }

    if (programaFiltro !== 'todos' && !programaIds.includes(programaFiltro)) {
      setProgramaFiltroState('todos')
      window.localStorage.setItem(STORAGE_KEY, 'todos')
    }
  }, [hydrated, programaIds, programaFiltro])

  return [programaFiltro, setProgramaFiltro] as const
}
