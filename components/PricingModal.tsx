
import React, { useState } from 'react';
import { Icons } from '../constants';

interface PricingModalProps {
  onUpgrade: () => void;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onUpgrade, onClose }) => {
  const [step, setStep] = useState<'features' | 'payment' | 'success'>('features');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simulate payment processing with a realistic delay
    setTimeout(() => {
      setStep('success');
      setIsProcessing(false);
      // Actual upgrade happens after success animation
      setTimeout(() => {
        onUpgrade();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Header - Changes based on step */}
        <div className={`h-32 p-8 flex items-center justify-between transition-colors duration-500 ${
          step === 'success' ? 'bg-emerald-500' : 'bg-gradient-to-br from-indigo-600 to-purple-700'
        }`}>
          <div>
            <h2 className="text-2xl font-black text-white">
              {step === 'features' && 'FocusFlow Pro'}
              {step === 'payment' && 'Secure Checkout'}
              {step === 'success' && 'Welcome to Pro!'}
            </h2>
            <p className="text-indigo-100 text-sm">
              {step === 'features' && 'Unlock your full potential'}
              {step === 'payment' && 'Powered by FocusPay'}
              {step === 'success' && 'Transaction successful'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl">
            {step === 'success' ? '🎉' : '💎'}
          </div>
        </div>

        <div className="p-8">
          {step === 'features' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: '✨', title: 'Advanced AI Assistant', desc: 'Predictive task scheduling' },
                  { icon: '🌍', title: 'Location Reminders', desc: 'Alerts based on your GPS' },
                  { icon: '☁️', title: 'Cloud Sync', desc: 'Sync across all your devices' },
                  { icon: '🎨', title: 'Premium Themes', desc: 'Exclusive AMOLED & Pastel modes' }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-xl">{feat.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold dark:text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white">$4.99<span className="text-sm font-normal text-slate-500">/month</span></div>
                <p className="text-xs text-slate-400 mt-1">Start 7-day free trial</p>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 text-slate-800 dark:text-white"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-6 h-4 bg-slate-300 rounded-sm" />
                      <div className="w-6 h-4 bg-slate-400 rounded-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 text-slate-800 dark:text-white"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({...cardInfo, expiry: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 text-slate-800 dark:text-white"
                      value={cardInfo.cvc}
                      onChange={(e) => setCardInfo({...cardInfo, cvc: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Encryption enabled. Your data is never stored on our servers.
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isProcessing || !cardInfo.number}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Pay $4.99 now'
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
                ✓
              </div>
              <h3 className="text-xl font-bold dark:text-white">Payment Confirmed</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Hang tight, we're setting up your Pro dashboard...</p>
              <div className="pt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full animate-progress" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {step !== 'success' && (
            <button 
              onClick={onClose}
              className="w-full text-center text-slate-400 text-sm font-medium mt-6"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default PricingModal;
