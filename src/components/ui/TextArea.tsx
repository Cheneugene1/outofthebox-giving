'use client';

interface TextAreaProps {
  value: string;
  onChange: (text: string) => void;
  maxLength: number;
  placeholder?: string;
}

export function TextArea({ value, onChange, maxLength, placeholder }: TextAreaProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        maxLength={maxLength}
        placeholder={placeholder || "Write a small useful tip..."}
        rows={4}
        className="w-full p-4 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-400 text-base"
      />
      <div className="text-right text-sm text-stone-400 mt-1">
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
