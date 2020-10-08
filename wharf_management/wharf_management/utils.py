# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import math
import frappe
from frappe import _
from frappe.utils import cstr, formatdate, cint, getdate, date_diff, add_days, time_diff_in_hours, rounded, now


@frappe.whitelist()
def get_create_cargo(doctype, cargo_ref, final_work_type, secondary_work_type, cargo_type):

    worktype, movement, payment,gate = "", "", "", ""

    if doctype == "Pre Advice":
        val = frappe.db.get_value(doctype, {"name": cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","last_port","qty","container_no","voyage_no",
        "bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature", "container_type","mark","final_dest_port","volume",
        "container_size","consignee","container_content","stowage","hazardous","hazardous_code", "status","seal_1","seal_2","eta_date","cargo_description","etd_date",
        "chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

    if doctype == "Cargo":
        val = frappe.db.get_value(doctype, {"name": cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","last_port","qty","container_no","voyage_no","custom_code",
        "bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature", "container_type","mark","final_dest_port","volume","custom_warrant",
        "container_size","consignee","container_content","stowage","hazardous","hazardous_code", "status","seal_1","seal_2","eta_date","cargo_description","etd_date","delivery_code",
        "chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

#    if not val.consignee:
#        val.consignee = val.agents

    if final_work_type == "Discharged" and not secondary_work_type:
        inspection_status = "Closed"
        movement = "Yard"
       

    if final_work_type == "Discharged" and secondary_work_type == "Re-stowing":
        worktype = "Re-stowing"
        movement = "Re-stowing"
        payment = "Closed"
        gate = "Closed"
        inspection_status = "Closed"
        

#            elif self.secondary_work_type == "Transhipment":
#                worktype = "Transhipment"
#                movement = "Transhipment"
#                payment = "Closed"
#                gate = "Closed"

    if cargo_type == "Split Ports" and final_work_type == "Discharged" :
        worktype = secondary_work_type
        movement = "Split Ports"
        payment = "Open"
        gate = "Open"
        inspection_status = "Closed"
        

    if cargo_type == "Split Ports" and final_work_type == "Loading" :
        worktype = secondary_work_type
        movement = "Split Ports"
        payment = "Closed"
        gate = "Open"
        inspection_status = "Open"
  



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
                "inspection_status" : inspection_status,
                "yard_status" : "Closed",
                "final_status" : final_work_type,
                "payment_status" : payment,
                "gate1_status" : gate,
                "gate2_status" : gate,
                "custom_warrant" : val.custom_warrant,
                "custom_code" : val.custom_code,
                "delivery_code" : val.delivery_code,
                "inspection_date": now()
            })
    doc.insert(ignore_permissions=True)
    doc.submit()

@frappe.whitelist()
def create_cargo_movement(cargo_ref, work_type, gate_status, gate):

        val = frappe.db.get_value("Cargo", {"name": cargo_ref}, ["pat_code","cargo_type","container_no","agents","container_type","container_size", "chasis_no", "mark", "qty", "consignee",
        "container_content","cargo_description", "custom_warrant", "eta_date", "etd_date", "booking_ref"], as_dict=True)

        info = frappe.db.get_value(gate, {"cargo_ref": cargo_ref}, ['truck_licenses_plate','drivers_information','modified','name'], as_dict=True)

        if gate == "Gate2" and work_type == "Loading":
#            frappe.msgprint(_("TSESESESE"), raise_exception=True)
            gate2_no = gate_status
            gate2_date = now()
            gate2_time = now()
            gate_content = "FULL"
            gate_no = None
            gate_date = None
            gate_time = None
            reference = info.name

        if gate == "Gate1" and work_type == "Discharged":
            gate_no = gate_status
            gate_date = info.modified
            gate_time = info.modified
            gate_content = None
            gate2_no = None
            gate2_date = None
            gate2_time = None
            gate_content = None
            reference = val.name

        doc = frappe.new_doc("Cargo Movement")
        doc.update({
                    "docstatus" : 1,
                    "pat_code" : val.pat_code,
                    "cargo_type" : val.cargo_type,
                    "container_no" : val.container_no,
                    "work_type" : work_type,
                    "agents" : val.agents,
                    "container_type" : val.container_type,
                    "container_size" : val.container_size,
                    "consignee" : val.consignee,
                    "container_content" : val.container_content,
                    "cargo_description" : val.cargo_description,
                    "main_gate_status" : gate2_no,
                    "main_gate_date" : gate2_date,
                    "main_gate_time" : gate2_time,
                    "gate_status" : gate_no,
                    "movement_date" : gate_date,
                    "gate1_time" : gate_time,
                    "truck" : info.truck_licenses_plate,
                    "truck_driver" : info.drivers_information,
                    "refrence": reference,
                    "chasis_no" : val.chasis_no,
                    "main_gate_content" : gate_content,
                    "mark" : val.mark,
                    "qty" : val.qty,
                    "warrant_number" : val.custom_warrant,
                    "eta_date" : val.eta_date,
                    "etd_date" : val.etd_date,
                    "booking_ref" : val.booking_ref
                })
        doc.insert(ignore_permissions=True)
        doc.submit()
#        frappe.msgprint(_("Hello Cargo Movement"), raise_exception=True)

@frappe.whitelist()
def create_preadvise_history(cargo_ref):

    val = frappe.db.get_value("Pre Advice", {"name": cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty","container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
    "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
    "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status",
    "break_bulk_item_count","security_item_count"], as_dict=True)

    doc = frappe.new_doc("Pre Advise History")
    doc.update({
                "docstatus" : 1,
                "booking_ref" : val.booking_ref,
                "pat_code" : val.pat_code,
                "net_weight" : val.net_weight,
                "cargo_type" : val.cargo_type,
                "qty" : val.qty,
                "container_no" : val.container_no,
                "voyage_no" : val.voyage_no,
                "bol" : val.bol,
                "work_type" : val.work_type,
                "secondary_work_type" : val.secondary_work_type,
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
                "status" : "Yard",
                "seal_1" : val.seal_1,
                "seal_2" : val.seal_2,
                "eta_date" : val.eta_date,
                "cargo_description" : val.cargo_description,
                "etd_date" : val.etd_date,
                "chasis_no" : val.chasis_no,
                "yard_slot" : val.yard_slot,
                "inspection_status" : val.inspection_status,
                "yard_status" : val.yard_status,
                "final_status" : val.final_status,
                "break_bulk_item_count" : val.break_bulk_item_count,
                "security_item_count" : val.security_item_count
                })
    doc.insert(ignore_permissions=True)
    doc.submit()
    frappe.db.delete('Pre Advice', {'name': cargo_ref })