// filename: src/components/BookingHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const BookingHistory = ({ onDataLoaded, onViewBooking, onUnviewBooking, viewedBookingIds = new Set(), isProviderView = false, providerId = "" }) => {
  const { authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Payment/Booking History from Backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const url = authUser && authUser._id 
          ? isProviderView
            ? `http://localhost:5001/api/payments/provider/${providerId || authUser._id}`
            : `http://localhost:5001/api/payments/user/${authUser._id}`
          : 'http://localhost:5001/api/payments';
          
        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          const formattedBookings = result.data.map((payment) => ({
            id: payment.bookingId,
            dbId: payment._id, 
            serviceId: payment.serviceId,
            customerName: payment.customerName,
            createdAt: payment.createdAt,
            date: payment.bookingDate || new Date(payment.createdAt).toISOString().split('T')[0],
            time: payment.bookingTime || new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: payment.serviceName,
            cancellationReason: payment.cancellationReason,
            amount: payment.amount,
            status: payment.status.toLowerCase(), // 'completed', 'pending', etc.
            attachments: payment.attachments || [], 
            cancellationDeadline: new Date(new Date(payment.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeSlots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']
          }));
          setBookingHistory(formattedBookings);
          if (onDataLoaded) {
            onDataLoaded(result.data, result.totalAmount || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [authUser, isProviderView, providerId, onDataLoaded]);

  // Fetch Booked Slots when rescheduling
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (showRescheduleModal && selectedBooking && newDate) {
        try {
          const query = selectedBooking.serviceId
            ? `serviceId=${encodeURIComponent(selectedBooking.serviceId)}`
            : `serviceName=${encodeURIComponent(selectedBooking.type)}`;
          const res = await fetch(`http://localhost:5001/api/payments/booked-slots?${query}&date=${newDate}`);
          const result = await res.json();
          if (result.success) {
            setBookedSlots(result.data);
          } else {
            setBookedSlots([]);
          }
        } catch (error) {
          console.error("Error fetching booked slots:", error);
          setBookedSlots([]);
        }
      } else {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [newDate, showRescheduleModal, selectedBooking]);

  // Filter bookings
  const getFilteredBookings = () => {
    return bookingHistory.filter(booking => {
      const matchesSearch = searchTerm === '' || 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredBookings = getFilteredBookings();

  // File handling functions
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('fig')) return '🎨';
    return '📎';
  };

  const getFileColor = (type) => {
    if (type.includes('pdf')) return 'from-red-500 to-red-600';
    if (type.includes('word') || type.includes('document')) return 'from-blue-500 to-blue-600';
    if (type.includes('image')) return 'from-emerald-500 to-teal-500';
    if (type.includes('fig')) return 'from-purple-500 to-pink-500';
    return 'from-gray-500 to-gray-600';
  };

  const handleAttachmentClick = (file) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleDownloadFile = () => {
    if (selectedFile && selectedFile.url) {
      window.open(`http://localhost:5001${selectedFile.url}`, '_blank');
    }
  };

  // Booking actions
  const handleCancellation = (booking) => {
    setSelectedBooking(booking);
    setShowCancellationModal(true);
  };

  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const confirmCancellation = async () => {
    try {
      if (selectedBooking.dbId) {
        await fetch(`http://localhost:5001/api/payments/${selectedBooking.dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Refunded', cancellationReason })
        });
      }
      setBookingHistory(bookingHistory.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, status: 'refunded', cancellationReason }
          : booking
      ));
    } catch(err) {
      console.error(err);
    }
    setShowCancellationModal(false);
    setSelectedBooking(null);
    setCancellationReason('');
  };

  const confirmReschedule = async () => {
    try {
      if (selectedBooking.dbId) {
        await fetch(`http://localhost:5001/api/payments/${selectedBooking.dbId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingDate: newDate, bookingTime: newTime })
        });
      }
      setBookingHistory(bookingHistory.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, date: newDate, time: newTime }
          : booking
      ));
    } catch(err) {
      console.error(err);
    }
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    setNewDate('');
    setNewTime('');
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const isPast24Hours = (createdAt) => {
    if (!createdAt) return false;
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffHours = (now - createdDate) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  return (
    <div className="bg-background font-sans border border-gray-100 rounded-xl p-6 shadow-sm">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="font-display text-2xl font-extrabold text-slate-800">
          Booking History
        </h2>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-slate-700 text-sm cursor-pointer hover:border-blue-400 transition-all"
          >
            <option value="all">All Bookings</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input 
            type="text" 
            placeholder="Search by Booking ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-slate-500">
        Showing {filteredBookings.length} of {bookingHistory.length} bookings
      </div>

      {/* Booking History Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Booking ID</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Customer Name</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Booked On</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Scheduled For</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Booking Type</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Amount</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Status</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Attachments</th>
              <th className="text-left py-3 px-2 text-slate-600 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  <div className="animate-pulse">Loading booking history...</div>
                </td>
              </tr>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-slate-700">
                  <td className="py-4 px-2">
                    <span className="font-mono text-sm text-blue-400">{booking.id}</span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-sm">
                        👤
                      </div>
                      <span className="text-sm">{booking.customerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="text-sm">
                      <div>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                      <div className="text-slate-400 text-xs">{booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="text-sm">
                      <div>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-slate-400 text-xs">{booking.time}</div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm">{booking.type}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium">LKR {booking.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full border w-fit ${getStatusBadge(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.cancellationReason && (
                        <span className="text-[10px] text-slate-400 italic max-w-[120px] truncate" title={booking.cancellationReason}>
                          Reason: {booking.cancellationReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    {booking.attachments.length > 0 ? (
                      <div className="flex -space-x-2">
                        {booking.attachments.slice(0, 3).map((file, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAttachmentClick(file)}
                            className="w-8 h-8 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs hover:z-10 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer group relative"
                            title={`Click to preview ${file.name}`}
                          >
                            <span className="text-sm">{getFileIcon(file.type)}</span>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-gray-200 shadow-md">
                              {file.name} ({file.size})
                            </span>
                          </button>
                        ))}
                        {booking.attachments.length > 3 && (
                          <div className="w-8 h-8 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs hover:border-blue-400 transition-all cursor-pointer group relative"
                               onClick={() => alert(`${booking.attachments.length - 3} more files available`)}>
                            <span className="text-xs font-medium text-slate-700">+{booking.attachments.length - 3}</span>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-gray-200 shadow-md">
                              {booking.attachments.length - 3} more files
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">No files</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-2">
                      {!isProviderView && booking.status !== 'cancelled' && booking.status !== 'refunded' && (
                        <>
                          <button
                            onClick={() => !isPast24Hours(booking.createdAt) && handleReschedule(booking)}
                            disabled={isPast24Hours(booking.createdAt)}
                            className={`p-2 rounded-lg transition-all ${isPast24Hours(booking.createdAt) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:scale-110'}`}
                            title={isPast24Hours(booking.createdAt) ? "Cannot reschedule after 24 hours" : "Reschedule"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => !isPast24Hours(booking.createdAt) && handleCancellation(booking)}
                            disabled={isPast24Hours(booking.createdAt)}
                            className={`p-2 rounded-lg transition-all ${isPast24Hours(booking.createdAt) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:scale-110'}`}
                            title={isPast24Hours(booking.createdAt) ? "Cannot cancel after 24 hours" : "Cancel Booking"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {isProviderView && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowViewModal(true);
                              if (onViewBooking) onViewBooking(booking);
                            }}
                            className={`p-2 rounded-lg transition-all hover:scale-110 flex items-center justify-center ${viewedBookingIds.has(booking.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-slate-600'}`}
                            title={viewedBookingIds.has(booking.id) ? "Viewed" : "View Details"}
                          >
                            {viewedBookingIds.has(booking.id) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          
                          {/* Un-view button */}
                          {viewedBookingIds.has(booking.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onUnviewBooking) onUnviewBooking(booking.id);
                              }}
                              className="p-2 bg-gray-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-all hover:scale-110"
                              title="Mark as Unread"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  No bookings found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border border-gray-100 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center text-2xl`}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-800">{selectedFile.name}</h3>
                  <p className="text-sm text-slate-500">{selectedFile.size}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilePreview(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center text-3xl`}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full w-full mb-2">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-slate-500">Ready to download</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-sm text-slate-600 border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-blue-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="font-medium">File Information:</span>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-600">
                    <span className="text-slate-500">Name:</span> {selectedFile.name}
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-500">Size:</span> {selectedFile.size}
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-500">Type:</span> {selectedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownloadFile}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </button>
              <button
                onClick={() => setShowFilePreview(false)}
                className="flex-1 py-3 bg-gray-100 text-slate-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Details Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-slate-800 mb-4">Booking Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Booking ID</p>
                <p className="font-medium text-slate-800">{selectedBooking.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer Name</p>
                <p className="font-medium text-slate-800">{selectedBooking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Service / Type</p>
                <p className="font-medium text-slate-800">{selectedBooking.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="font-medium text-slate-800">LKR {selectedBooking.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Scheduled For</p>
                <p className="font-medium text-slate-800">
                  {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full border ${getStatusBadge(selectedBooking.status)}`}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </span>
              </div>
              {selectedBooking.cancellationReason && (
                <div>
                  <p className="text-sm text-slate-500">Cancellation Reason</p>
                  <p className="font-medium text-red-500">{selectedBooking.cancellationReason}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancellationModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">Cancel Booking</h3>
            <p className="text-slate-600 text-sm mb-4">
              Are you sure you want to cancel booking <span className="text-blue-500 font-mono">{selectedBooking.id}</span>?
            </p>
            
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-xs font-medium">
                ⚠️ Cancellation deadline: {new Date(selectedBooking.cancellationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-600 font-medium mb-2">Reason for cancellation (optional)</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancellationModal(false)}
                className="flex-1 py-3 bg-gray-100 text-slate-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-100 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">Reschedule Booking</h3>
            <p className="text-slate-600 text-sm mb-4">
              Select new date and time for booking <span className="text-blue-500 font-mono">{selectedBooking.id}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTime('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="">Select a time slot</option>
                  {selectedBooking.timeSlots.map((slot) => {
                    const isBooked = bookedSlots.some(b => b.includes(slot));
                    const isCurrentSlot = selectedBooking.date === newDate && (selectedBooking.time === slot || (typeof selectedBooking.time === 'string' && selectedBooking.time.includes(slot)));
                    const isDisabled = isBooked && !isCurrentSlot;
                    return (
                      <option key={slot} value={slot} disabled={isDisabled} className={isDisabled ? 'text-gray-400 bg-gray-50' : ''}>
                        {slot} {isDisabled ? '(Booked)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 bg-gray-100 text-slate-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!newDate || !newTime}
                className={`flex-1 py-3 rounded-xl transition-all font-medium ${
                  newDate && newTime
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;   
