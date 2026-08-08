import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { patchCssModules } from "vite-css-modules";

export default defineConfig({
    envPrefix: ["VITE_", "MIN_"],
    plugins: [
        react(),
        babel({
            presets: [reactCompilerPreset({ target: "19" })],
            include: [/\.(ts|tsx|js|jsx)$/],
        }),
        patchCssModules({
            generateSourceTypes: true,
            declarationMap: true,
        }),
    ],
    base: "./",
    resolve: {
        tsconfigPaths: true,
        alias: {
            "@assets": path.resolve(__dirname, "./src/assets"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@contexts": path.resolve(__dirname, "./src/contexts"),
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "es2022",
        rolldownOptions: {
            output: {
                codeSplitting: {
                    minSize: 50000,
                    groups: [
                        { name: "framer-motion-vendor", test: /\/framer-motion/ },
                        {
                            name: "vendor",
                            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                            minSize: 30000,
                            maxSize: 500000,
                            priority: 20,
                        },
                        {
                            name: "charts",
                            test: /[\\/]node_modules[\\/]echarts[\\/]/,
                            priority: 10,
                        },
                    ],
                },
            },
        },
    },
});
