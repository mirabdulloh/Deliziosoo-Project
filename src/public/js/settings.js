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
        const res = await axios.post("/admin/settings/update", fd); // axios already included
        const updated = res.data?.data;
  
        if (updated?.memberImage) {
          document.getElementById("previewImg").src =
            (updated.memberImage.startsWith("/") ? "" : "/") + updated.memberImage;
        }
  
        alert("Saved ✅");
      } catch (err) {
        console.log(err);
        alert("Update failed ❌");
      }
    });
  });
  