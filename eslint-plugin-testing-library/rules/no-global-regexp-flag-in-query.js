"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULE_NAME = void 0;
const utils_1 = require("@typescript-eslint/utils");
const create_testing_library_rule_1 = require("../create-testing-library-rule");
const node_utils_1 = require("../node-utils");
exports.RULE_NAME = 'no-global-regexp-flag-in-query';
exports.default = (0, create_testing_library_rule_1.createTestingLibraryRule)({
    name: exports.RULE_NAME,
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow the use of the global RegExp flag (/g) in queries',
            recommendedConfig: {
                dom: false,
                angular: false,
                react: false,
                vue: false,
            },
        },
        messages: {
            noGlobalRegExpFlagInQuery: 'Avoid using the global RegExp flag (/g) in queries',
        },
        fixable: 'code',
        schema: [],
    },
    defaultOptions: [],
    create(context, _, helpers) {
        function report(literalNode) {
            if ((0, node_utils_1.isLiteral)(literalNode) &&
                'regex' in literalNode &&
                literalNode.regex.flags.includes('g')) {
                context.report({
                    node: literalNode,
                    messageId: 'noGlobalRegExpFlagInQuery',
                    fix(fixer) {
                        const splitter = literalNode.raw.lastIndexOf('/');
                        const raw = literalNode.raw.substring(0, splitter);
                        const flags = literalNode.raw.substring(splitter + 1);
                        const flagsWithoutGlobal = flags.replace('g', '');
                        return fixer.replaceText(literalNode, `${raw}/${flagsWithoutGlobal}`);
                    },
                });
                return true;
            }
            return false;
        }
        function getArguments(identifierNode) {
            if ((0, node_utils_1.isCallExpression)(identifierNode.parent)) {
                return identifierNode.parent.arguments;
            }
            else if ((0, node_utils_1.isMemberExpression)(identifierNode.parent) &&
                (0, node_utils_1.isCallExpression)(identifierNode.parent.parent)) {
                return identifierNode.parent.parent.arguments;
            }
            return [];
        }
        return {
            CallExpression(node) {
                const identifierNode = (0, node_utils_1.getDeepestIdentifierNode)(node);
                if (!identifierNode || !helpers.isQuery(identifierNode)) {
                    return;
                }
                const [firstArg, secondArg] = getArguments(identifierNode);
                const firstArgumentHasError = report(firstArg);
                if (firstArgumentHasError) {
                    return;
                }
                if ((0, node_utils_1.isObjectExpression)(secondArg)) {
                    const namePropertyNode = secondArg.properties.find((p) => (0, node_utils_1.isProperty)(p) &&
                        utils_1.ASTUtils.isIdentifier(p.key) &&
                        p.key.name === 'name' &&
                        (0, node_utils_1.isLiteral)(p.value));
                    if (namePropertyNode) {
                        report(namePropertyNode.value);
                    }
                }
            },
        };
    },
});
