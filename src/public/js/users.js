console.log("Users frontend javascript file");

$(function(){
    $(".member-status").on("change", (e)=>{
        const id = e.target.id, 
         memberStatus = $(`#${id}.member-status`).val();      
        console.log("member Id",id);
        console.log("memberStatus:",memberStatus);
        
        
        axios.post("/admin/user/edit", 
            {_id: id, memberStatus:memberStatus}).then((response)=>{
            const result = response.data;
            if(result.data){
                console.log("User Updated!:");
                $(".member-status").blur();
            }else alert ("User Update Failed!:")
        }).catch((err)=>{
            console.log(err);
            alert("User Update Failed!")
        });
    });
});