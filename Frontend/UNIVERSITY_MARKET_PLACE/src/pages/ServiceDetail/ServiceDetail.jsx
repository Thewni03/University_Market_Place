import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Eye, CalendarCheck, MapPin, User, Loader2, ArrowLeft, ShieldCheck, Clock, Zap } from 'lucide-react';
import { mockServices } from '../../data/mockData';

const getCategoryColors = (category) => {
    const colors = {
        "Web Design": "from-blue-500 to-indigo-600",
        "Tutoring": "from-emerald-400 to-teal-600",
        "Video Editing": "from-purple-500 to-fuchsia-600",
        "Writing": "from-amber-400 to-orange-500",
        "Photography": "from-rose-400 to-pink-600",
        "Development": "from-cyan-500 to-blue-600",
        "Design": "from-pink-500 to-rose-500",
        "Music": "from-violet-500 to-purple-600",
        "Marketing": "from-orange-500 to-red-500",
        "Fitness": "from-green-400 to-emerald-600",
    };
    return colors[category] || "from-slate-700 to-slate-900";
};

export default function ServiceDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState("");

    const handleBook = async () => {
        if (!selectedSlot) return;

        // Try to get logged in user details
        const userStr = localStorage.getItem("user");
        let bookerName = "Guest Student";
        let bookerEmail = "student@university.edu";

        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                bookerName = userObj.fullname || userObj.name || bookerName;
                bookerEmail = userObj.email || bookerEmail;
            } catch (e) {
                console.error("Could not parse user details from localStorage");
            }
        }

        setIsBooking(true);
        setBookingError("");

        try {
            const res = await axios.post("http://localhost:5001/api/bookings", {
                serviceId: service._id || service.id,
                providerName: service.provider?.name || "Verified Student",
                bookerName,
                bookerEmail,
                day: selectedSlot.day,
                time: selectedSlot.time
            });

            if (res.data.success) {
                setBookingSuccess(true);
            }
        } catch (error) {
            console.error("Booking error:", error);
            setBookingError("Failed to request booking. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/services/${id}`);
                setService(res.data.data || res.data);
            } catch (error) {
                console.error("Error fetching service details, checking mock data...", error);
                
                // Fallback to mock data if API fails (e.g. clicking a mock service with ID "1")
                const mockMatch = mockServices.find(s => String(s._id) === String(id) || String(s.id) === String(id));
                if (mockMatch) {
                    setService(mockMatch);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-bold text-slate-400 flex flex-col items-center gap-4">
                    <Zap className="w-16 h-16 text-slate-300" />
                    Service not found.
                    <Link to="/" className="text-sm text-emerald-600 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    // Group availability slots by day
    const slotsByDay = (service.availabilitySlots || []).reduce((acc, slot) => {
        if (!acc[slot.day]) acc[slot.day] = [];
        acc[slot.day].push(slot.time);
        return acc;
    }, {});

    const hasImages = service.workSamples && service.workSamples.length > 0;
    const gradient = getCategoryColors(service.category);
    const providerName = service.provider?.name || "Verified Student";
    const providerInitial = providerName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            {/* Massive Hero Header */}
            <div className={`w-full relative ${hasImages ? '' : `bg-gradient-to-r ${gradient}`}`}>
                {hasImages ? (
                    <div className="w-full h-[40vh] md:h-[50vh] relative">
                        <img src={service.workSamples[0].url} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    </div>
                ) : (
                    <div className="w-full h-[30vh] md:h-[40vh] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    </div>
                )}

                {/* Header Content overlay */}
                <div className="absolute bottom-0 left-0 w-full">
                    <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to listings
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs tracking-widest font-bold uppercase rounded-full shadow-sm">
                                {service.category}
                            </span>
                            <span className="px-3 py-1.5 bg-green-500/90 text-white backdrop-blur-sm text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3.5 h-3.5 fill-current" /> 5.0 (New)
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md max-w-4xl">
                            {service.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="max-w-6xl mx-auto px-5 lg:px-8 mt-10 md:mt-14">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Content Column (2/3) */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Meet the Provider Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -z-0"></div>
                            
                            <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl relative z-10 border-4 border-white">
                                {providerInitial}
                            </div>
                            
                            <div className="relative z-10 flex-grow">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Meet your provider</h3>
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    {providerName}
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </h2>
                                <p className="text-slate-500 mt-1 max-w-md">Undergraduate Student • Responds within 1 hour</p>
                            </div>

                            <button className="shrink-0 w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors relative z-10">
                                Contact Me
                            </button>
                        </div>

                        {/* About this Service */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-500" /> About this service
                            </h2>
                            <div className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                {service.description}
                            </div>
                        </section>

                        {/* Additional Stats Row */}
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-semibold">{service.locationMode}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                <Eye className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-semibold">Highly Viewed</span>
                            </div>
                        </div>

                        {/* Work Samples Grid (if more than 1 image) */}
                        {hasImages && service.workSamples.length > 1 && (
                            <section className="pt-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-emerald-500" /> Portfolio
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {service.workSamples.slice(1).map((sample, idx) => (
                                        <div key={idx} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden group cursor-pointer border border-slate-200 shadow-sm">
                                            <img src={sample.url} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Right Sticky Sidebar (1/3) */}
                    <div className="relative">
                        <div className="sticky top-28 bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
                           
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                            <div className="mb-8">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Service Rate</span>
                                <div className="flex items-baseline gap-1 text-slate-900">
                                    <span className="text-2xl font-bold text-slate-400">Rs</span>
                                    <span className="text-5xl font-black tracking-tighter">{service.pricePerHour || service.price}</span>
                                    <span className="text-lg font-bold text-slate-400">/hr</span>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-8" />

                            <div className="mb-8">
                                <span className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Clock className="w-4 h-4 text-emerald-500" /> Select Availability
                                </span>

                                {Object.keys(slotsByDay).length === 0 ? (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">No fixed schedule provided. Contact the provider to arrange a custom time.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {Object.entries(slotsByDay).map(([day, times]) => (
                                            <div key={day}>
                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">{day}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {times.map((time, idx) => {
                                                        const isSelected = selectedSlot?.day === day && selectedSlot?.time === time;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedSlot({ day, time })}
                                                                className={`px-4 py-2 transition-all rounded-xl text-xs font-bold cursor-pointer border ${isSelected ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20 scale-105' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                            >
                                                                {time}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleBook}
                                disabled={!selectedSlot || isBooking || bookingSuccess}
                                className={`w-full py-5 text-white text-lg font-black rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform 
                                    ${!selectedSlot ? 'bg-slate-300 cursor-not-allowed' : 
                                      bookingSuccess ? 'bg-emerald-500 shadow-emerald-500/30' : 
                                      'bg-slate-900 hover:bg-emerald-600 hover:-translate-y-1 shadow-slate-900/10 hover:shadow-emerald-600/30 group-hover:bg-emerald-600'}`}
                            >
                                {isBooking ? (
                                    <><Loader2 className="w-6 h-6 animate-spin" /> Requesting...</>
                                ) : bookingSuccess ? (
                                    <>Email Sent! 🎉</>
                                ) : selectedSlot ? (
                                    `Book for ${selectedSlot.day} at ${selectedSlot.time}`
                                ) : (
                                    'Select a slot to Book'
                                )}
                            </button>

                            {bookingError && (
                                <p className="text-rose-500 text-sm font-semibold text-center mt-3">{bookingError}</p>
                            )}
                            {bookingSuccess && (
                                <p className="text-emerald-600 text-xs font-semibold text-center mt-3 leading-relaxed">
                                    The provider has been notified via email!<br/>They will reply to directly coordinate.
                                </p>
                            )}

                            <p className="text-center text-xs font-medium text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Secure booking via UniMarket
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
