import { Route, Routes } from 'react-router'
import Sidebar from './components/Sidebar/Sidebar'
import HomePage from './pages/HomePage'
import FormGeneratorPage from './pages/FormGeneratorPage'
import SearchPage from './pages/SearchPage'
import SocketPage from './pages/SocketPage'

function App() {
  return (
    <div className="antialiased text-stone-950 bg-stone-100">
      <main className="grid gap-4 p-4 grid-cols-[220px_1fr]">
        <Sidebar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form-generator" element={<FormGeneratorPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/socket" element={<SocketPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
