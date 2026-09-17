import React from 'react';
import { BookOpen, Lock, Zap, School, LogIn, ChevronDown, Check, CreditCard, ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onOpenLogin: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenLogin }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-12 lg:py-20 px-4 sm:px-6 overflow-hidden bg-[#1a1410] text-[#f7f3ed]">
      {/* Subtle fine horizontal rule overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 28px)',
        }}
      />

      <div className="relative z-10 max-w-[1240px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left: Editorial Copy */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7f3ed]/10 border border-[#f7f3ed]/15 text-xs font-semibold tracking-wider uppercase text-[#d4e8da]">
            <BookOpen className="w-3.5 h-3.5 text-[#a8cdb4]" />
            <span>School Communication Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-[#fdfaf6]">
            The Home &amp;&nbsp;School <br />
            <em className="italic font-light text-[#ede4d9]">Ledger.</em>
          </h1>

          {/* Subcopy */}
          <p className="text-base sm:text-lg text-[#c8bfb4] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed font-sans">
            A shared, real-time diary that keeps parents and teachers in perfect
            step &mdash; fees, daily notes, events and messages, beautifully organised
            in one trusted place.
          </p>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#ede4d9]/80 py-1">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#a8cdb4]" />
              Private &amp; Secure
            </span>
            <span className="text-[#6b5a48]">&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#f5e6c8]" />
              Real-time Sync
            </span>
            <span className="text-[#6b5a48]">&bull;</span>
            <span className="inline-flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#d4e8da]" />
              Saraswati Vidya Mandir
            </span>
          </div>

          {/* CTA Group */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              id="heroSignInBtn"
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#fdfaf6] text-[#1a1410] hover:bg-[#ede4d9] font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 group"
            >
              <LogIn className="w-4 h-4 text-[#8a6f5a] group-hover:scale-110 transition-transform" />
              <span>Sign In with Access Code</span>
            </button>
            <p className="text-xs text-[#c8bfb4]/70">
              Your school office provides your confidential 6-digit key.
            </p>
          </div>
        </div>

        {/* Right: Realistic Ledger Mock Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[460px] bg-[#fdfaf6] text-[#1a1410] rounded-2xl p-6 shadow-2xl border border-[#d4cdc4]/60 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Registration Corner Marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8a6f5a]/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8a6f5a]/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8a6f5a]/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8a6f5a]/40" />

            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1a1410] text-[#d4e8da] flex items-center justify-center shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif text-base font-semibold text-[#1a1410] leading-none block">
                    ClassLine
                  </span>
                  <span className="text-[10px] text-[#6b5a48] uppercase tracking-wider font-semibold">
                    Week 6 &mdash; Autumn Term
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4e8da] text-[#1e3828] text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#2a4a35] animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            {/* Mock Entries */}
            <div className="py-4 space-y-3">
              {/* Entry 1: Fee */}
              <div className="relative pl-3.5 pr-3 py-2.5 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4]/50 hover:border-[#8a6f5a]/40 transition-colors group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-[#9b2c2c]" />
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#f5ddd9] text-[#7a1e1e] font-bold">
                    Fee Due &bull; ₹1,500
                  </span>
                  <span className="text-[#6b5a48]">18 Oct</span>
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#1a1410]">
                  Autumn Trip &mdash; Natural History Museum
                </h4>
                <p className="text-xs text-[#5a4f45] mt-0.5">
                  Parental contribution via UPI by 24 Oct.
                </p>
              </div>

              {/* Entry 2: Note */}
              <div className="relative pl-3.5 pr-3 py-2.5 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4]/50 hover:border-[#8a6f5a]/40 transition-colors group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-[#3d6b4f]" />
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#d4e8da] text-[#1e3828] font-bold">
                    Note Home
                  </span>
                  <span className="text-[#6b5a48]">17 Oct</span>
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#1a1410]">
                  Excellent Guided Reading this week
                </h4>
                <p className="text-xs text-[#5a4f45] mt-0.5">
                  Leo showed great comprehension discussing &ldquo;The Iron Man.&rdquo;
                </p>
              </div>

              {/* Entry 3: Event */}
              <div className="relative pl-3.5 pr-3 py-2.5 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4]/50 hover:border-[#8a6f5a]/40 transition-colors group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-[#6b5a48]" />
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#ede4d9] text-[#4a3c30] font-bold">
                    Event
                  </span>
                  <span className="text-[#6b5a48]">16 Oct</span>
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#1a1410]">
                  Harvest Assembly &mdash; Parents Welcome
                </h4>
                <p className="text-xs text-[#5a4f45] mt-0.5">
                  Thursday 24 Oct at 9:15 am, main hall.
                </p>
              </div>
            </div>

            {/* Reading Log Progress preview */}
            <div className="pt-3 border-t border-[#e8e2d8]">
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-[#1a1410]">Weekly Reading Target</span>
                <span className="text-[#2a4a35] font-bold">4 / 5 Nights</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e8e2d8] overflow-hidden">
                <div className="h-full bg-[#3d6b4f] rounded-full transition-all duration-700" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Downward scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#c8bfb4]/40 animate-bounce pointer-events-none">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
};
