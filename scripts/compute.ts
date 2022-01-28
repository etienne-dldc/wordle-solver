import { allowedWords as allowedWordsRaw } from "./allowed-words";
import { answerWords as answerWordsRaw } from "./answer-words";
import fse from "fs-extra";

const answerWords = answerWordsRaw.map((w) => w.split("") as Word);
const allowedWords = allowedWordsRaw
  .map((w) => w.split("") as Word)
  .concat(answerWords);

const LetterState = {
  Absent: 0,
  Present: 1,
  Correct: 2,
};

type LetterState = typeof LetterState[keyof typeof LetterState];

type Tuple5<T> = [T, T, T, T, T];

type Result = Tuple5<LetterState>;

export type Word = Tuple5<string>;

function createTuple5<T>(val: T): Tuple5<T> {
  return [val, val, val, val, val];
}

function tuple5Equal<T>(left: Tuple5<T>, right: Tuple5<T>): boolean {
  return left.every((val, i) => val === right[i]);
}

export function compare(answer: Word, guess: Word): Result {
  const answerArray = [...answer] as Tuple5<string | null>;
  const guessArray = [...guess] as Tuple5<string | null>;
  const result: Result = createTuple5(LetterState.Absent);
  // handle Correct first
  guessArray.forEach((guess, i) => {
    if (guess === answerArray[i]) {
      guessArray[i] = null;
      answerArray[i] = null;
      result[i] = LetterState.Correct;
    }
  });
  // handle Misplaced
  guessArray.forEach((guess, i) => {
    if (guess === null) {
      return;
    }
    const index = answerArray.indexOf(guess);
    if (index >= 0) {
      guessArray[i] = null;
      answerArray[index] = null;
      result[i] = LetterState.Present;
    }
  });
  return result;
}

function resultKey(result: Result): number {
  const [a, b, c, d, e] = result;
  return a * 81 + b * 27 + c * 9 + d * 3 + e * 1;
}

function createResultArray(): Array<boolean> {
  return Array.from({ length: 243 }, () => false);
}

// Compute
const data = new Map<string, string>();
answerWords.forEach((answer, i) => {
  const result = createResultArray();
  allowedWords.forEach((guess) => {
    const key = resultKey(compare(answer, guess));
    result[key] = true;
  });
  data.set(answer.join(""), result.map((b) => (b ? "1" : "0")).join(""));
  if (i % 50 === 0) {
    console.log(i);
  }
});

// Check duplicate
// data.forEach((word, key) => {
//   const same: Array<string> = [];
//   data.forEach((other, otherKey) => {
//     if (word === other) {
//       return;
//     }
//     if (key === otherKey) {
//       same.push(other);
//     }
//   });
//   if (same.length > 0) {
//     console.log(word, ...same);
//   }
// });

fse.ensureDirSync("./data");
fse.writeJSONSync(
  "./data/result.json",
  Object.fromEntries(Array.from(data.entries())),
  { spaces: 2 }
);
