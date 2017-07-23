$(document).ready(function () {
    const $message = $('#message');

    function request(url) {
        return function (e) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: url,
                beforeSend: function(){
                    $message.html('')
                },
                success: function (result) {
                    console.log(result);
                    $message.html(result.message);
                }
            });
            return false;
        }
    }

    $('#populate').submit(request('populate'));
    $('#update').submit(request('update'));
    $('#drop').submit(request('dropdatabase'));
});
