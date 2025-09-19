import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override rules
  {
    rules: {
      // Tắt cảnh báo console
      "no-console": "off",

      // Cho phép dùng any
      "@typescript-eslint/no-explicit-any": "off",

      // Tắt cảnh báo unused vars
      "@typescript-eslint/no-unused-vars": "off",

      // Tắt lỗi @ts-ignore
      "@typescript-eslint/ban-ts-comment": "off",

      // Tắt các lỗi nhỏ khác xàm xàm
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

export default eslintConfig;
