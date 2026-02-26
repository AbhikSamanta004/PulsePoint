import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])


  return (


    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium text-heading'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((item, index) => (
            <div className='border border-border-color rounded-xl max-w-56 overflow-hidden cursor-pointer group hover:translate-y-[-10px] transition-all duration-500 hover:shadow-card-hover bg-white' key={index}>
              <img className='bg-light-tint group-hover:bg-primary/10 transition-all duration-500' src={item.image} alt="" />
              <div className='p-4'>
                <p className='text-heading text-lg font-medium'>{item.name}</p>
                <p className='text-body text-sm'>{item.speciality}</p>
                <div className='mt-2 flex items-center justify-between'>
                  <div className='flex items-center gap-1 text-sm text-body'>
                    <input className="accent-primary" onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                    <p>Available</p>
                  </div>
                  <button onClick={() => navigate(`/edit-doctor/${item._id}`)} className='text-primary text-sm font-medium hover:underline'>Edit</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>


    </div>
  )
}

export default DoctorsList
