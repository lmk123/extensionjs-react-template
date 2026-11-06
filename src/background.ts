import {firefoxBrowser, isChromiumLike, isFirefoxLike} from './lib/browser'

console.log(
  '[From the background context] Hello from the background worker/script!'
)

function isOpenSidebarMessage(message: unknown) {
  return (message as {type?: string} | null | undefined)?.type === 'openSidebar'
}

if (isFirefoxLike) {
  const firefox = firefoxBrowser()

  // Clicking the toolbar icon is a user action, so the sidebar may be opened
  // here. toggle() (not open()) so a second click closes it, as on Chromium.
  //
  // There is no runtime.onMessage listener on Firefox: it never counts a
  // message relayed from a content-script click as a user action (see MDN
  // "User actions"), so ContentApp shows a hint instead of a button there.
  firefox.action.onClicked.addListener(() => {
    firefox.sidebarAction.toggle().catch(console.error)
  })
}

if (isChromiumLike) {
  // chrome.sidePanel exists from Chrome 114 and sidePanel.open() from 116, so
  // check both instead of letting a missing API throw at service-worker start
  // (which would also stop the listener below from being registered).
  const sidePanel = chrome.sidePanel as typeof chrome.sidePanel | undefined

  // Let the toolbar icon open the side panel. Set on every service-worker start
  // (it is an idempotent upsert) so the very first click already works.
  sidePanel
    ?.setPanelBehavior({openPanelOnActionClick: true})
    .catch(console.error)

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!isOpenSidebarMessage(message)) return

    // sidePanel.open() needs the user gesture that came with this message, so
    // call it synchronously (no await / async callback first), on the tab that
    // sent the message.
    const tabId = sender.tab?.id
    if (tabId === undefined || !sidePanel?.open) return

    sidePanel.open({tabId}).catch(console.error)
  })
}
