import React from 'react'

function Logo({ size = 'large', showTagline = true }) {
  const isSmall = size === 'small'
  const isIcon = size === 'icon'
  
  if (isIcon) {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }}>
        <rect width="48" height="48" rx="10" fill="#1a237e"/>
        <path d="M8 36V26H16V20H28V26H38V36H34L8 36Z" fill="#ff6d00"/>
        <circle cx="24" cy="28" r="8" fill="#00c853"/>
        <text x="24" y="32" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">$</text>
        <circle cx="14" cy="36" r="4" fill="white"/>
        <circle cx="14" cy="36" r="2" fill="#1a237e"/>
        <circle cx="32" cy="36" r="4" fill="white"/>
        <circle cx="32" cy="36" r="2" fill="#1a237e"/>
      </svg>
    )
  }
  
  return (
    <svg 
      viewBox={isSmall ? "0 0 180 40" : "0 0 280 60"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: isSmall ? 140 : 220, height: isSmall ? 32 : 48 }}
    >
      {/* Icon */}
      <g transform={isSmall ? "translate(0, 2) scale(0.65)" : "translate(0, 3) scale(1)"}>
        <rect x="0" y="0" width="48" height="48" rx="10" fill="#1a237e"/>
        <path d="M8 36V26H16V20H28V26H38V36H34L8 36Z" fill="#ff6d00"/>
        <circle cx="24" cy="28" r="8" fill="#00c853"/>
        <text x="24" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">$</text>
        <circle cx="14" cy="36" r="4" fill="white"/>
        <circle cx="14" cy="36" r="2" fill="#1a237e"/>
        <circle cx="32" cy="36" r="4" fill="white"/>
        <circle cx="32" cy="36" r="2" fill="#1a237e"/>
      </g>
      
      {/* Text */}
      <g transform={isSmall ? "translate(38, 0)" : "translate(58, 0)"}>
        <text 
          x="0" 
          y={isSmall ? "30" : "45"} 
          fontFamily="'Inter', system-ui, sans-serif" 
          fontSize={isSmall ? "24" : "38"} 
          fontWeight="700" 
          fill="#1a237e"
        >
          Load
        </text>
        <text 
          x={isSmall ? "52" : "82"} 
          y={isSmall ? "30" : "45"} 
          fontFamily="'Inter', system-ui, sans-serif" 
          fontSize={isSmall ? "24" : "38"} 
          fontWeight="700" 
          fill="#ff6d00"
        >
          Buck
        </text>
        
        {showTagline && (
          <text 
            x={isSmall ? "2" : "2"} 
            y={isSmall ? "38" : "56"} 
            fontFamily="'Inter', system-ui, sans-serif" 
            fontSize={isSmall ? "8" : "11"} 
            fontWeight="500" 
            fill="#00c853"
          >
            Know if your load pays
          </text>
        )}
      </g>
    </svg>
  )
}

export default Logo
