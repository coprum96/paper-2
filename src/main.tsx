import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './research/Root'
import './index.css'

const cloudflareAnalyticsToken = import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN as string | undefined

// Do not inject game analytics beacon into the research flow (incomplete disclosure / quieter telemetry).
const isResearch =
  new URLSearchParams(window.location.search).get('research') === '1' ||
  import.meta.env.VITE_RESEARCH_MODE === 'true' ||
  window.location.pathname.replace(/\/$/, '').endsWith('/research')

if (cloudflareAnalyticsToken && !isResearch) {
  const analyticsScript = document.createElement('script')
  analyticsScript.defer = true
  analyticsScript.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  analyticsScript.setAttribute('data-cf-beacon', JSON.stringify({ token: cloudflareAnalyticsToken }))
  document.head.appendChild(analyticsScript)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
