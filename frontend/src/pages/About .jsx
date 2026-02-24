import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-3xl pt-10 text-body">
        <p>
          ABOUT <span className="text-heading font-semibold">PULSEPOINT</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12 items-center">
        <img
          className="w-full md:max-w-[360px] rounded-2xl shadow-md"
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-body leading-relaxed">
          <p>
            Welcome to <span className="text-primary font-semibold">PulsePoint</span>, your trusted partner in managing your
            healthcare needs conveniently and efficiently. At PulsePoint, we
            understand the challenges individuals face when it comes to
            scheduling doctor appointments and managing their health records.
          </p>
          <p>
            PulsePoint is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior
            service. Whether you're booking your first appointment or managing
            ongoing care, PulsePoint is here to support you every step of the
            way.
          </p>
          <b className="text-heading text-lg">Our Vision</b>
          <p>
            Our vision at PulsePoint is to create a seamless healthcare
            experience for every user. We aim to bridge the gap between patients
            and healthcare providers, making it easier for you to access the
            care you need, when you need it.
          </p>
        </div>
      </div>

      <div className="text-2xl my-8">
        <p className="text-body uppercase tracking-wider">
          WHY <span className="text-heading font-bold">CHOOSE US</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row mb-20 gap-0 border border-border-color rounded-2xl overflow-hidden shadow-sm">
        <div className="px-10 md:px-16 py-12 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-body cursor-pointer border-b md:border-b-0 md:border-r border-border-color">
          <b className="text-heading hover:inherit">Efficiency:</b>
          <p>Streamlined appointment scheduling that fits into your busy lifestyle.</p>
        </div>
        <div className="px-10 md:px-16 py-12 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-body cursor-pointer border-b md:border-b-0 md:border-r border-border-color">
          <b className="text-heading hover:inherit">Convenience:</b>
          <p>Access to a network of trusted healthcare professionals in your area.</p>
        </div>
        <div className="px-10 md:px-16 py-12 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-body cursor-pointer">
          <b className="text-heading hover:inherit">Personalization:</b>
          <p>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
