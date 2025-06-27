import { ESLint } from 'eslint';
import { customRulesPlugin } from '../index.js';

// 색상 출력을 위한 ANSI 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// ESLint 인스턴스 생성
async function createESLintInstance() {
    return new ESLint({
        useEslintrc: false,
        baseConfig: {
            languageOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true
                    }
                },
                globals: {
                    console: 'readonly',
                    window: 'readonly',
                    document: 'readonly',
                    React: 'readonly',
                    process: 'readonly'
                }
            },
            plugins: {
                'custom': customRulesPlugin
            },
            rules: {
                'custom/no-console-log': 'error'
            }
        }
    });
}

// 테스트 케이스 정의
const testCases = [
    {
        name: '🚫 console.log 규칙 테스트',
        description: 'console.log 사용을 감지하고 console.warn/error 사용을 권장',
        code: `
// ❌ 이것들은 에러가 발생해야 함
console.log('This should be flagged');
console.log(\`Template literal: \${new Date()}\`);

function test() {
    console.log('Inside function');
    const obj = {
        method() {
            console.log('In object method');
        }
    };
}

const arrow = () => {
    console.log('In arrow function');
};

// ✅ 이것들은 괜찮아야 함
console.warn('This should be OK');
console.error('This is also OK');
console.info('Info message OK');
console.debug('Debug message OK');
        `,
        filename: 'src/test-console.js',
        expectedErrors: 4, // console.log 사용 4곳
        expectedRules: ['custom/no-console-log']
    },
    {
        name: '✅ 올바른 로깅 사용',
        description: 'console.log를 사용하지 않는 올바른 코드',
        code: `
// 올바른 로깅 방법들
console.warn('Warning message');
console.error('Error occurred');
console.info('Information');
console.debug('Debug info');

// 다른 console 메서드들
console.table([1, 2, 3]);
console.time('timer');
console.timeEnd('timer');

// 일반적인 코드
function Component() {
    return <div>Valid component</div>;
}

const data = { key: 'value' };
        `,
        filename: 'src/components/ValidComponent.jsx',
        expectedErrors: 0,
        expectedRules: []
    },
    {
        name: '🔧 복합 케이스 테스트',
        description: 'console.log와 다른 메서드가 혼재된 경우',
        code: `
function debugFunction() {
    console.log('Debug message 1'); // ❌ 에러
    console.warn('Warning message'); // ✅ 괜찮음
    console.log('Debug message 2'); // ❌ 에러
    console.error('Error message'); // ✅ 괜찮음
    
    if (true) {
        console.log('Conditional log'); // ❌ 에러
    }
    
    try {
        throw new Error('test');
    } catch (e) {
        console.error('Caught error:', e); // ✅ 괜찮음
    }
}

class TestClass {
    method() {
        console.log('Class method log'); // ❌ 에러
    }
}
        `,
        filename: 'src/utils/debug.js',
        expectedErrors: 4, // console.log 사용 4곳
        expectedRules: ['custom/no-console-log']
    },
    {
        name: '🧪 Edge Cases 테스트',
        description: '경계 사례들과 특수한 경우들을 테스트',
        code: `
// 중첩된 함수에서의 console.log
function outerFunction() {
    function innerFunction() {
        console.log('Inner function log'); // ❌ 에러
    }
    
    const arrowInner = () => {
        console.log('Arrow inner log'); // ❌ 에러
    };
    
    return {
        method() {
            console.log('Object method log'); // ❌ 에러
        }
    };
}

// 조건부 console.log
if (process.env.NODE_ENV === 'development') {
    console.log('Development log'); // ❌ 에러 (여전히 console.log이므로)
}

// 다양한 올바른 사용법
console.warn('Warning in edge case');
console.error('Error in edge case');
console.group('Group start');
console.groupEnd();
        `,
        filename: 'src/utils/edge-cases.js',
        expectedErrors: 4, // console.log 사용 4곳
        expectedRules: ['custom/no-console-log']
    }
];

