/**
 * Stub for the shared/design-mode platform module.
 * The real module is injected by the create.xyz platform at runtime.
 * This stub allows local development to proceed without it.
 */

/**
 * @typedef {(resolved: { element: Element }) => { className: string, styles: Record<string, string> | null }} GetStyleInfo
 */

/**
 * Initialize design mode — no-op stub for local development.
 * @param {GetStyleInfo} _getStyleInfo
 * @returns {() => void} reselect function
 */
export function initDesignMode(_getStyleInfo) {
  return function reselect() {};
}
