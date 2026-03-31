export default function BrandLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 65"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4338CA', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Shield-Card Hybrid shape */}
      <path
        d="M 10,20 L 10,55 Q 10,60 15,60 L 45,60 Q 50,60 50,55 L 50,20 L 30,8 L 10,20 Z"
        fill="url(#brandGrad)"
      />
      {/* Lock/vault keyhole */}
      <circle cx="30" cy="40" r="7" fill="#FFFFFF" />
      <rect x="27" y="40" width="6" height="8" rx="1" fill="#FFFFFF" />
    </svg>
  );
}
