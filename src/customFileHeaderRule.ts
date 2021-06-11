import * as Lint from 'tslint';
import * as TS from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'custom-file-header',
    description: 'Ensures the file starts with custom header',
    optionsDescription: 'Need to pass custom file header',
    options: {
      type: 'array',
      items: { header: 'string' },
    },
    hasFix: true,
    type: 'formatting',
    typescriptOnly: false,
  };

  get currentYear() {
    return new Date().getFullYear();
  }

  get header() {
    const headerContent = this.ruleArguments[0] || [''];

    return headerContent.split('{YEAR}');
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
      `${firstPart}${this.currentYear}${secoundPart}\n\n`
    );

    return [new Lint.RuleFailure(sourceFile, 0, 1, Rule.FAILURE_MESSAGE, this.ruleName, fix)];
  }
}
