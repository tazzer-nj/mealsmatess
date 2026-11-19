import type { KaldiRecognizer, Model } from "vosk-browser";
import { afterMiaWake } from "./voice-session";

declare global {
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  }
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

function terminateModel(model: Model) {
  model.terminate();
  (model as unknown as { worker: Worker }).worker.terminate();
}

export const MIA_MODEL_URL = "/mia/vosk-model-small-en-us-0.15.tar.gz";
export type RecognitionMode = "wake" | "conversation" | "ignore";

/** Native Web Speech API recognizer for ultra-fast, robust zero-download browser voice commands. */
class NativeSpeechRecognizer {
  private recognition: SpeechRecognition | null = null;
  private currentText = "";
  private finalSegments: string[] = [];
  private finishing?: (text: string) => void;
  private finishTimer?: ReturnType<typeof setTimeout>;
  private aborted = false;
  private mode: RecognitionMode = "wake";
  private wakeTriggered = false;

  constructor(
    SpeechRec: { new (): SpeechRecognition },
    private transcript: (text: string, endpoint: boolean) => void,
    signal: AbortSignal,
    onError: (error: Error) => void,
  ) {
    try {
      const rec = new SpeechRec();
      this.recognition = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (this.aborted || this.mode === "ignore") return;
        let interim = "";
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0]) {
            const t = res[0].transcript;
            if (res.isFinal) finalChunk += t;
            else interim += t;
          }
        }

        const fullText = [...this.finalSegments, finalChunk, interim]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (finalChunk.trim()) {
          this.finalSegments.push(finalChunk.trim());
        }
        this.currentText = fullText;

        if (this.mode === "wake") {
          const wakeRest = afterMiaWake(fullText);
          if (wakeRest !== null || /\bhey (mia|me a)\b/i.test(fullText)) {
            this.wakeTriggered = true;
            this.transcript("hey mia", false);
            this.mode = "conversation";
            if (wakeRest) {
              this.currentText = wakeRest;
              this.transcript(wakeRest, false);
            }
          }
        } else {
          this.transcript(fullText, !!finalChunk);
        }

        if (this.finishing && (finalChunk.trim() || fullText.trim())) {
          clearTimeout(this.finishTimer);
          const done = this.finishing;
          this.finishing = undefined;
          done(wakeTriggeredText(fullText));
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (this.aborted || event.error === "aborted" || event.error === "no-speech") return;
        onError(new Error(`Speech recognition error: ${event.error}`));
      };

      rec.onend = () => {
        if (!this.aborted && this.recognition && this.mode !== "ignore") {
          try {
            rec.start();
          } catch {
            // Already started or restarting
          }
        }
      };

      signal.addEventListener(
        "abort",
        () => {
          this.dispose();
        },
        { once: true },
      );

      rec.start();
    } catch (error) {
      onError(
        error instanceof Error ? error : new Error("Failed to start native speech recognition"),
      );
    }
  }

  reset(mode: RecognitionMode = "conversation") {
    clearTimeout(this.finishTimer);
    this.finishing?.("");
    this.finishing = undefined;
    this.currentText = "";
    this.finalSegments = [];
    this.mode = mode;
    this.wakeTriggered = false;
    if (mode === "ignore" && this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  accept(_samples: Float32Array) {
    // Native Web Speech API processes microphone input automatically
  }

  finish(): Promise<string> {
    return new Promise((resolve) => {
      this.finishing = resolve;
      this.finishTimer = setTimeout(() => {
        this.finishing = undefined;
        resolve(wakeTriggeredText(this.currentText));
      }, 3000);
    });
  }

  dispose() {
    this.aborted = true;
    clearTimeout(this.finishTimer);
    this.finishing?.("");
    this.finishing = undefined;
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}

function wakeTriggeredText(text: string): string {
  return (afterMiaWake(text) ?? text).trim();
}

/** Local Vosk recognizer fallback for offline or non-SpeechRecognition environments. */
class VoskRecognizer {
  private recognizer?: KaldiRecognizer;
  private segments: string[] = [];
  private partial = "";
  private finishing?: (text: string) => void;
  private finishTimer?: ReturnType<typeof setTimeout>;
  private mode: RecognitionMode = "wake";
  private samples = 0;
  private ring: { start: number; data: Float32Array }[] = [];
  private waking = false;

  constructor(
    private model: Model,
    private rate: number,
    private transcript: (text: string, endpoint: boolean) => void,
  ) {
    this.reset("wake");
  }

  private text() {
    return [...this.segments, this.partial].filter(Boolean).join(" ").trim();
  }

  reset(mode: RecognitionMode = "conversation") {
    clearTimeout(this.finishTimer);
    this.finishing?.("");
    this.finishing = undefined;
    this.recognizer?.remove();
    this.recognizer = undefined;
    this.segments = [];
    this.partial = "";
    this.mode = mode;
    this.samples = 0;
    this.ring = [];
    this.waking = false;
    if (mode === "ignore") return;
    const recognizer = new this.model.KaldiRecognizer(
      this.rate,
      mode === "wake" ? JSON.stringify(["hey mia", "hey me a", "[unk]"]) : undefined,
    );
    this.recognizer = recognizer;
    recognizer.setWords(true);
    recognizer.on("partialresult", (message) => {
      if (!("result" in message) || !("partial" in message.result)) return;
      const text = message.result.partial;
      if (this.mode === "wake") {
        if (!this.waking && /\bhey (mia|me a)\b/.test(text)) {
          this.waking = true;
          recognizer.retrieveFinalResult();
          this.transcript("hey mia", false);
        }
      } else {
        this.partial = text;
        this.transcript(this.text(), false);
      }
    });
    recognizer.on("result", (message) => {
      if (!("result" in message) || !("text" in message.result)) return;
      if (this.mode === "wake") {
        const words = message.result.result ?? [];
        const wakeEnd = words
          .filter((word) => word.word === "mia" || word.word === "a")
          .at(-1)?.end;
        if (
          (this.waking || /\bhey (mia|me a)\b/.test(message.result.text)) &&
          wakeEnd !== undefined
        ) {
          const buffered = this.ring;
          const cut = Math.round(wakeEnd * this.rate);
          if (!this.waking) this.transcript("hey mia", false);
          this.reset("conversation");
          for (const { start, data } of buffered) {
            if (start + data.length > cut) this.accept(data.slice(Math.max(0, cut - start)));
          }
        } else if (!this.waking) {
          this.reset("wake");
        }
        return;
      }
      if (message.result.text) this.segments.push(message.result.text);
      this.partial = "";
      if (this.finishing) {
        clearTimeout(this.finishTimer);
        const done = this.finishing;
        this.finishing = undefined;
        done(this.text());
      } else this.transcript(this.text(), true);
    });
  }

  accept(samples: Float32Array) {
    if (this.mode === "ignore") return;
    if (this.mode === "wake") {
      this.ring.push({ start: this.samples, data: samples.slice() });
      this.samples += samples.length;
      while (this.ring.length > 1 && this.ring[0]!.start < this.samples - this.rate * 4)
        this.ring.shift();
      if (this.waking) return;
    }
    this.recognizer?.acceptWaveformFloat(samples, this.rate);
  }

  finish(): Promise<string> {
    return new Promise((resolve) => {
      this.finishing = resolve;
      this.finishTimer = setTimeout(() => {
        this.finishing = undefined;
        resolve(this.text());
      }, 5000);
      this.recognizer?.retrieveFinalResult();
    });
  }

  dispose() {
    clearTimeout(this.finishTimer);
    this.finishing?.("");
    this.finishing = undefined;
    this.recognizer?.remove();
    terminateModel(this.model);
  }
}

/** Local constrained wake detector supporting native SpeechRecognition with Vosk fallback. */
export class LocalRecognizer {
  private engine: NativeSpeechRecognizer | VoskRecognizer;

  private constructor(engine: NativeSpeechRecognizer | VoskRecognizer) {
    this.engine = engine;
  }

  static async load(
    rate: number,
    transcript: (text: string, endpoint: boolean) => void,
    signal: AbortSignal,
    onError: (error: Error) => void,
  ) {
    const SpeechRec =
      typeof window !== "undefined" &&
      (window.SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: { new (): SpeechRecognition } })
          .webkitSpeechRecognition);

    if (SpeechRec) {
      return new LocalRecognizer(
        new NativeSpeechRecognizer(SpeechRec, transcript, signal, onError),
      );
    }

    const { Model } = await import("vosk-browser");
    signal.throwIfAborted();
    const model = new Model(new URL(MIA_MODEL_URL, location.origin).href, -2);
    const worker = (model as unknown as { worker: Worker }).worker;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => fail(new Error("The voice model took too long to load.")),
        120_000,
      );
      const cleanup = () => {
        clearTimeout(timeout);
        signal.removeEventListener("abort", abort);
      };
      const fail = (error: Error) => {
        cleanup();
        terminateModel(model);
        reject(error);
      };
      const abort = () => fail(new DOMException("Voice stopped", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      model.on("load", (message) => {
        if ("result" in message && message.result) {
          cleanup();
          resolve();
        } else fail(new Error("Couldn't load the offline voice model."));
      });
      const failed = () => {
        const error = new Error("Local speech recognition failed. Please enable hands-free again.");
        if (!model.ready) fail(error);
        else onError(error);
      };
      model.on("error", failed);
      worker.addEventListener("error", failed);
    });
    if (signal.aborted) {
      terminateModel(model);
      signal.throwIfAborted();
    }
    return new LocalRecognizer(new VoskRecognizer(model, rate, transcript));
  }

  reset(mode: RecognitionMode = "conversation") {
    this.engine.reset(mode);
  }

  accept(samples: Float32Array) {
    this.engine.accept(samples);
  }

  finish(): Promise<string> {
    return this.engine.finish();
  }

  dispose() {
    this.engine.dispose();
  }
}
