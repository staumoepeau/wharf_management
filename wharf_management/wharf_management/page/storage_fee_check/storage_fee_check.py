from __future__ import unicode_literals
import frappe
from frappe.utils import cint

@frappe.whitelist()
def get_container_info(cargo_ref):
    return frappe.db.sql("""select name, cargo_type, container_no, eta_date
		from `tabCargo` where name=%s""",(cargo_ref), as_dict=True)

