import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'giant';
  className?: string;
}

export const RockfellerLogo = ({ size = 'medium', className = '' }: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-28 h-28',
    xxlarge: 'w-32 h-32',
    giant: 'w-40 h-40'
  };

  const textSizes = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
    xxlarge: 'text-3xl',
    giant: 'text-4xl'
  };

  if (imageError) {
    // Fallback: Simples ícone sem círculo
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <Building2 className="text-white w-full h-full drop-shadow-lg" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img 
        src="/logo-rockfeller.png" 
        alt="Rockfeller Logo" 
        className="w-full h-full object-contain drop-shadow-lg"
        onError={() => {
          console.log('Logo PNG failed to load, using fallback');
          setImageError(true);
        }}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
};

export default RockfellerLogo; 