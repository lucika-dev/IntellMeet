import {
  Geist,
  Poppins,
  DM_Sans,
  Architects_Daughter,
  Fira_Code,
  Lora,
  VT323,
} from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
  preload: false,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: false,
});

const architectsDaughter =
  Architects_Daughter({
    subsets: ['latin'],
    weight: ['400'],
    variable:
      '--font-architects-daughter',
    display: 'swap',
    preload: false,
  });

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  preload: false,
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vt323',
  display: 'swap',
  preload: false,
});

export {
  geist,
  poppins,
  dmSans,
  architectsDaughter,
  firaCode,
  lora,
  vt323,
};

export const themeFonts = [
  geist.variable,
  poppins.variable,
  dmSans.variable,
  architectsDaughter.variable,
  firaCode.variable,
  lora.variable,
  vt323.variable,
].join(' ');