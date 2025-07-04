# React + TypeScript + Vite

## ⚡️ 프로젝트 시작하기

### 1. 프로젝트 다운로드
```bash
git clone <레포지토리 주소>
cd react-template
```

### 2. 의존성 설치
```bash
pnpm install # 또는 npm install, yarn install
```

### 3. 개발 서버 실행
```bash
pnpm dev # 또는 npm run dev, yarn dev
```

### 4. 빌드
```bash
pnpm build # 또는 npm run build, yarn build
```

### 5. 배포(정적 파일)
- `dist/` 폴더가 생성되며, 정적 호스팅(예: Vercel, Netlify, S3 등)에 업로드하여 배포할 수 있습니다.

---

## 📝 템플릿 적용 안내

- **커밋 템플릿**: `git config commit.template commit_template.txt` 명령어로 설정
- **이슈 템플릿**: `.github/ISSUE_TEMPLATE/` 폴더에 위치, GitHub 이슈 작성 시 자동 적용
- **PR 템플릿**: `.github/PULL_REQUEST_TEMPLATE.md` 파일, GitHub PR 생성 시 자동 적용

### 템플릿 사용법

#### 커밋 템플릿
```bash
# 템플릿 설정 (한 번만)
git config commit.template commit_template.txt

# 커밋 시 (메시지 없이)
git commit
# → 에디터에서 템플릿 참고해서 작성

## 🚀 릴리즈 가이드

이 프로젝트는 자동화된 버전 관리를 사용합니다.

### 📝 커밋 가이드

#### 커밋 메시지 규칙
```bash
# 새 기능 (0.1.0 → 0.2.0)
git commit -m "feat: add user login"

# 버그 수정 (0.1.0 → 0.1.1)  
git commit -m "fix: resolve login issue"

# 기타 (버전 증가 없음)
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
```

#### 커밋하는 방법
```bash
# 1. 변경사항 확인
git status
git diff

# 2. 파일 추가
git add .                    # 모든 파일
git add src/components/      # 특정 폴더
git add package.json         # 특정 파일

# 3. 커밋
git commit -m "feat: add new feature"

# 4. 푸시
git push origin your-branch
```

#### 좋은 커밋 팁
- **명확한 제목**: 무엇을 했는지 한눈에 알 수 있게
- **현재형 사용**: "add" (O), "added" (X)
- **50자 이내**: 제목은 간결하게
- **자주 커밋**: 작은 단위로 나누어서

```bash
# ✅ 좋은 예시
git commit -m "feat: add user profile modal"
git commit -m "fix: resolve mobile layout issue"
git commit -m "refactor: simplify auth logic"

# ❌ 나쁜 예시  
git commit -m "update"
git commit -m "fix bugs"
git commit -m "added new feature for user authentication and profile management with modal dialog"
```

### 🎯 릴리즈 명령어

```bash
# 자동 릴리즈 (커밋 메시지 기반)
pnpm run release

# 수동 릴리즈
pnpm run release:patch   # 0.1.0 → 0.1.1
pnpm run release:minor   # 0.1.0 → 0.2.0
pnpm run release:major   # 0.1.0 → 1.0.0

# 테스트 (실제 릴리즈 안함)
pnpm run release:dry
```

### 🔄 워크플로우

#### 일반적인 개발
```bash
# 1. 브랜치에서 개발
git checkout -b feature/new-feature
git commit -m "feat: add awesome feature"
git push origin feature/new-feature

# 2. PR 생성 (아래 방법 중 선택)
```

#### PR 생성 방법

**방법 1: GitHub 웹사이트 (가장 일반적)**
1. GitHub 저장소 페이지 접속
2. 푸시 후 나타나는 "Compare & pull request" 버튼 클릭
3. 또는 "Pull requests" 탭 → "New pull request" 버튼
4. 제목과 설명 작성 후 "Create pull request"

**방법 2: GitHub CLI (터미널)**
```bash
# GitHub CLI 설치 후
gh pr create --title "feat: add new feature" --body "상세 설명"

# 또는 대화형
gh pr create
```

**방법 3: VS Code (확장 프로그램)**
- GitHub Pull Requests 확장 프로그램 설치
- Ctrl+Shift+P → "GitHub Pull Requests: Create Pull Request"

#### PR 머지 후 릴리즈
```bash
# 3. 메인에서 릴리즈
git checkout main
git pull origin main
pnpm run release
```

#### 긴급 버그 수정
```bash
# 1. 핫픽스
git checkout -b hotfix/critical-bug
git commit -m "fix: resolve critical issue"

# 2. 메인 머지 → 릴리즈
git checkout main
git merge hotfix/critical-bug
pnpm run release:patch
```

### 🔧 GitHub Token 설정

릴리즈를 위해 GitHub Token이 필요합니다:

```bash
# 환경 변수 설정
export GITHUB_TOKEN=your_token_here

# Windows
set GITHUB_TOKEN=your_token_here
```

**Token 생성**: GitHub → Settings → Developer settings → Personal access tokens

### 🚨 문제 해결

#### "Working directory must be clean"
```bash
git add .
git commit -m "chore: clean workspace"
pnpm run release
```

#### 버전이 안 올라갈 때
```bash
# 올바른 커밋 메시지로 다시 커밋
git commit -m "fix: ensure proper versioning"
pnpm run release
```

### 💡 핵심 규칙

- ✅ **메인 브랜치에서만** 정식 릴리즈
- ✅ **feat/fix** 커밋 메시지 사용
- ✅ **드라이런 먼저** 테스트
- ❌ 브랜치에서 정식 릴리즈 금지

---

**도움이 필요하면**: `pnpm run release:dry`로 먼저 테스트해보세요!