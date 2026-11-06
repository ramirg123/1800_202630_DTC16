$(document).ready( function () {
    $(".bi-person-circle").on("click", function () {
        $("#profileMenu").removeClass("hidden")
    });
    
    $("#profileBackButton").on("click", function () {
        $("#profileMenu").addClass("hidden")
    });
})