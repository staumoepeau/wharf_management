# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document
from frappe.utils import add_days, cint, cstr, flt
from wharf_management.wharf_management.utils import create_preadvise_history

class PreAdvice(Document):

    def validate(self):
        self.check_status()


    def check_status(self):
        if not self.status:
            self.status = self.get_status()
        if not self.inspection_status:
            self.inspection_status = self.get_inspection_status()
        if not self.hazardous:
            self.hazardous = self.get_hazardous()


    def get_status(self):
        mystatus = "Booked"
        return mystatus

    def get_inspection_status(self):
        inspection_status = "Open"
        return inspection_status

    def get_hazardous(self):
        hazardous_ans = "No"
        return hazardous_ans


    def check_export_container(self):
        check_duplicate = None
        check_duplicate = frappe.db.sql("""Select container_no from `tabExport` where container_no=%s having count(container_no) > 1""", (self.container_no))

        return check_duplicate

    def devanning_create_vehicles(self):
            val = frappe.db.get_value("Pre Advice", {"name": self.name}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
            "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
            "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
            "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)
            doc = frappe.new_doc("Pre Advice")
            doc.update({
    #                "company" : self.company,
                    "docstatus" : 1,
                    "booking_ref" : val.booking_ref,
                    "pat_code" : val.pat_code,
                    "net_weight" : val.net_weight,
        #            "export_status" : self.export_status,
                    "cargo_type" : "Vehicles",
        #            "pre_advise_status" : self.pre_advise_status,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : "Devanning",
        #            "secondary_work_type" : val.secondary_work_type,
        #            "third_work_type" : self.third_work_type,
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
        #            "export_arrival_date" : self.export_arrival_date,
                    "container_size" : val.container_size,
                    "consignee" : val.consignee,
        #            "container_content" : ,
                    "stowage" : val.stowage,
                    "hazardous" : val.hazardous,
                    "hazardous_code" : val.hazardous_code,
                    "status" : "Uploaded",
                    "seal_1" : val.seal_1,
                    "seal_2" : val.seal_2,
                    "eta_date" : val.eta_date,
                    "cargo_description" : val.cargo_description,
                    "etd_date" : val.etd_date,
                    "chasis_no" : val.chasis_no,
        #            "yard_slot" : val.yard_slot,
                    "inspection_status" : "Open",
                    "final_status" : "Devanning"
                    })

            doc.insert()
            doc.submit()
            frappe.msgprint(_("Vehicle was created under this Container No {0} ").format(self.container_no))

    def devanning_create_bbulk(self):
            val = frappe.db.get_value("Pre Advice", {"name": self.name}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
            "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
            "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
            "status","seal_1","seal_2","eta_date","cargo_description","etd_date","yard_slot","final_status"], as_dict=True)
            doc = frappe.new_doc("Pre Advice")
            doc.update({
    #                "company" : self.company,
                    "docstatus" : 1,
                    "booking_ref" : val.booking_ref,
                    "pat_code" : val.pat_code,
                    "net_weight" : val.net_weight,
        #            "export_status" : self.export_status,
                    "cargo_type" : "Break Bulk",
        #            "pre_advise_status" : self.pre_advise_status,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : "Devanning",
        #            "secondary_work_type" : val.secondary_work_type,
        #            "third_work_type" : self.third_work_type,
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
        #            "export_arrival_date" : self.export_arrival_date,
                    "container_size" : val.container_size,
                    "consignee" : val.consignee,
        #            "container_content" : ,
                    "stowage" : val.stowage,
                    "hazardous" : val.hazardous,
                    "hazardous_code" : val.hazardous_code,
                    "status" : "Uploaded",
                    "seal_1" : val.seal_1,
                    "seal_2" : val.seal_2,
                    "eta_date" : val.eta_date,
                    "cargo_description" : val.cargo_description,
                    "etd_date" : val.etd_date,
        #            "chasis_no" : val.chasis_no,
        #            "yard_slot" : val.yard_slot,
                    "inspection_status" : "Open",
                    "final_status" : "Devanning"
                    })

            doc.insert()
            doc.submit()
            frappe.msgprint(_("Break Bulk was created under this Container No {0} ").format(self.container_no))

@frappe.whitelist()
def update_breakbulk_inspection(name_ref, counter, qty):
    if counter < qty:
        frappe.db.sql("""UPDATE `tabPre Advice` SET break_bulk_item_count=%s  WHERE name=%s""", (counter, name_ref))
	
    if counter == qty:
        frappe.db.sql("""UPDATE `tabPre Advice` SET break_bulk_item_count=%s  WHERE name=%s""", (counter, name_ref))
        create_preadvise_history(name_ref)
#        frappe.db.delete('Pre Advice', {'name': name_ref })
        



