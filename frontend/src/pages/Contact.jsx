import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-3xl pt-10 text-body'>
        <p>CONTACT <span className='text-heading font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-12 mb-28 text-sm'>

        <img className='w-full md:max-w-[360px] rounded-2xl shadow-md' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-bold text-xl text-heading tracking-wide uppercase font-medium'>Our Office</p>
          <p className='text-body leading-relaxed'>54709 Willms Station<br /> Suite 350, Washington, USA</p>
          <p className='text-body leading-relaxed'>Tel: (415) 555‑0132<br /> Email: support@pulsepoint.com </p>
          <p className='font-bold text-xl text-heading tracking-wide uppercase font-medium'>Careers at PulsePoint</p>
          <p className='text-body leading-relaxed'>Learn more about our teams and job openings.</p>
          <button className='border border-primary text-primary px-10 py-4 text-sm hover:bg-primary hover:text-white transition-all duration-500 rounded-lg font-medium shadow-sm'>Explore Jobs</button>
        </div>
      </div>




    </div>
  )
}

export default Contact
