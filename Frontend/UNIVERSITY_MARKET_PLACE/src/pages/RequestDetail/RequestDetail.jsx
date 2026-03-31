import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Loader2, BadgeDollarSign, MessageCircle, ArrowLeft, Clock, ShieldCheck, Briefcase } from 'lucide-react';
import { mockRequests } from '../../data/mockData';

export default function RequestDetail() {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/requests/${id}`);
                setRequest(res.data);
            } catch (error) {
                console.error("Error fetching request details, checking mock data...", error);

                // Fallback to mock data if API fails
                const mockMatch = mockRequests.find(r => String(r._id) === String(id) || String(r.id) === String(id));
                if (mockMatch) {
                    setRequest(mockMatch);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-bold text-slate-400 flex flex-col items-center gap-4">
                    <Briefcase className="w-16 h-16 text-slate-300" />
                    Request not found.
                    <Link to="/" className="text-sm text-rose-600 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    const isExpired = request.expired || (request.deadline && new Date(request.deadline) < new Date());
    const studentName = request.postedBy?.name || "Anonymous Student";
    const studentInitial = studentName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 py-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-5 lg:px-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to listings
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-5 lg:px-8 mt-8">

                {/* Main Request Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-bl-[100px] -z-0 transition-transform duration-700 group-hover:scale-110"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-6 mb-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black tracking-widest uppercase rounded-md shadow-sm">
                                        {request.category}
                                    </span>
                                    {isExpired && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold uppercase rounded-md">
                                            <Clock className="w-3.5 h-3.5" /> Expired
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-6">
                                    {request.title}
                                </h1>
                            </div>

                            {request.budget && (
                                <div className="shrink-0 md:text-right bg-white p-6 rounded-2xl border-2 border-rose-100 shadow-xl shadow-rose-100/50 min-w-[200px] transform md:rotate-2">
                                    <span className="text-xs font-bold text-rose-400 block uppercase tracking-widest mb-1">Offered Budget</span>
                                    <div className="flex items-baseline md:justify-end gap-1 text-slate-900">
                                        <span className="text-2xl font-bold text-slate-400">Rs</span>
                                        <span className="text-5xl font-black text-rose-600 tracking-tighter">{request.budget}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Info Bar */}
                        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-b border-slate-100 mb-8">
                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl py-2 px-4 border border-slate-100">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                <span className="font-semibold text-sm text-slate-700">{request.locationMode}</span>
                            </div>

                            {request.deadline && (
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl py-2 px-4 border border-slate-100">
                                    <Calendar className="w-4 h-4 text-rose-500" />
                                    <span className="font-semibold text-sm text-slate-700">Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-slate-50 rounded-xl py-2 px-4 border border-slate-100 ml-auto">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posted By</span>
                                <div className="w-6 h-6 bg-rose-200 text-rose-800 rounded-full flex items-center justify-center text-xs font-bold">
                                    {studentInitial}
                                </div>
                                <span className="font-semibold text-sm text-slate-700">{studentName}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-6">Full Requirements</h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg font-medium max-w-3xl">
                                {request.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Card */}
                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <h3 className="text-white text-2xl font-black tracking-tight mb-2">Can you fulfill this request?</h3>
                            <p className="text-slate-400 text-sm md:text-base font-medium flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Reach out directly to discuss details and agree on terms.
                            </p>
                        </div>
                        <button className="px-10 py-5 bg-rose-500 hover:bg-rose-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-3 shrink-0 transform hover:-translate-y-1">
                            <MessageCircle className="w-6 h-6" /> Send an Offer
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
