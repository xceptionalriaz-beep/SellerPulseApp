// app/zxing.d.ts
// ──────────────────────────────────────────────────────────────────
// Ambient type declarations for @zxing/browser and @zxing/library.
// These packages ship their own types but moduleResolution:"bundler"
// doesn't always resolve them — this file guarantees TypeScript finds them.
// ──────────────────────────────────────────────────────────────────

declare module '@zxing/browser' {
    export class BrowserMultiFormatReader {
        constructor(hints?: Map<number, unknown>, timeBetweenScansMillis?: number)
        decodeOnceFromVideoElement(videoElement: HTMLVideoElement): Promise<import('@zxing/library').Result>
        decodeFromVideoElement(
            videoElement: HTMLVideoElement,
            callbackFn: (result: import('@zxing/library').Result | null, error?: Error) => void
        ): Promise<import('@zxing/library').IScannerControls>
        decodeFromStream(
            stream: MediaStream,
            videoElement: HTMLVideoElement,
            callbackFn: (result: import('@zxing/library').Result | null, error?: Error) => void
        ): Promise<import('@zxing/library').IScannerControls>
        /** Decode a barcode from an image URL (data URL or object URL) */
        decodeFromImageUrl(src: string): Promise<import('@zxing/library').Result>
        /** Decode a barcode from an HTMLImageElement */
        decodeFromImageElement(element: HTMLImageElement | string): Promise<import('@zxing/library').Result>
    }
}

declare module '@zxing/library' {
    export class NotFoundException extends Error {
        static getNotFoundInstance(): NotFoundException
    }
    export interface IScannerControls {
        stop(): void
    }
    export interface Result {
        getText(): string
        getFormat(): number
        getTimestamp(): number
    }
}
