import {firefoxBrowser, isFirefoxLike} from './lib/browser'

console.log(
  '[From the background context] Hello from the background worker/script!'
)

if (isFirefoxLike) {
  const firefox = firefoxBrowser()

  firefox.action.onClicked.addListener(() => {
    firefox.sidebarAction.open()
  })

  firefox.runtime.onMessage.addListener((message: unknown) => {
    if (!message || (message as {type?: string}).type !== 'openSidebar') return

    firefox.sidebarAction.open()
  })
}

if (!isFirefoxLike) {
  chrome.action.onClicked.addListener(() => {
    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})
  })

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== 'openSidebar') return

    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})

    if (!chrome.sidePanel.open) return

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTabId = tabs && tabs[0] && tabs[0].id
      if (!activeTabId) return

      try {
        chrome.sidePanel.open({tabId: activeTabId})
      } catch (error) {
        console.error(error)
      }
    })
  })
}
