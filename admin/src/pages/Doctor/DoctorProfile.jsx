import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {

  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {

      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,

      }

      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
        // console.log(data.message)
      }


    } catch (error) {

      toast.error(error.message)
      console.log(error)

    }
  }

  useEffect(() => {

    getProfileData()

  }, [dToken])



  return profileData && (

    <div>
      <div className='flex flex-col gap-4 m-5'>

        <div>
          <img className='bg-primary w-full sm:max-w-64 rounded-xl shadow-md' src={profileData.image} alt="" />
        </div>

        <div className='flex-1 border border-border-color rounded-xl p-8 py-7 bg-white shadow-sm'>


          {/* -- --- Doc Info: name,degree,experience ------*/}

          <p className='flex items-center gap-2 text-3xl font-medium text-heading'>{profileData.name}</p>
          <div className='flex items-center gap-2 mt-1 text-body'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='py-0.5 px-2 border border-border-color text-xs rounded-full'>{profileData.experience}</button>
          </div>



          {/* ------Doc About ------*/}

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-heading mt-3' >About:</p>
            <p className='text-sm text-body max-w-[700px] mt-1' >
              {profileData.about}
            </p>
          </div>

          <p className='text-body font-medium mt-4'>
            Appointment fee: <span className='text-heading'>{currency} {isEdit ? <input className='border border-border-color px-2 py-0.5 rounded outline-none focus:border-primary' type="number" onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} /> : profileData.fees}</span>
          </p>

          <div className='flex gap-2 py-2 text-body'>
            <p className='font-medium text-heading'>Address:</p>
            <p className='text-sm'>
              {isEdit ? <input className='border border-border-color px-2 py-0.5 rounded outline-none focus:border-primary mb-2' type="text" onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} /> : profileData.address.line1}
              <br />
              {isEdit ? <input className='border border-border-color px-2 py-0.5 rounded outline-none focus:border-primary' type="text" onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} /> : profileData.address.line2}
            </p>
          </div>

          <div className='flex gap-1 pt-2 items-center text-body'>
            <input className='accent-primary' onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} type="checkbox" name="" id="available" />
            <label className='cursor-pointer' htmlFor="available">Available</label>
          </div>
          {
            isEdit
              ? <button onClick={updateProfile} className='px-10 py-2.5 bg-primary text-white text-sm rounded-full mt-5 hover:bg-primary-hover transition-all duration-300 shadow-md font-medium'>Save</button>
              : <button onClick={() => setIsEdit(true)} className='px-10 py-2.5 bg-light-tint text-primary hover:bg-primary hover:text-white border border-primary/10 text-sm rounded-full mt-5 transition-all duration-300 shadow-sm font-medium'>Edit</button>
          }

        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
