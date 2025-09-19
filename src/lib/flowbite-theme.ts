export const customFlowbiteTheme = {
  tabs: {
    tablist: {
      base: "flex flex-wrap -mb-px text-sm font-medium text-center",
      variant: {
        underline: "",
        default: "",
        pills: "",
        fullWidth: "",
      },
      tabitem: {
        base: "flex items-center justify-center p-4 rounded-t-lg border-b-2 border-transparent cursor-pointer",
        variant: {
          underline: {
            base: "hover:text-gray-600 hover:border-gray-300",
            active: {
              on: "bg-green-600 text-white border-green-600 dark:!bg-green-800 dark:!text-white dark:border-green-600",
              off: "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300",
            },
          },
          default: {
            base: "",
            active: {
              on: "bg-green-600 text-white border-green-600 dark:!bg-green-800 dark:!text-white dark:border-green-600",
              off: "",
            },
          },
          pills: {
            base: "",
            active: {
              on: "bg-green-600 text-white border-green-600 dark:!bg-green-800 dark:!text-white dark:border-green-600",
              off: "",
            },
          },
          fullWidth: {
            base: "",
            active: {
              on: "bg-green-600 text-white border-green-600 dark:!bg-green-800 dark:!text-white dark:border-green-600",
              off: "",
            },
          },
        },
        icon: "mr-2 h-5 w-5",
      },
    },
    tabitemcontainer: {
      base: "",
      variant: {
        underline: "",
        default: "",
        pills: "",
        fullWidth: "",
      },
    },
    tabpanel: "p-4 bg-white rounded-lg",
  },
};
