import { useTheme } from '../store/ThemeContext';

const Setting = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="p-6 bg-[var(--back-primary)] min-h-screen">
            <div className={`max-w-md rounded-xl space-y-4 p-5  bg-[var(--back-primary)] text-[var(--front-primary)]`} >
                <h2 className="text-xl font-bold ">Settings</h2>
                <div className="flex items-center justify-between border-[2px] p-5 border-[var(--back-secondary)]">
                    <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-[var(--front-secondary)]">Current: {theme}
                        </p>
                    </div>

                    <button onClick={toggleTheme} className="px-4 py-2 rounded-lg font-medium transition-all bg-[var(--primary-color)] text-[var(--back-primary)]">
                        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default Setting;