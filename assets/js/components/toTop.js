
const button= document.querySelector('.am-button_toTop')
button.addEventListener('click', () => scrollToTop(600))

function scrollToTop(duration) {
  if (duration <= 0) return
  const difference = 0 - document.documentElement.scrollTop
  const perTick = difference / duration * 10

  setTimeout(() => {
    document.documentElement.scrollTop = document.documentElement.scrollTop + perTick
    if (document.documentElement.scrollTop === 0) return
    scrollToTop(duration - 10)
  }, 10)
}