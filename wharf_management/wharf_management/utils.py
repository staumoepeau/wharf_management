# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import math
import frappe
from frappe import _
from frappe.utils import cstr, formatdate, cint, getdate, date_diff, add_days, time_diff_in_hours, rounded, now


@frappe.whitelist()
def get_create_cargo(cargo_ref, final_work_type, secondary_work_type, cargo_type):
    
    worktype, movement, payment,gate = "", "", "", ""
    val = frappe.db.get_value("Pre Advice", {"name": cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","last_port","qty","container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
    "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
    "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
        
    if not val.consignee:
        val.consignee = val.agents
	
    if val.status == "Inspection":
        movement = "Yard"
    	
        
    if final_work_type == "Discharged" and secondary_work_type == "Re-stowing":
        worktype = "Re-stowing"
        movement = "Re-stowing"
        payment = "Closed"
        gate = "Closed"
       
#            elif self.secondary_work_type == "Transhipment":
#                worktype = "Transhipment"
#                movement = "Transhipment"
#                payment = "Closed"
#                gate = "Closed"

    elif cargo_type == "Split Ports":
        worktype = secondary_work_type
        movement = "Split Ports"
        payment = "Open"
        gate = "Open"


    doc = frappe.new_doc("Cargo")
    doc.update({
            
                "docstatus" : 1,
                "cargo_ref": cargo_ref,
                "booking_ref" : val.booking_ref,
                "pat_code" : val.pat_code,
                "net_weight" : val.net_weight,
                "cargo_type" : val.cargo_type,
                "qty" : val.qty,
                "container_no" : val.container_no,
                "voyage_no" : val.voyage_no,
                "bol" : val.bol,
                "work_type" : final_work_type,
                "work_type_date": now(),
                "secondary_work_type" : worktype,
                "pol" : val.pol,
                "agents" : val.agents,
                "commodity_code" : val.commodity_code,
                "vessel" : val.vessel,
                "pod" : val.pod,
                "temperature" : val.temperature,
                "container_type" : val.container_type,
                "mark" : val.mark,
                "final_dest_port" : val.final_dest_port,
                "volume" : val.volume,
                "container_size" : val.container_size,
                "consignee" : val.consignee,
                "container_content" : val.container_content,
                "stowage" : val.stowage,
                "hazardous" : val.hazardous,
                "hazardous_code" : val.hazardous_code,
                "status" : movement,
                "seal_1" : val.seal_1,
                "seal_2" : val.seal_2,
                "eta_date" : val.eta_date,
                "cargo_description" : val.cargo_description,
                "etd_date" : val.etd_date,
                "chasis_no" : val.chasis_no,
                "inspection_status" : "Closed",
                "yard_status" : "Closed",
                "final_status" : final_work_type,
                "payment_status" : payment,
                "gate1_status" : gate,
                "gate2_status" : gate,
            })
    doc.insert(ignore_permissions=True)
    doc.submit()

