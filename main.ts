// One-line joke delivery for the "Make the AI Judge Laugh" bounty.
// The program holds a single fixed punchline, checks it against the
// bounty rules, and writes it verbatim to entry.txt. Nothing else.

import * as fs from "node:fs";
import * as path from "node:path";

// The joke being submitted. It must stay byte-for-byte identical, so it
// lives in exactly one place: this constant.
const JOKE =
  "My self-help book says I can become anyone. I'm halfway through and still me, so now it feels personal.";

// Count characters as code points, so any non-ASCII would still be
// measured the way the bounty measures UTF-8 characters.
function countChars(text: string): number {
  return [...text].length;
}

// Every character must be ordinary printable text: no control bytes,
// no DEL, nothing invisible smuggled in.
function isPrintable(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 32 || code === 127) {
      return false;
    }
  }
  return true;
}

// The bounty wants one line, 1..200 characters, and nothing but the joke.
function validate(text: string): void {
  const n = countChars(text);
  if (n < 1 || n > 200) {
    throw new Error(`Entry must be 1..200 characters, got ${n}.`);
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must not be only whitespace.");
  }
  if (!isPrintable(text)) {
    throw new Error("Entry contains a non-printable character.");
  }
}

// The grader can point us at an output folder; otherwise we use ./out.
function resolveOutDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return path.join(process.cwd(), "out");
}

// Read the file back and make sure it is byte-identical to the joke:
// no trailing newline, no extra whitespace, nothing appended.
function verifyWritten(target: string, expected: string): void {
  const onDisk = fs.readFileSync(target, "utf8");
  if (onDisk !== expected) {
    throw new Error(
      `entry.txt mismatch: on disk ${countChars(onDisk)} chars, expected ${countChars(expected)}.`,
    );
  }
}

function main(): void {
  validate(JOKE);
  const dir = resolveOutDir();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "entry.txt");
  // No trailing newline: the file must contain the joke and nothing else.
  fs.writeFileSync(target, JOKE, "utf8");
  verifyWritten(target, JOKE);
  console.log(`Wrote ${countChars(JOKE)} characters to ${target}`);
}

main();
