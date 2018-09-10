// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Gate1', {
    refresh: function(frm) {
        frm.add_fetch('truck_licenses_plate', 'company', 'company');

    },
    
    on_submit: function(frm){
        frm.reload_doc()
        frappe.set_route("List", "Cargo")
    },

    onload: function(frm) {

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
                        cur_frm.set_value("custom_warrant", data.message["custom_warrant"]);
                        cur_frm.set_value("custom_code", data.message["custom_code"]);
                        cur_frm.set_value("delivery_code", data.message["delivery_code"]);
                        cur_frm.set_value("bulk_payment", data.message["bulk_payment"]);
                        cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                        cur_frm.set_value("cargo_description", data.message["cargo_description"]);
                        cur_frm.set_value("chasis_no", data.message["chasis_no"]);
                        cur_frm.set_value("qty", data.message["qty"]);
                        cur_frm.set_value("container_content", data.message["container_content"]);
                        cur_frm.set_value("work_type", data.message["work_type"]);
                        

                        if (frm.doc.bulk_payment == "Yes") {
                            cur_frm.set_value("warrant_no", data.message["custom_warrant"]);
                            cur_frm.set_df_property("warrant_no", "read_only", 1);
                            cur_frm.set_df_property("bulk_payment", "read_only", 1);
                            cur_frm.set_df_property("bulk_payment", "hidden", 0);
                        } else {
                            cur_frm.set_df_property("bulk_payment", "hidden", 1);
                        }
                    
                        cur_frm.set_df_property("cargo_ref", "read_only", 1);
                        cur_frm.set_df_property("container_no", "read_only", 1);
                        cur_frm.set_df_property("customer", "read_only", 1);
                        cur_frm.set_df_property("delivery_code", "read_only", 1);
                        cur_frm.set_df_property("custom_code", "read_only", 1);
                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
                    
                        cur_frm.set_df_property("cargo_type", "read_only", 1);
                        cur_frm.set_df_property("cargo_description", "read_only", 1);
                        cur_frm.set_df_property("chasis_no", "read_only", 1);
                        cur_frm.set_df_property("container_content", "read_only", 1);

                        cur_frm.set_df_property("status", "hidden", 1);
                        cur_frm.set_df_property("work_type", "hidden", 1);
                        

                        if ((frm.doc.cargo_type == "Loose Cargo") || (frm.doc.cargo_type == "Break Bulk")){
                            cur_frm.set_df_property("qty", "hidden", 0);
                        } else {
                            cur_frm.set_df_property("qty", "hidden", 1);
                        }


                    }
                })
//        }
//        if (frm.doc.cargo_ref.str.substring(0,2) == "CW"){
//                frappe.call({
//                    "method": "frappe.client.get",
//                    args: {
//                        doctype: "Warehouse Cargo",
//                        name: frm.doc.cargo_warehouse_ref,
//                       filters: {
//                            'docstatus': 1,
 //                           'gate1_status': "Open"
//                        },
//                    },
//                    callback: function(data) {
//                      cur_frm.set_value("customer", data.message["consignee"]);
//                        cur_frm.set_value("container_no", data.message["container_no"]);
//                        cur_frm.set_value("work_type", data.message["work_type"]);
//                        cur_frm.set_df_property("work_type", "read_only", 1);
//                        cur_frm.set_df_property("cargo_ref", "read_only", 1);
//                        cur_frm.set_df_property("delivery_code", "read_only", 1);
//                        cur_frm.set_df_property("custom_code", "read_only", 1);
//                        cur_frm.set_df_property("custom_warrant", "read_only", 1);
//                        cur_frm.set_df_property("warrant_no", "read_only", 1);
        //cur_frm.set_df_property("custom_code_section", "hidden", 1);

//                    }
//                })
//        }

    }
});