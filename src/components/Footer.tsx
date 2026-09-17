import React from 'react';
import { School, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f7f3ed] border-t border-[#d4cdc4] py-8 text-xs text-[#5a4f45]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1410] flex items-center justify-center text-[#d4e8da] shrink-0">
            <School className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1410] leading-none">
              Saraswati Vidya Mandir
            </p>
            <p className="text-xs text-[#6b5a48] mt-1">
              Sector 62, Noida, Uttar Pradesh 201309, India
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-center sm:text-right space-y-1">
          <div className="flex items-center justify-center sm:justify-end gap-1.5 text-[#2a4a35] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>India-hosted &bull; Privacy-first &bull; End-to-End Encrypted</span>
          </div>
          <p className="text-[11px] text-[#6b5a48]">
            ClassLine v1.0 &copy; 2026 &mdash; All communications are private and school-managed.
          </p>
          <p className="text-[11px] text-[#6b5a48]">
            Support:{' '}
            <a
              href="mailto:office@saraswativm.edu.in"
              className="text-[#8a6f5a] hover:text-[#1a1410] underline underline-offset-2"
            >
              office@saraswativm.edu.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
