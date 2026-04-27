import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

import { isClerkConfigured } from "@/lib/clerk";

interface Props {
  children: React.ReactNode;
}

const clerkAppearance = {
  elements: {
    formButtonPrimary: "primary-gradient",
    footerActionLink: "primary-text-gradient hover: text-primary-500",
  },
};

const OptionalClerkProvider = ({ children }: Props) => {
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
  );
};

export default OptionalClerkProvider;
