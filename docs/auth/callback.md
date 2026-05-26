---
layout: default
title: 로그인 처리 중
permalink: /auth/callback/
---

# 로그인 처리 중

Pool's day 앱으로 돌아가는 중입니다…

잠시만 기다려 주세요. 자동으로 앱이 열리지 않으면 [Pool's day 앱 열기](#)을 눌러 주세요.

<script>
  // Supabase OAuth callback URL 의 query/fragment 를 그대로 deep link 로 전달.
  // expo-web-browser 가 deep link detect 하면 즉시 앱으로 복귀 → 이 페이지 깜빡임 최소.
  (function () {
    try {
      var qs = window.location.search || '';
      var hash = window.location.hash || '';
      var deep = 'poolsday://auth/callback' + qs + hash;
      // 즉시 navigate. 모바일이면 expo-web-browser 가 detect 후 앱 복귀.
      window.location.href = deep;
    } catch (e) { /* no-op */ }
  })();
</script>
