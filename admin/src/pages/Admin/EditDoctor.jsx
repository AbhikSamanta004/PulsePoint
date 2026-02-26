import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditDoctor = () => {
    const { docId } = useParams();
    const navigate = useNavigate();

    const [docImg, setDocImg] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [experience, setExperience] = useState('1 Year');
    const [fees, setFees] = useState('');
    const [about, setAbout] = useState('');
    const [speciality, setSpeciality] = useState('General physician');
    const [degree, setDegree] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [existingImg, setExistingImg] = useState('');

    const { backendUrl, aToken } = useContext(AdminContext);

    const fetchDoctorData = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/get-doctor-data', { docId }, { headers: { aToken } });
            if (data.success) {
                const doc = data.doctor;
                setName(doc.name);
                setEmail(doc.email);
                setExperience(doc.experience);
                setFees(doc.fees);
                setAbout(doc.about);
                setSpeciality(doc.speciality);
                setDegree(doc.degree);
                setAddress1(doc.address.line1);
                setAddress2(doc.address.line2);
                setExistingImg(doc.image);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (aToken && docId) {
            fetchDoctorData();
        }
    }, [aToken, docId]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData();
            formData.append('docId', docId);
            if (docImg) {
                formData.append('image', docImg);
            }
            formData.append('name', name);
            formData.append('experience', experience);
            formData.append('fees', Number(fees));
            formData.append('about', about);
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

            const { data } = await axios.post(backendUrl + '/api/admin/update-doctor', formData, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                navigate('/doctor-list');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="m-5 w-full">
            <p className="mb-3 text-lg font-medium text-heading">Edit Doctor</p>
            <div className="bg-white px-8 py-8 border border-border-color rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-scroll shadow-sm">
                <div className="flex items-center gap-4 mb-8 text-body">
                    <label htmlFor="doc-img">
                        <img className="w-16 h-16 object-cover bg-light-tint rounded-full cursor-pointer p-1 border-2 border-dashed border-primary/30 hover:border-primary transition-all" src={docImg ? URL.createObjectURL(docImg) : (existingImg || assets.upload_area)} alt="" />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                    <p>
                        Update doctor <br /> picture
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-10 text-heading">
                    <div className="w-full lg:flex-1 flex flex-col gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Doctor name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all" type="text" placeholder="Name" required />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Doctor Email</p>
                            <input value={email} className="border border-border-color rounded px-3 py-2 bg-gray-50 cursor-not-allowed outline-none transition-all" type="email" placeholder="Email" disabled />
                            <p className="text-xs text-slate-400">Email cannot be changed</p>
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Experience</p>
                            <select onChange={(e) => setExperience(e.target.value)} value={experience} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all">
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Year</option>
                                <option value="3 Year">3 Year</option>
                                <option value="4 Year">4 Year</option>
                                <option value="5 Year">5 Year</option>
                                <option value="6 Year">6 Year</option>
                                <option value="7 Year">7 Year</option>
                                <option value="8 Year">8 Year</option>
                                <option value="9 Year">9 Year</option>
                                <option value="10 Year">10 Year</option>
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Fees</p>
                            <input onChange={(e) => setFees(e.target.value)} value={fees} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all" type="number" placeholder="Fees" required />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 flex flex-col gap-4 text-heading">
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Speciality</p>
                            <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all">
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Education</p>
                            <input onChange={(e) => setDegree(e.target.value)} value={degree} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all" type="text" placeholder="Education" required />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p className="font-medium">Address</p>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all" type="text" placeholder="address 1" required />
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className="border border-border-color rounded px-3 py-2 focus:border-primary outline-none transition-all mt-2" type="text" placeholder="address 2" required />
                        </div>
                    </div>
                </div>
                <div>
                    <p className="mt-4 mb-2 font-medium text-heading">About Doctor</p>
                    <textarea onChange={(e) => setAbout(e.target.value)} value={about} className="w-full px-4 pt-2 border border-border-color rounded-lg focus:border-primary outline-none transition-all" placeholder="write about doctor" rows={5} required />
                </div>

                <button type="submit" className="bg-primary hover:bg-primary-hover px-10 py-3 mt-4 text-white rounded-full font-medium transition-all shadow-md">Update Doctor</button>
            </div>
        </form>
    );
};

export default EditDoctor;
