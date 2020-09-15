# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoStockReconciliation(Document):
    

    def on_submit(self):
        self.update_yard_layout()


    def update_yard_layout(self):
        frappe.db.sql("""Update `tabCargo` INNER JOIN `tabCargo Reconciliation` ON
		`tabCargo`.name = `tabCargo Reconciliation`.reference_doctype
		set `tabCargo`.yard_slot = `tabCargo Reconciliation`.new_yard_slot, 
		`tabCargo`.stock_date = %s, `tabCargo`.stock_count = 1, `tabCargo`.stock_take_by = %s
		where `tabCargo Reconciliation`.parent=%s""",
		(self.posting_date, self.owner, self.name))
