async function downloadUserSkinReport() {
  const response = await fetch("/api/user/report");
  const result = await response.json();

  if (result.success) {
    const reportData = result.report;
    
    // Create a local virtual browser download link for the data object
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Skin_Report_${reportData.account_summary.full_name}.json`);
    document.body.appendChild(downloadAnchor);
    
    downloadAnchor.click();
    downloadAnchor.remove();
  } else {
    alert("Could not load report parameters: " + result.error);
  }
}