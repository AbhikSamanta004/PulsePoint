import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10 mt-40 border-t border-gray-100 pt-16 pb-12'>
      <div className='flex flex-col sm:grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-12 text-sm'>

        {/*----Left Side: Brand & About----- */}
        <div className="flex flex-col items-start gap-6">
          <img className='w-40 hover:opacity-80 transition-opacity' src={assets.logo} alt="PulsePoint" />
          <p className='text-gray-500 leading-relaxed max-w-sm'>
            PulsePoint is committed to delivering world-class healthcare accessibility.
            Connect with top specialists and experience a seamless medical journey.
          </p>
          <div className="flex gap-4 mt-2">
            <div className="w-9 h-9 rounded-full bg-light-tint flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
              <span className="font-bold text-xs">FB</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-light-tint flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
              <span className="font-bold text-xs">IN</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-light-tint flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
              <span className="font-bold text-xs">𝕏</span>
            </div>
          </div>
        </div>

        {/*----Center Side: Quick Links----- */}
        <div>
          <p className='text-heading text-lg font-extrabold mb-6 tracking-tight'>COMPANY</p>
          <ul className='flex flex-col gap-3 text-gray-500'>
            <li className="hover:text-primary transition-colors cursor-pointer">Home</li>
            <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Contact Us</li>
            <li className="hover:text-primary transition-colors cursor-pointer text-[#22C55E] font-bold">Prescription AI</li>
          </ul>
        </div>

        {/*----Center Side: Support----- */}
        <div>
          <p className='text-heading text-lg font-extrabold mb-6 tracking-tight'>SUPPORT</p>
          <ul className='flex flex-col gap-3 text-gray-500'>
            <li className="hover:text-primary transition-colors cursor-pointer">Patient Care</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Help Center</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Terms of Service</li>
          </ul>
        </div>

        {/*----Right Side: Contact INFO----- */}
        <div className="flex flex-col max-sm:items-start items-end text-end max-sm:text-start">
          <p className='text-heading text-lg font-extrabold mb-6 tracking-tight'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-3 text-gray-500'>
            <li className="hover:text-primary transition-colors cursor-pointer font-bold text-heading">+1-212-456-7890</li>
            <li className="hover:text-primary transition-colors cursor-pointer">abhiksamanta20@gmail.com</li>
            <li className="mt-4 text-xs font-bold text-primary px-4 py-2 border border-primary/20 bg-primary/5 rounded-full inline-block">Support Available 24/7</li>
          </ul>
        </div>
      </div>

      {/*----Copyright Section---*/}
      <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className='text-sm text-gray-400'>&copy; 2025 <span className="text-primary font-bold">PulsePoint</span>. All Rights Reserved.</p>
        <div className="flex gap-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
          <span className="hover:text-primary cursor-pointer transition-colors">Accessibility</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Legal</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Cookies</span>
        </div>
      </div>
    </div>
  )
}

export default Footer
