import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'
const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800 ' id="speciality">
      <h1 className='text-3xl font-medium text-heading'>Find by Speciality</h1>
      <p className='sm:w-1/3 text-center text-sm text-body'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
        {specialityData.map((item, index) => (
          <Link onClick={() => scrollTo(0, 0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 group' key={index} to={`/doctors/${item.speciality}`}>
            <img className='w-16 sm:w-24 mb-2 bg-light-tint rounded-full p-2 transition-all duration-300 group-hover:shadow-card-hover' src={item.image} alt="" />
            <p className='text-body'>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu
