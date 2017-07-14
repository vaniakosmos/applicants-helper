$(document).ready(function () {
    const source = $("#search-template").html();
    const template = Handlebars.compile(source);

    $('#search').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "/search",
            data: {query: $("#query").val()},
            success: function (result) {
                const html = template(result);
                $('#search-result').html(html);
            }
        });
    });
});
