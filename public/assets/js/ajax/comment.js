$(document).ready(function() {

    $('.new-comment').on('submit', function(e) {
        e.preventDefault();
        let el = $(this);
        let action = el.data('action');
        let path = window.location.pathname;

        $.ajax({
            url: path + '/comment/add',
            type: 'POST',
            data: {
                title: $('#title').val(),
                content: $('#content').val(),
                author: $('#author').val()
            },
            dataType: 'json'
        }).done(function(result) {
            if(result.id) {
                $('.no-comment').remove();

                $('#title').val('');
                $('#content').val('');
                $('#author').val('');

                let html = '<h5>' + result.title + '</h5>';
                html += '<p>' + result.content + '</p>';
                html += '<small>Posté par <span>' + result.author + '</span> le <span>' + result.createdAt + '</span></small><hr>';

                $('.comments').prepend(html);
            }
        });
    });

});
