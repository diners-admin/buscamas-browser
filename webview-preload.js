const { ipcRenderer } = require('electron');

window.addEventListener('mouseover', event => {
  const link = event.target.closest && event.target.closest('a[href]');
  if (link && link.href) ipcRenderer.sendToHost('link-hover', link.href);
});
window.addEventListener('mouseout', event => {
  const link = event.target.closest && event.target.closest('a[href]');
  if (link) ipcRenderer.sendToHost('link-leave');
});
