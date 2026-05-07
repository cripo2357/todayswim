// react-native-svg-transformer 가 SVG를 React 컴포넌트로 변환하도록 타입 선언.
declare module '*.svg' {
  import { FC } from 'react';
  import { SvgProps } from 'react-native-svg';
  const Component: FC<SvgProps>;
  export default Component;
}
