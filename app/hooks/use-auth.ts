'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/app/types'

interface AuthState {
    user: User | null
    role: UserRole | null
    loading: boolean
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        role: null,
        loading: true,
    })
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthState({
                user: session?.user ?? null,
                role: (session?.user?.user_metadata?.role as UserRole) ?? null,
                loading: false,
            })
        })

        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthState({
                user: session?.user ?? null,
                role: (session?.user?.user_metadata?.role as UserRole) ?? null,
                loading: false,
            })
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return {
        ...authState,
        signOut,
    }
}