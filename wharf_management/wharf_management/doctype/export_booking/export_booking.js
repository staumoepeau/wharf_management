// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Export Booking', {
    onload: function(frm) {

        frm.set_query("booking_by", function(doc) {
            return {
                filters: {
                    'booking_by': frappe.session.user
                }
            };
        });



        if (frm.doc.docstatus == 0) {
            frm.set_value("booking_by", frappe.session.user);

            if (!frm.doc.posting_date) {
                frm.set_value('booking_date', frappe.datetime.nowdate());
            }
            if (!frm.doc.posting_time) {
                frm.set_value('booking_time', frappe.datetime.now_time());
            }
        }

    },
    refresh: function(frm) {

//        if (frappe.user.has_role("System Manager")) {
//            frm.page.sidebar.show(); // this removes the sidebar
//            $(".timeline").show()
//            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
//        } else {
//            frm.page.sidebar.hide(); // this removes the sidebar
//            $(".timeline").hide()
//            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
//        }
    }
});