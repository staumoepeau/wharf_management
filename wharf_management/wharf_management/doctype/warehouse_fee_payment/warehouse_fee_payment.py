# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class WarehouseFeePayment(Document):

    def on_submit(self):
        self.check_warrant_number()
        self.update_payment_status()
        self.check_status()


    def check_status(self):
        frappe.db.sql("""UPDATE `tabWarehouse Fee Payment` SET status = 'Paid' WHERE name=%s""", self.name)

    def validate(self):
        self.check_duplicate_warrant_number()


    def check_warrant_number(self):
        if not self.custom_warrant:
            frappe.msgprint(_("Custom Warrant Number is Required"), raise_exception=True)


    def check_duplicate_warrant_number(self):
        check_duplicate = None
        check_duplicate = frappe.db.sql("""Select custom_warrant from `tabWarehouse Fee Payment` where custom_warrant=%s having count(custom_warrant) > 1""", (self.custom_warrant))

        if check_duplicate:
            frappe.throw(_("Sorry You are duplicating this Warrant No : {0} ").format(self.custom_warrant))

    def update_payment_status(self):
             frappe.db.sql("""Update `tabCargo Warehouse` INNER JOIN `tabCargo Warehouse Table` ON
        `tabCargo Warehouse`.name = `tabCargo Warehouse Table`.cargo_warehouse
        set `tabCargo Warehouse`.payment_status='Closed', `tabCargo Warehouse`.status='Paid', `tabCargo Warehouse`.warrant_no=%s, vehicle_licenses_plate=%s, driver_information=%s
        where `tabCargo Warehouse Table`.parent=%s""", (self.custom_warrant, self.vehicle_licenses_plate, self.driver_information, self.name))

@frappe.whitelist()
def get_storage_days(eta_date, posting_date):
    working_days = get_holidays(eta_date, posting_date)
    storage_days = date_diff(posting_date, eta_date)
    storage_days -= len(working_days)
    return storage_days

@frappe.whitelist()
def get_holidays(start_date, end_date):
    holiday_list = frappe.db.get_value("Company", "Ports Authority Tonga", "default_holiday_list")
    holidays = frappe.db.sql_list('''select holiday_date  from `tabHoliday` where
		    parent=%(holiday_list)s
		    and holiday_date >= %(start_date)s
		    and holiday_date <= %(end_date)s''', {
		    "holiday_list": holiday_list,
		    "start_date": start_date,
		    "end_date": end_date
		    })
    holidays = [cstr(i) for i in holidays]
    return holidays

@frappe.whitelist()
def get_storage_fees(docname):
    return frappe.db.sql("""select docB.item_code, docA.description, docB.storage_fee_price as price,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight * docB.charged_storage_days) ELSE Sum(docB.volume * docB.charged_storage_days) END
        WHEN docB.cargo_type IN ("Container","Flatrack", "Vehicles") THEN (Count(docA.item_name) * docB.charged_storage_days) 
        END AS qty,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight * docB.charged_storage_days * docB.storage_fee_price) ELSE Sum(docB.volume * docB.charged_storage_days * docB.storage_fee_price) END
        WHEN docB.cargo_type IN ("Container","Flatrack", "Vehicles") THEN (Count(docA.item_name) * docB.charged_storage_days)
        END AS total
        from `tabCargo Warehouse Table` as docB, `tabWharf Fees` as docA
		where docB.item_code = docA.item_name and docB.parent = %s group by docB.item_code""", (docname), as_dict=1)
