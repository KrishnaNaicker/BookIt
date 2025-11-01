import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const [showCategories, setShowCategories] = useState(false);

  // UPDATE THESE TO MATCH YOUR DATABASE EXACTLY
  const categories = [
    'Aerial Adventures',
    'Water Sports',
    'Adventure & Food'
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">BookIt</span>
            <span className="ml-2 text-gray-600">Experiences</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Explore
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-1"
              >
                Categories
                <svg
                  className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showCategories && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategories(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          console.log('Selected category:', category);
                          navigate(`/?category=${encodeURIComponent(category)}`);
                          setShowCategories(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        navigate('/');
                        setShowCategories(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      All Categories
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;