"use client";

import React from "react";
import {
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
} from "@clerk/nextjs";

import { isClerkClientConfigured } from "@/lib/clerk-client";

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkClientConfigured) {
    return null;
  }

  return <ClerkSignedIn>{children}</ClerkSignedIn>;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  if (!isClerkClientConfigured) {
    return <>{children}</>;
  }

  return <ClerkSignedOut>{children}</ClerkSignedOut>;
};

export const UserButton = (
  props: React.ComponentProps<typeof ClerkUserButton>
) => {
  if (!isClerkClientConfigured) {
    return null;
  }

  return <ClerkUserButton {...props} />;
};
