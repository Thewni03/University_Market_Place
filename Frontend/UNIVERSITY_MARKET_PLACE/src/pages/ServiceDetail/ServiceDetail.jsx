import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Eye, CalendarCheck, MapPin, User, Loader2 } from 'lucide-react';

export default function ServiceDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/services/${id}`);
                setService(res.data.data || res.data);
            } catch (error) {
                console.error("Error fetching service details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

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
                            <div className="p-1.5 bg-slate-200 rounded-full">
                                <User className="w-4 h-4 text-slate-700" />
                            </div>
                            <span>Dulaj S.</span> {/* Mock Owner Name */}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>4.9 (12 reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <span>340 views</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarCheck className="w-4 h-4 text-slate-400" />
                            <span>24 bookings</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{service.locationMode}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Main Content (Left, 2/3 width) */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Dynamically mapped Work Samples Container */}
                        {service.workSamples && service.workSamples.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {service.workSamples.map((sample, idx) => (
                                    <div key={idx} className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden group">
                                        <img src={sample.url} alt={`Work Sample ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                ))}
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

                            <button className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300">
                                {selectedSlot ? `Book for ${selectedSlot.day} at ${selectedSlot.time}` : 'Select a slot to Book'}
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
