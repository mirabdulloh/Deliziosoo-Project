console.log("Products frontend javascript file");

$(function(){
    $(".product-collection").on("change",()=>{
        const selectedValue = $(".product-collection").val();
        if(selectedValue === "DRINK"){
            $("#product-collection").hide();
            $("#product-volume").show();
        }else{
            $("#product-volume").hide();
            $("#product-collection").show(); 
        }
    })
    $("#process-btn").on("click",()=>{
        $(".dish-container").slideToggle(500);
        $("#process-btn").css("display", "none")
    });
    $("#cancel-btn").on("click",()=>{
        $(".dish-container").slideToggle(100);
        $("#process-btn").css("display", "flex");
    });

    $(".new-product-status").on("change", async function (e){
        const id = e.target.id,
         productStatus = $(`#${id}.new-product-status`).val();
        console.log("product Id:",id);
        console.log("product Status",productStatus);
        
        try{
            const response = await axios.post(`/admin/product/${id}`,{ productStatus: productStatus});
            console.log("response",response);
            
            const result = response.data;
            if(result.data){
                console.log("product Updated:");
                $(".new-product-status").blur();
            }else alert("Product Update Failed: 12");
        
        }catch(err){
            console.log(err);
            alert("Product Update Failed!");
        }

    });
});

function validateForm(){
    const productName = $(".product-name").val(),
     productPrice = $(".product-price").val(),
     productLeftCount = $(".product-left-count").val(),
     productCollection = $(".product-collection").val(),
     productDesc = $(".product-desc"),
     productStatus = $(".product-status");
    if(productName === "" || productPrice === "" || productLeftCount === ""|| productCollection === "" ||
        productDesc === "" || productStatus === "" 
    ){
        alert("Please insert all required inputs!");
        return false
    }else return true;
}

function previewFileHandler(input, order){
    const imgClassName = input.className,
     file =  $(`.${imgClassName}`).get(0).files[0],
     fileType = file["type"],
     validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    if(!validImageTypes.includes(fileType)){
        alert("Please insert only jpeg, jpg, png!")
    }else{
        if(file){
            const reader = new FileReader();
            reader.onload = function(){
                $(`#image-section-${order}`).attr("src",reader.result)
            };
            reader.readAsDataURL(file);
        }
    }
}