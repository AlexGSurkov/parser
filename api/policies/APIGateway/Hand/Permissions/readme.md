
Permission policies manual
===================

All policies have the same code.
Permission code is auto transformed from policy filename
from camelCased to snake_cased format.


Adding new policy with permission
-------------------

To add new policy with new permission code just copy policy "adminAccess"
to new file and name it as camelCased permission code.

Dont need to change code of policy.
Each policy gets permission code automatically from filename.


Example #1
-------------------

* Permission: **admin_access**
* Filename: **adminAccess**


Example #2
-------------------

* Permission: **app_kpi_create**
* Filename: **appKpiCreate**


**Tip**: remember that first letter of filename is lower-cased.
