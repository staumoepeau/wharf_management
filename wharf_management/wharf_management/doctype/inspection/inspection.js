// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inspection', {

    refresh: function(frm) {
        if (frappe.user_roles.includes('Yard Inspection User', 'Yard Operation User')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user.has_role('System Manager', 'Yard Operation Supervisor')) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }

    },

    on_submit: function(frm) {

        frappe.msgprint({
            title: __('Notification'),
            indicator: 'green',
            message: __('Document updated successfully')
        });

        frappe.set_route("List", "Pre Advice", "List");
        location.reload(true);
    },

    onload: function(frm) {

        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager"));

        frm.toggle_enable(['container_content', 'secondary_work_type', 'mark', 'cargo_type', 'final_work_type', 'cargo_ref', 'work_information', 'qty',
            'vessel', 'vessel_arrival_date', 'container_no', 'chasis_no', 'third_work_type', 'last_port', 'voyage_no', 'work_type', 'booking_ref'
        ], is_allowed);

        frm.toggle_display(['booking_ref', 'cargo_ref', 'final_work_type', 'bol'], frappe.user_roles.includes('System Manager', 'Cargo Operation Manager', 'Operation Manifest User'));

        frm.toggle_display(['count_item'], frm.doc.cargo_type == "Break Bulk")

        if (frm.doc.cargo_type == "Break Bulk") {
            frm.set_df_property("count_item", "reqd", 1);
        } else if (frm.doc.cargo_type == "Break Bulk") {
            frm.set_df_property("count_item", "reqd", 0);
        }

        //        frappe.call({
        //            "method": "frappe.client.get",
        //            args: {
        //                doctype: "Pre Advice",
        //                name: frm.doc.cargo_ref,
        //                "container_no": frm.doc.container_no,
        //                filters: {
        //                    'docstatus': 1,
        //                    'inspection_status': ["!=", "Closed"]
        //                },
        //            },
        //            callback: function(data) {
        //                //               console.log(data);
        //                cur_frm.set_value("qty", data.message["qty"]);
        //            }
        //        });
    }
});