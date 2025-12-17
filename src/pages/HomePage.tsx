import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useDishes } from '@/hooks';

/**
 * HomePage - The main landing page for AliCooks.
 *
 * Shows the user's dish collection and main actions.
 */
export function HomePage() {
  const { dishes, isLoading } = useDishes();

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">AliCooks</h1>
          <p className="text-stone-600 mt-2">Meal planning made simple</p>
        </header>

        <main className="space-y-4">
          {/* Dish list or placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {isLoading ? (
              <p className="text-center text-stone-500">Loading...</p>
            ) : dishes.length === 0 ? (
              <p className="text-center text-stone-500">
                No dishes yet. Add your first dish to get started!
              </p>
            ) : (
              <ul className="space-y-2">
                {dishes.map((dish) => (
                  <li
                    key={dish.id}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                  >
                    <span className="font-medium text-stone-900">{dish.name}</span>
                    <span className="text-sm text-stone-500 capitalize">{dish.type}</span>
                  </li>
                ))}
              </ul>
            )}
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
