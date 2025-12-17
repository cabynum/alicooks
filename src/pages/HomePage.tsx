import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

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
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">AliCooks</h1>
          <p className="text-stone-600 mt-2">Meal planning made simple</p>
        </header>

        <main className="space-y-4">
          {/* Placeholder for dish list */}
          <div className="bg-white rounded-xl p-6 shadow-sm text-center text-stone-500">
            <p>Your dishes will appear here</p>
          </div>

          {/* Navigation to Add Dish */}
          <Link to="/add">
            <Button variant="primary" fullWidth>
              Add a Dish
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
}
