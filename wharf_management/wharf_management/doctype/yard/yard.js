// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.yard");

frappe.ui.form.on('Yard', {

    on_submit: function(frm) {
        frappe.set_route("List", "Pre Advice")
        location.reload(true);
    },
    yard_slot: function(frm) {
        if (frm.doc.yard_slot) {
            frappe.db.set_value('Yard Settings', frm.doc.yard_slot, 'occupy', 1)
        }
    },

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

    onload: function(frm) {

        wharf_management.yard.setup_yard_queries(frm);

        let is_allowed = (frappe.user_roles.includes("System Manager") || frappe.user_roles.includes("Cargo Operation Manager"));
        frm.toggle_enable(['cargo_ref', 'container_no', 'voyage_no', 'vessel', 'eta_date', 'bol', 'consignee', 'cargo_type', 'chasis_no', 'secondary_work_type'], is_allowed);

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Pre Advice",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 1,
                    'gate1_status': "Open"
                },
            },
            callback: function(data) {
                frm.set_value("secondary_work_type", data.message["secondary_work_type"]);
            }
        });

    }
});

$.extend(wharf_management.yard, {

    setup_yard_queries: function(frm) {
        frm.set_query('yard_slot', () => {
            return {
                filters: [
                    ['Yard Settings', 'occupy', '=', 0]
                ]
            }
        });
    },
});