# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from frappe.utils import cstr, formatdate, cint, getdate, date_diff, add_days, now, flt
from wharf_management.wharf_management.utils import get_create_cargo, get_create_cargo_devan


class Inspection(Document):

    def validate(self):
        self.validate_work_type()
        self.validate_crane_no()

        if self.cargo_type == "Split Ports" and not self.last_port:
                msgprint(_("Please make sure to choose the LAST PORT").format(self.last_port),
                    raise_exception=1)

    def on_submit(self):
        self.check_work_type()


    def check_work_type(self):

        if self.final_work_type == "Discharged" and self.secondary_work_type == "Devanning" and (self.third_work_type == "Stock" or not self.third_work_type) :

            self.create_cargo()
            get_create_cargo_devan("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, self.cargo_type, "EMPTY")

            if flt(self.devan_qty) > 0 :
                for v in range(1, self.devan_qty+1):
                    if self.devanning == "Vehicles":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Vehicles")
                    if self.devanning == "Break Bulk":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Break Bulk")
                    if self.devanning == "Heavy Vehicles":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Heavy Vehicles")
                    
            self.moveto_preadvise_history()
            frappe.db.delete('Pre Advice', {'name': self.cargo_ref })


        elif self.final_work_type == "Discharged" and self.secondary_work_type == "Devanning" and self.third_work_type == "Loading":

            self.create_cargo()
            get_create_cargo_devan("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, self.cargo_type, "EMPTY")           
            
            if flt(self.devan_qty) > 0 :
                for v in range(1, int(self.devan_qty)+1):
                    if self.devanning == "Vehicles":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Vehicles")
                    if self.devanning == "Break Bulk":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Break Bulk")
                    if self.devanning == "Heavy Vehicles":
                        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, "Heavy Vehicles")

            self.update_pre_advice_loading("Devanning/Loading")


        elif self.final_work_type == "Discharged" and self.secondary_work_type == "Transhipment" and not self.third_work_type:
            self.create_cargo()
            self.create_transhipment_cargo()

        elif self.final_work_type == "Discharged" and self.secondary_work_type == "Re-stowing" and not self.third_work_type:
            self.create_cargo()
            self.update_restow_status()

        elif self.final_work_type == "Discharged" and not self.secondary_work_type and not self.third_work_type and self.cargo_type != "Split Ports":
            self.create_cargo()
            self.update_inspection_status()
            self.moveto_preadvise_history()
            frappe.db.delete('Pre Advice', {'name': self.cargo_ref })


        elif self.final_work_type == "Discharged" and not self.secondary_work_type and not self.third_work_type and self.cargo_type == "Split Ports":
            self.check_discharged_split_port()

#        if self.final_work_type == "Devanning" and not self.secondary_work_type and not self.third_work_type:
#            self.update_inspection_status()

        elif self.final_work_type == "Loading" and not self.secondary_work_type and not self.third_work_type and self.work_information == "Re-stowing":
            self.loading_restowing()
            self.moveto_preadvise_history()

        elif self.final_work_type == "Loading" and not self.secondary_work_type and not self.third_work_type and self.work_information == "Split Ports":

            if self.cargo_type == "Split Ports" and self.last_port == "NO":
                self.check_inward_cargo()

        elif self.final_work_type == "Loading" and not self.secondary_work_type and not self.third_work_type and self.work_information == "Devanning/Loading":
            self.devanning_loading_update()
        
        elif self.final_work_type == "Loading" and not self.secondary_work_type and not self.third_work_type and not self.work_information:
            self.check_export()

            #get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, "Export", self.cargo_type)


    def devanning_loading_update(self):
#         val = frappe.db.get_value(doctype, {"name": cargo_ref}, ["status"

        frappe.db.sql("""UPDATE `tabCargo` SET last_work="Loading", status="Outbound", last_work_date=%s WHERE cargo_ref=%s and container_content = "EMPTY" and cargo_type in ("Container", "Flatrack")""", (now(), self.cargo_ref))
        self.moveto_preadvise_history()
        frappe.db.delete('Pre Advice', {'name': self.cargo_ref })


    def check_discharged_split_port(self):
        if self.last_port == "NO":
            self.create_cargo()
            self.update_pre_advice_loading("Split Ports")
#            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", status="Booked", final_status="Loading",
#            work_information="Split Ports", work_type="Loading", image_01=%s, inspection_comment=%s WHERE name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))

        if self.last_port == "YES":
            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Closed", final_status="Discharged",
            status="Inspection", image_01=%s, inspection_comment=%s WHERE name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
#            self.update_inspection_status()

    def update_pre_advice_loading(self, work_information):

        if work_information == "Devanning/Loading" and self.cargo_type == "Container":
            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", status="Booked", final_status="Loading", cargo_type = "Container",
            work_information=%s, work_type="Loading", secondary_work_type=" ", third_work_type= " ", container_content ="EMPTY", image_01=%s, inspection_comment=%s WHERE name=%s""", (work_information, self.file_attach, self.cargo_condition, self.cargo_ref))

        if work_information == "Devanning/Loading" and self.cargo_type != "Container":
            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", status="Booked", final_status="Loading", cargo_type = "Container",
            work_information=%s, work_type="Loading", secondary_work_type=" ", third_work_type= " ", image_01=%s, inspection_comment=%s WHERE name=%s""", (work_information, self.file_attach, self.cargo_condition, self.cargo_ref))
        
        if work_information == "Split Ports":
            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", status="Booked", final_status="Loading",
            work_information=%s, work_type="Loading", image_01=%s, inspection_comment=%s WHERE name=%s""", (work_information, self.file_attach, self.cargo_condition, self.cargo_ref))


    def validate_work_type(self):
        if not self.final_work_type:
            msgprint(_("Work Type is Manadory").format(self.final_work_type),
                    raise_exception=1)

    def validate_crane_no(self):
        if not self.crane_no:
                msgprint(_("Crane No is Manadory").format(self.crane_no), raise_exception = 1)

    def update_restow_status(self):
        frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", work_type='Loading', secondary_work_type=' ',
        work_information='Re-stowing', status='Booked' WHERE name=%s""", (self.cargo_ref))

    def loading_restowing(self):
        frappe.db.sql("""UPDATE `tabCargo` SET last_work="Loading", last_work_date=%s WHERE cargo_ref=%s""", (now(), self.cargo_ref))


    def update_inspection_status(self):

        if self.cargo_type in ["Loose Cargo", "Break Bulk"]:
            frappe.db.sql("""UPDATE `tabCargo` SET break_bulk_item_count=%s, inspection_status="Closed", final_status="Discharged", status="Inspection", file_attach=%s, file_attach_02=%s, inspection_comment=%s 
            WHERE cargo_ref=%s""", (self.count_item, self.file_attach, self.file_attach_02, self.cargo_condition, self.cargo_ref))

