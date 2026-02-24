import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium text-heading">All Appointments</p>

      <div className="bg-white border border-border-color rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll shadow-sm">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b border-border-color bg-light-tint/30 text-heading font-semibold uppercase text-xs tracking-wider">
          <p>#</p>
          <p>Patient </p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-body py-3 px-6 border-b border-border-color hover:bg-page-bg transition-all duration-200"
            key={index}
          >
            <p className="max-sm:hidden font-medium text-heading">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-light-tint"
                src={item.userData.image}
                alt=""
              />
              <p className="text-heading font-medium">{item.userData.name}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 py-0.5 rounded-full text-primary font-medium bg-light-tint">
                {item.payment ? "Online" : "Cash"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)},{item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-success-color text-xs font-medium uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded text-center">Completed</p>
            ) : (
              <div className="flex items-center gap-2">
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <>
                    {item.appointmentMode === 'Online' && (
                      <button
                        onClick={() => navigate(`/video-consultation/${item._id}`)}
                        className="bg-primary text-white text-[10px] px-2 py-1 rounded-full hover:opacity-90"
                      >
                        Join
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/chat/${item._id}`)}
                      className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-full hover:opacity-90"
                    >
                      Chat
                    </button>
                  </>
                )}
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
