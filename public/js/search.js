$(document).ready(function () {
    const dudesTemplate = Handlebars.compile($("#search-dudes-template").html());
    const univsTemplate = Handlebars.compile($("#search-univs-template").html());
    const facultiesTemplate = Handlebars.compile($("#search-faculties-template").html());
    const specsTemplate = Handlebars.compile($("#search-specs-template").html());

    const $input = $('#search');

    function search() {
        return $.ajax({
            type: "GET",
            url: "/search",
            data: {
                search: $input.val(),
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
                const html = mapTemplate(result.type)(result);
                $('#search-result').html(html);
            }
        });
    }


    function mapPlaceholder(type) {
        switch (type) {
            case 'dudes':
                return 'Іванов Іван Іванович...';
            case 'univs':
                return "Київський національний університет...";
            case 'faculties':
                return "Факультет кібернутики...";
            case 'specs':
                return "Землеустрій та кадастр...";
            default:
                return "...";
        }
    }


    function mapTemplate(type) {
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

    $input.keypress(function (e) {
        if (e.which === 13) {
            search();
            return false;
        }
    });

    $('input[type=radio]').change(function () {
        $input.attr('placeholder', mapPlaceholder($(this).val()));
    })
});