#            if self.qty == 1:
#                frappe.db.sql("""UPDATE `tabPre Advice` SET break_bulk_item_count=%s, inspection_status="Closed", final_status="Discharged", status="Inspection", image_01=%s, inspection_comment=%s WHERE name=%s""", (self.count_item, self.file_attach, self.cargo_condition, self.cargo_ref))

        if self.cargo_type in ["Tank Tainers", "Container", "Flatrack", "Split Ports", "Vehicles", "Heavy Vehicles", "Petrolium"]:
            frappe.db.sql("""UPDATE `tabCargo` SET inspection_status="Closed", final_status="Discharged", status="Inspection", file_attach=%s, file_attach_02=%s, inspection_comment=%s 
            WHERE cargo_ref=%s""", (self.file_attach, self.file_attach_02, self.cargo_condition, self.cargo_ref))

#        if self.qty == 0 and self.cargo_type == "Split Ports" and self.last_port == "NO":
#            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Open", status="Booked", final_status="Loading", work_type="Loading", image_01=%s, inspection_comment=%s WHERE name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
#        if self.qty == 0 and self.cargo_type == "Split Ports" and self.last_port == "YES":
#            frappe.db.sql("""UPDATE `tabPre Advice` SET inspection_status="Closed", final_status="Discharged", status="Inspection", image_01=%s, inspection_comment=%s WHERE name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))


    def update_final_status_devanning(self):
        frappe.db.sql("""UPDATE `tabPre Advice` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", secondary_work_type="Devanning",
        gate1_status="Closed", gate2_status="Closed", final_status="Discharged", status="Transfer" where name=%s""", (self.cargo_ref))

    # Ceare Cargo Item for Res-Stowing,
    def create_cargo(self):

        get_create_cargo("Pre Advice", self.cargo_ref, self.final_work_type, self.secondary_work_type, self.cargo_type)

    def check_inward_cargo(self):

        inward_cargo = frappe.db.sql("""Select name from `tabCargo` where booking_ref=%s and container_no=%s and status='INWARD' """, (self.booking_ref, self.container_no))

        if inward_cargo:
            frappe.db.sql("""UPDATE `tabCargo` SET status="Outbound", work_type="Loading", inspection_status="Closed", work_type_date=%s where name=%s """, (now(), inward_cargo))
            self.moveto_preadvise_history()
            frappe.db.delete('Pre Advice', {'name': self.cargo_ref })

        if not inward_cargo:
            msgprint(_("Please Check and Confirmed this Split Ports Container has arrived at the Gate"), raise_exception=1)


    def create_transhipment_cargo(self):
        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
        "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
        "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
        "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

        doc = frappe.new_doc("Transhipment Cargo")
        doc.update({
    #                "company" : self.company,
                    "docstatus" : 1,
                    "booking_ref" : val.booking_ref,
                    "pat_code" : val.pat_code,
                    "net_weight" : val.net_weight,
                    "cargo_type" : val.cargo_type,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : "Loading",
                    "secondary_work_type" : "Transhipment",
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
                    "status" : "Transshipment",
                    "seal_1" : val.seal_1,
                    "seal_2" : val.seal_2,
                    "eta_date" : val.eta_date,
                    "cargo_description" : val.cargo_description,
                    "etd_date" : val.etd_date,
                    "chasis_no" : val.chasis_no,
                    "inspection_status" : "Closed",
                    "yard_status" : "Closed",
                    "final_status" : self.final_work_type,
                    "payment_status" : "Closed",
                    "gate1_status" : "Closed",
                    "gate2_status" : "Closed"
                })
        doc.insert()
        doc.submit()
