import type { ReactNode } from "react";
import Checks from "../Checks";

const Card = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="relative z-20">

      <section
        className="
          relative
          overflow-hidden
          mt-[-40]
          min-h-screen
          border-t-[2px] border-foreground
          bg-background
          rounded-t-[4rem]

        "
      >
        <Checks scrollable/>

        <div className="relative z-10 mx-auto max-w-full">
          {children}
        </div>
      </section>

    </div>
  );
};

export default Card;