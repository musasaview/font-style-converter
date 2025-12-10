import { useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./lib/styles.json";
import { convertText } from "./lib/converter";
import "./style.css";

type StyleName = keyof typeof styles;

function App() {
  const [inputText, setInputText] = useState("");
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  const convertedResults = Object.entries(styles).map(([styleName, style]) => {
    const converted = convertText(inputText, style.from, style.to);
    const hasChange = converted !== inputText;
    return {
      styleName: styleName as StyleName,
      converted,
      hasChange,
    };
  });

  const displayResults = convertedResults.filter((result) => result.hasChange);

  const copyToClipboard = async (text: string, styleName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStyle(styleName);
      setTimeout(() => setCopiedStyle(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Unicode Text Converter</h1>
        <p>様々なUnicode文字スタイルに変換します</p>
      </header>

      <div className="input-section">
        <textarea
          className="input-textarea"
          placeholder="テキストを入力してください..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
        />
      </div>

      <div className="results-section">
        {displayResults.length === 0 && inputText && (
          <div className="no-results">変換可能な文字がありません</div>
        )}
        {displayResults.map((result) => (
          <div key={result.styleName} className="result-card">
            <div className="card-header">
              <span className="style-name">{result.styleName}</span>
              <button
                className={`copy-button ${copiedStyle === result.styleName ? 'copied' : ''}`}
                onClick={() => copyToClipboard(result.converted, result.styleName)}
                title="コピー"
              >
                {copiedStyle === result.styleName ? '✓' : '📋'}
              </button>
            </div>
            <div className="card-content">{result.converted}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
