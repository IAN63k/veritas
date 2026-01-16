import { Navbar } from '@/app/components/layout/navbar'
import { Footer } from '@/app/components/layout/footer'

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}