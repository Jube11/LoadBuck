import React from 'react'

function Logo({ size = 'large', showTagline = true }) {
  const isSmall = size === 'small'
  const isIcon = size === 'icon'
  
  if (isIcon) {
    return (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        {/* Background circle */}
        <rect width="64" height="64" rx="12" fill="#1a237e"/>
        
        {/* Truck body - sleek modern shape */}
        <path d="M8 48 L8 32 L20 32 L20 24 L36 24 L36 32 L52 32 L56 36 L56 48 L52 52 L12 52 Z" fill="#ff6d00"/>
        
        {/* Truck cab */}
        <path d="M36 24 L44 16 L52 16 L56 24 L56 32 L36 32 Z" fill="#1a237e"/>
        
        {/* Window */}
        <path d="M38 26 L44 20 L50 20 L52 26 L52 30 L38 30 Z" fill="#64b5f6"/>
        
        {/* Dollar sign badge */}
        <circle cx="28" cy="38" r="10" fill="#00c853"/>
        <text x="28" y="43" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">$</text>
        
        {/* Wheels */}
        <circle cx="18" cy="52" r="5" fill="#1a237e"/>
        <circle cx="18" cy="52" r="2.5" fill="#fff"/>
        <circle cx="46" cy="52" r="5" fill="#1a237e"/>
        <circle cx="46" cy="52" r="2.5" fill="#fff"/>
      </svg>
    )
  }
  
  return (
    <svg 
      viewBox={isSmall ? "0 0 200 50" : "0 0 400 100"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: isSmall ? 160 : 320, height: isSmall ? 40 : 80 }}
    >
      {/* Icon group */}
      <g transform={isSmall ? "translate(0, 5) scale(0.7)" : "translate(10, 10)"}>
        {/* Background badge */}
        <rect x="0" y="0" width="80" height="80" rx="16" fill="#1a237e"/>
        
        {/* Truck body - modern sleek design */}
        <path d="M10 60 L10 40 L26 40 L26 30 L46 30 L46 40 L66 40 L70 46 L70 60 L66 66 L14 66 Z" fill="#ff6d00"/>
        
        {/* Truck cab */}
        <path d="M46 30 L56 20 L66 20 L70 30 L70 40 L46 40 Z" fill="#1a237e"/>
        
        {/* Windshield */}
        <path d="M48 32 L56 24 L64 24 L66 32 L66 38 L48 38 Z" fill="#90caf9"/>
        
        {/* Dollar sign circle */}
        <circle cx="35" cy="48" r="14" fill="#00c853"/>
        <text x="35" y="54" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">$</text>
        
        {/* Wheels with white rims */}
        <circle cx="22" cy="66" r="7" fill="#1a237e"/>
        <circle cx="22" cy="66" r="3.5" fill="#fff"/>
        <circle cx="58" cy="66" r="7" fill="#1a237e"/>
        <circle cx="58" cy="66" r="3.5" fill="#fff"/>
      </g>
      
      {/* Text group */}
      <g transform={isSmall ? "translate(65, 5)" : "translate(110, 5)"}>
        {/* LoadBuck text */}
        <text 
          x="0" 
          y={isSmall ? "35" : "55"} 
          fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
          fontSize={isSmall ? "28" : "48"} 
          fontWeight="800" 
          fill="#1a237e"
          letterSpacing="-1"
        >
          Load
        </text>
        <text 
          x={isSmall ? "58" : "100"} 
          y={isSmall ? "35" : "55"} 
          fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
          fontSize={isSmall ? "28" : "48"} 
          fontWeight="800" 
          fill="#ff6d00"
          letterSpacing="-1"
        >
          Buck
        </text>
        
        {/* Tagline */}
        {showTagline && (
          <>
            <line x1="0" y1={isSmall ? "42" : "68"} x2={isSmall ? "40" : "70"} y2={isSmall ? "42" : "68"} stroke="#1a237e" strokeWidth="1.5"/>
            <text 
              x={isSmall ? "48" : "80"} 
              y={isSmall ? "44" : "70"} 
              fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
              fontSize={isSmall ? "9" : "13"} 
              fontWeight="500" 
              fill="#00c853"
              fontStyle="italic"
            >
              Know if your load pays
            </text>
            <line x1={isSmall ? "118" : "175"} y1={isSmall ? "42" : "68"} x2={isSmall ? "140" : "200"} y2={isSmall ? "42" : "68"} stroke="#1a237e" strokeWidth="1.5"/>
          </>
        )}
      </g>
    </svg>
  )
}

export default Logo
