// Copyright (c) 2017, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inspection', {
    refresh: function(frm) {

    },
        
    on_submit: function(frm){
        frm.reload_doc()
        frappe.set_route("List", "Pre Advice")
    },
    onload: function(frm) {
//        frm.refresh();

        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Pre Advice",
                name: frm.doc.cargo_ref,
                filters: {
                    'docstatus': 1
                },
            },
            callback: function(data) {
                console.log(data);
                cur_frm.set_value("cargo_ref", data.message["name"]);
                cur_frm.set_value("container_no", data.message["container_no"]);
                cur_frm.set_value("container_content", data.message["container_content"]);
                cur_frm.set_value("voyage_no", data.message["voyage_no"]);
                cur_frm.set_value("vessel", data.message["vessel"]);
                cur_frm.set_value("bol", data.message["bol"]);
                cur_frm.set_value("work_type", data.message["work_type"]);
                cur_frm.set_value("secondary_work_type", data.message["secondary_work_type"]);
                
                cur_frm.set_value("chasis_no", data.message["chasis_no"]);
                cur_frm.set_value("qty", data.message["qty"]);
                cur_frm.set_value("final_work_type", data.message["work_type"]);
                cur_frm.set_value("third_work_type", data.message["third_work_type"]);
                cur_frm.set_value("cargo_type", data.message["cargo_type"]);
                cur_frm.set_value("mark", data.message["mark"]);
                
                cur_frm.set_df_property("secondary_work_type", "read_only", 1);
                cur_frm.set_df_property("mark", "read_only", 1);
                cur_frm.set_df_property("cargo_type", "read_only", 1);
                cur_frm.set_df_property("voyage_no", "read_only", 1);
                cur_frm.set_df_property("work_type", "read_only", 1);
                cur_frm.set_df_property("final_work_type", "read_only", 1);
                cur_frm.set_df_property("cargo_ref", "read_only", 1);
                cur_frm.set_df_property("vessel", "read_only", 1);
                cur_frm.set_df_property("vessel_arrival_date", "read_only", 1);
                cur_frm.set_df_property("bol", "read_only", 1);
                cur_frm.set_df_property("container_no", "read_only", 1);
                cur_frm.set_df_property("chasis_no", "read_only", 1);
                cur_frm.set_df_property("third_work_type", "read_only", 1);
            }
        })
        
        if (frm.doc.work_type == "Loading"){
            cur_frm.set_df_property("inspection_images","hidden",1);
            cur_frm.set_df_property("cargo_condition","hidden",1);
        } else{
            cur_frm.set_df_property("inspection_images","hidden",0);
            cur_frm.set_df_property("cargo_condition","hidden",0);
        }

    }

});