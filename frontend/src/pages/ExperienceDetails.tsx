import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experiencesAPI } from '../services/api';
import type { ExperienceWithSlots, Slot } from '../types';

function ExperienceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<ExperienceWithSlots | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await experiencesAPI.getById(parseInt(id));
        setExperience(data);
      } catch (err) {
        setError('Failed to load experience details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id]);

  const handleBooking = () => {
    if (!selectedSlot || !experience) {
      alert('Please select a time slot');
      return;
    }

    navigate('/checkout', {
      state: {
        experience,
        slot: selectedSlot,
        participants,
      },
    });
  };

  const isSlotAvailable = (slot: Slot) => {
    return slot.capacity - slot.booked_count >= participants;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="container-custom py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Experience not found'}
        </div>
      </div>
    );
  }

  // Use available_slots if it exists, otherwise fall back to slots
  const slotsToDisplay = experience.available_slots || experience.slots || [];

  return (
    <div className="container-custom py-8">
      {/* Hero Image */}
      <div className="rounded-lg overflow-hidden mb-8">
        <img
          src={experience.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'}
          alt={experience.title}
          className="w-full h-96 object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            {experience.category && (
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                {experience.category}
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{experience.title}</h1>

            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {experience.location}
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {experience.duration}
              </div>

              {experience.rating && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-400 fill-current mr-1" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-semibold">{experience.rating}</span>
                  <span className="ml-1">({experience.reviews_count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Experience</h2>
            <p className="text-gray-700 leading-relaxed">{experience.description}</p>
          </div>

          {/* Available Slots */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Time Slot</h2>

            {slotsToDisplay.length > 0 ? (
              <div className="space-y-3">
                {slotsToDisplay.map((slot) => {
                  const available = isSlotAvailable(slot);
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => available && setSelectedSlot(slot)}
                      disabled={!available}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : available
                          ? 'border-gray-200 hover:border-primary-300 bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">{formatDate(slot.date)}</div>
                          <div className="text-gray-600">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                        </div>
                        <div className="text-right">
                          {available ? (
                            <div className="text-green-600 font-semibold">
                              {slot.capacity - slot.booked_count} spots left
                            </div>
                          ) : (
                            <div className="text-red-600 font-semibold">Fully Booked</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                No available slots at this time. Please check back later.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${experience.price}
              </div>
              <div className="text-gray-600">per person</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Participants
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  ${experience.price} x {participants} {participants === 1 ? 'person' : 'people'}
                </span>
                <span className="font-semibold">${(parseFloat(experience.price) * participants).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(parseFloat(experience.price) * participants).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedSlot
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedSlot ? 'Continue to Checkout' : 'Select a Time Slot'}
            </button>

            {selectedSlot && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800 font-semibold">Selected Slot:</div>
                <div className="text-sm text-green-700">
                  {formatDate(selectedSlot.date)}<br />
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperienceDetails;