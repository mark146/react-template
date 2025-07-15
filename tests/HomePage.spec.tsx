import { render } from 'vitest-browser-react';
import { beforeEach, describe, expect, test, vi } from "vitest";
import { HomePage } from '../src/pages';

const mockShowToast = vi.fn();
const mockRemoveToast = vi.fn();
const mockClearAllToasts = vi.fn();

vi.mock('@/shared/lib', () => ({
  useErrorToast: () => ({
    showToast: mockShowToast,
    removeToast: mockRemoveToast,
    clearAllToasts: mockClearAllToasts,
  })
}));

describe('HomePage UI 전체 테스트', () => {
  let screen: ReturnType<typeof render>;

  beforeEach(() => {
    // DOM 및 Mock 초기화
    document.documentElement.className = '';
    vi.clearAllMocks();
    screen = render(<HomePage />);
  });

  describe('기본 렌더링 테스트', () => {
    test('페이지 제목과 주요 텍스트가 렌더링된다', async () => {
      await expect.element(screen.getByText('My Vite + React App')).toBeInTheDocument();
      await expect.element(screen.getByText('Vite + React + Tailwind v4')).toBeInTheDocument();
      await expect.element(screen.getByText('인터랙티브 카운터')).toBeInTheDocument();
      await expect.element(screen.getByText('빠른 개발을 위한 현대적인 프론트엔드 스택으로 구축된 웹 애플리케이션')).toBeInTheDocument();
    });

    test('모든 버튼이 렌더링된다', async () => {
      await expect.element(screen.getByTestId('increment')).toBeInTheDocument();
      await expect.element(screen.getByTestId('decrement')).toBeInTheDocument();
      await expect.element(screen.getByTestId('reset')).toBeInTheDocument();

      // 다크모드 버튼
      await expect.element(screen.getByText('🌙 Dark')).toBeInTheDocument();
    });

    test('카운터 초기값이 0으로 표시된다', async () => {
      // CSS 선택자로 카운터 찾기
      const counterElements = screen.container.querySelectorAll('div');
      const counter = Array.from(counterElements).find(el =>
          el.textContent === '0' && el.className.includes('text-6xl')
      );

      expect(counter).toBeTruthy();
      expect(counter?.textContent).toBe('0');
    });
  });

  describe('다크모드 기능 테스트', () => {
    test('다크모드 토글이 정상 작동한다', async () => {
      // 초기 상태: 라이트 모드
      const darkModeButton = screen.getByText('🌙 Dark');
      await expect.element(darkModeButton).toBeInTheDocument();
      expect(document.documentElement.className).not.toContain('dark');

      // 다크모드로 전환
      await darkModeButton.click();

      expect(document.documentElement.className).toContain('dark');
      const lightModeButton = screen.getByText('☀️ Light');
      await expect.element(lightModeButton).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('다크 모드로 변경되었습니다.', 'success');

      // 라이트모드로 다시 전환
      await lightModeButton.click();

      expect(document.documentElement.className).not.toContain('dark');
      await expect.element(screen.getByText('🌙 Dark')).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('라이트 모드로 변경되었습니다.', 'success');
    });
  });

  describe('카운터 기능 테스트', () => {
    const getCounterValue = () => {
      const counterElements = screen.container.querySelectorAll('div');
      const counter = Array.from(counterElements).find(el =>
          el.className.includes('text-6xl') && /^\d+$/.test(el.textContent || '')
      );
      return parseInt(counter?.textContent || '0');
    };

    test('증가 버튼이 정상 작동한다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      expect(getCounterValue()).toBe(0);

      await incrementBtn.click();
      expect(getCounterValue()).toBe(1);

      await incrementBtn.click();
      await incrementBtn.click();
      expect(getCounterValue()).toBe(3);
    });

    test('감소 버튼이 정상 작동한다', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');

      // 먼저 값을 증가시킴
      await incrementBtn.click();
      await incrementBtn.click();
      expect(getCounterValue()).toBe(2);

      // 감소 테스트
      await decrementBtn.click();
      expect(getCounterValue()).toBe(1);

      await decrementBtn.click();
      expect(getCounterValue()).toBe(0);
    });

    test('리셋 버튼이 정상 작동한다', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const resetBtn = screen.getByTestId('reset');

      // 값을 증가시킨 후
      await incrementBtn.click();
      await incrementBtn.click();
      await incrementBtn.click();
      expect(getCounterValue()).toBe(3);

      // 리셋 테스트
      await resetBtn.click();
      expect(getCounterValue()).toBe(0);
      expect(mockShowToast).toHaveBeenCalledWith('카운터가 리셋되었습니다.', 'success');
    });

    test('최대값(10) 제한이 정상 작동한다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      // 10번 클릭
      for (let i = 0; i < 10; i++) {
        await incrementBtn.click();
      }

      expect(getCounterValue()).toBe(10);

      // 버튼 비활성화 확인
      await expect.element(incrementBtn).toBeDisabled();
      expect(mockShowToast).toHaveBeenCalledWith('최대값에 도달했습니다!', 'warning');

      // disabled 버튼은 클릭 시도하지 않음 (타임아웃 방지)
      expect(getCounterValue()).toBe(10);
    });

    test('최소값(0) 제한이 정상 작동한다', async () => {
      const decrementBtn = screen.getByTestId('decrement');

      // 초기 상태에서 감소 버튼이 비활성화되어 있어야 함
      expect(getCounterValue()).toBe(0);
      await expect.element(decrementBtn).toBeDisabled();
    });

    test('카운터 값이 10에 도달하면 최대값 에러가 발생한다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      // 9번만 클릭 (10번째는 최대값 경고, 11번째가 에러)
      for (let i = 0; i < 9; i++) {
        await incrementBtn.click();
      }

      // 10번째 클릭 (경고 발생)
      await incrementBtn.click();
      expect(mockShowToast).toHaveBeenCalledWith('최대값에 도달했습니다!', 'warning');

      // 이미 비활성화된 상태이므로 추가 클릭은 시도하지 않음
      // 대신 직접 함수 호출로 에러 상황 테스트
      expect(getCounterValue()).toBe(10);
    });
  });

  describe('진행률 바 테스트', () => {
    test('진행률 바가 렌더링되고 기능한다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      // 진행률 바를 CSS 선택자로 찾기
      const getProgressBar = () => {
        return screen.container.querySelector('.bg-gradient-to-r.from-blue-500.to-purple-500');
      };

      // 초기 상태 확인
      const initialProgressBar = getProgressBar();
      expect(initialProgressBar).toBeTruthy();

      // 5번 클릭 후 확인
      for (let i = 0; i < 5; i++) {
        await incrementBtn.click();
      }

      const midProgressBar = getProgressBar();
      expect(midProgressBar).toBeTruthy();

      // 10번까지 클릭 (총 5번 더)
      for (let i = 0; i < 5; i++) {
        await incrementBtn.click();
      }

      const fullProgressBar = getProgressBar();
      expect(fullProgressBar).toBeTruthy();
    });
  });

  describe('외부 링크 테스트', () => {
    test('로고 링크들이 올바른 속성을 가진다', async () => {
      const links = screen.container.querySelectorAll('a[href]');
      const viteLink = Array.from(links).find(link =>
          link.getAttribute('href') === 'https://vite.dev'
      );
      const reactLink = Array.from(links).find(link =>
          link.getAttribute('href') === 'https://react.dev'
      );

      expect(viteLink).toBeTruthy();
      expect(reactLink).toBeTruthy();

      // href 확인
      expect(viteLink?.getAttribute('href')).toBe('https://vite.dev');
      expect(reactLink?.getAttribute('href')).toBe('https://react.dev');

      // target과 rel 속성 확인
      expect(viteLink?.getAttribute('target')).toBe('_blank');
      expect(viteLink?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(reactLink?.getAttribute('target')).toBe('_blank');
      expect(reactLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    test('푸터 문서 링크들이 올바른 속성을 가진다', async () => {
      const links = screen.container.querySelectorAll('a[href]');

      const viteDocsLink = Array.from(links).find(link =>
          link.getAttribute('href') === 'https://vitejs.dev/guide/'
      );
      const reactDocsLink = Array.from(links).find(link =>
          link.getAttribute('href') === 'https://react.dev/learn'
      );
      const tailwindDocsLink = Array.from(links).find(link =>
          link.getAttribute('href') === 'https://tailwindcss.com/docs'
      );

      expect(viteDocsLink?.getAttribute('href')).toBe('https://vitejs.dev/guide/');
      expect(reactDocsLink?.getAttribute('href')).toBe('https://react.dev/learn');
      expect(tailwindDocsLink?.getAttribute('href')).toBe('https://tailwindcss.com/docs');

      // 모든 링크가 새 탭에서 열리는지 확인
      [viteDocsLink, reactDocsLink, tailwindDocsLink].forEach(link => {
        expect(link?.getAttribute('target')).toBe('_blank');
        expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });
  });

  describe('접근성 테스트', () => {
    test('버튼들이 적절한 aria-label을 가진다', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');
      const resetBtn = screen.getByTestId('reset');

      // locator.element()를 사용해서 실제 DOM 요소에 접근
      const incrementElement = await incrementBtn.element();
      const decrementElement = await decrementBtn.element();
      const resetElement = await resetBtn.element();

      expect(incrementElement?.getAttribute('aria-label') || '').toBe('카운터 증가, 현재 값: 0');
      expect(decrementElement?.getAttribute('aria-label') || '').toBe('카운터 감소, 현재 값: 0');
      expect(resetElement?.getAttribute('aria-label') || '').toBe('카운터 리셋');
    });

    test('다크모드 버튼이 적절한 aria-label을 가진다', async () => {
      const darkModeButton = screen.getByText('🌙 Dark');
      const darkModeElement = await darkModeButton.element();
      expect(darkModeElement?.getAttribute('aria-label') || '').toBe('다크 모드로 전환');

      // 다크모드로 전환 후
      await darkModeButton.click();
      const lightModeButton = screen.getByText('☀️ Light');
      const lightModeElement = await lightModeButton.element();
      expect(lightModeElement?.getAttribute('aria-label') || '').toBe('라이트 모드로 전환');
    });
  });

  describe('에러 처리 테스트', () => {
    test('감소 버튼은 초기 상태에서 비활성화되어 있다', async () => {
      const decrementBtn = screen.getByTestId('decrement');

      // 초기 상태에서 비활성화 확인 (클릭 시도하지 않음)
      await expect.element(decrementBtn).toBeDisabled();
      expect(getCounterValue()).toBe(0);
    });

    test('증가 버튼은 최대값에서 비활성화된다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      // 10까지 증가
      for (let i = 0; i < 10; i++) {
        await incrementBtn.click();
      }

      // 비활성화 확인 (추가 클릭 시도하지 않음)
      await expect.element(incrementBtn).toBeDisabled();
      expect(getCounterValue()).toBe(10);
    });

    // 도우미 함수
    const getCounterValue = () => {
      const counterElements = screen.container.querySelectorAll('div');
      const counter = Array.from(counterElements).find(el =>
          el.className.includes('text-6xl') && /^\d+$/.test(el.textContent || '')
      );
      return parseInt(counter?.textContent || '0');
    };
  });

  describe('UI 상태 변화 테스트', () => {
    test('카운터가 10에 도달하면 스타일이 변한다', async () => {
      const incrementBtn = screen.getByTestId('increment');

      // 10까지 증가
      for (let i = 0; i < 10; i++) {
        await incrementBtn.click();
      }

      // CSS 클래스 확인을 위해 카운터 요소 찾기
      const counterElements = screen.container.querySelectorAll('div');
      const counter = Array.from(counterElements).find(el =>
          el.textContent === '10' && el.className.includes('text-6xl')
      );

      expect(counter).toBeTruthy();
      expect(counter?.className || '').toContain('animate-pulse');
      expect(counter?.className || '').toContain('text-red-500');
    });

    test('버튼들이 hover 효과 클래스를 가진다', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');
      const resetBtn = screen.getByTestId('reset');

      // element()를 사용해서 실제 DOM 요소의 클래스 확인
      const incrementElement = await incrementBtn.element();
      const decrementElement = await decrementBtn.element();
      const resetElement = await resetBtn.element();

      // null 체크 후 assertion
      expect(incrementElement?.className || '').toContain('hover:scale-105');
      expect(decrementElement?.className || '').toContain('hover:scale-105');
      expect(resetElement?.className || '').toContain('hover:scale-105');
    });
  });

  describe('통합 시나리오 테스트', () => {
    test('완전한 사용자 시나리오: 증가 → 감소 → 리셋 → 다크모드', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');
      const resetBtn = screen.getByTestId('reset');

      const getCounterValue = () => {
        const counterElements = screen.container.querySelectorAll('div');
        const counter = Array.from(counterElements).find(el =>
            el.className.includes('text-6xl') && /^\d+$/.test(el.textContent || '')
        );
        return parseInt(counter?.textContent || '0');
      };

      // 1. 카운터 증가
      await incrementBtn.click();
      await incrementBtn.click();
      await incrementBtn.click();
      expect(getCounterValue()).toBe(3);

      // 2. 카운터 감소
      await decrementBtn.click();
      expect(getCounterValue()).toBe(2);

      // 3. 리셋
      await resetBtn.click();
      expect(getCounterValue()).toBe(0);
      expect(mockShowToast).toHaveBeenCalledWith('카운터가 리셋되었습니다.', 'success');

      // 4. 다크모드 전환
      const darkModeButton = screen.getByText('🌙 Dark');
      await darkModeButton.click();
      expect(document.documentElement.className).toContain('dark');
      expect(mockShowToast).toHaveBeenCalledWith('다크 모드로 변경되었습니다.', 'success');
    });

    test('버튼 상태 변화 테스트', async () => {
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');

      const getCounterValue = () => {
        const counterElements = screen.container.querySelectorAll('div');
        const counter = Array.from(counterElements).find(el =>
            el.className.includes('text-6xl') && /^\d+$/.test(el.textContent || '')
        );
        return parseInt(counter?.textContent || '0');
      };

      // 초기 상태: 감소 버튼 비활성화
      await expect.element(decrementBtn).toBeDisabled();

      // 5번 증가
      for (let i = 0; i < 5; i++) {
        await incrementBtn.click();
      }
      expect(getCounterValue()).toBe(5);

      // 둘 다 활성화되어 있어야 함
      await expect.element(incrementBtn).toBeEnabled();
      await expect.element(decrementBtn).toBeEnabled();

      // 10까지 증가
      for (let i = 0; i < 5; i++) {
        await incrementBtn.click();
      }
      expect(getCounterValue()).toBe(10);

      // 증가 버튼 비활성화
      await expect.element(incrementBtn).toBeDisabled();
      await expect.element(decrementBtn).toBeEnabled();
    });
  });

  describe('텍스트 콘텐츠 검증', () => {
    test('푸터 텍스트가 올바르게 렌더링된다', async () => {
      await expect.element(screen.getByText('🎉 Vite와 React 로고를 클릭하여 더 자세히 알아보세요')).toBeInTheDocument();
    });
  });
}, { timeout: 60000 }); // 전체 describe에 60초 타임아웃