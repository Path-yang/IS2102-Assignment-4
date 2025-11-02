export const injectStyles = (id, styles) => {
  if (typeof document === 'undefined' || !styles) return

  let styleTag = document.getElementById(id)
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = id
    document.head.appendChild(styleTag)
  }

  if (styleTag.textContent !== styles) {
    styleTag.textContent = styles
  }
}

