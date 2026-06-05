import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";

export default function AuthView() {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Custom UI variables matching your brand palette
  const clerkAppearance = {
    elements: {
      rootBox: "w-full",
      card: "bg-white/40 backdrop-blur-md border border-[#36343D]/10 rounded-2xl shadow-xl p-4 w-full sm:p-6",
      headerTitle:
        "text-[#36343D] font-extrabold text-2xl tracking-tight text-center lg:text-left",
      headerSubtitle:
        "text-sm text-[#36343D]/70 font-medium text-center lg:text-left",
      socialButtonsBlockButton:
        "border-[#36343D]/15 bg-white/60 hover:bg-white text-[#36343D] font-bold rounded-xl transition-all duration-200",
      formLabel:
        "text-xs font-bold uppercase tracking-wider text-[#36343D]/80 pl-1",
      formButtonPrimary:
        "w-full bg-[#F3619C] text-[#EDE986] font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-all duration-200 shadow-md hover:bg-[#B494F8] hover:text-[#DBFA40] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(180,148,248,0.35)] active:scale-[0.99]",
      footer: "hidden", // Completely hide Clerk's default footer to use your custom button toggle below
      dividerLine: "bg-[#36343D]/10",
      dividerText:
        "text-[#36343D]/40 font-bold text-xs uppercase tracking-wider",
      formInput:
        "w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/30 shadow-inner",
    },
  };

  return (
    <div className="fixed inset-0 z-[1000] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] bg-[#FAF4CD] overflow-y-auto lg:overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      {/* LEFT DESIGN SIDEBAR */}
      <div className="relative flex items-center justify-center p-8 lg:p-[60px] bg-[#93ABD8] overflow-hidden before:content-[''] before:absolute before:w-[500px] before:h-[500px] before:rounded-full before:bg-[rgba(219,250,64,0.15)] before:-top-[100px] before:-left-[100px] before:blur-[60px]">
        <div className="relative z-10 max-w-[520px] text-center lg:text-left flex flex-col justify-between h-full min-h-[350px] lg:min-h-[450px]">
          <div className="relative flex flex-col justify-center items-center lg:items-start h-full w-full pt-16">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#FAF4CD] leading-tight mb-5 text-center lg:text-left">
              Master your subjects with active recall.
            </h1>
            <p className="text-[#FAF4CD]/90 text-base md:text-lg leading-relaxed mb-10 text-center lg:text-left">
              Join our community to build dynamic testing modules, track study
              metrics, and accelerate your learning curve.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <div className="text-xs font-bold text-[#B494F8] bg-[#FAF4CD] px-3.5 py-2 rounded-full shadow-sm tracking-wide uppercase">
              Active Recall
            </div>
            <div className="text-xs font-bold text-[#B494F8] bg-[#FAF4CD] px-3.5 py-2 rounded-full shadow-sm tracking-wide uppercase">
              Spaced Repetition
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH PANEL INTERFACE */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-[60px] bg-[#FAF4CD]">
        <div className="w-full max-w-[420px] flex flex-col gap-6">
          <div className="text-center lg:text-left mb-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#36343D] tracking-tight mb-1">
              {isRegistering ? "Get Started" : "Welcome Back"}
            </h2>
            <p className="text-sm text-[#36343D]/70 font-medium">
              {isRegistering
                ? "Create an account to save your decks."
                : "Sign in to access your dashboard."}
            </p>
          </div>

          <div className="w-full flex justify-center context-clerk-container">
            {!isRegistering ? (
              <SignIn routing="virtual" appearance={clerkAppearance} />
            ) : (
              <SignUp routing="virtual" appearance={clerkAppearance} />
            )}
          </div>

          {/* UPGRADED TOGGLE FOOTER SECTION */}
          <div className="text-center text-sm font-semibold text-[#36343D]/80 mt-2 bg-white/30 py-3 px-4 rounded-xl border border-[#36343D]/5 backdrop-blur-sm">
            <span>
              {!isRegistering ? "New to quizTime?" : "Already have an account?"}
            </span>
            <button
              type="button"
              className="bg-transparent border-none text-[#F3619C] font-extrabold cursor-pointer transition-colors duration-150 hover:text-[#B494F8] underline ml-1.5"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {!isRegistering ? "Create an account" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
