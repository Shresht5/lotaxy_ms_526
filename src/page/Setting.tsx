import { useState } from 'react';
import { useTheme } from '../store/ThemeContext';
import { useToast } from '../store/ToastContext';

const Setting = () => {
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();

    const [password, setPassword] = useState(
        localStorage.getItem('password') || ''
    );

    const savePassword = () => {
        localStorage.setItem('password', password);
        sessionStorage.removeItem('authenticated');
    };

    return (
        <div className="min-h-screen bg-[var(--back-primary)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--front-primary)]">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-[var(--front-secondary)]">
                        Manage application preferences and security.
                    </p>
                </div>

                <div className="space-y-6">

                    {/* Theme */}
                    <div className="rounded-2xl border border-[var(--back-secondary)] bg-[var(--back-primary)] p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold text-[var(--front-primary)]">
                            Appearance
                        </h2>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="font-medium text-[var(--front-primary)]">
                                    Theme
                                </p>

                                <p className="mt-1 text-sm text-[var(--front-secondary)]">
                                    Current theme: {theme}
                                </p>
                            </div>

                            <button
                                onClick={() => { toggleTheme(); addToast(`Theme : ${theme === 'dark' ? 'Light' : 'Dark'}`, 'blue') }}
                                className="rounded-lg bg-[var(--primary-color)] px-5 py-2.5 font-medium text-[var(--back-primary)] transition hover:opacity-90"
                            >
                                {theme === 'dark'
                                    ? 'Switch to Light'
                                    : 'Switch to Dark'}
                            </button>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-2xl border border-[var(--back-secondary)] bg-[var(--back-primary)] p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold text-[var(--front-primary)]">
                            Security
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--front-primary)]">
                                    Application Password
                                </label>

                                <input
                                    type="text"
                                    value={password}
                                    placeholder="Leave empty to disable password"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-[var(--back-secondary)] bg-[var(--back-primary)] px-4 py-3 text-[var(--front-primary)] placeholder:text-[var(--front-secondary)] focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => { savePassword(); addToast('Password Saved', 'green') }}
                                    className="rounded-lg bg-[var(--primary-color)] px-5 py-2.5 font-medium text-[var(--back-primary)] transition hover:opacity-90"
                                >
                                    Save Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Setting;