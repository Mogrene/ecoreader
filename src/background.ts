browser.webRequest.onCompleted.addListener(
  (details) => {
    const contentLengthHeader = details.responseHeaders?.find(
      (header) => header.name.toLowerCase() === 'content-length'
    )

    const responseSize = contentLengthHeader?.value
      ? parseInt(contentLengthHeader.value, 10)
      : 0

    console.log({
      tabId: details.tabId,
      url: details.url,
      responseSize,
    })

    browser.storage.local.get({ totalSize: 0 }).then((result) => {
      const newTotalSize = parseInt(result.totalSize, 10) + responseSize
      browser.storage.local.set({ totalSize: newTotalSize })
    })
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
)

console.log('Background script loaded!')
