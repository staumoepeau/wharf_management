frappe.listview_settings['Custom Inspection'] = {
    add_fields: ["status", "docstatus"],
    has_indicator_for_draft: 1,
    get_indicator: function(doc) {
        var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
        indicator[1] = { "Inspection": "orange", "Deliver": "green" }[doc.status];
        return indicator;
    }
};