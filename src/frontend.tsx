import { useState } from "react";
import { createRoot } from "react-dom/client";
import data from "./lib/styles.json";
import {
  convertText,
  fullWidth,
  halfWidth,
  addHalfwidthDakutenToAll,
  addCombiningDakutenToAll,
  toUpperCase,
  toLowerCase,
  toggleCase,
  convertToPlainText,
} from "./lib/converter";
import { formatCharacterSet } from "./lib/format-chars";
import "./style.css";

const { categories, styles } = data;

type StyleKey = keyof typeof styles;

function App() {
  const [inputText, setInputText] = useState("El Psy Kongroo. 1.048596");
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

  const renderFunctionCard = (name: string, fn: (str: string) => string, key: string) => {
    const converted = fn(inputText);
    const hasChange = converted !== inputText;
    const isEmpty = !inputText || !hasChange;

    return (
      <div
        key={key}
        className={`result-card ${isEmpty ? "empty" : ""}`}
        title={name}
      >
        <div className="card-content">{converted || inputText}</div>
        <button
          className={`copy-button ${copiedStyle === key ? "copied" : ""}`}
          onClick={() => copyToClipboard(converted || inputText, key)}
          title="コピー"
          disabled={isEmpty}
        >
          {copiedStyle === key ? "✓" : "📋"}
        </button>
      </div>
    );
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

            // Plain Textスタイルの場合は専用関数を使用
            const converted = styleKey === 'plainText'
              ? convertToPlainText(inputText)
              : convertText(inputText, style.from, style.to);
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
          <span className="title-accent">font-style-converter</span>
        </h1>
        <p className="subtitle">主に英数字をナナメにしたり太字にしたり、濁点つけたり</p>
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
          <div className="category-header">
            <h2 className="category-title">Plain Text</h2>
            <span className="category-preview">元の文字列, 大文字・小文字変換</span>
          </div>
          <div className="results-grid">
            {renderFunctionCard("Plain Text (元に戻す)", convertToPlainText, "plaintext")}
            {renderFunctionCard("大文字 (UPPERCASE)", toUpperCase, "uppercase")}
            {renderFunctionCard("小文字 (lowercase)", toLowerCase, "lowercase")}
            {renderFunctionCard("大小反転 (tOGGLE cASE)", toggleCase, "togglecase")}
          </div>
        </div>
        <div className="category-section">
          <div className="category-header">
            <h2 className="category-title">Width & Dakuten</h2>
            <span className="category-preview">全角・半角・濁点</span>
          </div>
          <div className="results-grid">
            {renderFunctionCard("全角 (Full Width)", fullWidth, "fullwidth")}
            {renderFunctionCard("半角 (Half Width)", halfWidth, "halfwidth")}
            {renderFunctionCard("濁点追加 (Add Dakuten)", addCombiningDakutenToAll, "dakuten")}
            {renderFunctionCard("半角濁点追加 (Add Half Dakuten)", addHalfwidthDakutenToAll, "half-dakuten")}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
