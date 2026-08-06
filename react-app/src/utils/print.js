export function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=420,height=640');
  if (!win) {
    alert('Please allow pop-ups to print.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 350);
}
