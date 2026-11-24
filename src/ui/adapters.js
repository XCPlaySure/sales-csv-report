export function readFile(file, FileReaderImpl) {
  return new Promise((resolve, reject) => {
    const reader = new FileReaderImpl();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function copySummary(text, clipboard) {
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function selectNode(node, doc) {
  const range = doc.createRange();
  range.selectNodeContents(node);
  const selection = doc.defaultView.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function telegramUrl(text, url) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function browserAdapters(win) {
  return {
    readFile: (file) => readFile(file, win.FileReader),
    clipboard: win.navigator.clipboard,
    open: (url) => win.open(url, '_blank', 'noopener'),
  };
}
