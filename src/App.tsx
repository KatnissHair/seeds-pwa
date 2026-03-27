import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Log } from './pages/Log';
import { Analysis } from './pages/Analysis';
import { Habits } from './pages/Habits';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/log" element={<Log />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/habits" element={<Habits />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
