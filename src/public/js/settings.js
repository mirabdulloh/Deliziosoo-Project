function previewFile(event) {
    const img = document.getElementById("previewImg");
    const file = event.target.files?.[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingsForm");
    if (!form) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const fd = new FormData(form);
  
      try {
        await axios.post("/admin/settings/update", fd); // axios already included
        alert("Saved ✅");
        window.location.reload();
      } catch (err) {
        console.log(err);
        alert("Update failed ❌");
      }
    });
  });
  