// 개별 테스트 케이스 실행
async function runTestCase(eslint, testCase, index) {
    console.log(`\n${colorize(`${index + 1}. ${testCase.name}`, 'cyan')}`);
    console.log(`${colorize('📁 파일:', 'gray')} ${testCase.filename}`);
    console.log(`${colorize('📝 설명:', 'gray')} ${testCase.description}`);
    console.log(colorize('─'.repeat(80), 'gray'));

    try {
        const results = await eslint.lintText(testCase.code, {
            filePath: testCase.filename
        });

        const messages = results[0].messages;
        const actualErrors = messages.length;
        const actualRules = [...new Set(messages.map(m => m.ruleId))];

        // 결과 출력
        if (messages.length > 0) {
            console.log(colorize('🔍 발견된 문제들:', 'yellow'));
            messages.forEach((message, msgIndex) => {
                const severity = message.severity === 2 ?
                    colorize('Error', 'red') :
                    colorize('Warning', 'yellow');

                console.log(`   ${colorize(`${msgIndex + 1}.`, 'gray')} Line ${colorize(message.line, 'white')}:${colorize(message.column, 'white')} - ${message.message}`);
                console.log(`      ${colorize('Rule:', 'gray')} ${colorize(message.ruleId, 'blue')} (${severity})`);

                if (message.fix) {
                    console.log(`      ${colorize('Fix available:', 'green')} ${message.fix.text || 'Auto-fixable'}`);
                }
            });
        } else {
            console.log(colorize('✅ 문제 없음 - 모든 규칙을 통과했습니다!', 'green'));
        }

        // 예상 결과와 비교
        const errorsMatch = actualErrors === testCase.expectedErrors;
        const rulesMatch = testCase.expectedRules.length === 0 ||
            testCase.expectedRules.every(rule => actualRules.includes(rule));

        console.log(`\n${colorize('📊 테스트 결과:', 'blue')}`);
        console.log(`   • 예상 에러 수: ${colorize(testCase.expectedErrors, 'white')} | 실제: ${colorize(actualErrors, errorsMatch ? 'green' : 'red')}`);
        console.log(`   • 예상 규칙: ${colorize(testCase.expectedRules.join(', ') || 'None', 'white')} | 실제: ${colorize(actualRules.join(', ') || 'None', rulesMatch ? 'green' : 'red')}`);
        console.log(`   • 상태: ${errorsMatch && rulesMatch ?
            colorize('✅ PASS', 'green') :
            colorize('❌ FAIL', 'red')}`);

        return {
            name: testCase.name,
            passed: errorsMatch && rulesMatch,
            expectedErrors: testCase.expectedErrors,
            actualErrors,
            expectedRules: testCase.expectedRules,
            actualRules,
            messages
        };

    } catch (error) {
        console.log(colorize(`❌ 테스트 실행 실패: ${error.message}`, 'red'));
        return {
            name: testCase.name,
            passed: false,
            error: error.message
        };
    }
}

// 규칙 메타데이터 검증
function validateRuleMetadata() {
    console.log(colorize('\n🔍 규칙 메타데이터 검증', 'blue'));
    console.log(colorize('─'.repeat(50), 'gray'));

    const rules = customRulesPlugin.rules;
    const ruleNames = Object.keys(rules);

    console.log(`발견된 규칙 수: ${colorize(ruleNames.length, 'white')}`);

    ruleNames.forEach(ruleName => {
        const rule = rules[ruleName];
        console.log(`\n${colorize(`📋 ${ruleName}`, 'cyan')}`);

        // 필수 메타데이터 검증
        const requiredMeta = ['type', 'docs', 'messages'];
        const missingMeta = requiredMeta.filter(key => !rule.meta[key]);

        if (missingMeta.length === 0) {
            console.log(`   ${colorize('✅ 메타데이터 완료', 'green')}`);
        } else {
            console.log(`   ${colorize(`❌ 누락된 메타데이터: ${missingMeta.join(', ')}`, 'red')}`);
        }

        // 메타데이터 정보 출력
        console.log(`   • 타입: ${colorize(rule.meta.type, 'white')}`);
        console.log(`   • 설명: ${colorize(rule.meta.docs.description, 'white')}`);
        console.log(`   • 수정 가능: ${rule.meta.fixable ? colorize('Yes', 'green') : colorize('No', 'gray')}`);
        console.log(`   • 메시지 수: ${colorize(Object.keys(rule.meta.messages).length, 'white')}`);
    });
}

