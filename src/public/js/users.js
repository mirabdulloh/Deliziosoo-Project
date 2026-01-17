document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userSearch");
    const table = document.getElementById("usersTable");
  
    if (!input || !table) return;
  
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const rows = table.querySelectorAll("tbody tr");
  
      rows.forEach((tr) => {
        // Only search inside memberNick
        const nick = tr.querySelector(".user-name")?.textContent?.toLowerCase() || "";
  
        tr.style.display = nick.includes(q) ? "" : "none";
      });
    });
  });
  