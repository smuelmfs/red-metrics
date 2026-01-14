'use client'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-red-600 rounded-full animate-spin`}
        role="status"
        aria-label="Carregando"
      >
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  )
}

