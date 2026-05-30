"use client";
import Magnetic from "@/components/magnetic";
import { GsapButton } from '@/components/ui/Gsapbutton'
import SvgFlow from "../framer/SvgFlow";

export default function Section() {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-16">

      <Magnetic>
      <GsapButton className="w-90 text-3xl h-30">
  Get Started
</GsapButton>
      </Magnetic>

      <SvgFlow
  src="/Logo.svg"
  height={900}
  particleGap={1}
  particleSize={2}/>

    </div>

  );
}