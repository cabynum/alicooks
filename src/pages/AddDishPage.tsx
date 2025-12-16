import { Link } from 'react-router-dom';

/**
 * AddDishPage - Where users add new dishes to their collection.
 *
 * This is a placeholder that will eventually contain:
 * - DishForm component with name input and type selector
 * - Save and cancel actions
 */
export function AddDishPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add a Dish</h1>
          <p className="text-gray-600 mt-1">
            Add a new dish to your collection
          </p>
        </header>

        <main>
          {/* Placeholder for DishForm */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center mb-4">
              Dish form will go here
            </p>

            <div className="space-y-4">
              {/* Placeholder input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dish name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Spaghetti Bolognese"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>

              {/* Placeholder type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-gray-400">
                    Entree
                  </span>
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-gray-400">
                    Side
                  </span>
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-gray-400">
                    Other
                  </span>
                </div>
              </div>

              {/* Placeholder save button */}
              <button
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                disabled
              >
                Save Dish
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

