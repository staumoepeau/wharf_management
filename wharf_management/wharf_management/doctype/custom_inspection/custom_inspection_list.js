frappe.listview_settings['Custom Inspection'] = {
    add_fields: ["status", "docstatus"],
    has_indicator_for_draft: 1,

    get_indicator: function(doc) {
        if (doc.status === "Delivered") {
            return [__("Deliver Completed"), "green", "status,=,'Deliver'"];
        } else if (doc.status === "Inspection") {
            return [__("To Deliver for Inspection"), "orange", "status,=,'Inspection'"];
        }
    }
};