#        frappe.db.sql("""Update `tabPre Advice` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Transhipment", status="Transfer" where name=%s""", (self.cargo_ref))

#    Create EMPTY Container in Cargo for Handling Fee
    def create_cargo_item(self):
        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","last_port","qty",
        "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
        "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
        "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

#        vals = frappe.db.get_value("Export", {"container_no": self.container_no}, ["gate1_start"], as_dict=True)
        doc = frappe.new_doc("Cargo")
        doc.update({
    #                "company" : self.company,
                    "docstatus" : 1,
                    "booking_ref" : val.booking_ref,
                    "pat_code" : val.pat_code,
                    "net_weight" : val.net_weight,
                    "cargo_type" : val.cargo_type,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : self.final_work_type,
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
                    "status" : "Outbound",
                    "seal_1" : val.seal_1,
                    "seal_2" : val.seal_2,
                    "eta_date" : val.eta_date,
                    "cargo_description" : val.cargo_description,
                    "etd_date" : val.etd_date,
                    "chasis_no" : val.chasis_no,
                    "inspection_status" : "Closed",
                    "yard_status" : "Closed",
                    "final_status" : self.final_work_type,
                    "payment_status" : "Closed",
                    "gate1_status" : "Closed",
                    "gate2_status" : "Closed"
                })
        doc.insert()
        doc.submit()


    #Create EMPTY Container on Cargo for STOCK
    def create_empty_on_cargo(self):
        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
        "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
        "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
        "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

        doc = frappe.new_doc("Cargo")
        doc.update({
    #                "company" : self.company,
                    "docstatus" : 1,
                    "booking_ref" : val.booking_ref,
                    "pat_code" : val.pat_code,
                    "net_weight" : val.net_weight,
                    "cargo_type" : val.cargo_type,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : "Stock",
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
                    "container_content" : "EMPTY",
                    "stowage" : val.stowage,
                    "hazardous" : val.hazardous,
                    "hazardous_code" : val.hazardous_code,
                    "status" : "Inspection",
                    "seal_1" : val.seal_1,
                    "seal_2" : val.seal_2,
                    "eta_date" : val.eta_date,
                    "cargo_description" : val.cargo_description,
                    "etd_date" : val.etd_date,
                    "chasis_no" : val.chasis_no,
                    "yard_slot" : None,
                    "inspection_status" : "Open",
                    "yard_status" : "Open",
                    "final_status" : "Discharged",
                    "payment_status" : "Open",
                    "gate1_status" : "Open",
                    "gate2_status" : "Open"
                })
        doc.insert(ignore_permissions=True)
        doc.submit()


#    Create Container for Loading after Devanning
    def create_pre_advice_loading(self):
        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","last_port","qty",
        "container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
        "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
        "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status"], as_dict=True)

        if val.cargo_type == "Split Ports" and val.last_port == "NO":
            val.container_content = "FULL"

        if val.cargo_type != "Split Ports":
            val.container_content = "EMPTY"

        doc = frappe.new_doc("Pre Advice")
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
            "work_type" : "Loading",
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
            "seal_1" : val.seal_1,
            "seal_2" : val.seal_2,
            "eta_date" : val.eta_date,
            "cargo_description" : val.cargo_description,
            "etd_date" : val.etd_date,
            "chasis_no" : val.chasis_no,
            "yard_slot" : val.yard_slot,
            "inspection_status" : "Open",
            "status" : "Booked"
            })

        doc.insert(ignore_permissions=True)
        doc.submit()

    def create_restow_pre_advice_items(self):
        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty",
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
                    "cargo_type" : val.cargo_type,
                    "qty" : val.qty,
                    "container_no" : val.container_no,
                    "voyage_no" : val.voyage_no,
                    "bol" : val.bol,
                    "work_type" : "Re-stowing",
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
                    "yard_slot" : val.yard_slot,
                    "inspection_status" : "Open",
                    "status" : "Booked"

                })
        doc.insert(ignore_permissions=True)
        doc.submit()

    def check_export(self):
        container_number=None
