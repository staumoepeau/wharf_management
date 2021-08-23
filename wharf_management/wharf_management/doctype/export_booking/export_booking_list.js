// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Export Booking'] = {
    hide_name_column: true,
    add_fields: [""],

    has_indicator_for_draft: 1,
    get_indicator: function(doc) {},

    refresh: function(frm) {

//        if (frappe.user.has_role("System Manager", "Operation Manifest User")) {
//            frm.page.sidebar.show(); // this removes the sidebar
//            $(".timeline").show()
//            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
//        } else {

//            frm.page.sidebar.hide(); // this removes the sidebar
//            $(".timeline").hide()
//            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10");
//        }
    }
}