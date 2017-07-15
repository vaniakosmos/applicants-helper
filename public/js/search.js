$(document).ready(function () {
    const source = $("#search-template").html();
    const template = Handlebars.compile(source);

    $('#search-btn').click(function (e) {
        console.log('search');
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "/search",
            data: {search: $("#search").val()},
            success: function (result) {
                const html = template(result);
                $('#search-result').html(html);
            }
        });
    });
});
