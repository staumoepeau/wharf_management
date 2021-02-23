// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo'] = {
    hide_name_column: true,
    add_fields: ["status", "container_content", "manifest_check"],
    //    filters: [
    //        ["status", "=", "Yard"]
    //    ],
    has_indicator_for_draft: 1,
    get_indicator: function(doc) {
        if (doc.status) {
            var indicator = [__(doc.status), frappe.utils.guess_colour(doc.status), "status,=," + doc.status];
            indicator[1] = {
                "Need Attention": "red",
                "Export": "red",
                "Uploaded": "purple",
                "Re-stowing": "yellow",
                "Transshipment": "purple",
                "Outbound": "lightblue",
                "Inspection": "green",
                "Yard": "purple",
                "Paid": "orange",
                "Gate1": "blue",
                "Gate Out": "green",
                "Devanning": "black",
                "CCV": "black",
                "Split Ports": "black",
                "Custom Inspection": "orange",
                "Inspection Delivered": "lightblue",
                "Gate IN": "blue",
                "INWARD": "green",
                "FULL": "green",
                "Confirm": "green",

            }[doc.status];
            return indicator;

        }
        if (doc.container_content) {
            var indicator = [__(doc.container_content), frappe.utils.guess_colour(doc.container_content), "container_content,=," + doc.container_content];
            indicator[2] = {
                "FULL": "green",
                "EMPTY": "red",
            }[doc.container_content];
            return indicator;
        }
    },
    refresh: function(frm) {

//        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor',
//               'Yard Inspection User')) {
//            frm.page.sidebar.hide(); // this removes the sidebar
//            $(".timeline").hide()
//            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
//        }

//        if (frappe.user.has_role("System Manager", "Operation Manifest User", "Wharf")) {
//            frm.page.sidebar.show(); // this removes the sidebar
//            $(".timeline").show()
//            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
//        }
    }
};