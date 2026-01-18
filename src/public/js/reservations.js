function applyStatusStyle(selectEl) {
  const v = (selectEl.value || "").toUpperCase();

  selectEl.classList.remove("is-pending", "is-confirmed", "is-cancelled");

  if (v === "CONFIRMED") selectEl.classList.add("is-confirmed");
  else if (v === "CANCELLED") selectEl.classList.add("is-cancelled");
  else selectEl.classList.add("is-pending"); // default PENDING
}

document.addEventListener("DOMContentLoaded", () => {
  // style existing
  document
    .querySelectorAll(".reservation-status")
    .forEach((el) => applyStatusStyle(el));

  // search
  const input = document.getElementById("reservationSearch");
  const table = document.getElementById("reservationsTable");
  if (input && table) {
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const rows = table.querySelectorAll("tbody tr");

      rows.forEach((tr) => {
        const id =
          tr.querySelector("td.mono")?.textContent?.toLowerCase() || "";
        const email = tr.children?.[2]?.textContent?.toLowerCase() || "";
        tr.style.display = id.includes(q) || email.includes(q) ? "" : "none";
      });
    });
  }

  // update status
  document.querySelectorAll(".reservation-status").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const id = e.target.id;
      const reservationStatus = e.target.value;

      applyStatusStyle(e.target);

      try {
        const res = await axios.post("/admin/reservation/update", {
          _id: id,
          reservationStatus,
        });

        // optional: quick feedback
        // alert("Updated!");
      } catch (err) {
        console.log("reservation update error:", err);
        alert("Update failed");
      }
    });
  });
});

// NOTE MODAL
const noteModal = document.getElementById("noteModal");
const noteBackdrop = document.getElementById("noteBackdrop");
const noteClose = document.getElementById("noteClose");
const noteBody = document.getElementById("noteBody");

function openNote(text) {
  noteBody.textContent = text || "";
  noteModal.classList.add("open");
}
function closeNote() {
  noteModal.classList.remove("open");
}

document.querySelectorAll(".note-btn").forEach((btn) => {
  btn.addEventListener("click", () => openNote(btn.dataset.note || ""));
});

noteBackdrop?.addEventListener("click", closeNote);
noteClose?.addEventListener("click", closeNote);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNote();
});
