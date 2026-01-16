'use client'

import { useEffect, useRef, useState } from 'react'
import { AntiCopyDetector, SuspiciousEvent, ProtectionLevel } from '@/lib/anti-copy/detectors'
import { createClient } from '@/lib/supabase/client'

interface UseAntiCopyProps {
    attemptId: string
    protectionLevel: ProtectionLevel
    maxWarnings?: number
    onBlock?: () => void
}

export function useAntiCopy({
    attemptId,
    protectionLevel,
    maxWarnings = 3,
    onBlock,
}: UseAntiCopyProps) {
    const [warnings, setWarnings] = useState(0)
    const [isBlocked, setIsBlocked] = useState(false)
    const detectorRef = useRef<AntiCopyDetector | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const logEventToDatabase = async (event: SuspiciousEvent) => {
            await supabase.from('suspicious_events').insert({
                attempt_id: attemptId,
                event_type: event.type,
                timestamp: event.timestamp.toISOString(),
                metadata: event.metadata || null,
            } as never)
        }

        const handleSuspiciousEvent = (event: SuspiciousEvent) => {
            setWarnings((prev) => prev + 1)
            logEventToDatabase(event)
        }

        const handleBlock = () => {
            setIsBlocked(true)
            onBlock?.()

            // Bloquear el intento en la base de datos
            supabase
                .from('evaluation_attempts')
                .update({ status: 'blocked' } as never)
                .eq('id', attemptId)
                .then()
        }

        detectorRef.current = new AntiCopyDetector({
            protectionLevel,
            onSuspiciousEvent: handleSuspiciousEvent,
            onBlock: handleBlock,
            maxWarnings,
        })

        detectorRef.current.start()

        return () => {
            detectorRef.current?.stop()
        }
    }, [attemptId, protectionLevel, maxWarnings, onBlock, supabase])

    return {
        warnings,
        isBlocked,
        warningCount: detectorRef.current?.getWarningCount() || 0,
    }
}