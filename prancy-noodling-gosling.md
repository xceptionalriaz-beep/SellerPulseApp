# Plan: Full Width Image Selection / Active-State Feedback

## Context
When Full Width (`fullwidth`) variant is selected, clicking the image container inside the canvas iframe must show clear visual confirmation (purple outline + visible overlay). Currently the overlay opacity is 0 and the active-slot ring isn't clearly applied because the `fullDrop` wrapper doesn't bind events the same way as split/single variants.

## Approach (recommended)
1. **In `product_image.variants.ts` (fullwidth)**: Ensure the non-overlay `fullDrop` wrapper has `position:relative`, `data-canvas-dropzone="src"`, and the overlay div uses `data-canvas-overlay="src"`. Keep `img` with `data-slot="src"`.
2. **In `Canvas.tsx` iframe `<style>`**: Confirm `.riazify-active-slot` applies `outline: 3px solid #7530fb` and the hover rules trigger `opacity: 1` for `div[data-canvas-overlay]` inside `div[data-canvas-dropzone]`.
3. **In `Canvas.tsx` script**: Confirm `img[data-slot]` click handler posts `RIAZIFY_SELECT_SLOT` and `div[data-canvas-overlay]` click handler posts `RIAZIFY_OPEN_ASSET_PICKER`. Confirm message handler applies `.riazify-active-slot` class when `RIAZIFY_UPDATE_ACTIVE_SLOT` arrives.
4. **Verification**: `npx tsc --noEmit` clean.

No new files needed; reuse existing CSS classes and message events.
