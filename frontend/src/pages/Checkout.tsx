import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingsAPI, promoAPI } from '../services/api';
import type { ExperienceWithSlots, Slot, PromoValidation } from '../types';

interface CheckoutState {
  experience: ExperienceWithSlots;
  slot: Slot;
  participants: number;
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState;

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state || !state.experience || !state.slot) {
    return (
      <div className="container-custom py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          No booking information found. Please start from the experience details page.
        </div>
      </div>
    );
  }

  const { experience, slot, participants } = state;
  const baseAmount = parseFloat(experience.price) * participants;
  const discountAmount = promoValidation?.valid ? (promoValidation.discount_amount || 0) : 0;
  const finalAmount = baseAmount - discountAmount;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePromoValidation = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }

    try {
      setPromoLoading(true);
      setError(null);
      const result = await promoAPI.validate(promoCode, baseAmount);

      if (result.valid) {
        setPromoValidation(result);
      } else {
        setPromoValidation(null);
        setError(result.message || 'Invalid promo code');
      }
    } catch (err: any) {
      setPromoValidation(null);
      setError(err.response?.data?.error || 'Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_name || !formData.user_email || !formData.user_phone) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        experience_id: experience.id,
        slot_id: slot.id,
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_phone: formData.user_phone,
        participants,
        promo_code: promoValidation?.valid ? promoCode : undefined,
      };

      const booking = await bookingsAPI.create(bookingData);

      navigate('/confirmation', { state: { booking } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="user_email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="user_email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="user_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="user_phone"
                    name="user_phone"
                    value={formData.user_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Promo Code</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (promoValidation) setPromoValidation(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter promo code"
                />
                <button
                  type="button"
                  onClick={handlePromoValidation}
                  disabled={promoLoading || !promoCode.trim()}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {promoLoading ? 'Validating...' : 'Apply'}
                </button>
              </div>

              {promoValidation?.valid && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Promo code applied! You save ${discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>

            <div className="mb-4">
              <img
                src={experience.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'}
                alt={experience.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-900">{experience.title}</h3>
              <p className="text-sm text-gray-600">{experience.location}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(slot.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Participants:</span>
                <span className="font-semibold text-gray-900">{participants}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${baseAmount.toFixed(2)}</span>
              </div>

              {promoValidation?.valid && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode}):</span>
                  <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-primary-600">${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;