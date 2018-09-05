
var ipaddress = 'http://localhost:8090';
// var ipaddress = 'http://180.76.152.112:8090';

var menuId = $( "ul.nav" ).first().attr( "id" );

function approve(fs_id) {
    var request = $.ajax({
        url: ipaddress + "/pictureApprove/approve",
        method: "POST",
        data: { fs_id : fs_id },
        dataType: "html"
    });
    request.done(function( msg ) {
        alert("approved");
        window.location.reload();
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

function addIntoTags() {

    $('input[type="checkbox"]:checked').each(function() {
        console.log(this.value + "tag: " + $('#tags').val());
        var request = $.ajax({
            url: ipaddress + "/tagFootsteps/add",
            method: "POST",
            data: { tg_id : $('#tags').val(), fs_id: this.value },
            dataType: "html"
        });
        
        request.done(function( msg ) {
            console.log("done");
        });

        request.fail(function( jqXHR, textStatus ) {
            console.log( "Request failed: " + textStatus );
        });
        
    });
}

function getTags(fs_id) {
        var request = $.ajax({
            url: ipaddress + "/tagFootsteps/getTags",
            method: "GET",
            data: { fs_id : fs_id },
            dataType: "html"
        });

        request.done(function( msg ) {
            console.log(msg);
            $('#'+ fs_id).html(msg);
        });

        request.fail(function( jqXHR, textStatus ) {
            console.log("Request failed: " + textStatus);
        });
}


function reject(fs_id) {
    var request = $.ajax({
        url: ipaddress + "/pictureApprove/reject",
        method: "POST",
        data: { fs_id : fs_id },
        dataType: "html"
    });
    request.done(function( msg ) {
        alert("rejected");
        window.location.reload();
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

function del(fs_id) {
    var request = $.ajax({
        url: ipaddress + "/pictureApprove/delete",
        method: "POST",
        data: { fs_id : fs_id },
        dataType: "html"
    });
    request.done(function( msg ) {
        alert("deleted");
        window.location.reload();
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

