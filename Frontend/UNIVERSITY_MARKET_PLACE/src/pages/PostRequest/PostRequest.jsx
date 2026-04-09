import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Calendar, MapPin, BadgeDollarSign } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

    const fillDummyData = () => {
        setFormData({
            title: 'Need a custom logo for my tech club',
            category: 'Design',
            budget: '5000',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            description: 'We are starting a new computing and AI club on campus and need a sleek, modern logo. Prefer minimalist designs with a tech-focused theme. The final delivery should include vector files (SVG) and high-res PNGs.',
            locationMode: 'Online',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Fetch user from localStorage
            const userStr = localStorage.getItem("user");
            let user = { name: "Anonymous Student", id: "60d0bc7b8f0f0b2f1c8a9abc" };
            if (userStr) {
                try {
                    const parsed = JSON.parse(userStr);
                    user = { name: parsed.name || parsed.fullname, id: parsed.id || parsed._id };
                } catch(e) {}
            }

            if (!/^[a-zA-Z0-9 ]+$/.test(formData.title)) {
                toast.error("Title cannot contain special characters.");
                setIsSubmitting(false);
                return;
            }
            if (formData.title.length > 20) {
                toast.error("Title cannot exceed 20 characters.");
                setIsSubmitting(false);
                return;
            }

            const numericBudget = formData.budget ? Number(formData.budget) : undefined;
            if (numericBudget && numericBudget > 10000) {
                toast.error("Budget cannot exceed Rs 10,000");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...formData,
                budget: numericBudget,
                userId: user.id || "60d0bc7b8f0f0b2f1c8a9abc",
                postedBy: { name: user.name }
            };

            await axios.post('http://localhost:5001/api/requests', payload);
            toast.success('Request posted successfully!');
            navigate('/home');
        } catch (error) {
            console.error("Error posting request:", error);
            toast.error(error?.response?.data?.error || error?.message || 'Failed to post request.');
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
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Post a Request</h1>
                        <p className="text-emerald-50 text-lg opacity-90">Can't find what you need? Tell the campus what you're looking for.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-emerald-500" /> Request Details
                                </h2>
                                <button
                                    type="button"
                                    onClick={fillDummyData}
                                    className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-200 transition-colors"
                                >
                                    Fill Dummy Data
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Request Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        minLength={4}
                                        maxLength={20}
                                        pattern="^[a-zA-Z0-9 ]+$"
                                        title="Only letters, numbers, and spaces are allowed (Max 20 characters)"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Need someone to design a poster for my club"
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                        <BadgeDollarSign className="w-4 h-4 text-slate-400" /> Budget (Optional LKR)
                                    </label>
                                    <input
                                        type="number"
                                        name="budget"
                                        min="100"
                                        max="10000"
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 5000"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
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
                                    minLength={20}
                                    maxLength={200}
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed information about what exactly you need..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50 resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-500" /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-500" /> Location Mode
                                    </label>
                                    <select
                                        name="locationMode"
                                        value={formData.locationMode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50"
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
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2"
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
