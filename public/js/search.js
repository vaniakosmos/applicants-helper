$(document).ready(function () {
    const source = $("#search-template").html();
    const template = Handlebars.compile(source);

    function search() {
        $.ajax({
            type: "GET",
            url: "/search",
            data: {search: $("#search").val()},
            success: function (result) {
                const html = template(result);
                $('#search-result').html(html);
            }
        });
    }

    $('#search-btn').click(function () {
        search();
        return false;
    });
    $("#search").keypress(function (e) {
        if (e.which === 13) {
            search();
            return false;
        }
    })
});
