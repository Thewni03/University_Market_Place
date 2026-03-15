import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
      {imagePreview && (
        <div className="mx-auto mb-4 flex w-full max-w-4xl items-center gap-2">
          <div className="relative rounded-3xl bg-slate-100 p-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-white"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <input
            type="text"
            className="w-full bg-transparent px-2 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Write something thoughtful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden h-11 w-11 items-center justify-center rounded-2xl border transition sm:flex ${
              imagePreview
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-transparent text-slate-400 hover:bg-slate-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#03045e] text-white shadow-lg shadow-[#03045e]/25 transition hover:scale-[1.02] hover:bg-[#10117a] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
