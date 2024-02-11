import './popup.css'

const truncateString = (
  inputString: string | null,
  length: number = 30
): string => {
  if (!inputString) {
    return ''
  }

  if (inputString.length <= length) {
    return inputString
  }

  return `${inputString.slice(0, length - 3)}...`
}

document.addEventListener('DOMContentLoaded', () => {
  const reloadIcon = document.getElementById('reloadIcon')
  if (reloadIcon) {
    reloadIcon.addEventListener('click', () => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const activeTab = tabs[0]
        if (activeTab.id) {
          browser.tabs.reload(activeTab.id)
          reloadIcon.hidden = true
        }
      })
    })
  }

  const statusCheckbox = document.getElementById(
    'statusCheckbox'
  ) as HTMLInputElement
  if (statusCheckbox) {
    browser.storage.sync.get(['status']).then((result) => {
      statusCheckbox.checked = result.status || false
    })

    statusCheckbox.addEventListener('click', () => {
      browser.storage.sync.set({ status: statusCheckbox.checked })

      document.getElementById('switch-label-on')!.style.color =
        statusCheckbox.checked ? 'var(--green)' : 'var(--cold-gray)'

      if (reloadIcon?.hidden) reloadIcon.hidden = false
    })
  }

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0]

    if (activeTab.url) {
      const domain = new URL(activeTab.url).hostname
      const urlElement = document.getElementById('currentDomain')
      if (urlElement) {
        urlElement.textContent = truncateString(domain)
      }

      const whitelistLink = document.getElementById('whitelistLink')
      if (whitelistLink) {
        browser.storage.sync.get('whitelist').then((result) => {
          let whitelist = result.whitelist || []

          if (whitelist.includes(domain)) {
            whitelistLink.textContent = 'REMOVE FROM WHITELIST'
          }

          whitelistLink.addEventListener('click', () => {
            if (whitelist.includes(domain)) {
              whitelist = whitelist.filter((item: string) => item !== domain)
              whitelistLink.textContent = '+ ADD TO WHITELIST'
            } else {
              whitelist.push(domain)
              whitelistLink.textContent = 'REMOVE FROM WHITELIST'
            }

            browser.storage.sync.set({ whitelist })
          })
        })
      }
    }
  })
})
