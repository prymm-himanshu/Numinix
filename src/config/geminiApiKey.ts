@@ .. @@
-
-export const GEMINI_API_KEY = "AIzaSyAVrq0WKMK6laPoav30-h0LDN-AGw-O8u4";
+export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAVrq0WKMK6laPoav30-h0LDN-AGw-O8u4";