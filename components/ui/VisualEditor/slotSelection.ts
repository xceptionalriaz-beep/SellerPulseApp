// components/ui/VisualEditor/slotSelection.ts
// ─────────────────────────────────────────────────────────────────────────────
// Universal Slot Selection UI System
//
// Provides slim, soft, and modern selection styling across all blocks:
//   • Three Column / Two Column / Container dropzones
//   • Hero Product (Main Image & Thumbnails)
//   • Banners, Logos, Galleries & Media Placeholders
//
// Replaces harsh 3px outlines with a slim 2px curved stroke and soft ambient glow.
// ─────────────────────────────────────────────────────────────────────────────

export const SLOT_SELECTION_TOKENS = {
  primary: '#7530fb',
  primaryLight: 'rgba(243, 238, 255, 0.65)',
  primaryGlow: 'rgba(117, 48, 251, 0.18)',
  radius: '8px',
} as const;

/**
 * Global CSS injected into the canvas iframe.
 * Ensures every selected slot across ALL blocks uses the exact same smart, slim UI.
 */
export const SLOT_SELECTION_CSS = `
  /* ── 1. Base Dropzone & Placeholder States ────────────────────────────── */
  div[data-canvas-dropzone],
  div[data-slot],
  div[class*="placeholder"],
  div[style*="dashed"] {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  /* ── 2. The Smart, Slim & Soft Selection Border ────────────────────────── */
  /* Applies cleanly to Column dropzones, Placeholders, and Image containers */
  div[data-canvas-dropzone].riazify-active-slot,
  div[data-canvas-dropzone][data-canvas-dropzone-active="true"],
  div[data-slot].riazify-active-slot,
  div[style*="dashed"].riazify-active-slot,
  div[class*="placeholder"].riazify-active-slot,
  .riazify-active-slot:not(table):not(td):not(label) {
    outline: none !important;
    border-color: ${SLOT_SELECTION_TOKENS.primary} !important;
    border-style: solid !important;
    border-width: 2px !important;
    border-radius: ${SLOT_SELECTION_TOKENS.radius} !important;
    background-color: ${SLOT_SELECTION_TOKENS.primaryLight} !important;
    box-shadow: 0 0 0 3px ${SLOT_SELECTION_TOKENS.primaryGlow}, 0 2px 8px rgba(117, 48, 251, 0.12) !important;
  }

  /* ── Smart Round Selection: Perfectly hugs round avatars & circular logos ── */
  .riazify-slot-round,
  .riazify-active-slot[style*="50%"],
  div[data-slot][style*="50%"].riazify-active-slot,
  div[data-slot][style*="border-radius: 50%"].riazify-active-slot,
  div[data-slot][style*="border-radius:50%"].riazify-active-slot,
  div[data-slot].riazify-active-slot:has(img[style*="50%"]) {
    border-radius: 50% !important;
    overflow: hidden !important;
  }

  .riazify-slot-round img,
  .riazify-active-slot[style*="50%"] img,
  div[data-slot][style*="50%"].riazify-active-slot img {
    border-radius: 50% !important;
  }

  /* ── Universal Icon Selection Highlight (Works on small & large icons) ── */
  [data-feature-index].riazify-icon-selected,
  [data-icon-slot].riazify-icon-selected,
  div[data-feature-index].riazify-icon-selected {
    outline: 2px solid ${SLOT_SELECTION_TOKENS.primary} !important;
    outline-offset: 2px !important;
    border-radius: ${SLOT_SELECTION_TOKENS.radius} !important;
    box-shadow: 0 0 0 3px ${SLOT_SELECTION_TOKENS.primaryGlow} !important;
    transition: outline 0.15s ease, box-shadow 0.15s ease, border-radius 0.15s ease !important;
  }

  /* ── 3. Image Selection (Slim & Curved) ─────────────────────────────────── */
  img.riazify-active-slot,
  img[data-slot].riazify-active-slot {
    outline: none !important;
    border-radius: 6px !important;
    box-shadow: 0 0 0 2px ${SLOT_SELECTION_TOKENS.primary}, 0 4px 12px ${SLOT_SELECTION_TOKENS.primaryGlow} !important;
    transition: box-shadow 0.2s ease !important;
  }

  /* ── 4. Never Put Outlines on Wrapper Tables, Cells, or Labels ─────────── */
  table.riazify-active-slot,
  td.riazify-active-slot,
  label.riazify-active-slot {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* ── 5. Small Thumbnail Image Hygiene ───────────────────────────────────── */
  /* eBay gallery radio already highlights active thumbnail; avoid double border */
  label[for*="_"] img.riazify-active-slot,
  td[width="25%"] img.riazify-active-slot,
  td[width="50%"] img.riazify-active-slot,
  td[width="10%"] img.riazify-active-slot,
  td[width="12%"] img.riazify-active-slot {
    outline: none !important;
    box-shadow: none !important;
  }
`;

/**
 * Clears the active slot selection from all elements in the canvas
 */
export function clearActiveSlot(doc: Document = document): void {
  doc.querySelectorAll('.riazify-active-slot, .riazify-icon-selected, .riazify-slot-round').forEach((el) => {
    el.classList.remove('riazify-active-slot');
    el.classList.remove('riazify-icon-selected');
    el.classList.remove('riazify-slot-round');
  });
}

/**
 * Sets a target element as the active selected slot
 */
export function setActiveSlot(target: HTMLElement, doc: Document = target.ownerDocument || document): void {
  clearActiveSlot(doc);
  target.classList.add('riazify-active-slot');

  // Smart shape detection: if element or its inner image is circular (50%), apply round selection
  const style = target.getAttribute('style') || '';
  const img = target.querySelector('img');
  const imgStyle = img ? img.getAttribute('style') || '' : '';

  if (
    style.includes('50%') ||
    imgStyle.includes('50%') ||
    target.style.borderRadius === '50%' ||
    (img && img.style.borderRadius === '50%')
  ) {
    target.classList.add('riazify-slot-round');
  }
}

/**
 * Handles canvas clicks to automatically deselect slots when clicking outside
 */
export function handleSlotDeselectOnClick(e: MouseEvent, onDeselect?: () => void): void {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const isInsideSlot = target.closest('[data-slot], [data-canvas-dropzone], .riazify-active-slot');
  if (!isInsideSlot) {
    const doc = target.ownerDocument || document;
    clearActiveSlot(doc);
    if (onDeselect) onDeselect();
  }
}
