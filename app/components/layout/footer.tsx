export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center text-sm text-muted-foreground">
                    <span>Veritas v1.0.0-rc © {new Date().getFullYear()} Todos los derechos reservados</span>
                </div>
            </div>
        </footer>
    )
}
