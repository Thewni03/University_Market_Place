import {
  Compass,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: MessageCircleMore,
    title: "Live conversations",
    text: "Jump between quick updates and long chats without losing the thread.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    text: "Your sessions stay protected with secure auth and persistent login.",
  },
  {
    icon: Compass,
    title: "Built for momentum",
    text: "Move from signup to meaningful conversations in a clean, focused space.",
  },
];

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative hidden overflow-hidden lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,172,143,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(129,178,154,0.22),_transparent_38%),linear-gradient(135deg,_#0d1b2a,_#1b263b_35%,_#3d405b_65%,_#4c956c)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(224,225,221,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(224,225,221,0.07)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />

      <div className="relative z-10 flex w-full items-center justify-center p-12 xl:p-16">
        <div className="w-full max-w-xl space-y-10 text-[#e0e1dd]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cad2c5]/30 bg-[#e0e1dd]/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
            <Sparkles className="size-4 text-[#f4e285]" />
            Designed for fast, modern chat
          </div>

          <div className="space-y-4">
            <h2 className="max-w-lg text-4xl font-black leading-tight tracking-tight xl:text-5xl">
              {title}
            </h2>
            <p className="max-w-lg text-base leading-7 text-[#e0e1dd]/88 xl:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="grid gap-4">
            {features.map(({ icon: Icon, title: featureTitle, text }) => (
              <div
                key={featureTitle}
                className="flex items-start gap-4 rounded-3xl border border-[#cad2c5]/20 bg-[#e0e1dd]/10 p-5 shadow-2xl shadow-[#0d1b2a]/20 backdrop-blur-md"
              >
                <div className="mt-0.5 rounded-2xl bg-[linear-gradient(135deg,_#c6ac8f,_#81b29a)] p-3">
                  <Icon className="size-5 text-[#0d1b2a]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#e0e1dd]">
                    {featureTitle}
                  </h3>
                  <p className="text-sm leading-6 text-[#e0e1dd]/80">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`aspect-[1.15] rounded-[28px] border border-[#cad2c5]/20 bg-[#e0e1dd]/10 backdrop-blur-md ${
                  item % 2 === 0 ? "translate-y-4" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
