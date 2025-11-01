import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { experiencesAPI } from '../services/api';
import ExperienceCard from '../components/experience/ExperienceCard';
import type { Experience } from '../types';

function Home() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await experiencesAPI.getAll();
        setExperiences(data);
      } catch (err) {
        setError('Failed to load experiences. Please try again later.');
        console.error('Error fetching experiences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  // Filter experiences when category changes
  useEffect(() => {
    if (categoryParam) {
      console.log('Filtering by category:', categoryParam);
      const filtered = experiences.filter(
        exp => exp.category?.toLowerCase() === categoryParam.toLowerCase()
      );
      console.log('Filtered results:', filtered);
      setFilteredExperiences(filtered);
    } else {
      setFilteredExperiences(experiences);
    }
  }, [categoryParam, experiences]);

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Experiences
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Book unique travel experiences from kayaking adventures to hot air balloon rides
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="container-custom py-12">
        {/* Category Header */}
        {categoryParam && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {categoryParam}
            </h2>
            <p className="text-gray-600">
              {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'} found
            </p>
          </div>
        )}

        {/* Experiences Grid */}
        {filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No experiences found
            </h3>
            <p className="text-gray-500 mb-4">
              {categoryParam 
                ? `No experiences found in "${categoryParam}" category` 
                : 'No experiences available at the moment'}
            </p>
            {categoryParam && (
              <a
                href="/"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View All Experiences
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;