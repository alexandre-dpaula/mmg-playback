import React from "react";
import { BrandLogo } from "@/components/BrandLogo";

export const FooterBrand: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div
        className="mx-auto w-full bg-black border-t border-white/5"
        style={{
          paddingTop: "0.5rem",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-center pointer-events-auto px-4">
          <BrandLogo className="text-white drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};
