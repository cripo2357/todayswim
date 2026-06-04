// RNFirebase + expo-build-properties ios.useFrameworks:'static' 조합에서
// RNFBApp(프레임워크 모듈)이 React-Core의 비모듈러 헤더(RCTConvert.h /
// RCTBridgeModule.h / RCTEventEmitter.h)를 include → Xcode가
// -Wnon-modular-include-in-framework-module 을 -Werror 로 막아 아카이브 실패.
//
// 표준 해법: 모든 Pod 타깃에 CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES
// 를 박아 이 경고를 허용. Podfile post_install 블록에 주입.
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SETTING = 'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES';

const SNIPPET = [
  '    installer.pods_project.targets.each do |__target|',
  '      __target.build_configurations.each do |__cfg|',
  `        __cfg.build_settings['${SETTING}'] = 'YES'`,
  '      end',
  '    end',
  '',
].join('\n');

module.exports = function withFirebaseStaticFrameworkFix(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'Podfile',
      );
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (!contents.includes(SETTING)) {
        if (/post_install do \|installer\|\n/.test(contents)) {
          // 기존 post_install 블록 첫 줄 뒤에 삽입.
          contents = contents.replace(
            /(post_install do \|installer\|\n)/,
            `$1${SNIPPET}`,
          );
        } else {
          // post_install 블록이 없으면 새로 추가(타깃 do 블록 닫힘 전).
          contents = contents.replace(
            /(\nend\s*)$/,
            `\n  post_install do |installer|\n${SNIPPET}  end\n$1`,
          );
        }
        fs.writeFileSync(podfilePath, contents);
      }
      return cfg;
    },
  ]);
};
