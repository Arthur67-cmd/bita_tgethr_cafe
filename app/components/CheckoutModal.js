"use client";
import { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, total, onConfirm }) {
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

  if (!isOpen) return null;

  async function handlePayment() {
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));
    

    await onConfirm({ method, ...cardData });
    setProcessing(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>


      <div className="bg-white w-full max-w-md rounded-[1.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        

        <div className="bg-[#0A3F2F] p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold">Checkout</h2>
          <p className="text-xs opacity-70 uppercase tracking-widest mt-1">Secure Payment</p>
        </div>

        <div className="p-6 overflow-y-auto">

          <div className="text-center mb-8">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Amount Due</span>
            <div className="text-4xl font-bold text-[#0A3F2F] mt-2">${total}</div>
          </div>


          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setMethod('card')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                method === 'card' ? 'bg-white text-[#0A3F2F] shadow-sm' : 'text-gray-400'
              }`}
            >
              💳 Card
            </button>
            <button 
              onClick={() => setMethod('cash')}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                method === 'cash' ? 'bg-white text-[#0A3F2F] shadow-sm' : 'text-gray-400'
              }`}
            >
              💵 Cash
            </button>
          </div>


          {method === 'card' ? (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  className="input-field font-mono"
                  maxLength={19}
                  value={cardData.number}
                  onChange={e => setCardData({...cardData, number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Expiry</label>
                  <input type="text" placeholder="MM/YY" className="input-field font-mono" maxLength={5} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 ml-1 uppercase">CVC</label>
                  <input type="text" placeholder="123" className="input-field font-mono" maxLength={3} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-xl text-center animate-in slide-in-from-left-2 duration-300">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="font-bold text-yellow-900">Pay at Counter</h3>
              <p className="text-sm text-yellow-700 mt-2">
                Present your order ID to the barista to finalize payment.
              </p>
            </div>
          )}


          <button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full mt-8 btn-primary py-4 rounded-xl text-lg shadow-lg"
          >
            {processing ? 'Processing...' : `Pay $${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}