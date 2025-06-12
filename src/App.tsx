import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
    const [count, setCount] = useState(0)
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle('dark')
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
            <header className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center">
                    <h1 className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                        My Vite + React App
                    </h1>
                    <button
                        onClick={toggleDarkMode}
                        className="btn btn-secondary"
                    >
                        {darkMode ? '☀️ Light' : '🌙 Dark'}
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 pb-16">
                <section className="text-center mb-16">
                    <div className="flex justify-center items-center gap-8 mb-8">
                        <a
                            href="https://vite.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="logo-animation"
                        >
                            <img
                                src={viteLogo}
                                className="h-24 w-24 animate-float"
                                alt="Vite logo"
                            />
                        </a>
                        <div className={`text-6xl font-bold ${
                            darkMode ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                            +
                        </div>
                        <a
                            href="https://react.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="logo-animation"
                        >
                            <img
                                src={reactLogo}
                                className="h-24 w-24 animate-spin-slow"
                                alt="React logo"
                                style={{ animation: 'spin 20s linear infinite' }}
                            />
                        </a>
                    </div>

                    <h1 className={`text-5xl font-bold mb-4 ${
                        darkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                    }`}>
                        Vite + React + Tailwind v4
                    </h1>

                    <p className={`text-xl mb-8 max-w-2xl mx-auto ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        빠른 개발을 위한 현대적인 프론트엔드 스택으로 구축된 웹 애플리케이션
                    </p>
                </section>

                <section className="text-center">
                    <div className={`card inline-block min-w-80 ${
                        darkMode ? 'bg-gray-800 border-gray-700' : ''
                    }`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            인터랙티브 카운터
                        </h2>

                        <div className="mb-8">
                            <div className={`text-6xl font-bold mb-4 ${
                                count > 10 ? 'text-accent-500' :
                                    count > 5 ? 'text-primary-500' :
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                            } transition-colors duration-300`}>
                                {count}
                            </div>

                            <div className="flex justify-center gap-4 mb-6">
                                <button
                                    onClick={() => setCount(count - 1)}
                                    className="btn bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
                                    disabled={count <= 0}
                                >
                                    감소 -
                                </button>
                                <button
                                    onClick={() => setCount(count + 1)}
                                    className="btn-primary"
                                >
                                    증가 +
                                </button>
                                <button
                                    onClick={() => setCount(0)}
                                    className="btn btn-secondary"
                                >
                                    리셋
                                </button>
                            </div>
                        </div>

                        <div className={`text-sm p-4 rounded-lg ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                        }`}>
                            💡 <strong>개발 팁:</strong> <code className={`px-2 py-1 rounded ${
                            darkMode ? 'bg-gray-600' : 'bg-white'
                        }`}>src/App.jsx</code> 파일을 수정하고 저장하면 HMR이 즉시 반영됩니다
                        </div>
                    </div>
                </section>

                {/* Footer Info */}
                <footer className="text-center mt-16">
                    <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        🎉 Vite와 React 로고를 클릭하여 더 자세히 알아보세요
                    </p>

                    <div className="flex justify-center gap-6 mt-4">
                        <a
                            href="https://vitejs.dev/guide/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm hover:text-primary-500 transition-colors ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            📖 Vite 문서
                        </a>
                        <a
                            href="https://react.dev/learn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm hover:text-primary-500 transition-colors ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            📖 React 문서
                        </a>
                        <a
                            href="https://tailwindcss.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm hover:text-primary-500 transition-colors ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            📖 Tailwind 문서
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default App