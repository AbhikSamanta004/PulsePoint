import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (state === 'Admin') {

        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })

        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          navigate('/admin-dashboard')
        } else {
          toast.error(data.message)
        }

      } else {

        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          console.log(data.token)
          navigate('/doctor-dashboard')
        } else {
          toast.error(data.message)
        }

      }


    } catch (error) {
      console.log(error);
    }
  }


  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-10 min-w-[340px] sm:min-w-[420px] border border-border-color rounded-2xl text-body text-sm shadow-xl bg-white'>
        <p className='text-2xl font-semibold m-auto text-heading'><span className='text-primary'>{state}</span> Login</p>
        <div className='w-full'>
          <p className="font-medium text-heading">Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-border-color rounded w-full p-2.5 mt-1 focus:border-primary outline-none transition-all' type="email" required />
        </div>
        <div className='w-full'>
          <p className="font-medium text-heading">Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-border-color rounded w-full p-2.5 mt-1 focus:border-primary outline-none transition-all' type="password" required />
        </div>
        <button className='bg-primary text-white w-full py-3 rounded-xl text-base font-medium hover:bg-primary-hover transition-all duration-300 shadow-md mt-2' >Login</button>
        {
          state === 'Admin'
            ? <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Doctor')}>Click Here</span></p>
            : <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>Click Here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
