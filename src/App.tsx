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
      <h1>Wordle Twitter Solver</h1>
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
      <footer className="footer">
        <p className="sc-kfPuZi bDfCpq">
          Made by{" "}
          <a href="https://dldc.dev/twitter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#1DA1F2"
              viewBox="0 0 256 256"
              style={{ marginBottom: -7 }}
            >
              <rect width="256" height="256" fill="none"></rect>
              <path d="M245.65723,77.65674l-30.16407,30.16455C209.4707,177.70215,150.53809,232,80,232c-14.52441,0-26.49414-2.30273-35.57764-6.84473-7.33056-3.665-10.33349-7.59912-11.07861-8.71777a8,8,0,0,1,3.84717-11.92822c.25732-.09717,23.84814-9.15772,39.09521-26.40869a109.574,109.574,0,0,1-24.72656-24.355c-13.708-18.60352-28.206-50.91114-19.43066-99.17676a8.00023,8.00023,0,0,1,13.52832-4.22559c.35254.35156,33.64209,33.1709,74.3374,43.772L120,87.99609a48.31863,48.31863,0,0,1,48.6084-47.99267,48.11329,48.11329,0,0,1,40.96875,23.99609L240,64a8.0001,8.0001,0,0,1,5.65723,13.65674Z"></path>
            </svg>{" "}
            @EtienneTech
          </a>
        </p>
        <div style={{ height: 12 }} />
        <p>
          Explore the{" "}
          <a href="https://github.com/etienne-dldc/wordle-solver">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#263238"
              viewBox="0 0 256 256"
              style={{ marginBottom: -7 }}
            >
              <rect width="256" height="256" fill="none"></rect>
              <g>
                <path d="M70.146,82.87891a8.00043,8.00043,0,0,0-11.26758-1.02442l-48,40a7.99963,7.99963,0,0,0,0,12.291l48,40a7.99987,7.99987,0,1,0,10.24316-12.291L28.49658,128l40.625-33.85449A7.99977,7.99977,0,0,0,70.146,82.87891Z"></path>
                <path d="M245.12158,121.85449l-48-40a7.99987,7.99987,0,1,0-10.24316,12.291L227.50342,128l-40.625,33.85449a7.99987,7.99987,0,1,0,10.24316,12.291l48-40a7.99963,7.99963,0,0,0,0-12.291Z"></path>
                <path d="M162.73389,32.48145a8.005,8.005,0,0,0-10.25244,4.78418l-64,176a8.00034,8.00034,0,1,0,15.0371,5.46875l64-176A8.0008,8.0008,0,0,0,162.73389,32.48145Z"></path>
              </g>
            </svg>{" "}
            Code on Github
          </a>
        </p>
      </footer>
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
