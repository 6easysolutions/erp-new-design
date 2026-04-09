const Url = 'http://15.206.165.189:5125/';
// const Url = 'http://15.206.165.189:5001/';



export const URLS = {
  Base: Url,
  ImageUrl: Url,

  //Auth
  LogIn: Url + 'v1/pmsApi/vendor/auth/vendorlogin',
  ForgetPassword: Url + 'v1/pmsApi/vendor/auth/sendotp',
  VerifyOtp: Url + 'v1/pmsApi/vendor/auth/compareotp',
  ResetPassword: Url + 'v1/pmsApi/vendor/auth/resetpassword',

  //Profile
  GetProfile: Url + 'v1/pmsApi/vendor/auth/vendorgetprofile',
  UpdateProfile: Url + 'v1/pmsApi/vendor/auth/vendorupdateprofile',
  ChangePassword: Url + 'v1/pmsApi/vendor/auth/vendorchangepassword',



  //GetService
  GetService: Url + 'v1/pmsApi/admin/service/getallserives',

  //Stock Transfer
  GetAllStockTransfers: Url + 'v1/pmsApi/vendor/stockTransfer/getAllStockTransfers',
  GetStockTransferById: Url + 'v1/pmsApi/vendor/stockTransfer/getStockTransferById',
  CreateStockTransfer: Url + 'v1/pmsApi/vendor/stockTransfer/createStockTransfer',
  UpdateStockTransfer: Url + 'v1/pmsApi/vendor/stockTransfer/updateStockTransferStatus',

  //Salesman
  AddSalesman: Url + 'v1/pmsApi/vendor/salesman/add',
  GetSalesmans: Url + 'v1/pmsApi/vendor/salesman/getallsalesmans',
  EditSalesman: Url + 'v1/pmsApi/vendor/salesman/editsalesman/',
  DeleteSalesman: Url + 'v1/pmsApi/vendor/salesman/deletsalesman/',

  //Store
  AddStore: Url + 'v1/pmsApi/vendor/store/addstore',
  GetAllStore: Url + 'v1/pmsApi/vendor/store/getallstores',
  EditStore: Url + 'v1/pmsApi/vendor/store/editstore/',
  DeleteStore: Url + 'v1/pmsApi/vendor/store/deletestore/',
  GetByStoreId: Url + 'v1/pmsApi/vendor/store/getstorebyid',


  //Item Master
  AddItemMaster: Url + 'v1/pmsApi/vendor/itemmasterlist/addditemmasterlist',



  //New Postgres 



  //Unit
  AddUnit: Url + 'v1/pms/vendor/unitmaster/adddunitmaster',
  GetUnit: Url + 'v1/pms/vendor/unitmaster/getallunitmaster',
  EditUnit: Url + 'v1/pms/vendor/unitmaster/editunitmaster/',
  DeleteUnit: Url + 'v1/pms/vendor/unitmaster/deleteunitmaster/',

  //Brand
  AddBrand: Url + 'v1/pmsApi/vendor/brands/adddbrand',
  GetBrand: Url + 'v1/pmsApi/vendor/brands/getallbrand',
  EditBrand: Url + 'v1/pmsApi/vendor/brands/editbrand/',
  DeleteBrand: Url + 'v1/pmsApi/vendor/brands/deletebrand/',

  //Stock Reason
  //Stock Reason
  AddStockReason: Url + "v1/pmsApi/vendor/reasonCode/addReason",
  GetStockReason: Url + "v1/pmsApi/vendor/reasonCode/getAllReasonCodes",
  EditStockReason: Url + "v1/pmsApi/vendor/reasonCode/editReasonCode/",
  DeleteStockReason: Url + "v1/pmsApi/vendor/reasonCode/deleteReasonCode/",

  //Item Name
  AddItemName: Url + 'v1/pmsApi/vendor/itemname/addditemname',
  GetItemName: Url + 'v1/pmsApi/vendor/itemname/getallitemname',
  EditItemName: Url + 'v1/pmsApi/vendor/itemname/edititemname/',
  DeleteItemName: Url + 'v1/pmsApi/vendor/itemname/deleteitemname/',

  //Size
  AddSize: Url + 'v1/pmsApi/vendor/size/adddsize',
  GetSize: Url + 'v1/pmsApi/vendor/size/getallsize',
  EditSize: Url + 'v1/pmsApi/vendor/size/editsize/',
  DeleteSize: Url + 'v1/pmsApi/vendor/size/deletesize/',

  //Colour
  AddColour: Url + 'v1/pmsApi/vendor/colour/adddcolours',
  GetColour: Url + 'v1/pmsApi/vendor/colour/getallcolours',
  EditColour: Url + 'v1/pmsApi/vendor/colour/editcolours/',
  DeleteColour: Url + 'v1/pmsApi/vendor/colour/deletecolours/',

  //Style
  AddStyle: Url + 'v1/pmsApi/vendor/style/adddstyle',
  GetStyle: Url + 'v1/pmsApi/vendor/style/getallstyle',
  EditStyle: Url + 'v1/pmsApi/vendor/style/editstyle/',
  DeleteStyle: Url + 'v1/pmsApi/vendor/style/deletestyle/',

  //HSN/SAC
  AddHsnSac: Url + 'v1/pmsApi/vendor/hsnsac/adddhnsac',
  GetHsnSac: Url + 'v1/pmsApi/vendor/hsnsac/getallhnsac',
  EditHsnSac: Url + 'v1/pmsApi/vendor/hsnsac/edithnsac/',
  DeleteHsnSac: Url + 'v1/pmsApi/vendor/hsnsac/deletehnsac/',

  //Category
  AddCategory: Url + 'v1/pmsApi/vendor/category/adddcategory',
  GetCategory: Url + 'v1/pmsApi/vendor/category/getallcategory',
  EditCategory: Url + 'v1/pmsApi/vendor/category/editcategory/',
  DeleteCategory: Url + 'v1/pmsApi/vendor/category/deletecategory/',

  //Subcategory
  AddSubCategory: Url + 'v1/pmsApi/vendor/subcategory/adddsubcategory',
  GetSubCategory: Url + 'v1/pmsApi/vendor/subcategory/getallsubcategory',
  EditSubCategory: Url + 'v1/pmsApi/vendor/subcategory/editsubcategory/',
  DeleteSubCategory: Url + 'v1/pmsApi/vendor/subcategory/deletesubcategory/',
  GetByCategoryID: Url + "v1/pmsApi/vendor/subcategory/getsubcategoriesunderondemandcategoryid",

  //Racks
  AddRack: Url + 'v1/pmsApi/vendor/rack/adddrack',
  GetRack: Url + 'v1/pmsApi/vendor/rack/getallrack',
  EditRack: Url + 'v1/pmsApi/vendor/rack/editrack/',
  DeleteRack: Url + 'v1/pmsApi/vendor/rack/deleterack/',

  //ItemType
  AddItemType: Url + 'v1/pmsApi/vendor/itemtype/addditemtype',
  GetItemType: Url + 'v1/pmsApi/vendor/itemtype/getallitemtype',
  EditItemType: Url + 'v1/pmsApi/vendor/itemtype/edititemtype/',
  DeleteItemType: Url + 'v1/pmsApi/vendor/itemtype/deleteitemtype/',

  //GST
  AddGst: Url + 'v1/pmsApi/vendor/gst/add-gst',
  GetGst: Url + 'v1/pmsApi/vendor/gst/getall-gst',
  EditGst: Url + 'v1/pmsApi/vendor/gst/edit-gst/',
  DeleteGst: Url + 'v1/pmsApi/vendor/gst/delete-gst/',

  //Quantity
  GetQuantityType: Url + "v1/pmsApi/vendor/weight/getall",
  AddQuantityType: Url + "v1/pmsApi/vendor/weight/addd",
  EditQuantityType: Url + "v1/pmsApi/vendor/weight/edit/",
  DeleteQuantityType: Url + "v1/pmsApi/vendor/weight/delete/",

  //UOM Type
  AddUomType: Url + 'v1/pmsApi/vendor/uomtypes/adduomtype',
  GetAllUomTypes: Url + 'v1/pmsApi/vendor/uomtypes/getalluomtypes',
  EditUomType: Url + 'v1/pmsApi/vendor/uomtypes/edituomtype/',
  DeleteUomType: Url + 'v1/pmsApi/vendor/uomtypes/deleteuomtype/',

  //Products
  GetStoreProductById: Url + "v1/pmsApi/vendor/store_product/getproductbyid",

  GetProductById: Url + "v1/pmsApi/vendor/library_product/getproductbyid",
  GetProductsFromLibrary: Url + "v1/pmsApi/vendor/library_product/getallproducts/?searchQuery=",
  AddProduct: Url + "v1/pmsApi/vendor/store_product/addproduct",
  UpdateProduct: Url + "v1/pmsApi/vendor/store_product/editproduct",

  SearchByStore: Url + "v1/pmsApi/vendor/store_product/getallproduct",
  GetProductsByCategory: Url + "v1/pmsApi/vendor/library_product/get-store-products-by-categoryid",
  SearchByBarcode: Url + "v1/pmsApi/vendor/store_product/get-products-by-barcode/?searchQuery=",

  // Stock Adjustment
  AddStockAdjustment: Url + 'v1/pmsApi/vendor/stockAdjustment/create',
  GetStockAdjustments: Url + 'v1/pmsApi/vendor/stockAdjustment/getAll',
  EditStockAdjustment: Url + 'v1/pmsApi/vendor/stockAdjustment/update/',
  GetProductHistory: Url + 'v1/pmsApi/vendor/stockAdjustment/getProductHistory',

  // Write Off
  CreateWriteOff: Url + "v1/pmsApi/vendor/writeoff/create",
  GetAllWriteOffsapi: Url + "v1/pmsApi/vendor/writeoff/getAllByStore",


  //POS

  //Orders
  AddPosOrder: Url + "v1/pmsApi/vendor/pos-order/addpos",
  GetAllPosOrders: Url + "v1/pmsApi/vendor/pos-order/getpos",

  //Products
  GetAllStoreProducts: Url + "v1/pmsApi/vendor/store_product/getallproduct",

  // Supplier
  AddSupplier: Url + "v1/pmsApi/vendor/new-supplier-setting/adddsuppliersetting",
  GetSuppliers: Url + "v1/pmsApi/vendor/new-supplier-setting/getallsuppliersetting",

  //Customer 
  AddCustomer: Url + "v1/pmsApi/vendor/new-customer-setting/adddcustomersetting",
  GetAllCustomers: Url + "v1/pmsApi/vendor/new-customer-setting/getallcustomersetting",


  //Locations
  GetCountries: Url + "v1/pmsApi/vendor/docs/getallcountries",
  GetStates: Url + "v1/pmsApi/vendor/docs/getstatesbycountryid",
  GetCities: Url + "v1/pmsApi/vendor/docs/getcitiesbystateid",

  //Purchase
  NewPurchaseOrder: Url + "v1/pmsApi/vendor/purchase-order/add",
  GetAllDrafts: Url + "v1/pmsApi/vendor/purchase-order/get-isdraft-list",
  GetAllPurchases: Url + "v1/pmsApi/vendor/purchase-order/getall",
  PurchaseEdit: Url + "v1/pmsApi/vendor/purchase-order/update",
  GetPurchseById: Url + "v1/pmsApi/vendor/purchase-order/getbyid",
  GetPurchasesBySupplier: Url + "v1/pmsApi/vendor/purchase-order/get-purchase-orders-by-supplierId",
  SearchPurchasedItemBySupplier: Url + "v1/pmsApi/vendor/purchase-order/get-purchase-orders-by-itemname",
  NewPurchaseReturn: Url + "v1/pmsApi/vendor/purchase-order/create-return-orders",

  PurchaseReturnEdit: Url + "v1/pmsApi/vendor/purchase-order/update-return-product",
  GetAllPurchaseReturns: Url + "v1/pmsApi/vendor/purchase-order/get-return-orders",
  GetBatchIdByProductId: Url + "v1/pmsApi/vendor/purchase-order/getBatchIdByProductId",


  //Warehouse
  AddWarehouse: Url + 'v1/pmsApi/vendor/warehouse/add',
  GetWarehouse: Url + 'v1/pmsApi/vendor/warehouse/getall',
  EditWarehouse: Url + 'v1/pmsApi/vendor/warehouse/update/',
  DeleteWarehouse: Url + 'v1/pmsApi/vendor/warehouse/delete/',

  //Inventory Counts
  GetInventoryCounts: Url + 'v1/pmsApi/vendor/inventoryCounts/getInventoryCounts',
  GetLoadItems: Url + 'v1/pmsApi/vendor/inventoryCounts/getLoadItems',
  CreateInventoryCounts: Url + 'v1/pmsApi/vendor/inventoryCounts/createInventoryCounts',
  GetInventoryCountBySessionId: Url + 'v1/pmsApi/vendor/inventoryCounts/getBySessionId',
  SavePhysicalCounts: Url + 'v1/pmsApi/vendor/inventoryCounts/savePhysicalounts',
  UpdateApprovalStatus: Url + 'v1/pmsApi/vendor/inventoryCounts/approvalStatus',

  //Internal Orders
  LoadItems: Url + 'v1/pmsApi/vendor/intenalOrders/LoadItems',
  AddInternalOrder: Url + 'v1/pmsApi/vendor/intenalOrders/addInternalOrder',
  GetAllInternalOrders: Url + 'v1/pmsApi/vendor/intenalOrders/getAllInternalOrders',
  GetOrderById: Url + 'v1/pmsApi/vendor/intenalOrders/getOrderById',
  UpdateInternalOrderStatus: Url + 'v1/pmsApi/vendor/intenalOrders/updateInternalOrderStatus',

  //Stock
  GetStock: Url + 'v1/pmsApi/vendor/stock/get',
  GetStockMovement: Url + 'v1/pmsApi/vendor/stockMovement/get',



  //////////////////////////////////Hrms-Start///////////////////////////////////

  //Team
  AddHrmsTeam: Url + "v1/pmsApi/hrms/app/team/createTeam",
  GetHrmsTeam: Url + "v1/pmsApi/hrms/app/team/getAllTeams",
  EditHrmsTeam: Url + "v1/pmsApi/hrms/app/team/updateTeam/",
  DeleteHrmsTeam: Url + "v1/pmsApi/hrms/app/team/deleteTeam/",

  //Organization
  AddHrmsOrganization:
    Url + "v1/pmsApi/hrms/app/organization/createOrganization",
  GetHrmsOrganizations:
    Url + "v1/pmsApi/hrms/app/organization/getOrganizations",
  EditHrmsOrganization:
    Url + "v1/pmsApi/hrms/app/organization/updateOrganization/",
  DeleteHrmsOrganization:
    Url + "v1/pmsApi/hrms/app/organization/deactivateOrganization/",
  ActiveinActiveHrmsOrganization:
    Url + "v1/pmsApi/hrms/app/organization/deactivateOrganization/",

  //Designation
  AddHrmsDesignation:
    Url + "v1/pmsApi/hrms/admin/designation/createDesignation",
  GetHrmsDesignations:
    Url + "v1/pmsApi/hrms/admin/designation/getAllDesignations",
  EditHrmsDesignation:
    Url + "v1/pmsApi/hrms/admin/designation/updateDesignation/",
  DeleteHrmsDesignation:
    Url + "v1/pmsApi/hrms/admin/designation/deleteDesignation/",

  //Departments
  AddHrmsDepartments: Url + "v1/pmsApi/hrms/admin/department/createDepartment",
  GetHrmsDepartments: Url + "v1/pmsApi/hrms/admin/department/getAllDepartments",
  EditHrmsDepartments:
    Url + "v1/pmsApi/hrms/admin/department/updateDepartment/",
  DeleteHrmsDepartments:
    Url + "v1/pmsApi/hrms/admin/department/deleteDepartment/",

  //Employee
  AddHrmsEmployee: Url + "v1/pmsApi/hrms/app/user/createEmployee",
  GetHrmsEmployee: Url + "v1/pmsApi/hrms/app/user/getAllEmployees",
  GetOneHrmsEmployee: Url + "v1/pmsApi/hrms/app/user/getEmployee/",
  EditHrmsEmployee: Url + "v1/pmsApi/hrms/app/user/updateEmployee/",
  DeleteHrmsEmployee: Url + "v1/pmsApi/hrms/app/user/deleteEmployee/",

  GetHrmsOrgChart: Url + "v1/pmsApi/hrms/app/user/updateEmployee/",

  AddHrmsEmployeeProfileField:
    Url + "v1/pmsApi/hrms/app/user/updateProfileField",
  AddHrmsEmployeeProfileFieldGroup:
    Url + "v1/pmsApi/hrms/app/user/profileFieldGroup",
  EditHrmsEmployeeProfileField:
    Url + "v1/pmsApi/hrms/app/user/updateProfileField",
  EditHrmsEmployeeProfileFieldGroup:
    Url + "v1/pmsApi/hrms/app/user/profileFieldGroup",

  //Leave
  AddHrmsLeaveApply: Url + "v1/pmsApi/hrms/app/leave/applyLeave",
  GetHrmsLeaveApply: Url + "v1/pmsApi/hrms/app/leave/getAllLeaves",
  EditHrmsLeaveApply: Url + "v1/pmsApi/hrms/app/leave/updateLeave/",
  DeleteHrmsLeaveApply: Url + "v1/pmsApi/hrms/app/user/deleteEmployee/",

  //LeaveBalance
  GetHrmsLeaveBalance: Url + "v1/pmsApi/hrms/app/leave/getLeaveBalance/",

  //Attendance
  HrmsAttendanceCheckIn: Url + "v1/pmsApi/hrms/app/attendance/checkIn",
  HrmsAttendanceCheckOut: Url + "v1/pmsApi/hrms/app/attendance/checkOut",
  EditHrmsAttendance: Url + "v1/pmsApi/hrms/app/attendance/updateAttendance/",
  GetHrmsAttendance:
    Url + "v1/pmsApi/hrms/app/attendance/getAllEmployeeAttendances",
  GetAllHrmsAttendance:
    Url + "v1/pmsApi/hrms/app/attendance/getMonthlyAttendance",
  GetOneHrmsAttendance:
    Url + "/v1/pmsApi/hrms/app/attendance/getEmployeeAttendancee/",

  //Requests
  AddHrmsRequests: Url + "v1/pmsApi/hrms/app/request/createRequest",
  ApproveHrmsRequests: Url + "v1/pmsApi/hrms/app/request/approveRequest/",
  RejectHrmsRequests: Url + "v1/pmsApi/hrms/app/request/rejectRequest/",
  GetAllHrmsPendingRequests:
    Url + "v1/pmsApi/hrms/app/request/getPendingRequests",
  HrmsRequestBytype: Url + "v1/pmsApi/hrms/app/request/getRequestsByType",

  //HrmsOnboarding
  AddHrmsOnboarding: Url + "v1/pmsApi/hrms/admin/onboarding/createCandidate",
  GetHrmsOnboarding: Url + "v1/pmsApi/hrms/admin/onboarding/getAllCandidates",
  GetHrmsGenerateOnboarding:
    Url + "v1/pmsApi/hrms/admin/onboarding/generateOfferLetter",
  GetHrmsReleaseOnboarding:
    Url + "v1/pmsApi/hrms/admin/onboarding/releaseOfferLetter",
  UpdateHrmsOnboarding:
    Url + "v1/pmsApi/hrms/admin/onboarding/updateOfferStatus/",
  GetAllHrmsOnboarding: Url + "v1/pmsApi/hrms/admin/onboarding/getAllOffers",
  CreateHrmsOnboarding:
    Url + "v1/pmsApi/hrms/admin/onboarding/createEmployeeFromCandidate",

  //Salary
  AddHrmsSalary: Url + "v1/pmsApi/hrms/admin/salary/setSalaryStructure",
  GetHrmsSalary: Url + "v1/pmsApi/hrms/admin/salary/getSalaryStructure/",
  GetHrmsSalaryGeneratePayRole:
    Url + "v1/pmsApi/hrms/admin/salary/generatePayroll",
  GetHrmsSalaryGeneratePayslip: Url + "v1/pmsApi/hrms/admin/salary/getPayslip/",
  GetHrmsAllSalaryGeneratePayRole:
    Url + "v1/pmsApi/hrms/admin/salary/getAllPayrolls",

  //Clients
  AddHrmsClients: Url + "v1/pmsApi/hrms/app/clients/createClient",
  GetHrmsClients: Url + "v1/pmsApi/hrms/app/clients/getAllClients",
  EditHrmsClients: Url + "v1/pmsApi/hrms/app/clients/updateClient/",
  DeleteHrmsClients: Url + "v1/pmsApi/hrms/app/clients/deleteClient/",

  //Leave Rules
  AddHrmsLeaveRules: Url + "v1/pmsApi/hrms/app/leave-rule/add-leave-rule",
  GetHrmsLeaveRules: Url + "v1/pmsApi/hrms/app/leave-rule/getAllLeave-rules",
  EditHrmsLeaveRules: Url + "v1/pmsApi/hrms/app/leave-rule/updateleave-rule/",
  DeleteHrmsLeaveRules: Url + "v1/pmsApi/hrms/app/leave-rule/deleteLeave-rule/",

  //Holidays
  AddHrmsHoliday: Url + "v1/pmsApi/hrms/admin/holiday/createHoliday",
  GetHrmsHoliday: Url + "v1/pmsApi/hrms/admin/holiday/getAllHolidays",
  EditHrmsHoliday: Url + "v1/pmsApi/hrms/admin/holiday/updateHoliday/",
  DeleteHrmsHoliday: Url + "v1/pmsApi/hrms/admin/holiday/deleteHoliday/",

  //Projects
  AddHrmsProjectssaveTimesheet:
    Url + "v1/pmsApi/hrms/app/project/saveTimesheet",
  GetHrmsProjectsgetTimesheet: Url + "v1/pmsApi/hrms/app/project/getTimesheet",

  //////////////////////////////////Hrms-End///////////////////////////////////


};
