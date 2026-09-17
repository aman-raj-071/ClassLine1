import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Download, FileText, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pupilName: string;
  parentName: string;
  onPaymentConfirmed: (reference: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({ isOpen, onClose, pupilName, parentName, onPaymentConfirmed }) => {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptReference, setReceiptReference] = useState<string | null>(null);

  if (!isOpen) return null;

  const createReceipt = (reference: string) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(26, 20, 16); doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(247, 243, 237); doc.setFont('times', 'bold'); doc.setFontSize(19); doc.text('SARASWATI VIDYA MANDIR', 16, 15);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('OFFICIAL SCHOOL PAYMENT RECEIPT', 16, 23);
    doc.setTextColor(26, 20, 16); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('Payment Receipt', 16, 50);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 79, 69);
    doc.text(`Receipt reference: ${reference}`, 16, 59); doc.text(`Paid on: ${new Date().toLocaleString('en-IN')}`, 16, 65);
    doc.setDrawColor(212, 205, 196); doc.roundedRect(16, 75, 178, 70, 3, 3, 'S');
    const fields = [
      ['Pupil', pupilName], ['Parent / guardian', parentName], ['Contribution', 'Natural History Museum workshop trip'],
      ['Payment method', method === 'upi' ? 'UPI via approved payment provider' : 'Card via approved payment provider'],
      ['Amount received', 'INR 1,500.00'], ['Status', 'PAID - CONFIRMED'],
    ];
    fields.forEach(([label, value], index) => { const y = 86 + index * 9; doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 90, 72); doc.text(label, 23, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(26, 20, 16); doc.text(value, 78, y); });
    doc.setFillColor(212, 232, 218); doc.roundedRect(16, 156, 178, 22, 3, 3, 'F'); doc.setTextColor(30, 56, 40); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Payment confirmed - retain this receipt for your records.', 23, 169);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 90, 72); doc.text('No card number, UPI PIN, or payment credential is stored by ClassLine.', 16, 275); doc.text('This is a digitally generated school receipt.', 16, 281);
    doc.save(`ClassLine-Receipt-${reference}.pdf`);
  };

  const confirmPayment = () => {
    setIsProcessing(true);
    window.setTimeout(() => {
      const reference = `SVM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      onPaymentConfirmed(reference);
      setReceiptReference(reference);
      setIsProcessing(false);
    }, 900);
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="paymentTitle" className="fixed inset-0 z-[200] flex items-center justify-center bg-[#14100c]/80 p-4 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget && !isProcessing) onClose(); }}>
    <div className="relative w-full max-w-lg rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-2xl">
      <button type="button" onClick={onClose} disabled={isProcessing} aria-label="Close payment checkout" className="absolute right-4 top-4 rounded-full p-1.5 text-[#6b5a48] hover:bg-[#ede4d9]"><X className="h-5 w-5" /></button>
      {receiptReference ? <div className="space-y-5 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4e8da] text-[#1e3828]"><CheckCircle2 className="h-8 w-8" /></div><div><h2 id="paymentTitle" className="font-serif text-3xl text-[#1a1410]">Payment confirmed</h2><p className="mt-2 text-sm text-[#5a4f45]">Receipt reference: <strong className="font-mono text-[#1a1410]">{receiptReference}</strong></p></div><button type="button" onClick={() => createReceipt(receiptReference)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1410] px-5 py-3 text-sm font-bold text-[#f7f3ed]"><Download className="h-4 w-4" /> Download PDF receipt</button><button type="button" onClick={onClose} className="text-xs font-semibold text-[#3d6b4f] underline underline-offset-4">Back to ledger</button></div> : <div className="space-y-5"><div className="pr-8"><div className="mb-2 flex items-center gap-2 text-[#2a4a35]"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Secure payment</span></div><h2 id="paymentTitle" className="font-serif text-3xl text-[#1a1410]">Review contribution</h2><p className="mt-2 text-sm text-[#5a4f45]">For {pupilName} - Natural History Museum workshop trip.</p></div><div className="rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] p-4"><div className="flex justify-between text-sm"><span className="font-semibold">Workshop contribution</span><strong className="font-serif text-lg">₹1,500</strong></div><p className="mt-2 text-xs text-[#6b5a48]">Coach transport ₹900 + entry and materials ₹600</p></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setMethod('upi')} className={`rounded-xl border p-3 text-left text-sm font-bold ${method === 'upi' ? 'border-[#2a4a35] bg-[#edf7ef] text-[#1e3828]' : 'border-[#d4cdc4]'}`}>UPI provider</button><button type="button" onClick={() => setMethod('card')} className={`rounded-xl border p-3 text-left text-sm font-bold ${method === 'card' ? 'border-[#2a4a35] bg-[#edf7ef] text-[#1e3828]' : 'border-[#d4cdc4]'}`}>Card provider</button></div><div className="flex gap-2 rounded-xl border border-[#c6ddcb] bg-[#edf7ef] p-3 text-xs leading-relaxed text-[#1e3828]"><LockKeyhole className="h-4 w-4 shrink-0" /><p>You will be redirected to an approved payment provider. ClassLine does not collect or store your card details, UPI ID, or PIN.</p></div><button type="button" onClick={confirmPayment} disabled={isProcessing} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1410] px-5 py-3 text-sm font-bold text-[#f7f3ed] disabled:opacity-60"><CreditCard className="h-4 w-4" />{isProcessing ? 'Confirming secure payment...' : `Continue with ${method === 'upi' ? 'UPI' : 'Card'} provider`}</button><p className="text-center text-[11px] text-[#6b5a48]">Demo checkout: connect Razorpay, Stripe, or another PCI DSS-compliant provider server-side before accepting live payments.</p></div>}
    </div>
  </div>;
};
