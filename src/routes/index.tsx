import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFTERCUT — AI editor that remembers your creative DNA" },
      {
        name: "description",
        content:
          "AFTERCUT is a Minds agent that remembers your creative DNA and keeps turning long-form into platform-native posts while you sleep.",
      },
      { property: "og:title", content: "AFTERCUT — the editor that never forgets" },
      {
        property: "og:description",
        content:
          "Dump a VOD. Your Mind already knows your voice. It cuts, captions and follows up — without a re-brief.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4"
      />

      <div className="relative z-10 flex h-full flex-col">
        <SiteNav />

        <div className="mt-auto flex flex-col gap-6 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-[#010101] sm:text-4xl lg:text-[3.5rem] lg:text-white">
              Ship cuts that grind while you rest
            </h1>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex flex-col gap-3 sm:mt-8 sm:inline-flex sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white sm:p-1.5"
            >
              <input
                type="email"
                placeholder="Type your email"
                className="rounded-full bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none sm:w-64 sm:rounded-none sm:bg-transparent sm:px-4 sm:py-2"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:py-2.5"
                style={{ background: "linear-gradient(to bottom, #2B2B2B, #101010)" }}
              >
                Get started
              </button>
            </form>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <p
                className="text-3xl font-normal tracking-tight text-[#010101] sm:text-4xl lg:text-white"
                style={{ fontFamily: "'Silkscreen', cursive" }}
              >
                42,500+
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#010101]/70 sm:mt-4 lg:text-white/70">
                Creators run AFTERCUT to repurpose long-form daily.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-xs font-bold text-white">
                  S
                </div>
                <span className="text-sm font-semibold text-[#010101] lg:text-white">
                  Stratify
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#010101]/80 lg:text-white/80">
                "With AFTERCUT we went from re-explaining the brand every week to an agent that
                already knows it and keeps cutting overnight."
              </p>
              <div className="mt-4 flex items-center gap-3 sm:mt-5">
                <img
                  src="https://i.pravatar.cc/72?img=12"
                  alt="Sara Klein"
                  className="h-9 w-9 rounded-full bg-white/20 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#010101] lg:text-white">Sara Klein</p>
                  <p className="text-xs text-[#010101]/60 lg:text-white/60">Dir of Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
