import React, { createContext, useContext, useState } from "react";

type Toast = { id: number; message: string; colour: 'green' | 'red' | 'blue' };

type ToastContextType = {
    addToast: (message: string, colour: 'green' | 'red' | 'blue') => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, colour: 'green' | 'red' | 'blue') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, colour }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // FIX 1: Explicitly write out the full class strings so Tailwind scans them
    const getStyles = (colour: 'green' | 'red' | 'blue') => {
        if (colour === 'green') return "bg-green-300 text-green-800 border border-green-400";
        if (colour === 'red') return "bg-red-300 text-red-800 border border-red-400";
        return "bg-blue-300 text-blue-800 border border-blue-400";
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* FIX 2: Added pointer-events-none so your dashboard buttons remain clickable */}
            <div className="fixed top-[60px] right-10 flex flex-col-reverse gap-2 z-[500] pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`${getStyles(t.colour)} px-4 py-2 rounded shadow-md pointer-events-auto min-w-[150px] transition-all animate-slide-in duration-300`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
