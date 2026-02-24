import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false)

  const updateUserProfileData = async () => {
    try {

      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      image && formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }


  return userData && (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      {
        isEdit
          ? <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img className="w-36 rounded opacity-75" src={image ? URL.createObjectURL(image) : userData.image} alt="" />
              <img className="w-10 absolute bottom-12 right-12" src={image ? '' : assets.upload_icon} alt="" />
            </div>
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
          </label>
          : <img className="w-36 rounded" src={userData.image} alt="" />
      }



      {isEdit ? (
        <input className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={userData.name}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">{userData.name}</p>
      )}

      <hr className="bg-border-color h-[1px] border-none" />
      <div>
        <p className="text-body underline mt-3 font-medium">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-heading">
          <p className="font-medium">Email id:</p>
          <p className="text-primary">{userData.email}</p>
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input className="bg-page-bg border border-border-color px-2 py-1 max-w-52 rounded"
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <p className="text-primary font-medium">{userData.phone}</p>
          )}
          <p className="font-medium ">Address:</p>
          {
            isEdit
              ? <p className="flex flex-col gap-2 font-light">
                <input className='bg-page-bg border border-border-color px-2 py-1 rounded' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} type="text" />
                <input className='bg-page-bg border border-border-color px-2 py-1 rounded' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} type="text" />
              </p>
              : <p className='text-body'>
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
          }
        </div>
      </div>
      <div>
        <p className="text-body underline mt-3 font-medium">BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-heading'>
          <p className="font-medium">Gender:</p>
          {
            isEdit
              ? <select className="max-w-28 bg-page-bg border border-border-color px-2 py-1 rounded" onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              : <p className="text-body">{userData.gender}</p>
          }
          <p className="font-medium">Birthday:</p>
          {
            isEdit
              ? <input className="max-w-32 bg-page-bg border border-border-color px-2 py-1 rounded" type="date" onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
              : <p className="text-body">{userData.dob}</p>

          }
        </div>
      </div>
      <div className='mt-10'>
        {
          isEdit
            ? <button className="bg-primary text-white hover:bg-primary-hover px-10 py-2.5 rounded-full transition-all duration-300 shadow-md font-medium" onClick={updateUserProfileData}>Save information</button>
            : <button className="bg-light-tint text-primary hover:bg-primary hover:text-white px-10 py-2.5 rounded-full transition-all duration-300 shadow-sm font-medium border border-primary/10" onClick={() => setIsEdit(true)}>Edit</button>

        }
      </div>
    </div>
  );
};

export default MyProfile;
