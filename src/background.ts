import {firefoxBrowser, isFirefoxLike} from './lib/browser'

console.log(
  '[From the background context] Hello from the background worker/script!'
)

function isOpenSidebarMessage(message: unknown) {
  return (message as {type?: string} | undefined)?.type === 'openSidebar'
}

if (isFirefoxLike) {
  const firefox = firefoxBrowser()

  // Clicking the toolbar icon is a user action, so open() is allowed here.
  firefox.action.onClicked.addListener(() => {
    firefox.sidebarAction.open().catch(console.error)
  })

  firefox.runtime.onMessage.addListener((message: unknown) => {
    if (!isOpenSidebarMessage(message)) return

    // Firefox only allows sidebarAction.open() inside a handler for a user
    // action, and a message relayed from a click in a content script does not
    // count (see MDN "User actions"), so this call is expected to be rejected.
    firefox.sidebarAction.open().catch((error: unknown) => {
      console.warn(
        'Firefox refused to open the sidebar from a content-script message; use the toolbar button instead.',
        error
      )
    })
  })
}

if (!isFirefoxLike) {
  // Let the toolbar icon open the side panel. Set on every service-worker start
  // (it is an idempotent upsert) so the very first click already works.
  chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch(console.error)

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!isOpenSidebarMessage(message)) return

    // sidePanel.open() needs the user gesture that came with this message, so
    // call it synchronously (no await / async callback first), on the tab that
    // sent the message. chrome.sidePanel.open() exists from Chrome 116.
    const tabId = sender.tab?.id
    if (tabId === undefined || !chrome.sidePanel.open) return

    chrome.sidePanel.open({tabId}).catch(console.error)
  })
}
