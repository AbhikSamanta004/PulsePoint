import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')


  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      } else {

        const { data } = await axios.post(backendUrl + '/api/user/login', { password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }


      }
    } catch (error) {

      toast.error(error.message)

    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-10 min-w-[340px] sm:min-w-[420px] border border-border-color rounded-2xl text-body text-sm shadow-xl bg-white'>
        <p className='text-2xl font-semibold text-heading'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p className="text-body">Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>
        {
          state === "Sign Up" && <div className='w-full'>
            <p className="font-medium text-heading">Full Name</p>
            <input className='border border-border-color rounded w-full p-2.5 mt-1 focus:border-primary outline-none transition-all' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
          </div>

        }

        <div className='w-full'>
          <p className="font-medium text-heading">Email</p>
          <input className='border border-border-color rounded w-full p-2.5 mt-1 focus:border-primary outline-none transition-all' type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>

        <div className='w-full'>
          <p className="font-medium text-heading">Password</p>
          <input className='border border-border-color rounded w-full p-2.5 mt-1 focus:border-primary outline-none transition-all' type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>

        <button type='submit' className='bg-primary text-white w-full py-3 rounded-xl text-base font-medium hover:bg-primary-hover transition-all duration-300 shadow-md mt-2'>{state === 'Sign Up' ? "Create Account" : "Login"}</button>
        {
          state === "Sign Up"
            ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
            : <p>Create an new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
