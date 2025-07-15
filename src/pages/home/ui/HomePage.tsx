import { useState, type FC } from "react";
import reactLogo from '@/shared/assets/react.svg'
import viteLogo from '/vite.svg'
import { useErrorToast } from "@/shared/lib/error-handling";

const HomePage: FC = () => {
    const [count, setCount] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const { showToast } = useErrorToast();

    const toggleDarkMode = () => {
        try {
            setDarkMode(!darkMode);
            document.documentElement.classList.toggle('dark');
            showToast(`${darkMode ? '라이트' : '다크'} 모드로 변경되었습니다.`, 'success');
        } catch (error) {
            showToast('다크모드 전환 중 오류가 발생했습니다.');
        }
    };

    const incrementCount = () => {
        try {
            if (count >= 10) {
                throw new Error('카운터가 최대값(10)에 도달했습니다.');
            }
            setCount(count + 1);

            if (count + 1 === 10) {
                showToast('최대값에 도달했습니다!', 'warning');
            }
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    };

    const decrementCount = () => {
        try {
            if (count <= 0) {
                throw new Error('카운터가 최소값(0)에 도달했습니다.');
            }
            setCount(count - 1);
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    };

    const resetCount = () => {
        try {
            setCount(0);
            showToast('카운터가 리셋되었습니다.', 'success');
        } catch (error) {
            showToast('카운터 리셋 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            darkMode
                ? 'dark bg-gray-900 text-white'
                : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
            <header className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex justify-between items-center">
                    <h1 className={`text-xl md:text-2xl font-bold transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        My Vite + React App
                    </h1>
                    <button
                        onClick={toggleDarkMode}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-all duration-300 
                            transform hover:scale-105 active:scale-95
                            ${darkMode
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-yellow-500/20'
                            : 'bg-gray-800 hover:bg-gray-700 text-white shadow-gray-800/20'
                        } 
                            shadow-lg hover:shadow-xl
                        `}
                        aria-label={`${darkMode ? '라이트' : '다크'} 모드로 전환`}
                    >
                        {darkMode ? '☀️ Light' : '🌙 Dark'}
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 pb-16">
                <section className="text-center mb-12 md:mb-16">
                    <div className="flex justify-center items-center gap-6 md:gap-8 mb-8">
                        <a
                            href="https://vite.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <img
                                src={viteLogo}
                                className="h-16 w-16 md:h-24 md:w-24 transition-transform duration-300 group-hover:scale-110 animate-bounce"
                                alt="Vite logo"
                                style={{
                                    animationDuration: '3s',
                                    animationIterationCount: 'infinite'
                                }}
                            />
                        </a>
                        <div className={`text-4xl md:text-6xl font-bold transition-colors ${
                            darkMode ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                            +
                        </div>
                        <a
                            href="https://react.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <img
                                src={reactLogo}
                                className="h-16 w-16 md:h-24 md:w-24 transition-transform duration-300 group-hover:scale-110"
                                alt="React logo"
                                style={{
                                    animation: 'spin 20s linear infinite',
                                    transformOrigin: 'center'
                                }}
                            />
                        </a>
                    </div>

                    <h1 className={`text-3xl md:text-5xl font-bold mb-4 transition-all duration-500 ${
                        darkMode
                            ? 'text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                    }`}>
                        Vite + React + Tailwind v4
                    </h1>

                    <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto transition-colors ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        빠른 개발을 위한 현대적인 프론트엔드 스택으로 구축된 웹 애플리케이션
                    </p>
                </section>

                <section className="flex justify-center">
                    <div className={`
                        p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-500
                        border min-w-80 max-w-md w-full
                        ${darkMode
                        ? 'bg-gray-800/90 border-gray-700 shadow-gray-900/50'
                        : 'bg-white/80 border-gray-200 shadow-gray-500/20'
                    }
                    `}>
                        <h2 className={`text-xl md:text-2xl font-semibold mb-6 transition-colors ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            인터랙티브 카운터
                        </h2>

                        <div className="mb-8">
                            <div className={`
                                text-6xl md:text-7xl font-bold mb-4 transition-all duration-300
                                ${darkMode ? 'text-blue-400' : 'text-blue-600'}
                                ${count >= 10 ? 'animate-pulse text-red-500' : ''}
                            `}>
                                {count}
                            </div>

                            <div className={`w-full h-2 rounded-full mb-6 ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                                <div
                                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                                    style={{ width: `${(count / 10) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button
                                onClick={decrementCount}
                                disabled={count <= 0}
                                className={`
                                    py-3 px-4 rounded-lg font-medium transition-all duration-200 
                                    transform hover:scale-105 active:scale-95
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    ${darkMode
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                                } 
                                    shadow-lg hover:shadow-xl
                                `}
                                data-testid="decrement"
                                aria-label={`카운터 감소, 현재 값: ${count}`}
                            >
                                감소 -
                            </button>

                            <button
                                onClick={resetCount}
                                className={`
                                    py-3 px-4 rounded-lg font-medium transition-all duration-200 
                                    transform hover:scale-105 active:scale-95
                                    ${darkMode
                                    ? 'bg-gray-600 hover:bg-gray-500 text-white shadow-gray-600/30'
                                    : 'bg-gray-500 hover:bg-gray-600 text-white shadow-gray-500/30'
                                } 
                                    shadow-lg hover:shadow-xl
                                `}
                                data-testid="reset"
                                aria-label="카운터 리셋"
                            >
                                리셋
                            </button>

                            <button
                                onClick={incrementCount}
                                disabled={count >= 10}
                                className={`
                                    py-3 px-4 rounded-lg font-medium transition-all duration-200 
                                    transform hover:scale-105 active:scale-95
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    ${darkMode
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30'
                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
                                } 
                                    shadow-lg hover:shadow-xl
                                `}
                                data-testid="increment"
                                aria-label={`카운터 증가, 현재 값: ${count}`}
                            >
                                증가 +
                            </button>
                        </div>
                    </div>
                </section>

                <footer className="text-center mt-12 md:mt-16">
                    <p className={`text-sm mb-4 transition-colors ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        🎉 Vite와 React 로고를 클릭하여 더 자세히 알아보세요
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {[
                            { href: "https://vitejs.dev/guide/", text: "📖 Vite 문서" },
                            { href: "https://react.dev/learn", text: "📖 React 문서" },
                            { href: "https://tailwindcss.com/docs", text: "📖 Tailwind 문서" }
                        ].map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                                    text-sm px-3 py-2 rounded-lg transition-all duration-200 
                                    hover:scale-105 active:scale-95
                                    ${darkMode
                                    ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                                }
                                `}
                            >
                                {link.text}
                            </a>
                        ))}
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default HomePage;