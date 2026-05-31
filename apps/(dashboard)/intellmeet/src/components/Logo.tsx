import { Link } from 'react-router-dom';

interface LogoProps {
  src: string;
  alt: string;
  href?: string;
  size?: number;
  className?: string;
}

export const Logo = ({
  src,
  alt,
  href = '/',
  size = 40,
  className = '',
}: LogoProps) => {
  return (
    <Link to={href} aria-label={alt} className="shrink-0">
      <div
        role="img"
        aria-label={alt}
        className={`
          bg-foreground transition-all duration-300
          hover:opacity-80 shrink-0
          ${className}
        `}
        style={{
          width: size,
          height: size,
          maskImage: `url("${src}")`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url("${src}")`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    </Link>
  );
};