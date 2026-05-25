'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/marketing'

type ProgramViewTrackerProps = {
  programId: string
  programName: string
}

export function ProgramViewTracker({ programId, programName }: ProgramViewTrackerProps) {
  useEffect(() => {
    trackEvent('view_program', { programId, programName })
  }, [programId, programName])

  return null
}
