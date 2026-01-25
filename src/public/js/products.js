console.log("Products frontend javascript file");

$(function () {
  $(".product-collection").on("change", () => {
    const selectedValue = $(".product-collection").val();
    if (selectedValue === "DRINK") {
      $("#product-collection").hide();
      $("#product-volume").show();
    } else {
      $("#product-volume").hide();
      $("#product-collection").show();
    }
  });
  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });
  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id,
      productStatus = $(`#${id}.new-product-status`).val();
    console.log("product Id:", id);
    console.log("product Status", productStatus);

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      console.log("response", response);

      const result = response.data;
      if (result.data) {
        console.log("product Updated:");
        $(".new-product-status").blur();
      } else alert("Product Update Failed: 12");
    } catch (err) {
      console.log(err);
      alert("Product Update Failed!");
    }
  });

  $(".new-product-promotion").on("change", async function (e) {
    const id = e.target.id,
      productPromotion = $(`#${id}.new-product-promotion`).val();
    console.log("product Id:", id);
    console.log("product Promotion:", productPromotion);

    try {
      // First update the promotion
      const promoResponse = await axios.post(`/admin/product/promotion/${id}`, {
        productPromotion: parseInt(productPromotion),
      });
      console.log("promo response", promoResponse);

      if (promoResponse.data.data) {
        console.log("product Promotion Updated:");
        
        // If promotion is set (30% or 45%), automatically change status to PROMOTION
        if (parseInt(productPromotion) > 0) {
          const statusResponse = await axios.post(`/admin/product/${id}`, {
            productStatus: "PROMOTION",
          });
          
          if (statusResponse.data.data) {
            // Update the status dropdown UI
            $(`#${id}.new-product-status`).val("PROMOTION");
            applyStatusStyle($(`#${id}.new-product-status`)[0]);
            console.log("Status automatically changed to PROMOTION");
          }
        }
        // If promotion is removed (0), change status back to ACTIVE
        else {
          const statusResponse = await axios.post(`/admin/product/${id}`, {
            productStatus: "ACTIVE",
          });
          
          if (statusResponse.data.data) {
            // Update the status dropdown UI
            $(`#${id}.new-product-status`).val("ACTIVE");
            applyStatusStyle($(`#${id}.new-product-status`)[0]);
            console.log("Status automatically changed to ACTIVE");
          }
        }
        
        $(".new-product-promotion").blur();
      } else alert("Promotion Update Failed!");
    } catch (err) {
      console.log(err);
      alert("Promotion Update Failed!");
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productLeftCount = $(".product-left-count").val(),
    productCollection = $(".product-collection").val(),
    productDesc = $(".product-desc"),
    productStatus = $(".product-status");
  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all required inputs!");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className,
    file = $(`.${imgClassName}`).get(0).files[0],
    fileType = file["type"],
    validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validImageTypes.includes(fileType)) {
    alert("Please insert only jpeg, jpg, png!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}

// ! product search

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("productSearch");
  const table = document.getElementById("productsTable");

  if (!input || !table) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((tr) => {
      const name =
        tr.querySelector(".product-name")?.textContent?.toLowerCase() || "";

      tr.style.display = name.includes(q) ? "" : "none";
    });
  });
});

function applyStatusStyle(selectEl) {
    const $el = $(selectEl);
    const v = $el.val();
  
    // Status styles
    if ($el.hasClass("product-status")) {
      $el.removeClass("is-active is-block is-delete is-paused is-promotion");
      if (v === "ACTIVE") $el.addClass("is-active");
      else if (v === "BLOCK") $el.addClass("is-block");
      else if (v === "DELETE") $el.addClass("is-delete");
      else if (v === "PAUSED") $el.addClass("is-paused");
      else if (v === "PROMOTION") $el.addClass("is-promotion");
    }
    
    // Promotion styles
    if ($el.hasClass("product-promotion")) {
      $el.removeClass("is-no-promo is-promo-30 is-promo-45");
      if (v === "0") $el.addClass("is-no-promo");
      else if (v === "30") $el.addClass("is-promo-30");
      else if (v === "45") $el.addClass("is-promo-45");
    }
  }
  
  $(function () {
    $(".spec-select").each(function () { applyStatusStyle(this); });
    $(".spec-select").on("change", function () { applyStatusStyle(this); });
  });
  
  