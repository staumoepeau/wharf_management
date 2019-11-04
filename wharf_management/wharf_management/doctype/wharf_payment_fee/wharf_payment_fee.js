// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt
//{% include 'erpnext/selling/sales_common.js' %};

frappe.ui.form.on('Wharf Payment Fee', {

    setup: function(frm) {
        frm.get_field('wharf_fee_item').grid.editable_fields = [
            { fieldname: 'item', columns: 2 },
            { fieldname: 'description', columns: 2 },
            { fieldname: 'price', columns: 2 },
            { fieldname: 'qty', columns: 2 },
            { fieldname: 'total', columns: 2 }
        ];
    },

//    on_submit: function(frm){   
//        frappe.set_route("List", "Cargo")
//    },
    validate: function(frm){
        if (frm.doc.posting_date < get_today()) {
            frappe.msgprint(__("You can not select past date as the Posting Date"));
            frappe.validated = false;
        }
    },

    onload: function(frm) {
        

//        if ((frappe.user.has_role("Wharf Operation Cashier"))){
//            cur_frm.set_df_property("posting_date", "read_only", 1);
//            cur_frm.set_value("posting_date",frappe.datetime.nowdate());
//        }
 //       if ((frappe.user.has_role("System Manager"))){
 //           cur_frm.set_df_property("posting_date", "read_only", 0);
//            cur_frm.set_value("posting_date",frappe.datetime.nowdate());
 //       }

        if ((frappe.user.has_role("System Manager") || frappe.user.has_role("Wharf Operation Cashier") && frm.doc.docstatus == 1
            )) {0
                
                frm.add_custom_button(__('Refund Sale'), function() {
                    frappe.call({
                        method: "refund_sales",
                        doc: frm.doc,
                        callback: function(refund) {
                            frm.refresh_fields();
                            console.log(refund);
                        }
                        
                    });
                    frappe.set_route("List", "Cargo")
                },__("Make"));
                
        }

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Cargo",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 1
                },
            },
            callback: function(data) {
                cur_frm.set_value("cargo_ref", data.message["name"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("vessel", data.message["vessel"]);
                cur_frm.set_value("eta_date", data.message["eta_date"]);
                cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                cur_frm.set_value("work_type", data.message["work_type"]);
                cur_frm.set_value("secondary_work_type", data.message["secondary_work_type"]);
                cur_frm.set_value("agents", data.message["agents"]);
                cur_frm.set_value("weight", data.message["net_weight"]);
                cur_frm.set_value("volume", data.message["volume"]);
                cur_frm.set_value("litre", data.message["litre"]);
                cur_frm.set_value("chasis_no", data.message["chasis_no"]);
                cur_frm.set_value("bol", data.message["bol"]);

                cur_frm.set_value("yard_slot", data.message["yard_slot"]);
                cur_frm.set_value("consignee", data.message["consignee"]);
                cur_frm.set_value("container_type", data.message["container_type"]);

                cur_frm.set_value("container_size", data.message["container_size"]);
                cur_frm.set_value("container_content", data.message["container_content"]);

                cur_frm.set_df_property("naming_series", "hidden", 1);
                cur_frm.set_df_property("voyage_no", "read_only", 1);
                cur_frm.set_df_property("vessel", "read_only", 1);
                cur_frm.set_df_property("eta_date", "read_only", 1);
                cur_frm.set_df_property("cargo_type", "read_only", 1);

                cur_frm.set_df_property("work_type", "read_only", 1);
                cur_frm.set_df_property("secondary_work_type", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("agents", "read_only", 1);
                cur_frm.set_df_property("yard_slot", "read_only", 1);
                cur_frm.set_df_property("consignee", "read_only", 1);
                cur_frm.set_df_property("container_type", "read_only", 1);
                cur_frm.set_df_property("container_size", "read_only", 1);
                cur_frm.set_df_property("container_content", "read_only", 1);
                cur_frm.set_df_property("free_storage_days", "read_only", 1);
                cur_frm.set_df_property("weight", "read_only", 1);
                cur_frm.set_df_property("volume", "read_only", 1);
                cur_frm.set_df_property("litre", "read_only", 1);
                cur_frm.set_df_property("chasis_no", "read_only", 1);
                cur_frm.set_df_property("bol", "read_only", 1);

            }
        })
    },


    refresh: function() {

    },

    payment_method: function(frm) {
        var today = new Date();
        var dd = today.getDate();

        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }
        today = hr + '' + min + '' + mm + '' + sec;

        if (frm.doc.payment_method) {
            frm.set_value("paid_amount", frm.doc.total_amount)
        }
        
//        if (frm.doc.payment_method == 'Credit' && frm.doc.work_type == 'Stock') {
//            frm.set_value("custom_warrant", "ETY" + today)
//       }

        if (frm.doc.payment_method != 'Credit') {
            frm.set_value("custom_warrant", "")
        }

    },

    posting_date: function(frm) {

        if (frm.doc.posting_date < frappe.datetime.nowdate()) {
           frappe.msgprint(__("Posting Date must be equal or after the ETA Date"));
           frappe.validated = false;
       } else {

            frappe.call({
                method: "get_working_days",
                doc: frm.doc,
                callback: function(r) {
                    frm.set_value("storage_days", r.message);
                }

            })

            if (frm.doc.cargo_type == "Container") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Storage Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                            container_size: frm.doc.container_size,
                            container_content: frm.doc.container_content
                        }
                    },
                    callback: function(data) {
                        cur_frm.set_value("free_storage_days", data.message["grace_days"]);
                    }
                })
            } else if (frm.doc.cargo_type != "Container") {
                frappe.call({
                    "method": "frappe.client.get",
                    args: {
                        doctype: "Storage Fee",
                        filters: {
                            cargo_type: frm.doc.cargo_type,
                        }
                    },
                    callback: function(data) {
                        cur_frm.set_value("free_storage_days", data.message["grace_days"]);
                    }
                })
            }
        }
    },

    free_storage_days: function(frm) {
        if (frm.doc.free_storage_days < frm.doc.storage_days) {
            var sdays = flt(frm.doc.storage_days - frm.doc.free_storage_days);
            frm.set_value("storage_days_charged", sdays);
        } else if (frm.doc.free_storage_days >= frm.doc.storage_days) {
            frm.set_value("storage_days_charged", 0);
            frm.refresh_fields("storage_days_charged");
        }

    },

    custom_code: function(frm) {
        if (frm.doc.custom_code == "MTY") {
            frm.set_value("delivery_code", "EMPTY DELIVERY")
        } else if (frm.doc.custom_code == "DDL") {
            frm.set_value("delivery_code", "DIRECT DELIVERY")
        } else if (frm.doc.custom_code == "DDLW") {
            frm.set_value("delivery_code", "DIRECT DELIVERY WAREHOUSE")
        } else if (frm.doc.custom_code == "IDL") {
            frm.set_value("delivery_code", "INSPECTION DELIVERY")
        } else if (frm.doc.custom_code == "DLWS") {
            frm.set_value("delivery_code", "DELIVERY PAT WAREHOUSE")
        }else if (frm.doc.custom_code == "SPLIT-PORT") {
            frm.set_value("delivery_code", "SPLIT-PORT")
        } else if (!frm.doc.custom_code) {
            frm.set_value("delivery_code", "")
        }
       
//        if (frm.doc.bulk_payment == "Yes") {
//            cur_frm.set_value("bulk_payment_code", frm.doc.custom_warrant)
//                frm.set_value("custom_warrant", 0)
//            frm.set_value("custom_warrant", frm.doc.bulk_payment_code + "-" + frm.doc.bulk_item)
//           frm.refresh_fields("custom_warrant");
//        }

    },
    deliver_empty: function(frm){
        if (frm.doc.deliver_empty=="Yes"){
            cur_frm.set_df_property("custom_warrant", "read_only", 1)
        
        }else if (frm.doc.deliver_empty=="No"){
            cur_frm.set_df_property("custom_warrant", "read_only", 0)
        }
    },

    different_warrant: function(frm){
        if (frm.doc.different_warrant == "No"){
            frm.set_value("bulk_payment_code", frm.doc.custom_warrant)
            cur_frm.set_df_property("bulk_payment_code", "read_only", 1)

        }else if (frm.doc.different_warrant == "Yes"){
            cur_frm.set_df_property("bulk_payment_code", "read_only", 0)
            frm.set_value("bulk_payment_code", "")

        }
    },

    insert_fees_button: function(frm) {
        return frappe.call({
            method: "insert_fees",
            doc: frm.doc,
            callback: function(fees) {
                frm.refresh_fields();
                console.log(fees);
            }
        });
    },

    discount: function(frm) {
        if (frm.doc.discount == "No" || frm.doc.discount == "") {
            frm.set_value("total_amount", frm.doc.total_fee);
            frm.set_value("discount_amount", 0);
        } else if (frm.doc.discount == "Yes") {
            frm.set_value("total_amount", (frm.doc.total_fee - frm.doc.discount_amount));
        }
    },
    discount_amount: function(frm) {
        frm.set_value("total_amount", (frm.doc.total_fee - frm.doc.discount_amount));
    },
    paid_amount: function(frm){

        if (frm.doc.total_amount > frm.doc.paid_amount){
            frm.set_value("outstanding_amount", (frm.doc.total_amount - frm.doc.paid_amount));
            frm.set_value("change_amount", 0.00)
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)

        } 
        if (frm.doc.total_amount < frm.doc.paid_amount){
            frm.set_value("change_amount", (frm.doc.paid_amount - frm.doc.total_amount));
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
        if (frm.doc.total_amount == frm.doc.paid_amount){
            frm.set_value("change_amount", 0.00)
            frm.set_value("outstanding_amount", 0.00);
            cur_frm.set_df_property("change_amount", "read_only", 1)
            cur_frm.set_df_property("outstanding_amount", "read_only", 1)
        }
    },
});

frappe.ui.form.on("Wharf Fee Item", "total", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.model.set_value(d.doctype, d.name, "total_fee", d.total);

    var total_fees = 0;
    frm.doc.wharf_fee_item.forEach(function(d) { total_fees += d.total; });

    frm.set_value("total_fee", total_fees);
});

frappe.ui.form.on("Wharf Fee Item", "item", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    frappe.call({
        "method": "frappe.client.get",
        args: {
            doctype: "Item",
            filters: {
                'name': d.item
            },
        },
        callback: function(data) {
            frappe.model.set_value(d.doctype, d.name, "price", data.message["standard_rate"]);
            frappe.model.set_value(d.doctype, d.name, "description", data.message["description"]);
        }
    })
});

frappe.ui.form.on("Wharf Fee Item", "qty", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];

    frm.doc.wharf_fee_item.forEach(function(d) {
        flt(total += flt(d.price * d.qty))
        frm.set_value("total", total);
    })
});
