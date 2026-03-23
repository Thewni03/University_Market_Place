import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, Clock, MapPin, Tag, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = ["Tutoring", "Web Design", "Video Editing", "Writing", "Photography", "Development", "Design", "Music", "Marketing", "Fitness"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

export default function CreateService() {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    const currentUserId =
        localStorage.getItem("userId") ||
        localStorage.getItem("ownerId") ||
        (() => {
            try {
                return JSON.parse(localStorage.getItem("user") || "null")?._id || "";
            } catch {
                return "";
            }
        })();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        pricePerHour: '',
        description: '',
        locationMode: 'Online',
    });

    const [slots, setSlots] = useState([]);
    const [selectedDay, setSelectedDay] = useState(days[0]);
    const [selectedTime, setSelectedTime] = useState(times[0]);

    const [sampleFiles, setSampleFiles] = useState([]);
    const sampleFileInputRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSlot = () => {
        const newSlot = `${selectedDay}|${selectedTime}`;
        // prevent duplicates
        if (!slots.some(s => `${s.day}|${s.time}` === newSlot)) {
            setSlots([...slots, { day: selectedDay, time: selectedTime }]);
        }
    };

    const removeSlot = (index) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!currentUserId) {
                throw new Error("User ID not found. Please login again.");
            }
            const price = Number(formData.pricePerHour);
            if (price > 10000) {
                alert("you cant add more than 10000");
                setIsSubmitting(false);
                return;
            }

            const payload = new FormData();
            payload.append("title", formData.title);
            payload.append("category", formData.category);
            payload.append("pricePerHour", String(price));
            payload.append("description", formData.description);
            payload.append("locationMode", formData.locationMode);
            payload.append("ownerId", currentUserId);
            payload.append("isPublished", "true");
            payload.append("availabilitySlots", JSON.stringify(slots));
            sampleFiles.forEach((file) => {
                payload.append("workSampleFiles", file);
            });

            await axios.post(`${API_BASE_URL}/api/services`, payload);
            alert('Service created successfully!');
            navigate('/');
        } catch (error) {
            console.error("Error creating service:", error);
            alert(error?.response?.data?.error || error?.message || 'Failed to create service.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create a New Service</h1>
                        <p className="text-emerald-50 text-lg opacity-90">Offer your skills to the campus community and start earning.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-emerald-500" /> Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Service Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Advanced Calculus Tutoring"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price Per Hour (LKR/$)</label>
                                    <input
                                        type="number"
                                        name="pricePerHour"
                                        required
                                        min="0"
                                        max="10000"
                                        value={formData.pricePerHour}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 1500"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Work Samples / Photos */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-emerald-500" /> Sample Photos (Optional)
                            </h2>
                            <p className="text-sm text-slate-500 mb-2">Click Add Photo to choose files from your folder.</p>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Work Sample Photos</label>
                                <input
                                    ref={sampleFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length === 0) return;
                                        setSampleFiles((prev) => [...prev, ...files]);
                                        e.target.value = "";
                                    }}
                                    className="hidden"
                                />
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm text-slate-600">
                                        {sampleFiles.length > 0 ? `${sampleFiles.length} file(s) selected` : "No files selected"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => sampleFileInputRef.current?.click()}
                                        className="w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shrink-0"
                                    >
                                        Add Photo
                                    </button>
                                </div>
                            </div>

                            {sampleFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {sampleFiles.map((file, idx) => (
                                        <span
                                            key={`${file.name}-${idx}`}
                                            className="inline-flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800"
                                        >
                                            <span className="truncate max-w-[220px]">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSampleFiles(sampleFiles.filter((_, i) => i !== idx))}
                                                className="text-emerald-700 hover:text-red-600 transition-colors"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100" />

                        {/* Description & Location */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe what you offer, your experience, and what students can expect..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> Location Mode
                                </label>
                                <div className="flex gap-4">
                                    {['Online', 'On-Campus'].map(mode => (
                                        <label key={mode} className={`flex-1 flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${formData.locationMode === mode ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                                            <input
                                                type="radio"
                                                name="locationMode"
                                                value={mode}
                                                checked={formData.locationMode === mode}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <span className="font-semibold">{mode}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Availability */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-emerald-500" /> Availability Slots
                            </h2>

                            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Day</label>
                                    <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                                    <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={addSlot} className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shrink-0">
                                    Add Slot
                                </button>
                            </div>

                            {/* Added Slots Badges */}
                            {slots.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 p-4 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
                                    {slots.map((slot, idx) => (
                                        <div key={idx} className="flex items-center gap-2 py-1.5 px-3 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium shadow-sm">
                                            {slot.day} at {slot.time}
                                            <button type="button" onClick={() => removeSlot(idx)} className="text-emerald-400 hover:text-red-500 transition-colors ml-1">
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? 'Creating...' : (
                                    <>
                                        Publish Service <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
