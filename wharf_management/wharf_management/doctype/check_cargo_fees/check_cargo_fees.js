// Copyright (c) 2020, Sione Taumoepeau and contributors
// For license information, please see license.txt
frappe.provide("wharf_management.check_cargo_fees");
frappe.ui.form.on('Check Cargo Fees', {
    refresh: function(frm) {



        frm.add_custom_button(__("Print"), function() {
            var w = window.open("/printview?doctype=Check%20Cargo%20Fees&name=" + cur_frm.doc.name + "&trigger_print=1&format=Check%20Cargo%20Fees&no_letterhead=0&_lang=es");

            if (!w) {
                frappe.msgprint(__("Please enable pop-ups"));
                return;
            }
        })


        if (frappe.user.has_role("System Manager")) {
            frm.page.sidebar.show(); // this removes the sidebar
            $(".timeline").show()
            frm.page.wrapper.find(".layout-main-section-wrapper").addClass("col-md-10");
        } else {
            frm.page.sidebar.hide(); // this removes the sidebar
            $(".timeline").hide()
            frm.page.wrapper.find(".layout-main-section-wrapper").removeClass("col-md-10"); // this removes class "col-md-10" from content block, which sets width to 83%
        }

    },
    onload: function(frm) {

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Agent User",
                filters: { user: frm.doc.user }
            },
            callback: function(data) {
                if (frappe.session.user == data.message["user"]) {
                    cur_frm.set_value("agents", data.message["agent"])
                }
            }
        })

        cur_frm.set_query("cargo_ref", function() {
            return {
                "filters": [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered', 'Split Ports']],
                    //                        ['Cargo', 'consignee', '=', frm.doc.customer],
                ]
            };
        });

        var today = new Date();
        frm.set_value("today_date", today);
        frm.set_value("cargo_type", "");

        frm.set_value("container_no", " ");

        frm.set_value("total_fee_to_paid", " ");
        frm.set_value("consignee", " ");

        frm.set_value("vessel", " ");
        frm.set_value("voyage_no", " ");
        frm.set_value("eta_date", " ");
        frm.set_value("eta_date", " ");

        //frm.clear_child("wharf_fee_item")
        frappe.model.clear_table(frm.doc, "wharf_fee_item");
        //        item_row.item = ""

        //        frm.fields_dict['wharf_fee_item'].grid = " "
        //        doctype = "Wharf Fee Item"
        //        docname = "item"
        //        frappe.model.set_value(frm.doctype,frm.docname, 'duration',data.message.default_duration);

    },

    cargo_ref: function(frm) {
        if (frm.doc.cargo_ref) {
            frappe.call({
                //                method: "wharf_management.wharf_management.doctype.check_cargo_fees.check_cargo_fees.get_storage",
                method: "get_storage",
                doc: frm.doc,
                callback: function(data) {

                    frm.refresh_fields();
                    console.log(data);
                }
            })
        } else if (!frm.doc.cargo_ref) {
            msgprint("Please Select a Cargo")
        }

    }
});

$.extend(wharf_management.check_cargo_fees, {

    setup_cargo_queries: function(frm) {
        frm.get_query('cargo_ref', function(doc) {
            return {
                filters: [
                    ['Cargo', 'docstatus', '=', 1],
                    ['Cargo', 'status', 'in', ['Yard', 'Inspection Delivered']],
                    //                    ['Cargo', 'consignee', '=', frm.doc.customer],
                ]
            }
        });
    },
});