import React from 'react'
import { ToastProvider } from './ToastContext'
import { ThemeProvider } from './ThemeContext'

export const Store = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    )
}
