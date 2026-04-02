import { Shield, Sparkles, Medal, Award } from 'lucide-react';

interface TierBadgeProps {
  totalTransactions: number;
  trustScore: number;
}

export default function TierBadge({ totalTransactions, trustScore }: TierBadgeProps) {
  if (trustScore >= 4.8 && totalTransactions >= 20) {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-gray-800 to-black text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-gray-700">
        <Sparkles size={10} className="text-yellow-400" /> Platinum
      </span>
    );
  }
  
  if (trustScore >= 4.5 && totalTransactions >= 10) {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        <Award size={10} /> Gold
      </span>
    );
  }
  
  if (trustScore >= 4.0 && totalTransactions >= 5) {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        <Medal size={10} /> Silver
      </span>
    );
  }
  
  if (totalTransactions > 0) {
    return (
      <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        <Shield size={10} /> Bronze
      </span>
    );
  }

  // New Sellers with 0 transactions get a generic badge
  return (
    <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-full shadow-sm">
      New
    </span>
  );
}
