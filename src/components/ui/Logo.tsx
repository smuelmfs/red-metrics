'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Logo({ 
  size = 'md',
  showText = false 
}: { 
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}) {
  const [imageError, setImageError] = useState(false)
  
  const sizes = {
    sm: { container: 'w-10 h-10', image: 40, text: 'text-sm' },
    md: { container: 'w-16 h-16', image: 64, text: 'text-base' },
    lg: { container: 'w-24 h-24', image: 96, text: 'text-xl' }
  }

  const sizeConfig = sizes[size]

  // Tenta diferentes formatos de logo
  const logoSources = ['/RED.png', '/logo-red.png', '/logo-red.svg', '/logo.png', '/logo.svg']

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center flex-shrink-0">
        {!imageError ? (
          <Image
            src={logoSources[0]}
            alt="RED Agency"
            width={sizeConfig.image}
            height={sizeConfig.image}
            className="object-contain"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className={`${sizeConfig.container} bg-red-600 rounded-full flex items-center justify-center`}>
            <span className={`text-white font-bold ${sizeConfig.text}`}>R</span>
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 
          'text-2xl'
        }`}>
          Metrics
        </span>
      )}
    </div>
  )
}

