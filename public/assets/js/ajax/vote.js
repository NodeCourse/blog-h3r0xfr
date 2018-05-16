$(document).ready(function() {

    $('.vote').on('click', function(e) {
        e.preventDefault();
        let el = $(this);
        let action = el.data('action');
        let path = window.location.pathname;

        $.ajax({
            url: path + '/vote/' + action,
            dataType: 'json'
        }).done(function(result) {
            if(result.id)
                el.text(parseInt(el.text()) + 1).attr('style', 'color: #2ebaae');
        });
    });

});
