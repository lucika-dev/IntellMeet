'use client';

import Image from 'next/image';
import Magnetic from '../magnetic';
import { GsapButton } from '../ui/Gsapbutton';
import {
  Headphones,
  Puzzle,
  Sparkles,
  Users,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    title: 'Smarter Meetings',
    icon: Users,
    color: 'bg-[#7B2EFF]',
  },
  {
    title: 'AI That Works for You',
    icon: Sparkles,
    color: 'bg-[#FF6B00]',
  },
  {
    title: 'Boost Team Productivity',
    icon: Puzzle,
    color: 'bg-[#22C55E]',
  },
  {
    title: 'Built-in Support',
    icon: Headphones,
    color: 'bg-[#2F80FF]',
  },
  {
    title: 'Data-Driven Decisions',
    icon: BarChart3,
    color: 'bg-[#FF5CCF]',
  },
];

export default function Features() {
  return (
    <section className="w-full px-6 md:px-10">
      <h1 className="text-4xl font-medium leading-[0.92] tracking-[-0.065em] text-foreground md:text-7xl">
        Workspace For Productive Meetings
      </h1>

      <div className="relative z-[100] mx-20 mt-7">
        <Magnetic>
          <GsapButton className="h-30 w-90 text-3xl">
            Get Started
          </GsapButton>
        </Magnetic>
      </div>

      <div className="relative -mt-36 w-full">
        <Image
          src="/icons/Folder.svg"
          alt="Folder"
          width={1800}
          height={900}
          className="h-auto w-full select-none"
          priority
        />

        <div className="absolute inset-0 flex items-end justify-between px-[7%] pb-[5.5%]">
          <div className="w-[28%] rounded-[2rem] bg-[#ECECEC] p-7">
            <h2 className="mb-8 text-[4rem] font-medium leading-[0.9] tracking-[-0.075em] text-black">
              Add widget
            </h2>

            <div className="grid grid-cols-3 gap-x-5 gap-y-7">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-[1.7rem] ${feature.color}`}
                    >
                      <Icon className="h-12 w-12 text-white" strokeWidth={2} />
                    </div>

                    <p className="mt-3 text-[1rem] font-semibold leading-[0.95] tracking-[-0.045em] text-black">
                      {feature.title}
                    </p>
                  </div>
                );
              })}

              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-[#0057D9]">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="h-7 w-7 rounded-md bg-white" />
                    <div className="h-7 w-7 rounded-md bg-white" />
                    <div className="h-7 w-7 rounded-md bg-white" />
                    <div className="h-7 w-7 rounded-md bg-white" />
                  </div>
                </div>

                <p className="mt-3 text-[1rem] font-semibold leading-[0.95] tracking-[-0.045em] text-black">
                  Meeting Notes
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex w-[34%] flex-col justify-between">
            <div className="absolute -top-10 left-10 flex items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FF5A00]">
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                </div>
              </div>

              <h2 className="ml-5 mt-5 text-[8rem] font-medium leading-[0.9] tracking-[-0.085em] text-[#FF5A00]">
                Meet
              </h2>
            </div>

            <div className="mt-32 rounded-[2rem] bg-[#ECECEC] p-7">
              <h2 className="mb-8 text-[4rem] font-medium leading-[0.92] tracking-[-0.075em] text-black">
                Devices
              </h2>

              <div className="space-y-5">
                {[
                  { size: '320', type: 'mobile' },
                  { size: '768', type: 'tablet' },
                  { size: '1024', type: 'desktop' },
                ].map((device) => (
                  <div
                    key={device.size}
                    className="flex items-center justify-between rounded-[1.4rem] bg-[#DFDFDF] px-6 py-5"
                  >
                    <span className="text-4xl font-medium tracking-[-0.04em] text-black/45">
                      {device.size}
                    </span>

                    <div className="flex items-center justify-center">
                      {device.type === 'mobile' && (
                        <div className="h-14 w-8 rounded-[0.7rem] border-[4px] border-black" />
                      )}

                      {device.type === 'tablet' && (
                        <div className="h-16 w-11 rounded-[0.7rem] border-[4px] border-black" />
                      )}

                      {device.type === 'desktop' && (
                        <div className="flex flex-col items-center">
                          <div className="h-11 w-16 rounded-[0.5rem] border-[4px] border-black" />
                          <div className="mt-2 h-[4px] w-10 bg-black" />
                        </div>
                      )}
                    </div>

                    <div className="h-1 w-10 rounded-full bg-black/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-170 w-[34%] rounded-[2rem] bg-[#ECECEC] p-8">
            <h2 className="text-[5.2rem] font-medium leading-[0.82] tracking-[-0.085em] text-black">
              Enjoy easy
              <br />
              workflow
            </h2>

            <div className="mt-12 space-y-12">
              <p className="text-[2rem] font-normal leading-[1.08] tracking-[-0.045em] text-black">
                The intuitive drag-and-drop interface gives you everything you
                need.
              </p>

              <p className="text-[2rem] font-normal leading-[1.08] tracking-[-0.045em] text-black">
                Team members can use IntellMeet seamlessly, and managers get
                real-time insights instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}