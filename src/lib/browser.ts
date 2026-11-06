import type Browser from 'webextension-polyfill'

/**
 * True when building for Firefox or another Gecko-based browser. Use this
 * (not a direct `EXTENSION_PUBLIC_BROWSER` comparison) so every extension
 * context agrees on which runtime code path to take.
 */
export const isFirefoxLike =
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'firefox' ||
  import.meta.env.EXTENSION_PUBLIC_BROWSER === 'gecko-based'

/**
 * The global `browser`, typed as the WebExtension (Firefox) API.
 *
 * @types/chrome (>= 0.3) declares `var browser: typeof chrome`, which collides
 * with Extension.js's `const browser: typeof import('webextension-polyfill')`
 * (the conflict is only hidden by `skipLibCheck`) and wins, so the global has
 * no Firefox-only APIs such as `sidebarAction`. This is the single place that
 * re-types it; call it only inside an `isFirefoxLike` branch.
 *
 * It is a function rather than a constant so that importing this module never
 * touches `browser` at load time.
 */
export function firefoxBrowser(): Browser.Browser {
  return browser as unknown as Browser.Browser
}
