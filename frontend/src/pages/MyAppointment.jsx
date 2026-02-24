import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointment = () => {


  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]



  const slotDateFormat = (slotDate) => {

    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const navigate = useNavigate()

  const getUserAppointments = async () => {
    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })

      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments)
      }


    } catch (error) {

      console.log(error)
      toast.error(error.message)

    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {

      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()

      } else {
        toast.error(data.message)
      }

    } catch (error) {

      console.log(error)
      toast.error(error.message)
    }
  }

  const initpay = (order) => {

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response)

        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifyRazorpay', response, { headers: { token } })
          if (data.success) {
            getUserAppointments()
            navigate('/my-appointments')
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()

  }

  const appointmentRazorpay = async (appointmentId) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })

      if (data.success) {
        initpay(data.order)
      }

    } catch (error) {

    }
  }


  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-semibold text-heading border-b border-border-color text-xl'>My Appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b border-border-color last:border-0' key={index}>
            <div>
              <img className='w-32 bg-light-tint p-2 rounded-lg' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-body'>
              <p className='text-heading font-semibold text-lg'>{item.docData.name}</p>
              <p className='text-primary font-medium'>{item.docData.speciality}</p>
              <p className='text-heading font-medium mt-2'>Address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-2'><span className='text-sm text-heading font-medium'>Date & Time:</span> <span className="text-body">{slotDateFormat(item.slotDate)} | {item.slotTime}</span></p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {item.appointmentMode === 'Physical' && (
                <div className='text-xs text-body mb-2'>
                  <p className='font-semibold text-heading'>Clinic Address:</p>
                  <p>{item.docData.address.line1}, {item.docData.address.line2}</p>
                </div>
              )}

              {!item.cancelled && item.payment && !item.isCompleted && (
                <div className='flex flex-col gap-2'>
                  {item.appointmentMode === 'Online' && (
                    <button onClick={() => navigate(`/video-consultation/${item._id}`)} className='sm:min-w-48 py-2 border border-border-color rounded text-white bg-primary hover:bg-primary-hover transition-all duration-300 shadow-sm'>
                      Join Consultation
                    </button>
                  )}
                  <button onClick={() => navigate(`/chat/${item._id}`)} className='sm:min-w-48 py-2 border border-primary/20 rounded text-primary bg-light-tint hover:bg-primary hover:text-white transition-all duration-300'>
                    Open Chat
                  </button>
                </div>
              )}
              {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-border-color rounded text-heading bg-page-bg cursor-default font-medium'>Paid</button>}
              {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={() => appointmentRazorpay(item._id)} className='text-sm text-primary text-center sm:min-w-48 py-2 border border-primary/20 rounded bg-light-tint hover:bg-primary hover:text-white transition-all duration-300 font-medium'>Pay Online</button>}
              {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-body text-center sm:min-w-48 py-2 border border-border-color rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 font-medium'>Cancel appointment</button>}
              {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500 font-medium bg-red-50/30'>Appointment cancelled</button>}
              {item.isCompleted && <button className='sm:min-w-48 py-2 border border-success-color rounded text-success-color font-medium bg-green-50/30'>Completed</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointment
