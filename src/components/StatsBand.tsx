import React from 'react';

export const StatsBand: React.FC = () => {
  return (
    <section className="bg-[#1a1410] text-[#f7f3ed] py-12 px-4 sm:px-6 border-b border-[#2e2620]">
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#2e2620]">
        <div className="pt-4 md:pt-0">
          <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#fdfaf6] tracking-tight">
            24<span className="text-xl sm:text-2xl text-[#8a6f5a]">/28</span>
          </p>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#c8bfb4] mt-1.5">
            Parents connected
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-4">
          <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#d4e8da] tracking-tight">
            100<span className="text-xl sm:text-2xl text-[#a8cdb4]">%</span>
          </p>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#c8bfb4] mt-1.5">
            Delivery rate this week
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-4">
          <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#fdfaf6] tracking-tight">
            58<span className="text-xl sm:text-2xl text-[#8a6f5a]">s</span>
          </p>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#c8bfb4] mt-1.5">
            Avg. dispatch time
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-4">
          <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#f5e6c8] tracking-tight">
            4.2<span className="text-xl sm:text-2xl text-[#8a6f5a]">&times;</span>
          </p>
          <p className="text-xs uppercase font-semibold tracking-wider text-[#c8bfb4] mt-1.5">
            Reading nights / week
          </p>
        </div>
      </div>
    </section>
  );
};
