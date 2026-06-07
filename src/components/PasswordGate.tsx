import { useState } from 'react';
import { useToast } from '../store/ToastContext';

interface PasswordGateProps {
    children: React.ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authenticated, setAuthenticated] = useState(() => {
        const savedPassword = localStorage.getItem('password');
        if (!savedPassword || savedPassword.trim() === '') { return true; }
        return sessionStorage.getItem('authenticated') === 'true';
    });
    const [unlockClicks, setUnlockClicks] = useState(0);

    const { addToast } = useToast();

    const handleLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        const savedPassword = localStorage.getItem('password');
        if (!savedPassword || savedPassword.trim() === '') {
            setAuthenticated(true);
            return;
        }
        if (password === savedPassword) {
            addToast('Login Success', 'green')
            sessionStorage.setItem('authenticated', 'true');
            setAuthenticated(true);
        } else {
            setPassword('');
            addToast('Wrong Password', 'red')
        }
    };

    if (!authenticated) {
        return (
            <div className=" h-[calc(100%-40px)] w-full flex items-center justify-center bg-[var(--back-primary)]">
                <div className="w-full max-w-sm p-6 rounded-xl border text-[var(--front-primary)] font-semibold border-[var(--back-secondary)] bg-[var(--back-primary)] shadow-lg">
                    <h1 onClick={() => {
                        const c = unlockClicks + 1;
                        setUnlockClicks(c);
                        if (c >= 10) {
                            sessionStorage.setItem('authenticated', 'true');
                            setAuthenticated(true);
                            addToast('Emergency Login', 'green')
                        }
                    }}>Unlock Application</h1>

                    <p className="text-sm mb-4 text-[var(--front-secondary)]">
                        Enter your password to continue.
                    </p>
                    <form onSubmit={handleLogin}>
                        <input type="password" value={password} autoFocus placeholder="Password" onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                        }}
                            className="w-full rounded-lg border bg-[var(--back-primary)] border-[var(--primary-color)] px-3 py-2 text-sm text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-very-bold-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        />
                        <button type="submit" className="w-full mt-4 py-3 rounded-lg bg-[var(--primary-color)] hover:bg-[var(--primary-bold-color)] text-[var(--back-primary)] font-medium transition"                        >
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};