import { useMemo, useState } from "react";
import dataRaw from "../data/result.json";

export const data = new Map<string, Array<boolean>>(
  Object.entries(dataRaw).map(([key, value]) => [
    key,
    value.split("").map((c) => c === "1"),
  ])
);

const LetterState = {
  Absent: 0,
  Present: 1,
  Correct: 2,
};

type LetterState = typeof LetterState[keyof typeof LetterState];

type Tuple5<T> = [T, T, T, T, T];

export type Result = Tuple5<LetterState>;

export function resultKey(result: Result): number {
  const [a, b, c, d, e] = result;
  return a * 81 + b * 27 + c * 9 + d * 3 + e * 1;
}

export function resultFromKey(key: number): Result {
  const str = key.toString(3).padStart(5, "0");
  return str.split("").map((c) => parseInt(c, 10)) as any;
}

const allAnswers = Array.from(data.keys());

function App() {
  const [results, setResults] = useState<Array<number>>([]);

  const possibleAnswers = useMemo(() => {
    return allAnswers.filter((answer) => {
      return results.every((result) => {
        const resultArray = data.get(answer)!;
        return resultArray[result];
      });
    });
  }, [results]);

  return (
    <div className="main">
      <h1>Twitter Wordle Solver</h1>
      <p className="infos">
        Copy wordle tweets then past them in the input below. With enough tweets
        it will find the word of the day.
      </p>
      <p className="infos">Make sure to only copy tweets from the same day.</p>
      <textarea
        placeholder="Past tweets here."
        value={""}
        onChange={(e) => {
          const results = parse(e.currentTarget.value).map((r) => resultKey(r));
          setResults((prev) => {
            const res = [...prev];
            results.forEach((r) => {
              if (res.includes(r) === false) {
                res.push(r);
              }
            });
            return res;
          });
        }}
      />
      {(() => {
        if (possibleAnswers.length === 0) {
          return (
            <p className="result">
              Found {results.length} wordle lines to analyze.
              <br />
              No words remaining, try again.
            </p>
          );
        }
        if (possibleAnswers.length === 1) {
          return (
            <p className="result">
              Found {results.length} wordle lines to analyze.
              <br />
              The word of the day is {possibleAnswers[0].toUpperCase()}
            </p>
          );
        }
        return (
          <p className="result">
            Found {results.length} wordle lines to analyze. <br />
            There are {possibleAnswers.length} remainning answers.
          </p>
        );
      })()}
    </div>
  );
}

export default App;

const VALID_LINE = /^[012][012][012][012][012]$/;

export function parse(text: string): Array<Result> {
  const lines = text.split("\n");
  const results: Array<Result> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
      .replaceAll("Blue square", "1")
      .replaceAll("Orange square", "2")
      .replaceAll("Yellow square", "1")
      .replaceAll("Green square", "2")
      .replaceAll("⬛", "0")
      .replaceAll("⬜", "0")
      .replaceAll("🟦", "1")
      .replaceAll("🟧", "2")
      .replaceAll("🟨", "1")
      .replaceAll("🟩", "2")
      .slice(0, 5);
    if (line.match(VALID_LINE)) {
      if (line !== "00000" && line !== "22222") {
        results.push(line.split("").map((c) => parseInt(c, 10)) as any);
      }
    }
  }
  return results;
}
