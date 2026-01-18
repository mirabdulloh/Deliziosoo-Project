document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("orderSearch");
    const table = document.getElementById("ordersTable");
  
    if (!input || !table) return;
  
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const rows = table.querySelectorAll("tbody tr");
  
      rows.forEach((tr) => {
        const text = tr.textContent?.toLowerCase() || "";
        tr.style.display = text.includes(q) ? "" : "none";
      });
    });
  });