// 성능 테스트
async function performanceTest(eslint) {
    console.log(colorize('\n⏱️ 성능 테스트', 'blue'));
    console.log(colorize('─'.repeat(50), 'gray'));

    const testCode = `
        ${'console.log("test");'.repeat(100)}
        ${'console.warn("test");'.repeat(100)}
        ${'console.error("test");'.repeat(100)}
    `;

    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await eslint.lintText(testCode, { filePath: 'perf-test.js' });
        const end = performance.now();
        times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`• 반복 횟수: ${colorize(iterations, 'white')}`);
    console.log(`• 평균 시간: ${colorize(`${avgTime.toFixed(2)}ms`, 'white')}`);
    console.log(`• 최소 시간: ${colorize(`${minTime.toFixed(2)}ms`, 'green')}`);
    console.log(`• 최대 시간: ${colorize(`${maxTime.toFixed(2)}ms`, 'red')}`);
}

// 메인 테스트 실행
async function runTests() {
    console.log(colorize('🧪 ESLint 커스텀 규칙 테스트 시작', 'blue'));
    console.log(colorize('='.repeat(80), 'gray'));

    try {
        // 규칙 메타데이터 검증
        validateRuleMetadata();

        // ESLint 인스턴스 생성
        const eslint = await createESLintInstance();

        // 테스트 케이스 실행
        console.log(colorize('\n📋 테스트 케이스 실행', 'blue'));
        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const result = await runTestCase(eslint, testCases[i], i);
            results.push(result);
        }

        // 성능 테스트
        await performanceTest(eslint);

        // 최종 결과 요약
        console.log(colorize('\n📊 최종 테스트 결과', 'blue'));
        console.log(colorize('='.repeat(80), 'gray'));

        const passedTests = results.filter(r => r.passed).length;
        const totalTests = results.length;
        const totalErrors = results.reduce((sum, r) => sum + (r.actualErrors || 0), 0);

        console.log(`• 총 테스트 케이스: ${colorize(totalTests, 'white')}`);
        console.log(`• 통과한 테스트: ${colorize(passedTests, passedTests === totalTests ? 'green' : 'red')}`);
        console.log(`• 실패한 테스트: ${colorize(totalTests - passedTests, totalTests === passedTests ? 'green' : 'red')}`);
        console.log(`• 발견된 총 문제: ${colorize(totalErrors, 'white')}`);

        // 실패한 테스트 상세 정보
        const failedTests = results.filter(r => !r.passed);
        if (failedTests.length > 0) {
            console.log(colorize('\n❌ 실패한 테스트들:', 'red'));
            failedTests.forEach(test => {
                console.log(`   • ${test.name}`);
                if (test.error) {
                    console.log(`     오류: ${test.error}`);
                }
            });
        }

        // 전체 결과
        if (passedTests === totalTests) {
            console.log(colorize('\n🎉 모든 테스트가 통과했습니다!', 'green'));
            console.log(colorize('   커스텀 ESLint 규칙들이 정상적으로 동작합니다.', 'green'));
        } else {
            console.log(colorize('\n⚠️ 일부 테스트가 실패했습니다.', 'yellow'));
            console.log(colorize('   규칙 구현을 확인해주세요.', 'yellow'));
        }

        return passedTests === totalTests;

    } catch (error) {
        console.error(colorize(`💥 테스트 실행 실패: ${error.message}`, 'red'));
        console.error(colorize('\n🔍 상세 오류 정보:', 'gray'));
        console.error(error.stack);
        return false;
    }
}

// 개별 규칙 테스트 함수
export async function testIndividualRule(ruleName) {
    console.log(colorize(`🔍 개별 규칙 테스트: ${ruleName}`, 'blue'));

    const eslint = await createESLintInstance();
    const relevantTests = testCases.filter(test =>
        test.expectedRules.includes(`custom/${ruleName}`)
    );

    if (relevantTests.length === 0) {
        console.log(colorize(`⚠️ ${ruleName} 규칙에 대한 테스트를 찾을 수 없습니다.`, 'yellow'));
        return;
    }

    for (const test of relevantTests) {
        await runTestCase(eslint, test, 0);
    }
}

// 스크립트로 직접 실행될 때
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(colorize('테스트 실행 실패:', 'red'), error);
        process.exit(1);
    });
}