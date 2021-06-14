import * as Lint from 'tslint';
import * as TS from 'typescript';

import { LICENSE_TEMPLATES, LICENSE, CURRENT } from './customFileHeaderRule.helper';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'custom-file-header',
    description: 'Ensures the file starts with custom header',
    optionsDescription: 'Need to pass custom file header',
    options: {
      type: 'array',
      items: {
        header: 'string',
        type: 'string',
        company: 'string',
        defaultYear: 'string',
      },
    },
    hasFix: true,
    type: 'formatting',
    typescriptOnly: false,
  };

  get currentYear() {
    return new Date().getFullYear();
  }

  get defaultYear() {
    const defaultYearValue = this.ruleArguments[3];

    if (defaultYearValue) {
      if (defaultYearValue === CURRENT) {
        return this.currentYear;
      }

      return defaultYearValue;
    }

    return this.currentYear;
  }

  get header() {
    const headerValue = this.ruleArguments[0] || [''];

    if (headerValue === LICENSE) {
      const licenseType = this.ruleArguments[1];
      const company = this.ruleArguments[2];

      const license = LICENSE_TEMPLATES[licenseType];

      if (license && company) {
        return license.replace('{COMPANY}', company).split('{YEAR}');
      }

      return '';
    }

    return headerValue.split('{YEAR}');
  }

  public static FAILURE_MESSAGE = 'Custom header is missing';

  public gotLicenseHeader = (str: string) => {
    if (this.header.length > 1) {
      const [firstPart, secoundPart] = this.header;

      const licenseFirstPartLength = firstPart.length;
      const hasFirstPart = str.indexOf(firstPart) === 0;
      const hasYear = hasFirstPart && /[0-9]{4}/.test(str.slice(licenseFirstPartLength, licenseFirstPartLength + 4));
      const hasSecondPart = hasYear && str.slice(licenseFirstPartLength + 4).indexOf(secoundPart) === 0;

      return hasFirstPart && hasYear && hasSecondPart;
    }

    return str.indexOf(this.header[0]) === 0;
  };

  public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
    if (this.gotLicenseHeader(sourceFile.text)) {
      return [];
    }

    const [firstPart, secoundPart] = this.header;

    const fix: Lint.Fix | undefined = Lint.Replacement.appendText(
      0,
      `${firstPart}${this.defaultYear}${secoundPart}\n\n`
    );

    return [new Lint.RuleFailure(sourceFile, 0, 1, Rule.FAILURE_MESSAGE, this.ruleName, fix)];
  }
}
