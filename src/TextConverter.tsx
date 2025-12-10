import { useState } from "react";
import {
  convertText,
  fullWidth,
  halfWidth,
  addHalfwidthDakutenToAll,
  addCombiningDakutenToAll,
} from "./lib/converter";
import stylesData from "./lib/styles.json";

type StyleKey = keyof typeof stylesData.styles;

export function TextConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const handleStyleConversion = (styleKey: StyleKey) => {
    const style = stylesData.styles[styleKey];
    if (style && style.from && style.to) {
      const result = convertText(inputText, style.from, style.to);
      setOutputText(result);
    }
  };

  const handleFullWidth = () => {
    setOutputText(fullWidth(inputText));
  };

  const handleHalfWidth = () => {
    setOutputText(halfWidth(inputText));
  };

  const handleAddDakuten = () => {
    setOutputText(addCombiningDakutenToAll(inputText));
  };

  const handleAddHalfDakuten = () => {
    setOutputText(addHalfwidthDakutenToAll(inputText));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-4xl text-left flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to convert..."
          className="w-full min-h-[120px] bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-3 text-[#fbf0df] font-mono resize-y focus:border-[#f3d5a3] placeholder-[#fbf0df]/40 outline-none"
        />

        <div className="flex flex-col gap-3">
          {/* Function-based conversions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFullWidth}
              className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer"
            >
              全角 (Full Width)
            </button>
            <button
              onClick={handleHalfWidth}
              className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer"
            >
              半角 (Half Width)
            </button>
            <button
              onClick={handleAddDakuten}
              className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer"
            >
              濁点追加 (Add Dakuten)
            </button>
            <button
              onClick={handleAddHalfDakuten}
              className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer"
            >
              半角濁点追加 (Add Half Dakuten)
            </button>
          </div>

          {/* Style-based conversions */}
          {Object.entries(stylesData.categories).map(([categoryName, styleKeys]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <h3 className="text-[#fbf0df] font-bold text-sm">{categoryName}</h3>
              <div className="flex flex-wrap gap-2">
                {styleKeys.map((styleKey) => {
                  const style = stylesData.styles[styleKey as StyleKey];
                  return (
                    <button
                      key={styleKey}
                      onClick={() => handleStyleConversion(styleKey as StyleKey)}
                      className="bg-[#1a1a1a] text-[#fbf0df] border-2 border-[#fbf0df] px-3 py-1.5 rounded-lg text-sm transition-all duration-100 hover:bg-[#fbf0df] hover:text-[#1a1a1a] cursor-pointer"
                    >
                      {style.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-start">
          <textarea
            value={outputText}
            readOnly
            placeholder="Output will appear here..."
            className="flex-1 min-h-[120px] bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-3 text-[#fbf0df] font-mono resize-y focus:border-[#f3d5a3] placeholder-[#fbf0df]/40"
          />
          <button
            onClick={copyToClipboard}
            disabled={!outputText}
            className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
