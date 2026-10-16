// Type declarations for html2canvas
// The package ships types at dist/types/index.d.ts but doesn't expose them
// via the "types" field in package.json, so we re-declare the module here.

declare module 'html2canvas' {
    interface Options {
        allowTaint?: boolean
        backgroundColor?: string | null
        canvas?: HTMLCanvasElement
        foreignObjectRendering?: boolean
        imageTimeout?: number
        ignoreElements?: (element: Element) => boolean
        logging?: boolean
        onclone?: (document: Document, element: HTMLElement) => void
        proxy?: string
        removeContainer?: boolean
        scale?: number
        useCORS?: boolean
        width?: number
        height?: number
        x?: number
        y?: number
        scrollX?: number
        scrollY?: number
        windowWidth?: number
        windowHeight?: number
    }

    function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>

    export = html2canvas
}
