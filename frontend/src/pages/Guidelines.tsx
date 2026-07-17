import React, { useState } from 'react';
import { BookOpen, AlertTriangle, CheckCircle, Activity, Info, ChevronDown } from 'lucide-react';

export const Guidelines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tips' | 'myths' | 'faqs'>('tips');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const beforeDonation = [
    'Drink plenty of water (at least 500ml) before your donation.',
    'Eat a healthy, low-fat meal. Do not donate on an empty stomach.',
    'Get at least 6-8 hours of sleep the night before.',
    'Avoid drinking alcohol for 24 hours prior to donation.',
    'Bring a valid government photo ID card.',
  ];

  const duringDonation = [
    'Wear comfortable clothing with sleeves that roll up easily.',
    'Let the coordinator know if you prefer one arm over the other.',
    'Relax, listen to music, or talk to other donors to ease anxiety.',
    'The actual blood collection takes only 8 to 10 minutes.',
    'Inform the staff immediately if you feel dizzy or lightheaded.',
  ];

  const afterDonation = [
    'Rest in the recovery area for 10-15 minutes post-donation.',
    'Consume the provided snack and juice immediately.',
    'Keep the bandage on for at least 4-6 hours.',
    'Drink extra fluids for the next 24 to 48 hours.',
    'Avoid lifting heavy weights or strenuous gym exercises for the rest of the day.',
  ];

  const benefits = [
    { title: 'Free Health Screening', desc: 'Every donor receives a mini-physical checking pulse, blood pressure, temperature, and hemoglobin.' },
    { title: 'Stimulates Cell Production', desc: 'Donating blood triggers the body to synthesize new red blood cells, keeping the cardiovascular system efficient.' },
    { title: 'Reduces Iron Levels', desc: 'Helps maintain healthy iron concentrations in the body, lowering the risk of heart disease.' },
    { title: 'Saves Up to 3 Lives', desc: 'Each whole blood donation is separated into red blood cells, platelets, and plasma to treat multiple patients.' },
  ];

  const myths = [
    { myth: 'Donating blood is extremely painful and takes hours.', fact: 'You only feel a brief prick when the needle is inserted. The actual blood draw is completed in under 10 minutes.' },
    { myth: 'You can contract HIV or Hepatitis from the needle.', fact: 'A sterile, brand-new disposable needle is opened in front of you and discarded immediately after. There is zero risk of infection.' },
    { myth: 'Frequent donation makes your immune system weak.', fact: 'Your body replaces blood volume within 48 hours and red blood cells in a few weeks. It has no negative impact on immunity.' },
    { myth: 'Vegetarians cannot donate blood.', fact: 'Vegetarians can absolutely donate blood, provided their hemoglobin levels meet the minimum 12.5 g/dL requirement.' },
  ];

  const faqs = [
    { q: 'Who is eligible to donate blood?', a: 'Any healthy individual between 18 and 65 years of age, weighing at least 45 kg (or 50 kg depending on site guidelines), and with a minimum hemoglobin level of 12.5 g/dL.' },
    { q: 'How often can I donate blood?', a: 'Male donors can safely donate whole blood every 90 days (3 months), and female donors can donate every 120 days (4 months).' },
    { q: 'Can I donate if I recently got a tattoo or piercing?', a: 'You must wait 6 months (180 days) after getting a tattoo or body piercing before you are eligible to donate.' },
    { q: 'Can I donate blood if I have taken medication?', a: 'It depends on the medication. If you are taking antibiotics for an active infection, you must wait 14 days after your last dose. For chronic medications (like blood pressure), consult the medical coordinator at the camp.' },
    { q: 'Can pregnant or breastfeeding women donate?', a: 'No. Pregnant and breastfeeding women are temporarily deferred for their own health and the safety of the baby.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Blood Donation Guidelines</h1>
        <p className="text-slate-500 text-sm">
          Everything you need to know about preparation, safety protocols, benefits, and common FAQs.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 text-xs font-semibold rounded-card transition-all ${
              activeTab === 'tips' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Preparation & Benefits
          </button>
          <button
            onClick={() => setActiveTab('myths')}
            className={`px-4 py-2 text-xs font-semibold rounded-card transition-all ${
              activeTab === 'myths' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Myths vs Facts
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 text-xs font-semibold rounded-card transition-all ${
              activeTab === 'faqs' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FAQs
          </button>
        </div>
      </div>

      {/* TAB CONTENT: PREPARATION TIPS & BENEFITS */}
      {activeTab === 'tips' && (
        <div className="space-y-12 slide-up">
          {/* Donation Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Before */}
            <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                <h3 className="font-bold text-slate-800 text-sm">1. Before Your Donation</h3>
              </div>
              <ul className="space-y-3 flex-1">
                {beforeDonation.map((tip, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-xs text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* During */}
            <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <h3 className="font-bold text-slate-800 text-sm">2. During Your Donation</h3>
              </div>
              <ul className="space-y-3 flex-1">
                {duringDonation.map((tip, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-xs text-slate-600">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-slate-800 text-sm">3. After Your Donation</h3>
              </div>
              <ul className="space-y-3 flex-1">
                {afterDonation.map((tip, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-xs text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="bg-slate-900 text-white rounded-card p-8 shadow-md">
            <h2 className="text-xl font-bold mb-6 text-center text-red-200">Health Benefits of Donation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-card p-5 space-y-2">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary self-start inline-block">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{benefit.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MYTHS VS FACTS */}
      {activeTab === 'myths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 slide-up">
          {myths.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-card p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider">Myth</h4>
                  <p className="text-sm text-slate-800 font-medium mt-1">"{item.myth}"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex-1">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider">Fact</h4>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{item.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: FAQS ACCORDION */}
      {activeTab === 'faqs' && (
        <div className="max-w-3xl mx-auto space-y-4 slide-up">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800 text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs leading-relaxed border-t border-slate-50 bg-slate-50/50">
                    <p className="pl-2 border-l-2 border-primary">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
