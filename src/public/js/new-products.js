$(function () {
  const $form = $("form.product-create-card");
  const input = document.getElementById("productImages");
  const grid = document.getElementById("uploadGrid");
  if (!input || !grid || !$form.length) return;

  const tiles = Array.from(grid.querySelectorAll(".upload-tile"));
  const state = new Array(5).fill(null);
  let activeSlot = 0;

  function render() {
    tiles.forEach((tile, i) => {
      const img = tile.querySelector(".upload-preview");
      if (!img) return;

      const file = state[i];
      if (!file) {
        img.src = "";
        img.style.display = "none";
        tile.classList.remove("has-image");
        return;
      }

      img.src = URL.createObjectURL(file);
      img.style.display = "block";
      tile.classList.add("has-image");
    });
  }

  function placeFiles(startIndex, files) {
    let idx = startIndex;
    for (const file of files) {
      if (!file?.type?.startsWith("image/")) continue;
      if (idx >= 5) break;
      state[idx] = file;
      idx++;
    }
    render();
  }

  function syncStateToInput() {
    const dt = new DataTransfer();
    state.filter(Boolean).forEach((f) => dt.items.add(f));
    input.files = dt.files; // ✅ now multer will get them
  }

  // click tile -> open picker
  grid.addEventListener("click", (e) => {
    const tile = e.target.closest(".upload-tile");
    if (!tile) return;
    activeSlot = Number(tile.dataset.slot || 0);
    input.value = "";
    input.click();
  });

  // choose files -> fill from active slot
  input.addEventListener("change", () => {
    placeFiles(activeSlot, Array.from(input.files || []));
  });

  // drag/drop
  tiles.forEach((tile) => {
    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
      tile.classList.add("drag-over");
    });
    tile.addEventListener("dragleave", () =>
      tile.classList.remove("drag-over")
    );
    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      tile.classList.remove("drag-over");
      const slot = Number(tile.dataset.slot || 0);
      placeFiles(slot, Array.from(e.dataTransfer?.files || []));
    });
  });

  // ✅ IMPORTANT: before submitting, sync files into the real input
  $form.on("submit", function () {
    syncStateToInput();
  });
});

$(function () {
  function toggleSizeVolume() {
    const isDrink = $(".product-collection").val() === "DRINK";

    // FOOD: productSize
    $("#food-size-field").toggle(!isDrink);
    $("#productSize").prop("disabled", isDrink);

    // DRINK: productVolume
    $("#drink-volume-field").toggle(isDrink);
    $("#productVolume").prop("disabled", !isDrink);
  }

  $(".product-collection").on("change", toggleSizeVolume);
  toggleSizeVolume(); // run once on load
});
