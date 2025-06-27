export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'console.log 사용 금지',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            avoidConsoleLog: 'console.log는 사용하지 마세요. console.warn, console.error 등을 사용해주세요.',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'console' &&
                    node.callee.property.name === 'log'
                ) {
                    context.report({
                        node,
                        messageId: 'avoidConsoleLog',
                        fix(fixer) {
                            return fixer.replaceText(node.callee.property, 'warn');
                        },
                    });
                }
            },
        };
    },
};