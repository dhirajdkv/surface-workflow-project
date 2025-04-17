import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Surface Labs - Getting Started",
  description: "Set up Surface Labs tracking and analytics for your website",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 