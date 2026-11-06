import logo from '../images/icon.png'
import {isChromiumLike} from '../lib/browser'

export default function ContentApp() {
  const logoImage = (
    <img className="content_pill_logo" src={logo} alt="" aria-hidden="true" />
  )

  // Only Chromium lets the background open the side panel in response to a
  // click relayed from a content script. Elsewhere (Firefox, Safari) a button
  // here could never work, so show where to open the sidebar instead.
  if (!isChromiumLike) {
    return (
      <div className="content_pill content_pill_static" role="note">
        {logoImage}
        <span className="content_pill_text">
          Open the sidebar from the toolbar icon
        </span>
      </div>
    )
  }

  const handleClick = async () => {
    try {
      await chrome.runtime.sendMessage({type: 'openSidebar'})
    } catch (error) {
      // e.g. "Extension context invalidated" after the extension reloaded
      // underneath this page, or the background failed to start.
      console.error('Could not ask the background to open the sidebar.', error)
    }
  }

  return (
    <button
      type="button"
      className="content_pill"
      onClick={handleClick}
      aria-label="Open sidebar"
    >
      {logoImage}
      <span className="content_pill_text">Open sidebar</span>
    </button>
  )
}
