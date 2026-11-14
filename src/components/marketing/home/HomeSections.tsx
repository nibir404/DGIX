import { WhatIs } from "./WhatIs";
import { TwoWays } from "./TwoWays";
import { WhyNotDirect } from "./WhyNotDirect";
import { VerifiedSection } from "./VerifiedSection";
import { Solutions } from "./Solutions";
import { Proof } from "./Proof";
import { WhyChoose } from "./WhyChoose";
import { Faq } from "./Faq";

/** Home sections below the hero — Paper artboard "Home · Desktop". */
export function HomeSections() {
  return (
    <>
      <WhatIs />
      <TwoWays />
      <WhyNotDirect />
      <VerifiedSection />
      <Solutions />
      <Proof />
      <WhyChoose />
      <Faq />
    </>
  );
}
