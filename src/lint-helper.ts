import { Linter, Configuration } from 'tslint';
import * as TSLintConfig from './tslint.json';

export const lintHelper = ({
  sourceFile,
  ruleName,
  customRuleOptions,
}: {
  sourceFile: string;
  ruleName: string;
  customRuleOptions?: (string | boolean)[];
}) => {
  const lint = new Linter({ fix: false });
  const getRuleOptions = customRuleOptions || TSLintConfig.rules[ruleName];

  lint.lint(
    '',
    sourceFile,
    Configuration.parseConfigFile({
      rules: {
        [ruleName]: Array.isArray(getRuleOptions) ? [...getRuleOptions] : getRuleOptions,
      },
      rulesDirectory: TSLintConfig.rulesDirectory,
    })
  );

  return lint.getResult();
};

export const getErrorLine = (failures: any[]) =>
  failures.map((failure) => {
    const start = failures[0].startPosition.position;
    const end = failures[0].endPosition.position;

    return failure.sourceFile.text.substr(start, failure.sourceFile.text.length - end);
  });
