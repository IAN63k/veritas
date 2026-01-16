'use client'

export interface SuspiciousEvent {
    type: 'copy' | 'paste' | 'cut' | 'keycombo' | 'blur' | 'devtools' | 'context_menu' | 'selection'
    timestamp: Date
    metadata?: Record<string, any>
}

export type ProtectionLevel = 'low' | 'medium' | 'high'

export interface AntiCopyConfig {
    protectionLevel: ProtectionLevel
    onSuspiciousEvent: (event: SuspiciousEvent) => void
    onBlock?: () => void
    maxWarnings?: number
}

export class AntiCopyDetector {
    private config: AntiCopyConfig
    private warningCount = 0
    private cleanupFunctions: (() => void)[] = []
    private devToolsCheckInterval?: NodeJS.Timeout
    private blurTimeout?: NodeJS.Timeout

    constructor(config: AntiCopyConfig) {
        this.config = config
    }

    start() {
        if (this.config.protectionLevel === 'low') {
            this.setupLowProtection()
        } else if (this.config.protectionLevel === 'medium') {
            this.setupMediumProtection()
        } else {
            this.setupHighProtection()
        }
    }

    stop() {
        this.cleanupFunctions.forEach(cleanup => cleanup())
        this.cleanupFunctions = []

        if (this.devToolsCheckInterval) {
            clearInterval(this.devToolsCheckInterval)
        }
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout)
        }
    }

    private setupLowProtection() {
        // Solo logging básico, sin bloqueo
        this.setupCopyPasteDetection(false)
        this.setupContextMenuDetection(false)
    }

    private setupMediumProtection() {
        // Logging + prevención de acciones
        this.setupCopyPasteDetection(true)
        this.setupContextMenuDetection(true)
        this.setupKeyboardShortcuts()
        this.setupBlurDetection()
        this.setupSelectionDetection()
    }

    private setupHighProtection() {
        // Todo lo anterior + DevTools detection + auto-block
        this.setupCopyPasteDetection(true)
        this.setupContextMenuDetection(true)
        this.setupKeyboardShortcuts()
        this.setupBlurDetection()
        this.setupDevToolsDetection()
        this.setupSelectionDetection()
        this.setupVisibilityDetection()
    }

    private logEvent(event: SuspiciousEvent) {
        this.warningCount++
        this.config.onSuspiciousEvent(event)

        // Auto-block en nivel alto
        if (
            this.config.protectionLevel === 'high' &&
            this.config.maxWarnings &&
            this.warningCount >= this.config.maxWarnings
        ) {
            this.config.onBlock?.()
        }
    }

    private setupCopyPasteDetection(prevent: boolean) {
        const handleCopy = (e: ClipboardEvent) => {
            this.logEvent({ type: 'copy', timestamp: new Date() })
            if (prevent) e.preventDefault()
        }

        const handlePaste = (e: ClipboardEvent) => {
            this.logEvent({ type: 'paste', timestamp: new Date() })
            if (prevent) e.preventDefault()
        }

        const handleCut = (e: ClipboardEvent) => {
            this.logEvent({ type: 'cut', timestamp: new Date() })
            if (prevent) e.preventDefault()
        }

        document.addEventListener('copy', handleCopy)
        document.addEventListener('paste', handlePaste)
        document.addEventListener('cut', handleCut)

        this.cleanupFunctions.push(() => {
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('paste', handlePaste)
            document.removeEventListener('cut', handleCut)
        })
    }

    private setupContextMenuDetection(prevent: boolean) {
        const handleContextMenu = (e: MouseEvent) => {
            this.logEvent({ type: 'context_menu', timestamp: new Date() })
            if (prevent) e.preventDefault()
        }

        document.addEventListener('contextmenu', handleContextMenu)

        this.cleanupFunctions.push(() => {
            document.removeEventListener('contextmenu', handleContextMenu)
        })
    }

    private setupKeyboardShortcuts() {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Detectar combinaciones sospechosas
            const isSuspicious =
                (e.ctrlKey || e.metaKey) &&
                ['c', 'v', 'x', 'a', 'p', 's', 'f'].includes(e.key.toLowerCase())

            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
            const isDevTools =
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) &&
                    e.shiftKey &&
                    ['i', 'j', 'c'].includes(e.key.toLowerCase()))

            if (isSuspicious || isDevTools) {
                this.logEvent({
                    type: 'keycombo',
                    timestamp: new Date(),
                    metadata: { key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey },
                })
                e.preventDefault()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        this.cleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeyDown)
        })
    }

    private setupBlurDetection() {
        let blurStartTime: number | null = null

        const handleBlur = () => {
            blurStartTime = Date.now()

            // Dar 3 segundos de gracia antes de registrar
            this.blurTimeout = setTimeout(() => {
                if (blurStartTime) {
                    this.logEvent({
                        type: 'blur',
                        timestamp: new Date(),
                        metadata: { duration: Date.now() - blurStartTime },
                    })
                }
            }, 3000)
        }

        const handleFocus = () => {
            if (this.blurTimeout) {
                clearTimeout(this.blurTimeout)
            }
            blurStartTime = null
        }

        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)

        this.cleanupFunctions.push(() => {
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
            if (this.blurTimeout) {
                clearTimeout(this.blurTimeout)
            }
        })
    }

    private setupDevToolsDetection() {
        // Detectar DevTools abierto mediante diferencia de tamaño de ventana
        const detectDevTools = () => {
            const threshold = 160
            const widthDiff = window.outerWidth - window.innerWidth
            const heightDiff = window.outerHeight - window.innerHeight

            if (widthDiff > threshold || heightDiff > threshold) {
                this.logEvent({
                    type: 'devtools',
                    timestamp: new Date(),
                    metadata: { widthDiff, heightDiff },
                })
            }
        }

        this.devToolsCheckInterval = setInterval(detectDevTools, 1000)

        this.cleanupFunctions.push(() => {
            if (this.devToolsCheckInterval) {
                clearInterval(this.devToolsCheckInterval)
            }
        })
    }

    private setupSelectionDetection() {
        let selectionTimeout: NodeJS.Timeout

        const handleSelectionChange = () => {
            clearTimeout(selectionTimeout)

            selectionTimeout = setTimeout(() => {
                const selection = window.getSelection()
                if (selection && selection.toString().length > 50) {
                    this.logEvent({
                        type: 'selection',
                        timestamp: new Date(),
                        metadata: { length: selection.toString().length },
                    })
                }
            }, 500)
        }

        document.addEventListener('selectionchange', handleSelectionChange)

        this.cleanupFunctions.push(() => {
            document.removeEventListener('selectionchange', handleSelectionChange)
            clearTimeout(selectionTimeout)
        })
    }

    private setupVisibilityDetection() {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                this.logEvent({
                    type: 'blur',
                    timestamp: new Date(),
                    metadata: { reason: 'tab_hidden' },
                })
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        this.cleanupFunctions.push(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        })
    }

    getWarningCount() {
        return this.warningCount
    }
}