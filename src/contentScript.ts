const pauseMedia = (): void => {
  document.querySelectorAll('video, audio').forEach((media) => {
    const mediaElement = media as HTMLMediaElement
    mediaElement.pause()
  })
}

browser.storage.sync.get(['status']).then((result) => {
  if (result.status) {
    pauseMedia()
  }
})
