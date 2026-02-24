import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const PrescriptionUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const { backendUrl, token } = useContext(AppContext);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setMedicines([]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a prescription image first");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/ai/prescription-explain', formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.success) {
                setMedicines(data.medicines);
                toast.success("Prescription analyzed successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze prescription. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <div className='flex flex-col md:flex-row flex-wrap bg-hero-gradient rounded-lg px-6 md:px-10 lg:px-20 mb-10'>
                <div className='md:w-2/3 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[6vw]'>
                    <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight'>
                        AI Prescription <br /> Explainer
                    </p>
                    <div className='flex flex-col md:flex-row items-center gap-3'>
                        {/* <img src={assets.pulse_icon} className="invert w-12 opacity-80" alt="" /> */}
                        <p className='text-white text-sm md:text-base opacity-95'>
                            Confused by medical shorthand? Upload your printed prescription <br className='hidden sm:block' />
                            and let our advanced AI translate it into simple, actionable steps.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Upload */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white border-2 border-dashed border-border-color rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] transition-all hover:border-primary/50 relative overflow-hidden group shadow-sm">
                            {preview ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={preview} alt="Prescription preview" className="max-h-[380px] rounded-xl object-contain z-10 shadow-md" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setMedicines([]); }}
                                        className="absolute top-2 right-2 z-30 bg-white/80 backdrop-blur-sm p-2 rounded-full text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-body group-hover:text-primary transition-colors text-center px-4">
                                    <div className="w-20 h-20 bg-light-tint rounded-full flex items-center justify-center shadow-inner">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-semibold text-heading">Drop prescription here</p>
                                        <p className="text-sm opacity-70">Support PNG, JPG or PDF formats (Max 5MB)</p>
                                    </div>
                                    <button className="bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-medium">Browse Files</button>
                                </div>
                            )}
                            {!preview && (
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf"
                                />
                            )}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing Image...</span>
                                </>
                            ) : (
                                <>
                                    <img src={assets.pulse_icon} className="w-5 h-5 invert" alt="" />
                                    <span>Analyze Prescription</span>
                                </>
                            )}
                        </button>

                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-[11px] text-orange-800 leading-normal">
                                <span className="font-bold uppercase tracking-tight block mb-1">Medical Disclaimer</span>
                                This AI service is for informational purposes only. Do not make medical decisions solely based on this analysis. Always consult your doctor.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Evidence/Results */}
                    <div className="lg:col-span-7">
                        {loading && (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border border-border-color rounded-2xl p-10 text-center shadow-sm">
                                <div className="relative w-20 h-20 mb-6">
                                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={assets.pulse_icon} className="w-8 h-8 opacity-20" alt="" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-heading text-xl mb-2">AI is reading ...</h3>
                                <p className="text-body text-sm max-w-xs">Extracting medicine names, dosages, and patient instructions using computer vision.</p>
                            </div>
                        )}

                        {!loading && medicines.length > 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="flex items-center justify-between pb-4 border-b border-border-color">
                                    <h2 className="text-2xl font-bold text-heading">Prescription Details</h2>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {medicines.length} Medicines Found
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {medicines.map((med, index) => (
                                        <div key={index} className="bg-white border border-border-color rounded-2xl p-6 shadow-sm hover:shadow-card-hover transition-all duration-300 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-heading group-hover:text-primary transition-colors mb-1">{med.medicineName}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-primary/10 text-primary text-[11px] font-bold px-3 py-0.5 rounded-full">
                                                            {med.dosage}
                                                        </span>
                                                        <span className="text-body text-[11px] flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                            {med.timing}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-light-tint/50 border border-primary/5 rounded-xl p-4 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                                                <p className="text-sm leading-relaxed text-heading italic">
                                                    "{med.usageExplanation}"
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && medicines.length === 0 && (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border border-border-color border-dashed rounded-2xl p-10 text-center opacity-80 shadow-sm">
                                <div className="w-24 h-24 bg-page-bg rounded-full flex items-center justify-center mb-6 text-4xl grayscale opacity-50">
                                    📋
                                </div>
                                <h3 className="font-bold text-heading text-xl mb-2">Ready for Analysis</h3>
                                <p className="text-body text-sm max-w-xs leading-relaxed">
                                    Upload a photo of your printed prescription. Our AI will automatically identify medicines and explain them for you.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionUpload;
