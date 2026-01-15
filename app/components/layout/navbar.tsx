'use client'

import Link from 'next/link'
import { useAuth } from '@/app/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GraduationCap, LogOut, User } from 'lucide-react'

export function Navbar() {
    const { user, role, signOut } = useAuth()

    const getInitials = (name?: string) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <GraduationCap className="h-6 w-6" />
                    <span className="font-bold text-xl">Veritas</span>
                </Link>

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarFallback>
                                        {getInitials(user.user_metadata?.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.user_metadata?.name}</p>
                                    <p className="text-xs text-muted-foreground text-ellipsis truncate">{user.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {role === 'teacher' ? 'Profesor' : 'Estudiante'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={role === 'teacher' ? '/teacher/dashboard' : '/student/my-courses'}>
                                    <User className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    )
}