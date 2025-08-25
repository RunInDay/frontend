import { Global, css } from '@emotion/react'

const GlobalStyles = () => (
  <Global
    styles={css`
      @font-face {
        font-family: 'PretendardBold';
        src: url('/fonts/Pretendard-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardSemiBold';
        src: url('/fonts/Pretendard-SemiBold.woff') format('woff');
        font-weight: 600;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardRegular';
        src: url('/fonts/Pretendard-Regular.woff') format('woff');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'PretendardLight';
        src: url('/fonts/Pretendard-Light.woff') format('woff');
        font-weight: 300;
        font-style: normal;
      }

      :root {
        /* Primary */
        --color-primary: #5face2;

        /* Gray */
        --color-gray-100: #f4f4f5;
        --color-gray-200: #d9d9d9;
        --color-gray-300: #cbcbcb;
        --color-gray-400: #b7b7b7;
        --color-gray-500: #939393;
        --color-gray-600: #7e7e7e;

        /* Semantic */
        --color-red: #f14452;
        --color-green: #23ad6f;
        --color-yellow: #f4d248;

        /* Background */
        --color-bg-white: #ffffffff;
        --color-bg-blue: #f8f9fc;

        /* Base */
        --color-background: var(--color-bg-white);
        --color-text: #333;
        --color-text-white: #fff;
        --color-text-black: #000;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'PretendardRegular', sans-serif;
        font-size: 14px;
        max-width: 480px;
        min-height: 100dvh;
        margin: 0 auto;
        border: 1px solid #ccc; // 개발할때만 적용
      }

      /* 데스크탑 스타일 */
      @media (min-width: 769px) {
        body {
          max-width: 480px;
          margin: 0 auto;
        }
      }
    `}
  />
)

export default GlobalStyles
