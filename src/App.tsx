import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, AddDishPage, SuggestionPage } from '@/pages';

/**
 * App - Root component with routing configuration.
 *
 * Routes:
 * - "/" : HomePage (dish list and main actions)
 * - "/add" : AddDishPage (add new dish form)
 * - "/suggest" : SuggestionPage (get meal suggestions)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddDishPage />} />
        <Route path="/suggest" element={<SuggestionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
