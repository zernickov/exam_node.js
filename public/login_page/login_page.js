$(document).ready(function () {
    $('.hidden').fadeIn(1000).removeClass('hidden');
    $("#exit-cookie").click(function(){
        $("#cookie-disclaimer-box").fadeOut();
    });
});
