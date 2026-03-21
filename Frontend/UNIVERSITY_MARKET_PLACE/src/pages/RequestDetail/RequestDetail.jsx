import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, User, Loader2, BadgeDollarSign, MessageCircle } from 'lucide-react';

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
                console.error("Error fetching request details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl font-semibold text-slate-600">Request not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header wrapper card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-sm font-semibold rounded-full mb-4">
                                {request.category}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                {request.title}
                            </h1>
                        </div>

                        {request.budget && (
                            <div className="shrink-0 text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Offered Budget</span>
                                <span className="text-2xl font-black text-rose-600">Rs {request.budget}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <User className="w-4 h-4 text-slate-700" />
                            </div>
                            <div>
                                <p className="text-sm">Requested by</p>
                                <p className="text-xs text-slate-400">Student ID: ...{request.userId ? request.userId.toString().slice(-4) : 'N/A'}</p>
                            </div>
                        </div>

                        {request.deadline && (
                            <div className="flex items-center gap-2 text-slate-600 font-medium ml-auto sm:ml-0">
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <Calendar className="w-4 h-4 text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-sm">Deadline</p>
                                    <p className="text-xs text-slate-400">{new Date(request.deadline).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}  

                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <MapPin className="w-4 h-4 text-slate-700" />
                            </div>
                            <div>
                                <p className="text-sm">Location</p>
                                <p className="text-xs text-slate-400">{request.locationMode}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <h2 className="text-xl font-bold mb-3">Full Requirements</h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                            {request.description}
                        </p>
                    </div>
                </div>

                {/* Action Bottom */}
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl">
                    <div>
                        <h3 className="text-white text-xl font-bold mb-1">Can you fulfill this request?</h3>
                        <p className="text-slate-300 text-sm">Reach out to the student to discuss details and finalize the agreement.</p>
                    </div>
                    <button className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 shrink-0">
                        <MessageCircle className="w-5 h-5" /> Send Offer
                    </button>
                </div>

            </div>
        </div>
    );
}
