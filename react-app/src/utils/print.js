export function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=850,height=900,scrollbars=yes,resizable=yes');
  if (!win) {
    alert('Please allow pop-ups to print.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch (e) {
      console.error(e);
    }
  }, 500);
}
