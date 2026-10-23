import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { FiCheck, FiCopy, FiX, FiGithub } from "react-icons/fi";
import { convertAll, type TextStyle } from "./lib/catalog";
import "./style.css";

const SAMPLE_TEXT = "ABCD abcd あいう\n0123456789";

interface ResultProps {
  style: TextStyle;
  output: string;
  unchanged: boolean;
  copied: boolean;
  onCopy: (button: HTMLButtonElement) => void;
  plain?: boolean;
}

function Result({
  style,
  output,
  unchanged,
  copied,
  onCopy,
  plain,
}: ResultProps) {
  return (
    <article
      className={`result${plain ? " plain-result" : ""}${unchanged ? " unchanged" : ""}`}
      title={`${style.name}: ${style.specimen ?? style.description}`}
    >
      <div className="result-body">
        <div className="result-text" dir="auto">
          {output}
        </div>
        <button
          className={`copy-button${copied ? " is-copied" : ""}`}
          title={copied ? "コピーしました" : "コピー"}
          onClick={(event) => onCopy(event.currentTarget)}
          aria-label={`${plain ? "装飾なし" : style.name}をコピー`}
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
      {style.note && <p className="result-note">{style.note}</p>}
      <div className="result-footer">
        <h3 title={style.description}>{plain ? "装飾なし" : style.name}</h3>
        {style.specimen && (
          <span className="specimen" aria-label={`${style.name}の文字見本`}>
            {style.specimen}
          </span>
        )}
      </div>
    </article>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [hideUnchanged, setHideUnchanged] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [copyError, setCopyError] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fallback = useRef<HTMLTextAreaElement>(null);
  const copyOrigin = useRef<HTMLButtonElement | null>(null);
  const resultsHeading = useRef<HTMLDivElement>(null);
  const categoryHeadings = useRef(new Map<string, HTMLHeadingElement>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copyAttempt = useRef(0);
  useEffect(
    () => () => {
      ++copyAttempt.current;
      clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (copyError) {
      fallback.current?.focus();
      fallback.current?.select();
    }
  }, [copyError]);
  useEffect(() => {
    const heading = resultsHeading.current!;
    const observer = new ResizeObserver(() => {
      heading.parentElement?.style.setProperty(
        "--results-toolbar-height",
        `${heading.offsetHeight}px`,
      );
    });
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  const sourceText = input === "" ? SAMPLE_TEXT : input;
  const { plainText, results } = useMemo(
    () => convertAll(sourceText),
    [sourceText],
  );
  const visibleResults = results.filter(
    (result) =>
      result.style.id !== "plain" &&
      (!hideUnchanged || result.output !== plainText),
  );
  const grouped = Map.groupBy(
    visibleResults,
    (result) => result.style.category,
  );
  const plain = results.find((result) => result.style.id === "plain")!;

  function updateInput(value: string) {
    ++copyAttempt.current;
    setInput(value);
    setCopied(null);
    setNotice("");
    setCopyError(null);
    clearTimeout(timer.current);
  }
  function closeCopyError() {
    ++copyAttempt.current;
    setCopyError(null);
    const origin = copyOrigin.current;
    (origin?.isConnected ? origin : textarea.current)?.focus();
  }
  async function copy(
    text: string,
    id: string,
    name: string,
    button: HTMLButtonElement,
  ) {
    const attempt = ++copyAttempt.current;
    clearTimeout(timer.current);
    setCopied(null);
    setNotice("");
    setCopyError(null);
    copyOrigin.current = button;
    try {
      await navigator.clipboard.writeText(text);
      if (attempt !== copyAttempt.current) return;
      setCopied(id);
      setCopyError(null);
      setNotice(`${name}をコピーしました`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (attempt !== copyAttempt.current) return;
        setCopied(null);
        setNotice("");
      }, 2000);
    } catch {
      if (attempt === copyAttempt.current) setCopyError({ name, text });
    }
  }

  return (
    <main
      onKeyDown={(event) => {
        if (copyError && event.key === "Escape") {
          event.preventDefault();
          closeCopyError();
        }
      }}
    >
      <aside className="sidebar" aria-label="入力と装飾なしの結果">
        <header className="app-heading">
          <span className="app-mark" aria-hidden="true">
            Aa
          </span>
          <h1>font style converter</h1>
        </header>
        <section className="input-section">
          <div className="input-heading">
            <label htmlFor="source-text">変換したい文字を入力</label>
            <button
              className="clear-button"
              disabled={!input}
              onClick={() => {
                updateInput("");
                textarea.current?.focus();
              }}
            >
              クリア
            </button>
          </div>
          <textarea
            id="source-text"
            autoFocus
            ref={textarea}
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            spellCheck={false}
            placeholder={SAMPLE_TEXT}
            rows={6}
          />
          <Result
            {...plain}
            plain
            unchanged={plain.output === sourceText}
            copied={copied === "plain"}
            onCopy={(button) => copy(plain.output, "plain", "装飾なし", button)}
          />
        </section>
        <p className="privacy">入力内容は保存・送信されません</p>
        <footer className="author">
          <span>made by musasaview</span>
          <a
            href="https://x.com/musasaview"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="作者の X"
          >
            𝕏
          </a>
          <a
            href="https://github.com/musasaview/font-style-converter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub ソースコード"
          >
            <FiGithub />
          </a>
        </footer>
      </aside>
      <section className="results-section" aria-label="変換結果">
        <div className="results-heading" ref={resultsHeading}>
          <h2>
            変換結果 <span className="result-count">{visibleResults.length}件</span>
          </h2>
          <select
            className="category-jump"
            aria-label="カテゴリへ移動"
            defaultValue=""
            disabled={grouped.size === 0}
            onChange={(event) => {
              const heading = categoryHeadings.current.get(event.target.value);
              event.currentTarget.value = "";
              heading?.focus({ preventScroll: true });
              heading?.scrollIntoView({ block: "start" });
            }}
          >
            <option value="" disabled>
              カテゴリへ移動
            </option>
            {Array.from(grouped.keys(), (category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={hideUnchanged}
              onChange={(event) => setHideUnchanged(event.target.checked)}
            />
            変換されない文字種を隠す
          </label>
        </div>
        {grouped.size === 0 && (
          <p className="empty-results">
            変換できる文字種がありません。チェックを外すとすべて表示します。
          </p>
        )}
        {Array.from(grouped, ([category, items]) => (
          <section
            className="category-section"
            key={category}
            aria-label={category}
          >
            <h3
              className="category-heading"
              tabIndex={-1}
              ref={(heading) => {
                if (heading) categoryHeadings.current.set(category, heading);
                else categoryHeadings.current.delete(category);
              }}
            >
              {category}
            </h3>
            <div className="results-grid">
              {items.map((result) => (
                <Result
                  key={result.style.id}
                  {...result}
                  unchanged={result.output === plainText}
                  copied={copied === result.style.id}
                  onCopy={(button) =>
                    copy(
                      result.output,
                      result.style.id,
                      result.style.name,
                      button,
                    )
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </section>
      <div className="sr-only" role="status">
        {notice}
      </div>
      {copyError && (
        <div className="copy-fallback" role="region" aria-label="手動コピー">
          <div>
            <strong>自動コピーが利用できません</strong>
            <button
              className="close-button"
              aria-label="手動コピーを閉じる"
              onClick={closeCopyError}
            >
              <FiX />
            </button>
          </div>
          <p>
            選択された文字を Ctrl+C / ⌘C、または長押しでコピーしてください。
          </p>
          <textarea
            ref={fallback}
            readOnly
            value={copyError.text}
            aria-label={`${copyError.name}のコピー用テキスト`}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
    </main>
  );
}

const container = document.getElementById("root")!;
const root = import.meta.hot
  ? (import.meta.hot.data.root ??= createRoot(container))
  : createRoot(container);
root.render(<App />);
