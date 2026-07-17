import React, { useState } from 'react';
import api from '../api';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { 
  ClipboardCheck, ChevronRight, ChevronLeft, ShieldCheck, 
  AlertCircle, Calendar, MapPin, Heart, Info, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EligibilityChecker: React.FC = () => {
  // Wizard steps: 1: General (Age, Weight), 2: Last Donation, 3: Deferrals, 4: Results
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [hadDonatedBefore, setHadDonatedBefore] = useState<'yes' | 'no'>('no');
  const [hemoglobin, setHemoglobin] = useState('');
  
  // Boolean questions
  const [feverLast14Days, setFeverLast14Days] = useState<boolean>(false);
  const [pregnancyBreastfeeding, setPregnancyBreastfeeding] = useState<boolean>(false);
  const [recentSurgery, setRecentSurgery] = useState<boolean>(false);
  const [recentTattooPiercing, setRecentTattooPiercing] = useState<boolean>(false);
  const [currentMedication, setCurrentMedication] = useState<boolean>(false);
  const [chronicIllness, setChronicIllness] = useState<boolean>(false);

  // Error validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Result state
  const [resultData, setResultData] = useState<{
    id: string;
    result: 'ELIGIBLE' | 'TEMPORARY_DEFERRAL' | 'PERMANENT_DEFERRAL';
    reason: string;
    nextEligibleDate: string | null;
  } | null>(null);

  const handleNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!age || !weight) {
        setValidationError('Please enter your age and weight.');
        return;
      }
      const numAge = parseInt(age);
      const numWeight = parseFloat(weight);
      if (isNaN(numAge) || numAge <= 0) {
        setValidationError('Please enter a valid age.');
        return;
      }
      if (isNaN(numWeight) || numWeight <= 0) {
        setValidationError('Please enter a valid weight.');
        return;
      }
    }
    if (step === 2) {
      if (hadDonatedBefore === 'yes' && !lastDonationDate) {
        setValidationError('Please select the date of your last donation.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setValidationError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setLoading(true);

    try {
      const payload = {
        age: parseInt(age),
        weight: parseFloat(weight),
        lastDonationDate: hadDonatedBefore === 'yes' ? lastDonationDate : null,
        hemoglobin: hemoglobin ? parseFloat(hemoglobin) : null,
        feverLast14Days,
        pregnancyBreastfeeding,
        recentSurgery,
        recentTattooPiercing,
        currentMedication,
        chronicIllness,
      };

      const res = await api.post('/eligibility/check', payload);
      setResultData(res.data);
      setStep(4); // Show results step
    } catch (err: any) {
      console.error('Eligibility submit error:', err);
      setValidationError(err.response?.data?.message || 'Error compiling assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAge('');
    setWeight('');
    setLastDonationDate('');
    setHadDonatedBefore('no');
    setHemoglobin('');
    setFeverLast14Days(false);
    setPregnancyBreastfeeding(false);
    setRecentSurgery(false);
    setRecentTattooPiercing(false);
    setCurrentMedication(false);
    setChronicIllness(false);
    setResultData(null);
    setValidationError(null);
  };

  return (
    <DashboardLayout>
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">Eligibility Checker</h2>
        <p className="text-xs text-slate-400">Complete the medical screening questionnaire to test your eligibility.</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white border border-slate-100 p-8 rounded-card shadow-sm space-y-6">
        {/* Step Indicators */}
        {step < 4 && (
          <div className="flex items-center justify-between border-b border-slate-50 pb-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {step} of 3</span>
            <div className="flex gap-2">
              <span className={`h-2 w-10 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-slate-100'}`}></span>
              <span className={`h-2 w-10 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-100'}`}></span>
              <span className={`h-2 w-10 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-slate-100'}`}></span>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationError && (
          <div className="bg-red-50 border border-red-100 text-primary p-3 rounded-card text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* STEP 1: GENERAL METRICS */}
        {step === 1 && (
          <div className="space-y-5 slide-up text-xs font-semibold">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">General Requirements</h3>
              <p className="text-[10px] text-slate-400 font-normal">Please input your current age and body weight.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-1" htmlFor="age">Age (Years) *</label>
                <input
                  id="age"
                  type="number"
                  placeholder="e.g. 24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1" htmlFor="weight">Weight (kg) *</label>
                <input
                  id="weight"
                  type="number"
                  placeholder="e.g. 58"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1" htmlFor="hemoglobin">Hemoglobin level in g/dL (Optional)</label>
              <input
                id="hemoglobin"
                type="number"
                step="0.1"
                placeholder="e.g. 13.5 (Leave blank if unknown)"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-semibold flex items-center gap-1 shadow"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LAST DONATION */}
        {step === 2 && (
          <div className="space-y-5 slide-up text-xs font-semibold">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Donation Intervals</h3>
              <p className="text-[10px] text-slate-400 font-normal">Tell us about your previous blood donation history.</p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 mb-1">Have you donated blood before?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="hadDonated"
                    checked={hadDonatedBefore === 'yes'}
                    onChange={() => setHadDonatedBefore('yes')}
                    className="h-4 w-4 text-primary focus:ring-primary/20"
                  />
                  <span>Yes, I have donated blood before</span>
                </label>
                <label className="flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="hadDonated"
                    checked={hadDonatedBefore === 'no'}
                    onChange={() => setHadDonatedBefore('no')}
                    className="h-4 w-4 text-primary focus:ring-primary/20"
                  />
                  <span>No, this is my first time</span>
                </label>
              </div>
            </div>

            {hadDonatedBefore === 'yes' && (
              <div className="slide-up">
                <label className="block text-slate-700 mb-1">Date of Last Donation *</label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-semibold flex items-center gap-1 shadow"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEFERRALS */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-5 slide-up text-xs font-semibold">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Medical Deferrals</h3>
              <p className="text-[10px] text-slate-400 font-normal">Select yes or no for the following conditions. Sensitive details are NOT saved.</p>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {/* Question: Fever */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Do you have a fever, active infection, or feeling unwell in the last 14 days?</span>
                <input
                  type="checkbox"
                  checked={feverLast14Days}
                  onChange={(e) => setFeverLast14Days(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>

              {/* Question: Pregnancy */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Are you pregnant, planning pregnancy, or currently breastfeeding?</span>
                <input
                  type="checkbox"
                  checked={pregnancyBreastfeeding}
                  onChange={(e) => setPregnancyBreastfeeding(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>

              {/* Question: Surgery */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Have you undergone any major surgical procedure in the last 6 months?</span>
                <input
                  type="checkbox"
                  checked={recentSurgery}
                  onChange={(e) => setRecentSurgery(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>

              {/* Question: Tattoo */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Have you gotten a tattoo, body piercing, or acupuncture in the last 6 months?</span>
                <input
                  type="checkbox"
                  checked={recentTattooPiercing}
                  onChange={(e) => setRecentTattooPiercing(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>

              {/* Question: Medication */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Are you currently taking oral antibiotics or short-term prescription medications?</span>
                <input
                  type="checkbox"
                  checked={currentMedication}
                  onChange={(e) => setCurrentMedication(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>

              {/* Question: Chronic */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-700 leading-normal max-w-md">Have you been diagnosed with any chronic cardiac, renal, liver, or oncological illnesses?</span>
                <input
                  type="checkbox"
                  checked={chronicIllness}
                  onChange={(e) => setChronicIllness(e.target.checked)}
                  className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/20 shrink-0 ml-4"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card text-xs font-semibold shadow flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Submit Assessment'
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && resultData && (
          <div className="space-y-6 text-center py-6 slide-up text-xs font-semibold">
            {resultData.result === 'ELIGIBLE' ? (
              <div className="space-y-5">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-emerald-800 text-sm">Congratulations! You are Eligible to Donate</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                    You have successfully passed the initial voluntary screening. You can now register for active blood donation camps in your district and print your certificate of appreciation after donating.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    to="/camps"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-card shadow transition-colors font-semibold"
                  >
                    Browse Camps
                  </Link>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            ) : resultData.result === 'TEMPORARY_DEFERRAL' ? (
              <div className="space-y-5">
                <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <Calendar className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-amber-800 text-sm">Temporary Deferral Applied</h3>
                  <p className="text-slate-600 font-bold leading-normal">
                    Re-evaluation Eligible Date: {new Date(resultData.nextEligibleDate!).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-slate-500 text-[10px] leading-relaxed max-w-md mx-auto border-t border-slate-100 pt-3">
                    **Reason:** {resultData.reason || 'Safety deferral criteria not met. Please rest and re-test on the recommended date.'}
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    to="/guidelines"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-card shadow font-semibold"
                  >
                    Read Guidelines
                  </Link>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Restart Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="h-16 w-16 bg-red-100 text-primary rounded-full flex items-center justify-center mx-auto border border-red-200">
                  <AlertCircle className="h-10 w-10 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-primary text-sm font-sans uppercase">Deferred from Voluntary Donation</h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                    For your own health and the safety of recipients, you are deferred from direct blood donation. 
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                    However, you can still make a huge impact! Share your **Blood Buddy referral link** with friends, coordinate camps with NSS, or organize awareness drives.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    to="/blood-buddy"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-card shadow font-semibold flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    Invite Buddies
                  </Link>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 border border-slate-200 rounded-card text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
