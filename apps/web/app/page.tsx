import { Hero } from "@/components/ui/hero";
import { TextColor } from "@/components/text-color";
import { SiteHeader } from "@/components/landing/site-header";
import { TopGlowBeam } from "@/components/landing/top-glow-beam";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { StackRow } from "@/components/landing/stack-row";
import { LivePreviewSection } from "@/components/landing/live-preview-section";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { ProcessSteps } from "@/components/landing/process-steps";
import { ToolGrid } from "@/components/landing/tool-grid";
import { StatsBar } from "@/components/landing/stats-bar";
import { ClosingCta, SiteFooter } from "@/components/landing/closing-cta";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background pt-16">
      <SiteHeader />

      <div className="relative">
        <TopGlowBeam />
        <AnnouncementBar />

        <Hero
          title={<TextColor />}
          titleClassName="!p-0"
          subtitle="Point it at a repo, describe the task, and it plans, codes, tests, and opens the PR — in a sandbox you can watch live."
          actions={[
            { label: "Launch the agent", href: "/agent" },
            { label: "See how it works", href: "#how-it-works", variant: "outline" },
          ]}
        />

        <StackRow />
      </div>

      <LivePreviewSection />
      <ArchitectureSection />
      <ProcessSteps />
      <ToolGrid />
      <StatsBar />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
