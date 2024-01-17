export function useMoveWindow(e: any) {
  const startx = e.x
  const starty = e.y
  document.addEventListener('mousemove', move)
  function move(ev) {
    const x = ev.x - startx
    const y = ev.y - starty
    window.api.moveWindow(x, y)
  }
  document.addEventListener('mouseup', end)
  function end() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', end)
  }
}
