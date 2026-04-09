import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Eye, CalendarCheck, MapPin, User, Loader2, MessageCircle } from 'lucide-react';

export default function ServiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    })();
    const currentUserId =
        localStorage.getItem("userId") ||
        localStorage.getItem("ownerId") ||
        storedUser?._id ||
        "";
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const requester = currentUserId
                    ? `?ownerId=${encodeURIComponent(currentUserId)}`
                    : "";
                const res = await axios.get(`${API_BASE_URL}/api/services/${id}${requester}`);
                setService(res.data.data || res.data);
            } catch (error) {       
                console.error("Error fetching service details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id, API_BASE_URL, currentUserId]);

    const reviewCount = Number(service?.reviewCount || (service?.reviews?.length || 0));
    const averageRating = reviewCount > 0
        ? (
            (service.reviews || []).reduce((sum, r) => sum + Number(r?.rating || 0), 0) /
            reviewCount
        ).toFixed(1)
        : "0.0";
    const bookingsCount = Number(service?.bookingCount || reviewCount);
    const ownerName = service?.ownerId?.fullname || service?.ownerName || "Service Provider";
    const ownerId = service?.ownerId?._id || service?.ownerId || "";
    const ownerPicture = (() => {
        const value = service?.ownerProfilePicture;
        if (!value || typeof value !== "string") return "";
        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("data:image/") ||
            value.startsWith("blob:")
        ) {
            return value;
        }
        if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
        return "";
    })();
    const canContactProvider = ownerId && ownerId !== currentUserId;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-semibold text-slate-600">Service not found.</div>
            </div>
        );
    }

    // Group availability slots by day
    const slotsByDay = (service.availabilitySlots || []).reduce((acc, slot) => {
        if (!acc[slot.day]) acc[slot.day] = [];
        acc[slot.day].push(slot.time);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-3">
                        {service.category}
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">{service.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                            {ownerPicture ? (
                                <img
                                    src={ownerPicture}
                                    alt={ownerName}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="p-1.5 bg-slate-200 rounded-full">
                                    <User className="w-4 h-4 text-slate-700" />
                                </div>
                            )}
                            <span>{ownerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{averageRating} ({reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>{Number(service?.viewCount || 0)} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarCheck className="w-4 h-4 text-slate-400" />
                            <span>{bookingsCount} bookings</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{service.locationMode}</span>
                        </div>
                        {canContactProvider && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/dashboard", {
                                        state: {
                                            openChatUser: {
                                                _id: ownerId,
                                                fullname: ownerName,
                                                fullName: ownerName,
                                                profilePic: ownerPicture,
                                                profile_picture: ownerPicture,
                                            },
                                        },
                                    })
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact Service Provider
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Main Content (Left, 2/3 width) */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Dynamically mapped Work Samples Container */}
                        {service.workSamples && service.workSamples.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {service.workSamples.map((sample, idx) => {
                                    const imageUrl = sample.url?.startsWith("/") 
                                        ? `${API_BASE_URL}${sample.url}` 
                                        : sample.url;
                                    return (
                                        <div key={idx} className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden group">
                                            <img src={imageUrl} alt={`Work Sample ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About this Service</h2>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {service.description}
                            </div>
                        </section>

                        {/* Removed Reviews section as requested */}
                    </div>

                    {/* Sticky Sidebar (Right, 1/3 width) */}
                    <div className="relative">
                        <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">

                            <div className="mb-6">
                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Price</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-3xl font-extrabold text-slate-800">Rs {service.pricePerHour || service.price}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-6" />

                            <div className="mb-8">
                                <span className="text-sm font-semibold text-slate-800 block mb-4">Available slots</span>

                                {Object.keys(slotsByDay).length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No specific slots listed. Contact to arrange a time.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {Object.entries(slotsByDay).map(([day, times]) => (
                                            <div key={day}>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{day}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {times.map((time, idx) => {
                                                        const isSelected = selectedSlot?.day === day && selectedSlot?.time === time;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedSlot({ day, time })}
                                                                className={`px-3 py-1.5 transition-colors border rounded-lg text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${isSelected ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 border-transparent hover:border-emerald-200 hover:text-emerald-700'}`}
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
                                className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
                                onClick={() =>
                                    navigate('/booking-form', {
                                        state: {
                                            serviceId: id,
                                            serviceTitle: service?.title || "",
                                            pricePerHour: service?.pricePerHour || service?.price || 0,
                                            selectedSlot: selectedSlot || null,
                                        },
                                    })
                                }
                            >
                                {selectedSlot ? `Book for ${selectedSlot.day} at ${selectedSlot.time}` : 'Select a slot to Book'}
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
