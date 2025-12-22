import { useState, useRef, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { STYLES, CATEGORIES } from "./lib/character-maps";
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
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import "./style.css";

type StyleKey = keyof typeof STYLES;

interface FunctionCard {
  name: string;
  key: string;
  fn: (str: string) => string;
}

const FUNCTION_CARDS: FunctionCard[] = [
  { name: "Plain Text (元に戻す)", key: "plaintext", fn: convertToPlainText },
  { name: "大文字 (UPPERCASE)", key: "uppercase", fn: toUpperCase },
  { name: "小文字 (lowercase)", key: "lowercase", fn: toLowerCase },
  { name: "大小反転 (tOGGLE cASE)", key: "togglecase", fn: toggleCase },
];

const WIDTH_DAKUTEN_CARDS: FunctionCard[] = [
  { name: "全角 (Full Width)", key: "fullwidth", fn: fullWidth },
  { name: "半角 (Half Width)", key: "halfwidth", fn: halfWidth },
  { name: "濁点追加 (Add Dakuten)", key: "dakuten", fn: addCombiningDakutenToAll },
  { name: "半角濁点追加 (Add Half Dakuten)", key: "half-dakuten", fn: addHalfwidthDakutenToAll },
];

function formatCharacterSet(charMap: Record<string, string>): string {
  const lowercase: string[] = [];
  const uppercase: string[] = [];
  const digits: string[] = [];

  Object.entries(charMap).forEach(([from, to]) => {
    if (/[a-z]/.test(from)) {
      lowercase.push(to);
    } else if (/[A-Z]/.test(from)) {
      uppercase.push(to);
    } else if (/[0-9]/.test(from)) {
      digits.push(to);
    }
  });

  const parts = [];
  if (uppercase.length > 0) parts.push(uppercase.join(''));
  if (lowercase.length > 0) parts.push(lowercase.join(''));
  if (digits.length > 0) parts.push(digits.join(''));

  return parts.join(' ');
}

function App() {
  const [inputText, setInputText] = useState("El Psy Kongroo. 1.048596");
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const copyToClipboard = async (text: string, styleKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStyle(styleKey);
      setTimeout(() => setCopiedStyle(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClearInput = () => {
    setInputText("");
    textareaRef.current?.focus();
  };

  const renderResultCard = (
    converted: string,
    styleKey: string,
    styleName: string,
    charSet?: string
  ) => {
    const hasChange = converted !== inputText;
    const isEmpty = !inputText || !hasChange;
    const title = charSet ? `${styleName}: ${charSet}` : styleName;

    return (
      <div
        key={styleKey}
        className={`result-card ${isEmpty ? "empty" : ""}`}
        title={title}
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
  };

  const renderFunctionCards = (cards: FunctionCard[]) => (
    <div className="results-grid">
      {cards.map(({ name, key, fn }) => {
        const converted = fn(inputText);
        return renderResultCard(converted, key, name);
      })}
    </div>
  );

  const categoryPreview = useMemo(() => {
    const previews: Record<string, string> = {};
    Object.entries(CATEGORIES).forEach(([categoryName, styleKeys]) => {
      previews[categoryName] = styleKeys
        .map(key => {
          const charMap = STYLES[key as StyleKey];
          return charMap ? formatCharacterSet(charMap) : "";
        })
        .filter(Boolean)
        .join(" ");
    });
    return previews;
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">
          <span className="title-accent">font-style-converter</span>
        </h1>
        <p className="subtitle">文字列の見た目を変換するやつ。どこにも送信されないのでご安心を。</p>
      </header>

      <div className="input-section">
        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder="テキストを入力してください..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            spellCheck={false}
          />
          {inputText && (
            <button
              className="clear-button"
              onClick={handleClearInput}
              title="クリア"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="categories-container">
        {Object.entries(CATEGORIES).map(([categoryName, styleKeys]) => (
          <div key={categoryName} className="category-section">
            <div className="category-header">
              <h2 className="category-title">{categoryName}</h2>
              <span className="category-preview">{categoryPreview[categoryName]}</span>
            </div>
            <div className="results-grid">
              {styleKeys.map((styleKey) => {
                const charMap = STYLES[styleKey as StyleKey];
                if (!charMap) return null;

                const converted = convertText(inputText, charMap);
                const charSet = formatCharacterSet(charMap);

                return renderResultCard(converted, styleKey, styleKey, charSet);
              })}
            </div>
          </div>
        ))}

        <div className="category-section">
          <div className="category-header">
            <h2 className="category-title">Plain Text</h2>
            <span className="category-preview">元の文字列, 大文字・小文字変換</span>
          </div>
          {renderFunctionCards(FUNCTION_CARDS)}
        </div>

        <div className="category-section">
          <div className="category-header">
            <h2 className="category-title">Width & Dakuten</h2>
            <span className="category-preview">全角・半角・濁点</span>
          </div>
          {renderFunctionCards(WIDTH_DAKUTEN_CARDS)}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text" title="made by musasaview">𝚖𝚊𝚍𝚎 𝚋𝚢 𝚖𝚞𝚜𝚊𝚜𝚊𝚟𝚒𝚎𝚠</div>
          <div className="footer-links">
            <a
              href="https://x.com/musasaview"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              title="Twitter / X"
            >
              <FaXTwitter size={20} />
            </a>
            <a
              href="https://github.com/musasaview/font-style-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              title="GitHub"
            >
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
