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
        self.check_status()

        if self.reference_doctype == "Cargo":
            self.check_warrant_number()
            self.check_duplicate_warrant_number()
            self.update_cargo_table()

        if self.reference_doctype == "Overdue Storage":
            self.update_cargo_overdue_table()
        
        if self.reference_doctype == "Booking Request":
            self.update_booking_request()
        
        if self.reference_doctype == "Export":
            self.check_warrant_number()
            self.check_duplicate_warrant_number()
            self.update_export()

    def check_status(self):
        if self.status != "Paid":
            self.status = "Paid"

#    def check_payment(self):
#        if self.total_amount != self.paid_amount:
#            frappe.throw(_("Please Check Your Paid Amount"))
        
#        if self.outstanding_amount > 0:
#            frappe.throw(_("Please Check double check your Payment Amount"))


    def update_export(self):
        frappe.db.sql("""Update `tabExport` INNER JOIN `tabExport Cargo Reference` ON
		`tabExport`.name = `tabExport Cargo Reference`.export_reference_doctype
		set payment_status = 'Closed',
		status='Paid'
		where `tabExport Cargo Reference`.parent=%s""", (self.name))

    def update_booking_request(self):
        frappe.db.sql("""Update `tabBooking Request` INNER JOIN `tabBooking Request References` ON
		`tabBooking Request`.name = `tabBooking Request References`.booking_reference_doctype
		set payment_status = 'Closed',
		status='Paid'
		where `tabBooking Request References`.parent=%s""", (self.name))


    def update_cargo_table(self):
        frappe.db.sql("""Update `tabCargo` INNER JOIN `tabCargo References` ON
		`tabCargo`.name = `tabCargo References`.reference_doctype
		set payment_status = 'Closed',
        payment_date = %s,
		custom_warrant=%s, custom_code=%s,
		delivery_code=%s, status='Paid'
		where `tabCargo References`.parent=%s""",
		(self.modified, self.custom_warrant, self.delivery_code, self.delivery_information, self.name))
    
    def update_cargo_overdue_table(self):
        frappe.db.sql("""Update `tabCargo` INNER JOIN `tabCargo References` ON
		`tabCargo`.name = `tabCargo References`.reference_doctype
		set overdue_storage_status = "Clear"
		where `tabCargo References`.parent=%s""",
		(self.name))

    def check_warrant_number(self):
        if not self.custom_warrant:
            frappe.msgprint(_("Custom Warrant Number is Required"), raise_exception=True)


    def check_duplicate_warrant_number(self):
        check_duplicate = frappe.db.sql("""Select custom_warrant from `tabWharf Payment Entry` where custom_warrant=%s having count(custom_warrant) > 1""", (self.custom_warrant))
        if check_duplicate:
            frappe.throw(_("Sorry You are duplicating this Warrant No : {0} ").format(check_duplicate))

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
def get_booking_handling_fee(docname):
    return frappe.db.sql("""SELECT item_code, handling_fee
		FROM `tabBooking Request References`
		WHERE parent = %s""", (docname), as_dict=1)

@frappe.whitelist()
def get_booking_berthed_fee(docname):
    return frappe.db.sql("""select berthed_fee_code, berthed_fee
		from `tabBooking Request References`
		WHERE parent = %s""", (docname), as_dict=1)

@frappe.whitelist()
def get_storage_fees(docname):
    return frappe.db.sql("""select docB.item_code, docA.description, docB.storage_fee_price as price,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight * docB.charged_storage_days) ELSE Sum(docB.volume * docB.charged_storage_days) END
        WHEN docB.cargo_type IN ("Container","Flatrack", "Vehicles") THEN (Count(docA.item_name) * docB.charged_storage_days)
        WHEN docB.cargo_type IN ("Tank Tainers") THEN Sum(docB.litre/1000) 
        END AS qty,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight * docB.charged_storage_days * docB.storage_fee_price) ELSE Sum(docB.volume * docB.charged_storage_days * docB.storage_fee_price) END
        WHEN docB.cargo_type IN ("Container","Flatrack", "Vehicles") THEN (docB.storage_fee_price * docB.charged_storage_days)
        WHEN docB.cargo_type IN ("Tank Tainers") THEN Sum(docB.litre/1000) 
        END AS total
        from `tabCargo References` as docB, `tabWharf Fees` as docA
		where docB.wharfage_item_code = docA.item_name and docB.parent = %s group by docB.wharfage_item_code""", (docname), as_dict=1)

#    return frappe.db.sql("""select docB.item_code, docA.description,
#		Sum(docB.charged_storage_days) as qty,
#		Sum(docB.storage_fee_price) as price,
#		Sum(docB.storage_fee) as total
#		from `tabCargo References` as docB, `tabWharf Fees` as docA
#		WHERE docB.wharfage_item_code = docA.item_name AND docB.parent = %s group by docB.item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_wharfage_fees(docname):
    return frappe.db.sql("""select docB.wharfage_item_code, docA.description, docB.wharfage_fee_price as price,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight) ELSE Sum(docB.volume) END
        WHEN docB.cargo_type IN ("Container", "Flatrack", "Vehicles") THEN Count(docA.item_name)
        WHEN docB.cargo_type IN ("Tank Tainers") THEN Sum(docB.litre/1000) 
        END AS qty,
        Sum(docB.wharfage_fee) as total
        from `tabCargo References` as docB, `tabWharf Fees` as docA
		where docB.wharfage_item_code = docA.item_name and docB.parent = %s group by docB.wharfage_item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_export_storage_fees(docname):
    return frappe.db.sql("""select docB.item_code, docA.description,
		Sum(docB.charged_storage_days) as qty,
		Sum(docB.storage_fee_price) as price,
		Sum(docB.storage_fee) as total
		from `tabExport Cargo Reference` as docB, `tabWharf Fees` as docA
		WHERE docB.wharfage_item_code = docA.item_name AND docB.parent = %s group by docB.item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_export_wharfage_fees(docname):
    return frappe.db.sql("""select docB.wharfage_item_code, docA.description, docB.wharfage_fee_price as price,
        CASE 
            WHEN docB.cargo_type IN ("Heavy Vehicles", "Break Bulk", "Loose Cargo", "Split Ports") 
            THEN 
                CASE 
                WHEN Sum(docB.volume) < Sum(docB.net_weight)
                    THEN Sum(docB.net_weight) ELSE Sum(docB.volume) END
        WHEN docB.cargo_type IN ("Container","Flatrack", "Vehicles") THEN Count(docA.item_name)
        WHEN docB.cargo_type IN ("Tank Tainers") THEN Sum(docB.litre/1000) 
        END AS qty,
        Sum(docB.wharfage_fee) as total
        from `tabExport Cargo Reference` as docB, `tabWharf Fees` as docA
		where docB.wharfage_item_code = docA.item_name and docB.parent = %s group by docB.wharfage_item_code""", (docname), as_dict=1)

@frappe.whitelist()
def get_total_fees(docname):
    return frappe.db.sql("""select Sum(total) as total_fee
		from `tabWharf Fee Item` WHERE parent = %s """, (docname), as_dict=1)