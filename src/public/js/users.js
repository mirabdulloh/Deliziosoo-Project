document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("userSearch");
  const table = document.getElementById("usersTable");

  if (!input || !table) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((tr) => {
      // Only search inside memberNick
      const nick =
        tr.querySelector(".user-name")?.textContent?.toLowerCase() || "";

      tr.style.display = nick.includes(q) ? "" : "none";
    });
  });
});

console.log("Users frontend javascript file");
$(function () {
  $(".member-status").on("change", (e) => {
    const id = e.target.id;
    const memberStatus = $(`#${id}.member-status`).val();

    axios.post("/admin/user/edit", { _id: id, memberStatus })
      .then(() => $(".member-status").blur())
      .catch((err) => console.log(err.response?.data || err));
  });
});

function applyStatusStyle(selectEl) {
  const $el = $(selectEl);
  const v = $el.val();

  $el.removeClass("is-active is-block is-delete");

  if (v === "ACTIVE") $el.addClass("is-active");
  else if (v === "BLOCK") $el.addClass("is-block");
  else $el.addClass("is-delete");
}

$(function () {
  $(".member-status").each(function () {
    applyStatusStyle(this);
  });

  $(".member-status").on("change", function () {
    applyStatusStyle(this);
  });
});
