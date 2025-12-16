import { Link } from 'react-router-dom';

/**
 * HomePage - The main landing page for AliCooks.
 *
 * This is a placeholder that will eventually show:
 * - List of user's dishes
 * - "Add Dish" button
 * - "Suggest Meal" button
 * - "Plan Menu" button
 */
export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AliCooks</h1>
          <p className="text-gray-600 mt-2">Meal planning made simple</p>
        </header>

        <main className="space-y-4">
          {/* Placeholder for dish list */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
            <p className="mb-4">Your dishes will appear here</p>
          </div>

          {/* Navigation to Add Dish */}
          <Link
            to="/add"
            className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Add a Dish
          </Link>
        </main>
      </div>
    </div>
  );
}

