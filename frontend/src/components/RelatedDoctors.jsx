import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ speciality, docId }) => {

  const { doctors } = useContext(AppContext)
  const navigate = useNavigate()
  const [relDoc, setRelDocs] = useState([])

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
      setRelDocs(doctorsData)
    }
  }, [doctors, speciality, docId])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 mdLmx-10'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors</p>
      <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            key={index}
            onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }}
            className='doctor-card group cursor-pointer flex flex-col'
          >
            <div className="relative aspect-square overflow-hidden bg-light-tint/50">
              <img
                className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                src={item.image}
                alt={item.name}
              />
            </div>

            <div className='p-5 flex flex-col gap-1'>
              <div className='flex items-center justify-between mb-1'>
                <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-success-color' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-success-color animate-pulse' : 'bg-gray-400'}`}></span>
                  <p className='font-medium'>{item.available ? 'Available' : 'Not Available'}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-heading font-black text-xs">4.9</span>
                </div>
              </div>
              <p className='text-heading text-lg font-extrabold group-hover:text-primary transition-colors'>{item.name}</p>
              <p className='text-primary text-xs font-bold uppercase tracking-wider'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
    </div>
  )
}

export default RelatedDoctors
