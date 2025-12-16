import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, AddDishPage } from '@/pages';

/**
 * App - Root component with routing configuration.
 *
 * Routes:
 * - "/" : HomePage (dish list and main actions)
 * - "/add" : AddDishPage (add new dish form)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddDishPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
