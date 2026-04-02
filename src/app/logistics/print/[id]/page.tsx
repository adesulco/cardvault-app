'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldAlert, QrCode } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function PrintLabelPage() {
  const { id } = useParams();
  const [tx, setTx] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then(res => res.json())
      .then(data => {
         setTx(data.transaction);
         // Auto-trigger print dialog after layout paint
         setTimeout(() => window.print(), 1000);
      });
  }, [id]);

  if (!tx) return <div className="p-12 text-center text-xs text-gray-400 font-mono">Generating AWB Matrix...</div>;

  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${tx.id}&code=Code128&dpi=96`;

  return (
    <>
      {/* Absolute strict CSS overrides for thermal 4x6" printers */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html { visibility: hidden; background: white; margin: 0; padding: 0; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0; top: 0; width: 4in; height: 6in;
            margin: 0; padding: 0.25in; box-sizing: border-box;
          }
          /* Neutralizes global mobile shell */
          div[class*="max-w-md"] { max-width: none !important; box-shadow: none !important; border: none !important; }
        }
      `}} />

      <div id="print-area" className="bg-white text-black w-full min-h-screen sm:min-h-0 sm:w-[4in] sm:h-[6in] mx-auto p-6 sm:p-[0.25in] border border-gray-300 flex flex-col font-sans">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-[3px] border-black pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-black">
              <ShieldAlert size={16} className="fill-black text-white" />
              <h1 className="font-black text-sm tracking-tight uppercase">CardVault Secure</h1>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Express Escrow Servicing</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
             <p className="text-[9px] font-bold text-gray-500 border border-black px-1 mt-0.5">PRIORITY</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex gap-4 mb-4 border-b-[3px] border-black pb-4">
           {/* Sender */}
           <div className="flex-1">
              <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5 tracking-wider">From (Seller)</p>
              <h3 className="text-xs font-bold leading-tight uppercase">{tx.seller.displayName}</h3>
              <p className="text-[10px] uppercase mt-1 leading-snug break-words pr-2">
                {tx.seller.location || 'NO LOCATION SET'}
                <br/>{tx.seller.phone || 'NO PHONE SET'}
              </p>
           </div>
           
           {/* Recipient */}
           <div className="flex-[1.5] border-l-[3px] border-black pl-4">
              <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5 tracking-wider">To (Buyer)</p>
              <h3 className="text-sm font-black leading-tight uppercase mb-1">{tx.buyer.displayName}</h3>
              <p className="text-[11px] font-bold uppercase leading-snug tracking-tight">
                 {tx.buyer.location || 'Buyer Location Explicitly Withheld until shipping requested. Please coordinate in chat.'}
              </p>
              <p className="text-[11px] mt-1.5 font-bold uppercase">TEL: {tx.buyer.phone || '000-000-000'}</p>
           </div>
        </div>

        {/* The Asset Details */}
        <div className="flexitems-center justify-between mb-4 border border-black p-3 rounded-md bg-gray-50">
           <div>
              <p className="text-[9px] uppercase font-bold text-gray-500 mb-0.5 tracking-widest">Secured Asset</p>
              <h4 className="text-xs font-black uppercase leading-tight truncate w-[2.5in]">{tx.listing?.card?.cardName || 'UNKNOWN ASSET'}</h4>
              <p className="text-[10px] font-bold mt-1 tracking-tight">VAULT VALUE: <span className="text-black">RP {(tx.buyerPaidAmount || 0).toLocaleString('id-ID')}</span></p>
           </div>
        </div>

        {/* Barcode Routing */}
        <div className="mt-auto pt-4 border-t-[3px] border-black flex flex-col items-center">
           <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Internal Routing Waybill</p>
           {/* Physical Scannable Image from TEC-IT API */}
           <img src={barcodeUrl} alt="Escrow Barcode" className="h-[0.8in] w-[3in] object-contain mb-1 mix-blend-multiply" />
           <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase">{tx.id.split('-')[0]}-{tx.id.split('-')[1]}</p>
        </div>

      </div>
    </>
  );
}
