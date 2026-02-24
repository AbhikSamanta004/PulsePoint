import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [appointmentMode, setAppointmentMode] = useState('Physical')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    let allSlots = []
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      // Get the date for the current iteration day
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // Set booking hours: 10:00 AM to 9:00 PM
      let startOfSlot = new Date(currentDate)
      startOfSlot.setHours(10, 0, 0, 0)

      let endOfSlot = new Date(currentDate)
      endOfSlot.setHours(21, 0, 0, 0)

      // If we are looking at "today", adjust start time to at least 1 hour from now
      if (today.getDate() === currentDate.getDate()) {
        let now = new Date()
        // If it's already past 9 PM today, skip today entirely
        if (now.getHours() >= 21) {
          continue;
        }
        // Start from (now + 1 hour) rounded up to the nearest 30 mins
        let minStart = new Date(now.getTime() + 60 * 60 * 1000)
        if (minStart.getMinutes() > 0 && minStart.getMinutes() <= 30) {
          minStart.setMinutes(30, 0, 0)
        } else if (minStart.getMinutes() > 30) {
          minStart.setHours(minStart.getHours() + 1, 0, 0, 0)
        } else {
          minStart.setSeconds(0, 0)
        }

        // Use the later of 10 AM or our minStart
        startOfSlot = new Date(Math.max(startOfSlot.getTime(), minStart.getTime()))

        // If our adjusted start is past 9 PM, skip today
        if (startOfSlot >= endOfSlot) continue;
      }

      let timeSlots = []
      let tempDate = new Date(startOfSlot)

      while (tempDate < endOfSlot) {
        // Build the time string manually for consistency: "hh:mm am/pm"
        let hours = tempDate.getHours()
        let minutes = tempDate.getMinutes()
        let ampm = hours >= 12 ? 'pm' : 'am'
        let displayHours = hours % 12 || 12
        // Ensure 2-digit format for hours and minutes to match original UI expectations
        let hh = displayHours < 10 ? '0' + displayHours : displayHours
        let mm = minutes < 10 ? '0' + minutes : minutes
        let formattedTime = `${hh}:${mm} ${ampm}`

        let day = tempDate.getDate()
        let month = tempDate.getMonth() + 1
        let year = tempDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const slotTimeKey = formattedTime

        // Check availability
        const isSlotAvailable = docInfo.slots_booked && docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTimeKey) ? false : true

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(tempDate),
            time: formattedTime
          })
        }

        // Increment by 30 minutes
        tempDate.setMinutes(tempDate.getMinutes() + 30)
      }

      // Add the day if it has slots
      if (timeSlots.length > 0) {
        allSlots.push(timeSlots)
      }
    }

    setDocSlots(allSlots)
    setSlotIndex(0)
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    try {
      if (!docSlots[slotIndex] || !slotTime) {
        toast.error("Please select a time slot")
        return
      }

      const date = docSlots[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime, appointmentMode }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      setSlotTime('')
      getAvailableSlots()
    }
  }, [docInfo])

  return docInfo && (
    <div className='pb-10'>
      {/* ---  doctors details------*/}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-border-color rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 shadow-sm'>
          {/*----doc info:name,degree,experience -----*/}
          <p className='flex items-center gap-2 text-2xl font-medium text-heading'>{docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-body'>
            <p>{docInfo.degree}- {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border border-border-color text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          {/*--------doctor about ------*/}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-heading mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-body max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-body font-medium mt-4'>Appointment fee: <span className='text-heading'>{currencySymbol}{docInfo.fees}</span></p>

          {/* Consultation Type Selection */}
          <div className='mt-4 flex flex-col gap-2'>
            <p className='text-heading font-medium'>Select Consultation Mode:</p>
            <div className='flex gap-4'>
              {(docInfo.consultationType === 'Both' || docInfo.consultationType === 'Physical' || !docInfo.consultationType) && (
                <div onClick={() => setAppointmentMode('Physical')} className={`flex items-center gap-2 cursor-pointer p-2 px-4 border rounded-full transition-all ${appointmentMode === 'Physical' ? 'bg-primary text-white border-primary shadow-sm' : 'border-border-color text-body hover:bg-light-tint'}`}>
                  <input type="radio" checked={appointmentMode === 'Physical'} readOnly className='hidden' />
                  <span className='text-sm'>Physical Visit</span>
                </div>
              )}
              {(docInfo.consultationType === 'Both' || docInfo.consultationType === 'Online' || !docInfo.consultationType) && (
                <div onClick={() => setAppointmentMode('Online')} className={`flex items-center gap-2 cursor-pointer p-2 px-4 border rounded-full transition-all ${appointmentMode === 'Online' ? 'bg-primary text-white border-primary shadow-sm' : 'border-border-color text-body hover:bg-light-tint'}`}>
                  <input type="radio" checked={appointmentMode === 'Online'} readOnly className='hidden' />
                  <span className='text-sm'>Online Consultation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*--------booking slot------*/}
      <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-heading'>
        <p className='text-xl'>Booking Slots</p>
        <div className='flex gap-4 items-center w-full overflow-x-auto mt-6 pb-2 scrollbar-none'>
          {
            docSlots.length > 0 && docSlots.map((item, index) => (
              <div onClick={() => { setSlotIndex(index); setSlotTime(''); }} className={`text-center py-6 min-w-16 rounded-full cursor-pointer transition-all duration-300 ${slotIndex === index ? 'bg-primary text-white shadow-md' : 'border border-border-color text-body hover:bg-light-tint'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-auto mt-8 pb-2 scrollbar-none'>
          {docSlots.length > 0 && docSlots[slotIndex] && docSlots[slotIndex].map((item, index) => (
            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-all duration-300 ${item.time === slotTime ? 'bg-primary text-white shadow-sm' : 'text-body border border-border-color hover:bg-light-tint'}`} key={index}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} disabled={!slotTime} className={`bg-primary text-white text-sm font-light px-16 py-4 rounded-full my-8 transition-all duration-300 shadow-md ${!slotTime ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-hover active:scale-95'}`}>
          {slotTime ? 'Book an appointment' : 'Select a time slot'}
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
