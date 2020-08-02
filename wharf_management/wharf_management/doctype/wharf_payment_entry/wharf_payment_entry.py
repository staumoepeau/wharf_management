# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document


class WharfPaymentEntry(Document):
    
    def on_submit(self):
        self.check_duplicate_warrant_number()
        self.check_warrant_number()
        self.update_cargo_table()
#        self.change_status()

    
    def update_cargo_table(self):
        frappe.db.sql("""Update `tabCargo` INNER JOIN `tabCargo References` ON
		`tabCargo`.name = `tabCargo References`.reference_doctype
		set payment_status = 'Closed', 
		custom_warrant=%s, custom_code=%s, 
		delivery_code=%s, status='Paid' 
		where `tabCargo References`.parent=%s""", 
		(self.custom_warrant, self.delivery_code, self.delivery_information, self.name))

    def check_warrant_number(self):
        if not self.custom_warrant:
            frappe.msgprint(_("Custom Warrant Number is Required"), raise_exception=True)


    def check_duplicate_warrant_number(self):
        check_duplicate = frappe.db.sql("""Select custom_warrant from `tabWharf Payment Entry` where custom_warrant=%s having count(custom_warrant) > 1""", (self.custom_warrant))
        if check_duplicate:
            frappe.throw(_("Sorry You are duplicating this Warrant No "))

@frappe.whitelist()
def get_storage_days(eta_date, posting_date):
    working_days = get_holidays(eta_date, posting_date)
    storage_days = date_diff(posting_date, eta_date)
    storage_days -= len(working_days)
    return storage_days


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
    return frappe.db.sql("""select docB.item_code, docA.description, 
		Sum(docB.charged_storage_days) as qty, 
		Sum(docB.storage_fee_price) as price, 
		Sum(docB.charged_storage_days * docB.storage_fee_price) as total 
		from `tabCargo References` as docB, `tabStorage Fee` as docA  
		where docB.item_code = docA.item_name and docB.parent = %s group by docB.item_code""", (docname), as_dict=1)

@frappe.whitelist()	
def get_wharfage_fees(docname):
    return frappe.db.sql("""select docB.wharfage_item_code, docA.description, docB.wharfage_fee_price as price, 
		Count(docB.name) as qty,
		Sum(docB.wharfage_fee_price) as total
		from `tabCargo References` as docB, `tabWharfage Fee` as docA  
		where docB.wharfage_item_code = docA.item_name and docB.parent = %s group by docB.wharfage_item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_total_fees(docname):
    return frappe.db.sql("""select Sum(total) as total_fee
		from `tabWharf Fee Item` WHERE parent = %s """, (docname), as_dict=1)
    
