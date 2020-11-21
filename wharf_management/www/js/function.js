$(document).ready(function() {
    $("#sort").DataTable({
        columnDefs: [
            { type: 'date', targets: [3] }
        ],
    });
});