$(document).ready(function () {
    const dudesTemplate = Handlebars.compile($("#search-dudes-template").html());
    const univsTemplate = Handlebars.compile($("#search-univs-template").html());
    const facultiesTemplate = Handlebars.compile($("#search-faculties-template").html());
    const specsTemplate = Handlebars.compile($("#search-specs-template").html());

    function search() {
        return $.ajax({
            type: "GET",
            url: "/search",
            data: {
                search: $("#search").val(),
                type: $('input[name=search-type]:checked').val(),
            },
            beforeSend: function(){
                $('#search-result').html('');
                $('.loader').show();
            },
            complete: function(){
                $('.loader').hide();
            },
            success: function (result) {
                const html = chooseTemplate(result.type)(result);
                $('#search-result').html(html);
            }
        });
    }

    function chooseTemplate(type) {
        switch (type) {
            case 'dudes':
                return dudesTemplate;
            case 'univs':
                return univsTemplate;
            case 'faculties':
                return facultiesTemplate;
            case 'specs':
                return specsTemplate;
            default:
                return dudesTemplate;
        }
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
