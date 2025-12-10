import { useState } from "react";
import { createRoot } from "react-dom/client";
import data from "./lib/styles.json";
import { convertText } from "./lib/converter";
import { formatCharacterSet } from "./lib/format-chars";
import "./style.css";

const { categories, styles } = data;

type StyleKey = keyof typeof styles;

function App() {
  const [inputText, setInputText] = useState("");
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  const copyToClipboard = async (text: string, styleKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStyle(styleKey);
      setTimeout(() => setCopiedStyle(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderCategory = (categoryName: string, styleKeys: string[]) => {
    // Get all character sets for this category
    const categoryCharSets = styleKeys
      .map((key) => {
        const style = styles[key as StyleKey];
        if (!style) return "";
        return formatCharacterSet(style.from, style.to);
      })
      .filter(Boolean)
      .join(" ");

    return (
      <div key={categoryName} className="category-section">
        <div className="category-header">
          <h2 className="category-title">{categoryName}</h2>
          <span className="category-preview">{categoryCharSets}</span>
        </div>
        <div className="results-grid">
          {styleKeys.map((styleKey) => {
            const style = styles[styleKey as StyleKey];
            if (!style) return null;

            const converted = convertText(inputText, style.from, style.to);
            const hasChange = converted !== inputText;
            const isEmpty = !inputText || !hasChange;
            const charSet = formatCharacterSet(style.from, style.to);

            return (
              <div
                key={styleKey}
                className={`result-card ${isEmpty ? "empty" : ""}`}
                title={`${style.name}: ${charSet}`}
              >
                <div className="card-content">{converted || inputText}</div>
                <button
                  className={`copy-button ${copiedStyle === styleKey ? "copied" : ""}`}
                  onClick={() => copyToClipboard(converted || inputText, styleKey)}
                  title="コピー"
                  disabled={isEmpty}
                >
                  {copiedStyle === styleKey ? "✓" : "📋"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">
          <span className="title-text">Unicode</span>
          <span className="title-accent">Text</span>
          <span className="title-text">Converter</span>
        </h1>
        <p className="subtitle">様々なUnicode文字スタイルに変換</p>
      </header>

      <div className="input-section">
        <textarea
          className="input-textarea"
          placeholder="テキストを入力してください..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          spellCheck={false}
        />
      </div>

      <div className="categories-container">
        {Object.entries(categories).map(([categoryName, styleKeys]) =>
          renderCategory(categoryName, styleKeys)
        )}

        <div className="category-section">
          <h2 className="category-title">Plain Text</h2>
          <div className="results-grid">
            <div
              className={`result-card ${!inputText ? "empty" : ""}`}
              title="Plain Text (Original)"
            >
              <div className="card-content">{inputText || "Plain text"}</div>
              <button
                className={`copy-button ${copiedStyle === "plain" ? "copied" : ""}`}
                onClick={() => copyToClipboard(inputText, "plain")}
                title="コピー"
                disabled={!inputText}
              >
                {copiedStyle === "plain" ? "✓" : "📋"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
