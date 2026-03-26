import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex w-full flex-1 items-center justify-center bg-[linear-gradient(180deg,_#ffffff,_#f8fbf9)] px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-500 shadow-sm">
          <span className="inline-block size-2 rounded-full bg-emerald-500" />
          Select a conversation
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(16,185,129,0.14),_rgba(74,78,105,0.10))] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-3 rounded-[24px] border border-white/80 bg-white/80" />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#4a4e69]">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-4xl font-semibold tracking-tight text-slate-900">
          Conversations, designed to feel calm.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
          Pick someone from the left and start chatting in a cleaner, more focused workspace built for quick replies and long conversations.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
