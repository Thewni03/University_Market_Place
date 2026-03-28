import React, { useState, useEffect } from 'react';

const RatingReview = () => {
  const [hoveredStar, setHoveredStar] = useState(null);
  const [ratings, setRatings] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [animateBars, setAnimateBars] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const totalReviews = Object.values(ratings).reduce((a, b) => a + b, 0);
  const averageRating = totalReviews > 0 ? (Object.entries(ratings).reduce((acc, [stars, count]) =>
    acc + (parseInt(stars) * count), 0) / totalReviews).toFixed(1) : "0.0";

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(r => ({ ...r, id: r._id }));
        setReviews(mappedData);
        const newRatings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        mappedData.forEach(r => {
          if (newRatings[r.rating] !== undefined) newRatings[r.rating]++;
        });
        setRatings(newRatings);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    setAnimateBars(true);
    fetchReviews();
  }, []);

  const handleReviewSubmit = async () => {
    if (newReview.trim() && newRating > 0) {
      const animals = ['🦊', '🐼', '🦁', '🐨', '🐧', '🦉', '🐰', '🦝'];
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      try {
        const response = await fetch('http://localhost:5000/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: newRating, comment: newReview, name: 'You', avatar: randomAnimal, avatarBg: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]', isOwn: true })
        });
        if (response.ok) {
          fetchReviews(); setNewReview(''); setNewRating(0);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to submit review');
        }
      } catch (error) { console.error('Error:', error); }
    }
  };

  const handleLike = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    const isLiking = !review.liked;
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: isLiking ? r.likes + 1 : Math.max(0, r.likes - 1), liked: isLiking } : r));
    try {
      await fetch(`http://localhost:5000/api/reviews/${reviewId}/like`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ increment: isLiking })
      });
    } catch (error) { console.error('Error:', error); }
  };

  const handleReplyClick = (reviewId) => {
    setActiveReplyId(activeReplyId === reviewId ? null : reviewId);
    setReplyText('');
  };

  const handleReplySubmit = async (reviewId) => {
    if (replyText.trim()) {
      const animals = ['🦊', '🐼', '🦁', '🐨', '🐧', '🦉', '🐰', '🦝'];
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/reply`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: replyText, name: 'You', avatar: randomAnimal, avatarBg: 'bg-gradient-to-br from-[#667EEA] to-[#764BA2]' })
        });
        if (response.ok) { fetchReviews(); setActiveReplyId(null); setReplyText(''); }
        else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to submit reply');
        }
      } catch (error) { console.error('Error:', error); }
    }
  };

  const handleEditClick = (review) => { setEditingReview(review.id); };
  const handleEditCancel = () => { setEditingReview(null); };

  const handleEditSave = async (reviewId, oldRating, newText, newRating) => {
    if (newText.trim() && newRating > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: newRating, comment: newText })
        });
        if (response.ok) { fetchReviews(); setEditingReview(null); }
        else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to update review');
        }
      } catch (error) { console.error('Error:', error); }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (response.ok) { fetchReviews(); setDeleteConfirm(null); }
    } catch (error) { console.error('Error:', error); }
  };

  // Handle see more reviews
  const handleSeeMore = () => {
    setVisibleReviews(prev => prev + 3);
  };

  // Star rating component
  const StarRating = ({ rating, interactive = false, size = "small", onRatingChange, hoveredStar: externalHoveredStar, setHoveredStar: externalSetHoveredStar }) => {
    const starSize = size === "large" ? "w-6 h-6" : "w-4 h-4";
    const [internalHoveredStar, setInternalHoveredStar] = useState(null);

    const currentHoveredStar = externalHoveredStar !== undefined ? externalHoveredStar : internalHoveredStar;
    const currentSetHoveredStar = externalSetHoveredStar || setInternalHoveredStar;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} transition-all duration-300 ${interactive ? 'cursor-pointer hover:drop-shadow-glow' : 'cursor-default'} ${interactive && currentHoveredStar >= star ? 'scale-110 drop-shadow-glow' : ''
              }`}
            onMouseEnter={() => interactive && currentSetHoveredStar(star)}
            onMouseLeave={() => interactive && currentSetHoveredStar(null)}
            onClick={() => {
              if (interactive && onRatingChange) {
                onRatingChange(star);
              }
            }}
            viewBox="0 0 24 24"
            fill={star <= rating ? "#FFB347" : "#E5E7EB"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke={star <= rating ? "#FF9F1C" : "#D1D5DB"}
              strokeWidth="1"
              fill={star <= rating ? "#FFB347" : "#E5E7EB"}
              className="transition-all duration-300"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0);
        }
        25% {
          transform: translateY(-30px) translateX(15px);
        }
        50% {
          transform: translateY(-15px) translateX(-15px);
        }
        75% {
          transform: translateY(-45px) translateX(10px);
        }
      }

      @keyframes float-subtle {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes bounce-subtle {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes pulse-subtle {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out;
      }

      .animate-slideIn {
        animation: slideIn 0.6s ease-out forwards;
        opacity: 0;
      }

      .animate-float {
        animation: float 25s infinite ease-in-out;
      }

      .animate-float-subtle {
        animation: float-subtle 4s infinite ease-in-out;
      }

      .animate-bounce-subtle {
        animation: bounce-subtle 0.5s ease-in-out;
      }

      .animate-pulse-subtle {
        animation: pulse-subtle 2s infinite ease-in-out;
      }

      .animate-gradient {
        background-size: 200% 200%;
        animation: gradientShift 15s ease infinite;
      }

      .drop-shadow-glow {
        filter: drop-shadow(0 0 8px rgba(255, 179, 71, 0.5));
      }

      .border-gradient-to-b {
        border-image: linear-gradient(to bottom, #e5e7eb, #f3f4f6) 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Floating particles component with 2026 colors
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => {
        const colors = [
          'from-[#FF6B6B]/10 to-[#FF8E53]/10',
          'from-[#4ECDC4]/10 to-[#45B7D1]/10',
          'from-[#FFB347]/10 to-[#FF9F1C]/10',
          'from-[#A06AB4]/10 to-[#C06BB4]/10',
          'from-[#667EEA]/10 to-[#764BA2]/10',
          'from-[#5D9B9B]/10 to-[#4A7C7C]/10'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r ${randomColor} animate-float`}
            style={{
              width: Math.random() * 15 + 5 + 'px',
              height: Math.random() * 15 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 8 + 's',
              animationDuration: Math.random() * 20 + 20 + 's',
              filter: 'blur(2px)'
            }}
          />
        );
      })}
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = ({ reviewId, rating, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl border border-gray-100">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-full flex items-center justify-center animate-bounce-subtle">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Review</h3>
        <p className="text-gray-500 text-center mb-6">Are you sure you want to delete your review? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reviewId, rating)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white font-medium rounded-xl hover:from-[#FF5252] hover:to-[#FF7043] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#FF6B6B]/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Review Modal
  const EditReviewModal = ({ review, onSave, onCancel }) => {
    const [localEditText, setLocalEditText] = useState(review.comment);
    const [localEditRating, setLocalEditRating] = useState(review.rating);
    const [localHoveredStar, setLocalHoveredStar] = useState(null);

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
        <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100">
          <h3 className="text-xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
            Edit Your Review
          </h3>

          {/* Rating Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
            <StarRating
              rating={localEditRating}
              interactive={true}
              size="large"
              onRatingChange={setLocalEditRating}
              hoveredStar={localHoveredStar}
              setHoveredStar={setLocalHoveredStar}
            />
          </div>

          {/* Review Input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Your Review</label>
            <textarea
              value={localEditText}
              onChange={(e) => setLocalEditText(e.target.value)}
              placeholder="Share your experience with our platform..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]/30 focus:border-[#667EEA] transition-all resize-none"
              rows="4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (localEditText.trim() && localEditRating > 0) {
                  onSave(review.id, review.rating, localEditText, localEditRating);
                }
              }}
              disabled={!localEditText.trim() || localEditRating === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${localEditText.trim() && localEditRating > 0
                ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-lg shadow-[#667EEA]/30 hover:shadow-xl hover:shadow-[#667EEA]/40 hover:scale-105 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F8F9FF] via-[#F0F3FF] to-[#E9ECFF] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B]/5 via-[#4ECDC4]/5 to-[#667EEA]/5 animate-gradient"></div>

      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmationModal
          reviewId={deleteConfirm.id}
          rating={deleteConfirm.rating}
          onConfirm={handleDeleteReview}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={reviews.find(r => r.id === editingReview)}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Page Transition Effect */}
        <div className="animate-fadeIn">
          {/* Rating Summary Card - Modern Glassmorphism with 2026 Colors */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(102,126,234,0.3)] p-8 mb-8 border border-white/50 hover:shadow-[0_25px_70px_-15px_rgba(102,126,234,0.4)] transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Average Rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <span className="text-6xl font-bold bg-gradient-to-r from-[#667EEA] via-[#764BA2] to-[#A06AB4] bg-clip-text text-transparent">
                    {averageRating}
                  </span>
                  <div className="flex flex-col items-start">
                    <StarRating rating={Math.round(parseFloat(averageRating))} size="large" />
                    <span className="text-sm text-[#6B7280] mt-1">Based on {totalReviews} verified reviews</span>
                  </div>
                </div>
              </div>

              {/* Rating Breakdown Bars */}
              <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = (ratings[star] / totalReviews) * 100;
                  const barColor = star === 5
                    ? 'from-[#FFB347] to-[#FF9F1C]'
                    : star === 4
                      ? 'from-[#4ECDC4] to-[#45B7D1]'
                      : 'from-[#9CA3AF] to-[#6B7280]';

                  return (
                    <div key={star} className="flex items-center gap-3 group">
                      <span className="text-sm font-medium text-[#4B5563] w-8">{star} ★</span>
                      <div className="flex-1 h-2.5 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-[#FFB347]/30`}
                          style={{
                            width: animateBars ? `${percentage}%` : '0%',
                            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </div>
                      <span className="text-sm text-[#6B7280] w-12">{ratings[star]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Reviews Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">Customer Reviews</h2>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <span className="text-sm text-[#667EEA] font-semibold">✨ {reviews.length} reviews</span>
            </div>
          </div>

          {/* Write Review Section */}
          <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(102,126,234,0.2)] border border-white/50 hover:shadow-[0_15px_50px_-10px_rgba(102,126,234,0.3)] transition-all duration-300">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent mb-4">
              Write a Review
            </h3>

            {/* Rating Selection */}
            <div className="mb-4">
              <label className="block text-sm text-[#4B5563] mb-2">Your Rating</label>
              <StarRating
                rating={newRating}
                interactive={true}
                size="large"
                onRatingChange={setNewRating}
              />
              {newRating === 0 && (
                <p className="text-xs text-[#9CA3AF] mt-1 animate-pulse-subtle">Click on stars to rate</p>
              )}
            </div>

            {/* Review Input */}
            <div className="mb-4">
              <label className="block text-sm text-[#4B5563] mb-2">Your Review</label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your experience with our platform..."
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]/30 focus:border-[#667EEA] transition-all resize-none"
                rows="4"
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleReviewSubmit}
                disabled={!newReview.trim() || newRating === 0}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${newReview.trim() && newRating > 0
                  ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-lg shadow-[#667EEA]/30 hover:shadow-xl hover:shadow-[#667EEA]/40 hover:scale-105 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-4 h-4 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Review
              </button>
            </div>
          </div>

          {/* Review Cards Grid */}
          <div className="space-y-6">
            {reviews.slice(0, visibleReviews).map((review, index) => (
              <div
                key={review.id}
                className="group bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(102,126,234,0.3)] transition-all duration-500 hover:-translate-y-1 border border-white/50 animate-slideIn relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Action Buttons - Only show for own reviews */}
                {review.isOwn && (
                  <div className="absolute bottom-4 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleEditClick(review)}
                      className="w-8 h-8 bg-gradient-to-br from-[#667EEA]/10 to-[#764BA2]/10 hover:from-[#667EEA]/20 hover:to-[#764BA2]/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Edit review"
                    >
                      <svg className="w-4 h-4 text-[#667EEA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: review.id, rating: review.rating })}
                      className="w-8 h-8 bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF8E53]/10 hover:from-[#FF6B6B]/20 hover:to-[#FF8E53]/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Delete review"
                    >
                      <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Avatar with animal */}
                  <div className={`w-12 h-12 rounded-2xl ${review.avatarBg} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-float-subtle`}>
                    {review.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-[#1F2937]">{review.name}</h3>
                        {review.verified && (
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-[#4ECDC4]/10 to-[#45B7D1]/10 text-[#4ECDC4] rounded-full border border-[#4ECDC4]/20 flex items-center gap-1">
                            <span className="text-[#4ECDC4]">✓</span> Verified
                          </span>
                        )}
                        {review.isOwn && (
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 text-[#667EEA] rounded-full border border-[#667EEA]/20">
                            Your Review
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[#9CA3AF]">{review.date}</span>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      <StarRating rating={review.rating} interactive={false} />
                    </div>

                    {/* Comment */}
                    <p className="text-[#4B5563] leading-relaxed mb-4">
                      {review.comment}
                    </p>

                    {/* Replies Section */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="ml-8 mt-4 space-y-3 border-l-2 border-gradient-to-b from-gray-200 to-gray-100 pl-4">
                        {review.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3 animate-slideIn">
                            <div className={`w-8 h-8 rounded-xl ${reply.avatarBg} flex items-center justify-center text-lg shadow-md`}>
                              {reply.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#1F2937] text-sm">{reply.name}</span>
                                {reply.verified && (
                                  <span className="text-xs text-[#4ECDC4]">✓</span>
                                )}
                                <span className="text-xs text-[#9CA3AF]">{reply.date}</span>
                              </div>
                              <p className="text-sm text-[#4B5563]">{reply.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    {activeReplyId === review.id && (
                      <div className="mt-4 ml-8 animate-slideIn">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#667EEA] to-[#764BA2] flex items-center justify-center text-lg shadow-md animate-float-subtle">
                            🦊
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1F2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]/30 focus:border-[#667EEA] transition-all resize-none"
                              rows="2"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="px-3 py-1 text-xs text-[#9CA3AF] hover:text-[#667EEA] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplySubmit(review.id)}
                                disabled={!replyText.trim()}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${replyText.trim()
                                  ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-md hover:shadow-lg hover:scale-105'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions - Like and Reply only */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => handleLike(review.id)}
                        className={`text-sm transition-all duration-300 flex items-center gap-1 group/btn ${review.liked ? 'text-[#FF6B6B]' : 'text-[#9CA3AF] hover:text-[#FF6B6B]'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-all duration-300 group-hover/btn:scale-110 ${review.liked ? 'fill-current animate-bounce-subtle' : 'fill-none'
                            }`}
                          fill={review.liked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        {review.likes > 0 && <span>{review.likes}</span>}
                        {review.likes === 0 && <span>Like</span>}
                      </button>

                      <button
                        onClick={() => handleReplyClick(review.id)}
                        className="text-sm text-[#9CA3AF] hover:text-[#667EEA] transition-all duration-300 flex items-center gap-1 hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* See Other Reviews Button */}
          {visibleReviews < reviews.length && (
            <div className="text-center mt-10">
              <button
                onClick={handleSeeMore}
                className="px-8 py-4 bg-white/90 backdrop-blur-xl text-[#667EEA] font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 hover:border-[#667EEA]/30 group"
              >
                <span className="flex items-center gap-2">
                  See Other Reviews ({reviews.length - visibleReviews} more)
                  <svg className="w-4 h-4 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingReview;