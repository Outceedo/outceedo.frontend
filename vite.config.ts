import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add build configuration to handle sweetalert2
  build: {
    rollupOptions: {
      external: ["sweetalert2"],
      output: {
        globals: {
          sweetalert2: "Swal",
        },
      },
    },
    // Add commonjs options to better handle node modules
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  // Improve dependency optimization
  optimizeDeps: {
    include: ["sweetalert2"],
  },
});
