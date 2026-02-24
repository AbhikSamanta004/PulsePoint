import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [suggestedDoctors, setSuggestedDoctors] = useState([]);
    const { backendUrl, token, navigate } = useContext(AppContext);
    const chatEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!symptoms.trim()) return;
        if (!token) {
            toast.error("Please login to use AI Symptom Checker");
            return;
        }

        setLoading(true);
        setResponse(null);
        try {
            const { data } = await axios.post(backendUrl + '/api/ai/check-symptoms', { symptoms }, { headers: { token } });
            if (data.success) {
                setResponse(data.aiResponse);
                setSuggestedDoctors(data.suggestedDoctors || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("AI service is currently unavailable.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [response, loading]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <style>
                {`
                    @keyframes ring-pulse {
                        0% { transform: scale(0.85); opacity: 0.3; }
                        50% { transform: scale(1.05); opacity: 0.6; }
                        100% { transform: scale(0.85); opacity: 0.3; }
                    }
                    .animate-ring {
                        animation: ring-pulse 2s ease-in-out infinite;
                        transform-origin: center;
                    }
                `}
            </style>
            {/* Chat Floating Button */}
            <button
                onClick={toggleChat}
                className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative flex items-center justify-center w-6 h-6">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" className="animate-ring" />
                            <path d="M2 12H5L7 6L11 18L13 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                        </svg>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[90vw] sm:w-[400px] max-h-[600px] bg-white border border-border-color rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex items-center gap-3">
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" className="animate-ring" />
                                <path d="M2 12H5L7 6L11 18L13 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">AI Symptom Checker</p>
                            <p className="text-[10px] opacity-80">Powered by Gemini AI</p>
                        </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-page-bg min-h-[300px]">
                        <div className="bg-white p-3 rounded-xl border border-border-color text-sm text-body shadow-sm self-start max-w-[85%]">
                            Hello! I'm your AI health assistant. Describe your symptoms (e.g., "I have a sharp headache and nausea for 2 days"), and I'll help you understand what might be happening.
                        </div>

                        {symptoms && !loading && !response && (
                            <div className="bg-primary text-white p-3 rounded-xl shadow-sm self-end max-w-[85%] text-sm hidden group-last:block">
                                {symptoms}
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center gap-2 text-body text-sm italic p-2">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">●</span>
                                <span className="animate-bounce delay-200">●</span>
                                AI is analyzing your symptoms...
                            </div>
                        )}

                        {response && (
                            <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-white border-2 border-primary/20 rounded-xl p-4 shadow-md">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xl font-bold text-heading">Initial Analysis</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${response.urgencyLevel === 'High' ? 'bg-red-100 text-red-600' :
                                            response.urgencyLevel === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {response.urgencyLevel} Urgency
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-body font-medium uppercase text-[10px] tracking-tight">Possible Issue</p>
                                            <p className="text-heading font-semibold">{response.possibleIssue}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-body font-medium uppercase text-[10px] tracking-tight">Department</p>
                                                <p className="text-heading font-semibold">{response.recommendedDepartment}</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-medium uppercase text-[10px] tracking-tight">Specialist</p>
                                                <p className="text-heading font-semibold">{response.recommendedSpecialist}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-border-color">
                                            <p className="text-body font-medium uppercase text-[10px] tracking-tight mb-1">Suggested Action</p>
                                            <p className="text-heading bg-light-tint p-2 rounded-lg border border-primary/10 italic">{response.suggestedAction}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-body italic text-center px-4">Disclaimer: This is an AI-generated suggestion and not a professional medical diagnosis. Please consult a doctor for proper examination.</p>

                                {suggestedDoctors.length > 0 && (
                                    <div className="mt-2 space-y-3">
                                        <p className="text-body font-bold text-xs uppercase tracking-widest pl-1">Available Specialists</p>
                                        <div className="flex flex-col gap-2">
                                            {suggestedDoctors.map((doc, index) => (
                                                <div key={index} className="flex items-center gap-3 bg-white p-2 border border-border-color rounded-xl hover:shadow-md transition-all cursor-pointer group" onClick={() => { navigate(`/appointment/${doc._id}`); setIsOpen(false); }}>
                                                    <img className="w-12 h-12 rounded-lg bg-light-tint object-cover" src={doc.image} alt={doc.name} />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-heading group-hover:text-primary transition-colors">{doc.name}</p>
                                                        <p className="text-[10px] text-body">{doc.speciality}</p>
                                                    </div>
                                                    <div className="text-primary font-medium text-[10px] px-3 py-1 bg-light-tint rounded-full group-hover:bg-primary group-hover:text-white transition-all">Book</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-border-color">
                        {response ? (
                            <button
                                onClick={() => { setResponse(null); setSuggestedDoctors([]); setSymptoms(''); }}
                                className="w-full py-2 bg-light-tint text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                            >
                                Check New Symptoms
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="Describe how you feel..."
                                    className="flex-1 border border-border-color rounded-xl px-3 py-2 text-sm focus:border-primary outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !symptoms.trim()}
                                    className="bg-primary text-white p-2 rounded-xl disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
