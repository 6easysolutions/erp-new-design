import { all_routes } from "../../routes/all_routes";
import { printer } from "../../utils/imagepath";

export const SidebarData1 = [
  {
    tittle: "Dashboard",
    icon: "layout-dashboard",
    route: "/sales-dashboard",
    hasSubRoute: false,
    subRoutes: []
  },
  {
    tittle: "Set Up",
    hasSubRoute: true,
    icon: "layout-grid",
    showSubRoute: false,
    activeRoute: "users",
    subRoutes: [

      {
        tittle: "Configuration",
        hasSubRoute: true,
        showSubRoute: false,
        subRoutes: [
          {
            tittle: "Store Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.storesetting,
            subRoutes: []
          },
          {
            tittle: "Item Master Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.itemmastersettings,
            subRoutes: []
          },
          {
            tittle: "Purchase Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.purchasesettings,
            subRoutes: []
          },
          {
            tittle: "Search Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.searchsettings,
            subRoutes: []
          },

          {
            tittle: "Sale Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.salesettings,
            subRoutes: []
          },
          {
            tittle: "Sale Setting(GST Configuration)",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.salesettingsgst,
            subRoutes: []
          },
          {
            tittle: "Account Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.accountsettings,
            subRoutes: []
          },
          {
            tittle: "WhatsApp Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.whatsappsettings,
            subRoutes: []
          },
          {
            tittle: "Customer Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.customersettings,
            subRoutes: []
          },
          {
            tittle: "Supplier Setting",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.suppliersettings,
            subRoutes: []
          }
        ]







      },


      {
        tittle: "Manage",
        hasSubRoute: true,
        showSubRoute: false,
        route: "/sales-list",
        subRoutes: [
          {
            tittle: "Operator",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/invoice-setting",
            subRoutes: []
          },
          {
            tittle: "Supplier",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/invoice-settings",
            subRoutes: []
          },
          {
            tittle: "POS / Bill Setup",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/sales-returns",
            subRoutes: []
          },
          {
            tittle: "Master Barcode Setup",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/quotation-list",
            subRoutes: []
          },
          {
            tittle: "Other Charges Master",
            hasSubRoute: true,
            showSubRoute: true,
            route: "/pos",
            subRoutes: []
          },
          {
            tittle: "Barcode Setup",
            hasSubRoute: true,
            showSubRoute: true,
            route: "/pos",
            subRoutes: []
          }
        ]

      },
      {
        tittle: "Master",
        hasSubRoute: true,
        showSubRoute: false,
        activeRoute: "promo",
        subRoutes: [

          {
            tittle: "All Masters",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/all-masters",
            subRoutes: []
          },
          {
            tittle: "Item Master Update By Excel",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/item-master-update-by-excel",
            subRoutes: []
          },
        ]

      },
      {
        tittle: "Sales Man",
        hasSubRoute: true,
        showSubRoute: false,
        activeRoute: "users",
        subRoutes: [

          {
            tittle: "New Salesman",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/salesman",
            subRoutes: []
          },
          {
            tittle: "Salesman Commission",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/purchase-order-report",
            subRoutes: []
          },
        ]

      },
      {
        tittle: "Membership & Coupon",
        hasSubRoute: true,
        showSubRoute: true,
        //   route: routes.stockTransfer,
        subRoutes: [
          {


            tittle: "Card Master",
            route: "/expense-list"
          },
          {
            tittle: "Generate Card Number",
            route: "/expense-category"
          },
          {
            tittle: "Coupon Master",
            route: "/expense-category"
          }
        ]

      },

    ]

  },
  {
    tittle: "Inventory",
    hasSubRoute: true,
    icon: "brand-unity",
    showSubRoute: false,
    activeRoute: "product",
    subRoutes: [
      {
        tittle: "Products / Services",
        hasSubRoute: false,
        showSubRoute: true,
        route: "/product-list",
        subRoutes: []
      },
      {
        tittle: "Stock Adjustments",
        hasSubRoute: false,
        showSubRoute: false,
        route: all_routes.stockadjustment,
        subRoutes: []
      },
      {
        tittle: "Write-offs",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/write-off",
        subRoutes: []
      },
      {
        tittle: "Inventory Counts",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/inventory-counts",
        subRoutes: []
      },
      {
        tittle: "Internal Orders",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/internal-orders",
        subRoutes: []
      },
      {
        tittle: "Transfers",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/transfers",
        subRoutes: []
      },
      {
        tittle: "Stock",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/stock",
        subRoutes: []
      },
      {
        tittle: "Stock Movement",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/stock-movement",
        subRoutes: []
      },
    ]

  },
  {
    tittle: "Purchases",
    hasSubRoute: true,
    icon: "layout-grid",
    showSubRoute: false,
    activeRoute: "users",
    subRoutes: [
      {
        tittle: "New Purchase",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/new-purchase",
        subRoutes: []
      },
      {
        tittle: "Purchases Edit",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/purchase-edit",
        subRoutes: []
      },
      {
        tittle: "Purchase Return",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/purchase-returns",
        subRoutes: []
      },
      {
        tittle: "Purchases Return Edit",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/purchase-return-edit",
        subRoutes: []
      }]

  },

  {
    tittle: "Sale",
    icon: "user-circle",
    route: "/sales",
    hasSubRoute: false,
    subRoutes: []
  },
  {
    tittle: "Transfer Stock",
    hasSubRoute: false,
    icon: "user-circle",
    route: "/localization-settings",
    subRoutes: []

  },
  {
    tittle: "Financials",
    hasSubRoute: true,
    icon: "chart-bar",
    showSubRoute: false,
    activeRoute: "users",
    subRoutes: [

      {
        tittle: "Payments",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/expense-report",
        subRoutes: []

      },
      {
        tittle: "Cash Flow Report",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/expense-report",
        subRoutes: []
      },
      {
        tittle: "Profit and Loss",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/income-report",
        subRoutes: []
      },





      {
        tittle: "Statement of Accounts",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/tax-report",
        subRoutes: []
      },
      {
        tittle: "Payrolls",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/profit-and-loss",
        subRoutes: []
      },
      {
        tittle: "Adjustments",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/annual-report",
        subRoutes: []
      }]

  },
  {
    tittle: "E-Commerce",
    hasSubRoute: true,
    icon: "settings",
    showSubRoute: false,
    activeRoute: "users",
    subRoutes: [
      {
        tittle: "Payments",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/system-settings"
      },
      {
        tittle: "Cash Flow Report",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/system-settings"
      },
      {
        tittle: "Purchase Return Edit",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/system-settings"
      },
      {
        tittle: "Purchase Return",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/system-settings"
      },
    ]

  },
  {
    tittle: "Task",
    hasSubRoute: true,
    icon: "circle-plus",
    showSubRoute: false,
    activeRoute: "More",
    subRoutes: [
      {
        tittle: "Push Stock To Dump",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/customers",
        subRoutes: []

      },
      {
        tittle: "Stock Scan",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/roles-permissions",
        subRoutes: []

      },
      {
        tittle: "Stock Audit",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/users",
      },
      {
        tittle: "Stock Conversion",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/delete-account",
      }]

  },


  /////////////////////////Hrms////////////////////////////////////////

  {
    tittle: "Hrms",
    hasSubRoute: true,
    icon: "layout-grid",
    showSubRoute: false,
    activeRoute: "users",
    subRoutes: [
      {
        tittle: "Profile",
        hasSubRoute: true,
        showSubRoute: false,
        subRoutes: [
          {
            tittle: "My Profile",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.HrmsMyProfileSettings,
            subRoutes: [],
          },
          {
            tittle: "Org Chart",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.Hrmsorgchart,
            subRoutes: [],
          },
        ],
      },

      {
        tittle: "Leave",
        hasSubRoute: true,
        showSubRoute: false,
        route: "/sales-list",
        subRoutes: [
          {
            tittle: "Apply Leaves",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.HrmsApplyforLeave,
            subRoutes: [],
          },
          {
            tittle: "Leaves History",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.HrmsLeaveHistory,
            subRoutes: [],
          },
          {
            tittle: "Holidays",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.HrmsHolidaysHistory,
            subRoutes: [],
          },
          {
            tittle: "Leaves Roles",
            hasSubRoute: false,
            showSubRoute: false,
            route: all_routes.HrmsLeavesRules,
            subRoutes: [],
          },
          {
            tittle: "Balance Log ",
            hasSubRoute: true,
            showSubRoute: true,
            route: all_routes.HrmsBalanceLog,
            subRoutes: [],
          },
          {
            tittle: "Apply For Optional Holidays ",
            hasSubRoute: true,
            showSubRoute: true,
            route: all_routes.HrmsApplyforOptionalHolidays,
            subRoutes: [],
          },
          {
            tittle: "Apply For Compensatory Off ",
            hasSubRoute: true,
            showSubRoute: true,
            route: all_routes.HrmsApplyforCompensatoryOff,
            subRoutes: [],
          },
        ],
      },
      {
        tittle: "Team",
        hasSubRoute: true,
        showSubRoute: false,
        activeRoute: "promo",
        subRoutes: [
          {
            tittle: "Team Members",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/all-masters",
            subRoutes: [],
          },
          {
            tittle: "Leave History ",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/item-master-update-by-excel",
            subRoutes: [],
          },
          {
            tittle: "Addendance Report",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/all-masters",
            subRoutes: [],
          },
          {
            tittle: "Leave Addendance Report",
            hasSubRoute: false,
            showSubRoute: false,
            route: "/item-master-update-by-excel",
            subRoutes: [],
          },
        ],
      },
      {
        tittle: "Attendance",
        hasSubRoute: false,
        showSubRoute: false,
        route: "/purchase-list",
        subRoutes: [],
      },
      {
        tittle: "My Finance",
        hasSubRoute: true,
        showSubRoute: true,
        route: "/purchase-list",
        subRoutes: [
          {
            tittle: "My Salary",
            route: "/expense-list",
          },
          {
            tittle: "My Payslips",
            route: "/expense-category",
          },
          {
            tittle: "Investment Declaration",
            route: "/expense-category",
          },
        ],
      },
      {
        tittle: "Requests",
        hasSubRoute: true,
        showSubRoute: true,
        route: "/purchase-lists",
        subRoutes: [
          {
            tittle: "Track My Request ",
            route: "/expense-list",
          },
          {
            tittle: "Id Cart Request ",
            route: "/expense-category",
          },
          {
            tittle: "Bussiness Card Request",
            route: "/expense-category",
          },
          {
            tittle: "Travel Request",
            route: "/expense-category",
          },
        ],
      },
      {
        tittle: "Hr",
        hasSubRoute: true,
        showSubRoute: true,
        route: "/purchase-list",
        subRoutes: [
          {
            tittle: "Departments",
            route: all_routes.HrmsDepartment,
          },
          {
            tittle: "Designation",
            route: all_routes.HrmsDesignation,
          },
          {
            tittle: "Organization",
            route: all_routes.HrmsOrgination,
          },
          {
            tittle: "Employee",
            route: all_routes.HrmsEmployee,
          },
          {
            tittle: "Team",
            route: all_routes.HrmsTeam,
          },
          {
            tittle: "Attendance",
            route: all_routes.HrmsAttendance,
          },
          {
            tittle: "Requests",
            route: all_routes.HrmsRequests,
          },
          {
            tittle: "Onboarding",
            route: all_routes.HrmsOnboarding,
          },
          {
            tittle: "Salary",
            route: all_routes.HrmsSalary,
          },
          {
            tittle: "Clients",
            route: all_routes.HrmsClients,
          },
          {
            tittle: "Projects",
            route: all_routes.HrmsProjects,
          },

        ],
      },
    ],
  },



];


