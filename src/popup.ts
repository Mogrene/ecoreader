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

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

browser.storage.local.get({ totalSize: 0 }).then((result) => {
  const { totalSize } = result
  document.getElementById('totalSize')!.innerText = formatBytes(totalSize)
})

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
      statusCheckbox.checked = result.status || true
    })

    statusCheckbox.addEventListener('click', () => {
      browser.storage.sync.set({ status: !statusCheckbox.checked })

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
