import { render } from 'vitest-browser-react';
import { beforeEach, describe, expect, test, vi } from "vitest";
import { HomePage } from '../src/pages';

vi.mock('@/shared/ui', () => ({
  useErrorToast: () => ({ showError: vi.fn() })
}));

describe('HomePage UI', () => {
  let screen : ReturnType<typeof render>;

  beforeEach(() => {
    document.documentElement.className = '';
    screen = render(<HomePage />);
  });

  test('타이틀, 설명, 카운터 UI가 렌더링된다', async () => {
    const { getByText, getByRole, getByTestId } = screen;
    await expect.element(getByText('My Vite + React App')).toBeInTheDocument();
    await expect.element(getByText('Vite + React + Tailwind v4')).toBeInTheDocument();
    await expect.element(getByText('인터랙티브 카운터')).toBeInTheDocument();
    await expect.element(getByRole('button', { name: /증가/i })).toBeInTheDocument();
    await expect.element(getByRole('button', { name: /감소/i })).toBeInTheDocument();
    await expect.element(getByRole('button', { name: /리셋/i })).toBeInTheDocument();
    await expect.element(getByTestId('counter')).toHaveTextContent('0');
  });

  test('다크모드 토글 버튼이 동작한다', async () => {
    const { getByRole, getByText } = screen;
    const darkModeButton = getByRole('button', { name: /dark|light|다크|라이트|🌙|☀️/i });
    await expect.element(getByText('🌙 Dark')).toBeInTheDocument();
    await darkModeButton.click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    await expect.element(getByText('☀️ Light')).toBeInTheDocument();
    await darkModeButton.click();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    await expect.element(getByText('🌙 Dark')).toBeInTheDocument();
  });

  test('카운터 증가 버튼이 동작한다', async () => {
    const plusBtn = screen.getByTestId('increment');
    const counter = screen.getByTestId('counter');
    await expect.element(counter).toHaveTextContent('0');
    await plusBtn.click();
    await expect.element(counter).toHaveTextContent('1');
  });

  test('카운터 감소 버튼이 동작한다', async () => {
    const plusBtn = screen.getByTestId('increment');
    const minusBtn = screen.getByTestId('decrement');
    const counter = screen.getByTestId('counter');
    await plusBtn.click();
    await expect.element(counter).toHaveTextContent('1');
    await minusBtn.click();
    await expect.element(counter).toHaveTextContent('0');
  });

  test('카운터 리셋 버튼이 동작한다', async () => {
    const plusBtn = screen.getByTestId('increment');
    const resetBtn = screen.getByTestId('reset');
    const counter = screen.getByTestId('counter');
    await plusBtn.click();
    await plusBtn.click();
    await expect.element(counter).toHaveTextContent('2');
    await resetBtn.click();
    await expect.element(counter).toHaveTextContent('0');
  });
});
