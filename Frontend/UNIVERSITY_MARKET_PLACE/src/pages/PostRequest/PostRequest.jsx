import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Calendar, MapPin, BadgeDollarSign } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = ["Tutoring", "Web Design", "Video Editing", "Writing", "Photography", "Development", "Design", "Music", "Marketing", "Fitness"];

export default function PostRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        budget: '',
        deadline: '',
        description: '',
        locationMode: 'Online',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Mocking userId
            const payload = {
                ...formData,
                budget: formData.budget ? Number(formData.budget) : undefined,
                userId: '60d0bc7b8f0f0b2f1c8a9abc', // mockup id
            };

            await axios.post('http://localhost:5001/api/requests', payload);
            alert('Request posted successfully!');
            navigate('/');
        } catch (error) {
            console.error("Error posting request:", error);
            alert('Failed to post request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-10 text-white">
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Post a Request</h1>
                        <p className="text-rose-50 text-lg opacity-90">Can't find what you need? Tell the campus what you're looking for.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-rose-500" /> Request Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Request Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Need someone to design a poster for my club"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <BadgeDollarSign className="w-4 h-4 text-slate-400" /> Budget (Optional LKR)
                                    </label>
                                    <input
                                        type="number"
                                        name="budget"
                                        min="0"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 5000"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Description, Deadline & Location */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Requirements</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed information about what exactly you need..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50 resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-rose-500" /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-rose-500" /> Location Mode
                                    </label>
                                    <select
                                        name="locationMode"
                                        value={formData.locationMode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-slate-50"
                                    >
                                        <option value="Online">Online</option>
                                        <option value="On-Campus">On-Campus</option>
                                        <option value="Place">Specific Place</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? 'Posting...' : (
                                    <>
                                        Publish Request <CheckCircle2 className="w-5 h-5" />
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
