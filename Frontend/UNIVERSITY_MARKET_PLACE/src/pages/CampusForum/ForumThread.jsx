import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function ForumThread() {
  const { id } = useParams();
  const [threadData, setThreadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const authUser = useAuthStore(state => state.authUser);

  const fetchThread = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/forum/${id}`);
      setThreadData(res.data.data);
    } catch (error) {
      toast.error("Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/forum/${id}/answer`, 
        { content: answerContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswerContent("");
      toast.success("Answer posted!");
      fetchThread();
    } catch (error) {
      toast.error("Failed to post answer");
    }
  };

  const toggleQuestionUpvote = async () => {
    if (!authUser) return toast.error("Please login");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/forum/${id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setThreadData(prev => ({ 
        ...prev, 
        question: { ...prev.question, upvotes: res.data.upvotes } 
      }));
    } catch (e) { toast.error("Error upvoting"); }
  };

  const toggleAnswerUpvote = async (answerId) => {
    if (!authUser) return toast.error("Please login");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/forum/answer/${answerId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setThreadData(prev => ({
        ...prev,
        answers: prev.answers.map(a => a._id === answerId ? { ...a, upvotes: res.data.upvotes } : a)
      }));
    } catch (e) { toast.error("Error upvoting"); }
  };

  const acceptAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/forum/${id}/answer/${answerId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Success!");
      fetchThread(); // reload to reflect UI state changes properly across all answers
    } catch (e) { 
      toast.error(e.response?.data?.message || "Failed to accept answer"); 
    }
  };

  if (loading) return <div className="min-h-screen py-20 flex justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!threadData?.question) return <div className="text-center py-20 bg-slate-50">Question not found.</div>;

  const { question, answers } = threadData;
  const isQuestionOwner = authUser && String(authUser._id) === String(question.authorId._id);
  const qUpvotes = question.upvotes || [];
  const qHasUpvoted = authUser && qUpvotes.includes(authUser._id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">
        
        <Link to="/forum" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-semibold mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Q&A
        </Link>
        
        {/* Main Question Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="p-6 border-b border-slate-100 flex items-start gap-4">
            <div className="flex flex-col items-center">
              <button 
                onClick={toggleQuestionUpvote}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${qHasUpvoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <span className="font-bold text-slate-700 mt-2 text-xl">{qUpvotes.length}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">{question.title}</h1>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {question.description}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-semibold">{question.category}</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex items-center gap-3">
             <img src={(question.authorId.profile_picture || "").startsWith("http") ? question.authorId.profile_picture : `${API_BASE_URL}${question.authorId.profile_picture || ""}`} alt="" className="w-8 h-8 rounded-full border border-slate-200 bg-white" />
             <div className="text-sm">
               <span className="font-semibold text-slate-800">{question.authorId.fullname || question.authorId.username}</span>
               <span className="text-slate-500 ml-2 text-xs">asked {new Date(question.createdAt).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>
        </div>

        <div className="space-y-6 mb-12">
          {answers.map(ans => {
            const aUpvotes = ans.upvotes || [];
            const aHasUpvoted = authUser && aUpvotes.includes(authUser._id);
            return (
              <div key={ans._id} className={`bg-white rounded-2xl shadow-sm border p-6 flex items-start gap-4 ${ans.isAccepted ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => toggleAnswerUpvote(ans._id)}
                    className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-colors ${aHasUpvoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-slate-700 mt-2">{aUpvotes.length}</span>
                  
                  {ans.isAccepted && (
                    <div className="mt-3 text-emerald-500 flex flex-col items-center">
                      <CheckCircle className="w-6 h-6 fill-emerald-100" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {ans.content}
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    {/* Mark as accepted logic */}
                    <div>
                      {isQuestionOwner && (
                        <button 
                          onClick={() => acceptAnswer(ans._id)}
                          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${ans.isAccepted ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                        >
                          {ans.isAccepted ? "Unmark Solution" : "Mark as Solution"}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <img src={(ans.authorId.profile_picture || "").startsWith("http") ? ans.authorId.profile_picture : `${API_BASE_URL}${ans.authorId.profile_picture || ""}`} alt="" className="w-6 h-6 rounded-full border border-slate-200 bg-white" />
                      <span className="font-semibold text-slate-700">{ans.authorId.fullname || ans.authorId.username}</span>
                      <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(ans.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Answer Input */}
        {authUser ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h3>
            <form onSubmit={handlePostAnswer}>
              <textarea 
                className="w-full border border-slate-300 px-4 py-3 rounded-xl min-h-[150px] resize-y focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none mb-4"
                placeholder="Write your definitive answer here..."
                value={answerContent}
                onChange={e => setAnswerContent(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
              >
                Post Your Answer
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Join the Discussion</h3>
            <p className="text-slate-500 mb-4">Please log in to answer this question.</p>
            <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-block">Log In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
