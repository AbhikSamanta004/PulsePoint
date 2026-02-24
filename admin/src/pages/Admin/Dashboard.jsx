import React from "react";
import { AdminContext } from "../../context/AdminContext";
import { useContext } from "react";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return (
    dashData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-border-color cursor-pointer hover:shadow-card-hover transition-all duration-300">
            <img className="w-14 bg-light-tint p-2 rounded-full" src={assets.doctor_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-heading">
                {dashData.doctors}
              </p>
              <p className="text-body text-sm font-medium">Doctors</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-border-color cursor-pointer hover:shadow-card-hover transition-all duration-300">
            <img className="w-14 bg-light-tint p-2 rounded-full" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-heading">
                {dashData.appointments}
              </p>
              <p className="text-body text-sm font-medium">Appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border border-border-color cursor-pointer hover:shadow-card-hover transition-all duration-300">
            <img className="w-14 bg-light-tint p-2 rounded-full" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-heading">
                {dashData.patients}
              </p>
              <p className="text-body text-sm font-medium">Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border border-border-color bg-light-tint/30">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold text-heading">Latest Bookings</p>
          </div>

          <div className="pt-4 border border-border-color border-t-0">
            {dashData.latestAppointments.map((item, index) => (
              <div
                className="flex items-center px-6 py-3 gap-3 border-b border-border-color last:border-0 hover:bg-light-tint/50 transition-all duration-200"
                key={index}
              >
                <img
                  className="rounded-full w-10"
                  src={item.docData.image}
                  alt=""
                />
                <div className="flex-1 text-sm">
                  <p className="text-heading font-medium">
                    {item.docData.name}
                  </p>
                  <p className="text-body">
                    {slotDateFormat(item.slotDate)}
                  </p>
                </div>
                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-success-color text-xs font-medium uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded">
                    Completed
                  </p>
                ) : (
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
