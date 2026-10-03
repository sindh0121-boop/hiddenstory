# 숨겨진 이야기에 대하여

태안군 일생의례 구술조사 웹 다큐멘터리.

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소를 만듭니다(예: `hidden-stories`).
2. 이 폴더 안의 파일을 **모두** 저장소 루트에 올립니다. `index.html`이 루트에 있어야 합니다.
3. 저장소 **Settings → Pages** 에서 Source를 `Deploy from a branch`, Branch를 `main` / `/(root)`로 정하고 저장합니다.
4. 1~2분 뒤 `https://<아이디>.github.io/<저장소이름>/` 에서 열립니다.

## 구성

- `index.html` — 페이지
- `support.js` — 페이지 실행 런타임
- `mm-engine.js` — 스크롤 모션, 챕터, 만화, 크레딧
- `mm-art.js`, `image-slot.js` — 보조 스크립트
- `assets/` — 그림, 사진, 폰트(그리운 김탕체)
- `.nojekyll` — GitHub Pages가 파일을 그대로 쓰도록 하는 빈 파일

인트로 영상은 Cloudinary에서, 웹폰트는 Google Fonts와 jsDelivr에서 불러옵니다.
