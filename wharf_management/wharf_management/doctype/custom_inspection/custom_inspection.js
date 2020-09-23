// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.ui.form.on('Custom Inspection', {

    refresh: function(frm) {

        frm.events.make_custom_buttons(frm);

        if (frappe.user_roles.includes('Wharf Security Officer', 'Wharf Security Officer Main Gate', 'Wharf Security Supervisor')) {

            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }
        if (frappe.user.has_role("System Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        }
    },
    before_submit: function(frm) {


    },
    make_custom_buttons: function(frm) {
        if (frm.doc.docstatus == 1 && frm.doc.status == "Inspection") {
            frm.add_custom_button(__("Deliver fo Inspection"),
                () => {
                    frm.events.get_custom_inspection(frm)
                }).addClass("btn-warning");
        }

    },

    onload: function(frm) {
        if (frm.doc.docstatus == 0) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Cargo",
                    name: frm.doc.cargo_ref,
                    filters: {
                        'docstatus': 1,
                        'gate1_status': "Open"
                    },
                },
                callback: function(data) {
                    cur_frm.set_value("customer", data.message["consignee"]);
                    cur_frm.set_value("container_no", data.message["container_no"]);
                    cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                    cur_frm.set_value("cargo_description", data.message["cargo_description"]);
                    cur_frm.set_value("yard_slot", data.message["yard_slot"]);
                    cur_frm.set_value("container_size", data.message["container_size"]);
                    cur_frm.set_value("container_type", data.message["container_type"]);

                    cur_frm.set_df_property("cargo_ref", "read_only", 1);
                    cur_frm.set_df_property("yard_slot", "read_only", 1);
                    cur_frm.set_df_property("container_no", "read_only", 1);
                    cur_frm.set_df_property("customer", "read_only", 1);
                    cur_frm.set_df_property("cargo_type", "read_only", 1);
                    cur_frm.set_df_property("cargo_description", "read_only", 1);
                    cur_frm.set_df_property("container_size", "read_only", 1);
                    cur_frm.set_df_property("container_type", "read_only", 1);

                }
            })
        }
    },

    get_custom_inspection: function(frm) {
        var d = new frappe.ui.Dialog({
            title: __("Custom Inspection Security Check"),
            fields: [{
                "fieldname": "status",
                "fieldtype": "Select",
                "label": __("STATUS"),
                options: ["Inspection", "Delivered"],
                default: "Delivered",
                reqd: 1,
            }, ],
            primary_action_label: 'Submit',
            primary_action(values) {
                if (!values) {
                    frappe.throw(__("Status is required"));
                }
                frappe.call({
                    method: "wharf_management.wharf_management.doctype.custom_inspection.custom_inspection.update_custom_inspection",
                    args: {
                        "status": values.status,
                        "docname": frm.doc.name,
                    },
                    callback: function(r) {
                        d.hide();
                        refresh_field("status");
                        location.reload(true);
                    }
                })
            }
        });

        d.show();

    },

});