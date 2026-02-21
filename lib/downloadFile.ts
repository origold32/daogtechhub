export function downloadCSV(csvContent: string, fileName = "defaultFileName") {
  const blob = new Blob([csvContent], { type: "text/csv" });
  console.log("csv content", csvContent, blob);

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
