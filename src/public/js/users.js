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
    const id = e.target.id,
      memberStatus = $(`#${id}.member-status`).val();
    console.log("member Id", id);
    console.log("memberStatus:", memberStatus);

    axios
      .post("/admin/user/edit", { _id: id, memberStatus: memberStatus })
      .then((response) => {
        const result = response.data;
        if (result.data) {
          console.log("User Updated!:");
          $(".member-status").blur();
        } else alert("User Update Failed!:");
      })
      .catch((err) => {
        console.log(err);
        alert("User Update Failed!");
      });
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
