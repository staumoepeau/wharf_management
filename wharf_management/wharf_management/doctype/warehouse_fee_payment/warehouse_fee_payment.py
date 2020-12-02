# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt
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
            frappe.throw(_("Sorry You are duplicating this Warrant No : {0} ").format(check_duplicate))

    def update_payment_status(self):
             frappe.db.sql("""Update `tabCargo Warehouse` INNER JOIN `tabCargo Warehouse Table` ON
        `tabCargo Warehouse`.name = `tabCargo Warehouse Table`.cargo_warehouse
        set `tabCargo Warehouse`.payment_status='Closed', `tabCargo Warehouse`.status='Paid', `tabCargo Warehouse`.warrant_no=%s, vehicle_licenses_plate=%s, driver_information=%s
        where `tabCargo Warehouse Table`.parent=%s""", (self.custom_warrant, self.vehicle_licenses_plate, self.driver_information, self.name))

@frappe.whitelist()
def get_storage_fees(docname):
    return frappe.db.sql("""select docB.item_code, docA.description,
        Sum(docB.charged_storage_days) as qty,
        Sum(docB.storage_fee_price) as price,
        Sum(docB.storage_fee) as total
        from `tabCargo Warehouse Table` as docB, `tabWharf Fees` as docA
        WHERE docB.item_code = docA.item_name AND docB.parent = %s group by docB.item_code""", (docname), as_dict=1)