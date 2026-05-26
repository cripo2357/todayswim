// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      // Deno edge functions: Node ESLint 으로 lint X (https:// imports, Deno global).
      "supabase/functions/**",
      // 스킬 자산(Next.js 템플릿) / 스크래치 파일 / Node scripts — RN 앱 코드 아님.
      ".claude/**",
      ".tmp_*",
      "scripts/**",
    ],
  }
]);
