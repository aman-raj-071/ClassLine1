import React from 'react';
import { Users, GraduationCap, Check, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface RolesSectionProps {
  onSelectRoleLogin: (role: UserRole) => void;
}

export const RolesSection: React.FC<RolesSectionProps> = ({ onSelectRoleLogin }) => {
  return (
    <section id="access-code-role-choices" className="py-16 sm:py-24 bg-[#f7f3ed]" tabIndex={-1}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b5a48]">
            Who it&rsquo;s for
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1410] tracking-tight">
            Built for both sides of the conversation
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parent Card */}
          <div className="bg-[#fdfaf6] rounded-3xl p-8 sm:p-10 border border-[#d4cdc4] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ede4d9] text-[#6b5a48] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#1a1410]">
                For Parents
              </h3>

              <p className="text-sm text-[#5a4f45] leading-relaxed">
                Your child&rsquo;s school life, beautifully organised. See every note, event, and fee the moment it&rsquo;s dispatched &mdash; and never let another trip deadline slip past.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#1a1410]">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Per-child individual timeline</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Fee tracking &amp; instant UPI receipts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Interactive nightly reading log</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Direct, quiet notes to class teachers</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRoleLogin('parent')}
              className="w-full py-3.5 px-6 rounded-full bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 group transition-all"
            >
              <span>Sign in as Parent</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Teacher Card */}
          <div className="bg-[#fdfaf6] rounded-3xl p-8 sm:p-10 border border-[#d4cdc4] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4e8da] text-[#1e3828] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#1a1410]">
                For Teachers
              </h3>

              <p className="text-sm text-[#5a4f45] leading-relaxed">
                Compose and dispatch in under a minute. Monitor delivery status, verify parent acknowledgements, and keep your class registry in calm, predictable order.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#1a1410]">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Fast ledger composer with classifications</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Instant delivery &amp; read analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Classroom engagement index and attention ledger</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#d4e8da] text-[#2a4a35] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Target whole class or tailored pupil groups</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectRoleLogin('teacher')}
              className="w-full py-3.5 px-6 rounded-full bg-[#2a4a35] text-[#f7f3ed] hover:bg-[#1e3828] font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 group transition-all"
            >
              <span>Sign in as Teacher</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
