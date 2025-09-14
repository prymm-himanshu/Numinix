// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import history from "file:///home/project/node_modules/connect-history-api-fallback/lib/index.js";
var vite_config_default = defineConfig({
  base: "/Numinix/",
  // Set base for GitHub Pages deployment
  plugins: [
    react()
    // Add more plugins if needed
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  server: {
    fs: {
      allow: ["."]
    },
    middlewareMode: false,
    // Add SPA fallback middleware
    setupMiddlewares: (middlewares) => {
      middlewares.use(history());
      return middlewares;
    }
  },
  preview: {
    // This will fallback to index.html for all routes
    // when previewing the build locally
    fallback: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgaGlzdG9yeSBmcm9tICdjb25uZWN0LWhpc3RvcnktYXBpLWZhbGxiYWNrJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy9OdW1pbml4LycsIC8vIFNldCBiYXNlIGZvciBHaXRIdWIgUGFnZXMgZGVwbG95bWVudFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICAvLyBBZGQgbW9yZSBwbHVnaW5zIGlmIG5lZWRlZFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBmczoge1xuICAgICAgYWxsb3c6IFsnLiddLFxuICAgIH0sXG4gICAgbWlkZGxld2FyZU1vZGU6IGZhbHNlLFxuICAgIC8vIEFkZCBTUEEgZmFsbGJhY2sgbWlkZGxld2FyZVxuICAgIHNldHVwTWlkZGxld2FyZXM6IChtaWRkbGV3YXJlcykgPT4ge1xuICAgICAgbWlkZGxld2FyZXMudXNlKGhpc3RvcnkoKSk7XG4gICAgICByZXR1cm4gbWlkZGxld2FyZXM7XG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIC8vIFRoaXMgd2lsbCBmYWxsYmFjayB0byBpbmRleC5odG1sIGZvciBhbGwgcm91dGVzXG4gICAgLy8gd2hlbiBwcmV2aWV3aW5nIHRoZSBidWlsZCBsb2NhbGx5XG4gICAgZmFsbGJhY2s6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBSWxCLE9BQU8sYUFBYTtBQUVwQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLEVBRVI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLE9BQU8sQ0FBQyxHQUFHO0FBQUEsSUFDYjtBQUFBLElBQ0EsZ0JBQWdCO0FBQUE7QUFBQSxJQUVoQixrQkFBa0IsQ0FBQyxnQkFBZ0I7QUFDakMsa0JBQVksSUFBSSxRQUFRLENBQUM7QUFDekIsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUE7QUFBQTtBQUFBLElBR1AsVUFBVTtBQUFBLEVBQ1o7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
