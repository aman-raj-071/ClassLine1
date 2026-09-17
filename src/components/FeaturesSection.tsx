import React from 'react';
import { CreditCard, FileEdit, Calendar, BookOpenCheck, Shield, Send } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Fee Notices',
      icon: CreditCard,
      iconBg: 'bg-[#f5ddd9]',
      iconColor: 'text-[#9b2c2c]',
      body: 'Trip payments, uniform orders, and school fees — delivered directly to parents with due dates and a one-tap UPI payment link.',
      stat: 'Zero missed payments this term',
    },
    {
      title: 'Daily Notes',
      icon: FileEdit,
      iconBg: 'bg-[#d4e8da]',
      iconColor: 'text-[#2a4a35]',
      body: 'Personal notes from teacher to parent — praise, observations, reading milestones — written in seconds and delivered instantly.',
      stat: '100% delivery rate this week',
    },
    {
      title: 'Events & Assemblies',
      icon: Calendar,
      iconBg: 'bg-[#ede4d9]',
      iconColor: 'text-[#6b5a48]',
      body: 'Harvest assemblies, sports days, parent evenings — announced once and surfaced clearly in every parent’s dedicated timeline.',
      stat: '28 families notified instantly',
    },
    {
      title: 'Nightly Reading Log',
      icon: BookOpenCheck,
      iconBg: 'bg-[#dce4f0]',
      iconColor: 'text-[#364e78]',
      body: 'Track nightly reading habits across the class. Parents log from home; teachers see class comprehension in real time.',
      stat: 'Avg. 4.2 nights per week',
    },
    {
      title: 'Private by Design',
      icon: Shield,
      iconBg: 'bg-[#e8dff0]',
      iconColor: 'text-[#4e3070]',
      body: 'Access-code authentication, school-managed directory, fully GDPR-compliant. No social accounts, no advertising, no tracking.',
      stat: 'Privacy-first &bull; India-hosted',
    },
    {
      title: 'Teacher Composer',
      icon: Send,
      iconBg: 'bg-[#f5e6c8]',
      iconColor: 'text-[#7a4e10]',
      body: 'Write, categorise, and dispatch ledger entries in under a minute. Target the whole class, tailored groups, or individual families.',
      stat: 'Average dispatch time: 58 s',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#fdfaf6] border-t border-b border-[#d4cdc4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="max-w-2xl text-center mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b5a48]">
            What ClassLine does
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1410] tracking-tight">
            Everything in one ledger
          </h2>
          <p className="text-sm sm:text-base text-[#5a4f45] leading-relaxed">
            No more app-switching, no lost slips, no unanswered messages. One unified diary &mdash; kept in perfect order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#f7f3ed] p-6 rounded-2xl border border-[#d4cdc4]/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg} ${item.iconColor} shadow-inner`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#1a1410]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5a4f45] leading-relaxed">
                    {item.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#d4cdc4]/60">
                  <p
                    className="text-[11px] font-semibold text-[#6b5a48]"
                    dangerouslySetInnerHTML={{ __html: item.stat }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
