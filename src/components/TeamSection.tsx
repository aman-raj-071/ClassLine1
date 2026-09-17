import React from 'react';
import { Users, Heart } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';

export const TeamSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#fdfaf6] border-t border-[#d4cdc4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e2d8] text-xs font-bold uppercase tracking-wider text-[#6b5a48]">
            <Users className="w-3.5 h-3.5" />
            <span>The People Behind ClassLine</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1410] tracking-tight">
            Meet the Team
          </h2>

          <p className="font-serif italic text-base text-[#5a4f45] leading-relaxed">
            A small, passionate group of educators and engineers who believe that great communication between home and school changes everything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <article
              key={idx}
              className="bg-[#f7f3ed] rounded-2xl p-6 border border-[#d4cdc4] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${member.bgClass} ${member.textClass} shadow-inner shrink-0`}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1a1410] leading-none">
                      {member.name}
                    </h3>
                    <p className="text-xs uppercase font-bold tracking-wider text-[#6b5a48] mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#5a4f45] leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#d4cdc4]/60">
                {member.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-0.5 rounded-md bg-[#e8e2d8] text-[#5a4f45] text-[11px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="pt-6 border-t border-[#d4cdc4]/70 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs text-[#5a4f45] font-serif italic">
            <Heart className="w-3.5 h-3.5 text-[#9b2c2c] fill-[#9b2c2c]" />
            <span>Built with care for Saraswati Vidya Mandir &mdash; and every school that follows.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
