import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowUp, MessageCircle, Plus, Search, Tag, CheckCircle } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function CampusForum() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("new"); // new, top, unanswered
  const [category, setCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authUser = useAuthStore(state => state.authUser);

  // New Question Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postCategory, setPostCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/forum?sort=${sort}&category=${category}`);
      setQuestions(res.data.data);
    } catch (error) {
      toast.error("Failed to load forum data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [sort, category]);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return toast.error("Title and description are required");
    if (title.trim().length < 10) return toast.error("Title must be at least 10 characters long.");
    if (description.trim().length < 20) return toast.error("Description must be at least 20 characters long.");
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/forum`, 
        { title, description, category: postCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question posted!");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setPostCategory("General");
      fetchQuestions(); // refresh
    } catch (error) {
      toast.error("Error posting question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-emerald-800 text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">Campus Q&A</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">Ask questions, share knowledge, and build a lasting database of answers for the entire student body.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 -mt-12 relative z-20">
        {/* Categories Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 mb-6 flex gap-2 overflow-x-auto hide-scrollbar">
          {["All", "Academics", "Campus Life", "Career & Internships", "Tech Support", "Roommates & Housing", "General"].map(cat => (
            <button 
              key={cat} onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${category === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setSort("new")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${sort === 'new' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Latest Activity
            </button>
            <button 
              onClick={() => setSort("top")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${sort === 'top' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Top Questions
            </button>
            <button 
              onClick={() => setSort("unanswered")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${sort === 'unanswered' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Unanswered
            </button>
          </div>
          
          {authUser ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Ask a Question
            </button>
          ) : (
            <Link to="/login" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold text-center transition-colors">
              Log in to Ask
            </Link>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No questions found</h3>
              <p className="text-slate-500 mt-2">Looks like it's quiet here. Be the first to ask something!</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-emerald-200 transition-all group">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left Stats Column */}
                  <div className="flex sm:flex-col gap-4 sm:gap-2 items-center sm:items-end sm:w-24 shrink-0 text-slate-500">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-slate-700">{q.upvoteCount}</span>
                      <span className="text-xs">votes</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg ${q.isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : q.answerCount > 0 ? 'text-emerald-600 border border-emerald-100' : 'text-slate-500'}`}>
                      <span className="font-semibold">{q.answerCount}</span>
                      <span className="text-xs">answers</span>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/forum/${q._id}`}>
                      <h2 className="text-xl font-bold text-emerald-800 group-hover:text-emerald-600 cursor-pointer mb-2 pr-4">{q.title}</h2>
                    </Link>
                    <p className="text-slate-600 line-clamp-2 mb-4">{q.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {q.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <img 
                          src={q.author?.profile_picture ? (q.author.profile_picture.startsWith('http') ? q.author.profile_picture : `${API_BASE_URL}${q.author.profile_picture}`) : 'https://via.placeholder.com/150'} 
                          alt="avatar" 
                          className="w-6 h-6 rounded-full object-cover" 
                        />
                        <span className="font-medium text-emerald-700">{q.author?.fullname || q.author?.username}</span>
                        <span>asked {new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal / Dialog for asking a question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Ask the Community</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handlePostQuestion} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                  <p className="text-xs text-slate-500 mb-2">Be specific and imagine you're asking a question to another student.</p>
                  <input 
                    type="text" 
                    placeholder="e.g. Is there a microwave available in the Engineering building?" 
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    minLength={10}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Details</label>
                  <p className="text-xs text-slate-500 mb-2">Include all the information someone would need to answer your question.</p>
                  <textarea 
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl min-h-[150px] resize-y focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                    placeholder="Describe your question in detail... (Min 20 characters)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    minLength={20}
                    maxLength={3000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <p className="text-xs text-slate-500 mb-2">Pick the most relevant category for your post.</p>
                  <select 
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none bg-white"
                    value={postCategory}
                    onChange={e => setPostCategory(e.target.value)}
                  >
                    {["Academics", "Campus Life", "Career & Internships", "Tech Support", "Roommates & Housing", "General"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
