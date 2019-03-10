$('#join-form').on('submit', function (e) {

    const $userName = $('#userName');
    const $roomName = $('#roomName');

    if ($userName.val().trim() === '' || $roomName.val().trim() === '') {
        e.preventDefault();
        if ($userName.val().trim() === '') {
            $userName.addClass('error');
        } else {
            $userName.removeClass('error');
        }
        if ($roomName.val().trim() === '') {
            $roomName.addClass('error');
        } else {
            $roomName.removeClass('error');
        }
    } else {
        $userName.val($userName.val().replace(/ /g, ''));
        $roomName.val($roomName.val().replace(/ /g, ''));
    }
});