#        val = frappe.db.get_value("Pre Advice", {"container_no": self.container_no, "name" : self.cargo_ref}, ["booking_ref", "name"], as_dict=True)
        container_number = frappe.db.sql("""Select name from `tabExport` where container_no=%s""", (self.container_no))

        if container_number:
#               msgprint(_("Check 1 {0}").format(container_number), raise_exception=1)
    #            container_ref = frappe.db.get_value("Export", {"container_no": self.container_no}, "name")
                val = frappe.db.get_value("Export", {"container_no": self.container_no}, ["name", "yard_slot",
                "main_gate_start","main_gate_ends","gate1_start","gate1_ends","driver_start",
                "container_type","container_size","pat_code","container_content","driver_ends","seal_1", "status"], as_dict=True)

                if val.container_content == "FULL" and val.status != "Paid":

                    msgprint(_("Please Check and Confirmed this container have been PAID"), raise_exception=1)
                if val.container_content == "EMPTY" and val.status != "Yard":
                    msgprint(_("Please Check and Confirmed this container has arrived at the GATE"), raise_exception=1)
#                if val.container_content == "FULL" and val.status == "Paid":
#                    val.status = "Paid"
                
#                msgprint(_("Check 1"), raise_exception=1)
                
                doc = frappe.new_doc("Export History")
                doc.update({
                        "yard_slot" : val.yard_slot,
                        "main_gate_start" : val.main_gate_start,
                        "main_gate_ends" : val.main_gate_ends,
                        "gate1_start": val.gate1_start,
                        "gate1_ends" : val.gate1_ends,
                        "driver_start" : val.driver_start,
                        "driver_ends" : val.driver_ends,
                        "container_type" : val.container_type,
                        "container_size" : val.container_size,
                        "pat_code" : val.pat_code,
                        "container_content" : val.container_content,
                        "seal_1" : val.seal_1,
                        "container_no" : self.container_no
                        })
                doc.insert(ignore_permissions=True)
                doc.submit()
                
#                msgprint(_("Check 2"), raise_exception=1)
    #            frappe.throw(_("Gate 1 {0}").format(vals.gate1_start))
                get_create_cargo("Pre Advice", self.cargo_ref, "Loading", "Export", self.cargo_type)
#                msgprint(_("Check 3"), raise_exception=1)
#                frappe.db.sql("""Update `tabPre Advice` set main_gate_start=%s, gate1_start=%s, driver_start=%s where container_no=%s""", (val.main_gate_start, val.gate1_start, val.driver_ends, self.container_no ))
                frappe.db.sql("""Update `tabCargo` set gate1_in=%s, maingate_in=%s where container_no=%s and cargo_ref=%s """, (val.gate1_start, val.main_gate_start, self.container_no, self.cargo_ref ))
                frappe.db.sql("""Delete from `tabExport` where container_no=%s""", self.container_no)
                self.moveto_preadvise_history()
                frappe.db.delete('Pre Advice', {'name': self.cargo_ref })


    def load_transhipment_cargo(self):
        container_number=None

        container_number = frappe.db.sql("""Select name from `tabTranshipment Cargo` where container_no=%s """, (self.container_no))

        if container_number:
            frappe.db.sql("""delete from `tabTranshipment Cargo` where container_no=%s""", self.container_no)

# Move Pre Advice Transaction to Pre Advice History
    def moveto_preadvise_history(self):

        val = frappe.db.get_value("Pre Advice", {"name": self.cargo_ref}, ["booking_ref","pat_code","net_weight","cargo_type","qty","container_no","voyage_no","bol","work_type","secondary_work_type","pol","agents","commodity_code","vessel","pod","temperature",
        "container_type","mark","final_dest_port","volume","container_size","consignee","container_content","stowage","hazardous","hazardous_code",
        "status","seal_1","seal_2","eta_date","cargo_description","etd_date","chasis_no","yard_slot","inspection_status","yard_status","final_status",
        "break_bulk_item_count","security_item_count"], as_dict=True)

        doc = frappe.new_doc("Pre Advise History")
        doc.update({
                    "cargo_ref": self.cargo_ref,
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
                    "status" : "Transfer",
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
        frappe.db.delete('Pre Advice', {'name': self.cargo_ref })