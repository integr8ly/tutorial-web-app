import asciidoctor from 'asciidoctor.js';

const CONTEXT_PREAMBLE = 'preamble';
const CONTEXT_SECTION = 'section';
const CONTEXT_PARAGRAPH = 'paragraph';

const BLOCK_ATTR_TYPE = 'type';
const BLOCK_ATTR_TIME = 'time';

const BLOCK_TYPE_VERIFICATION = 'verification';
const BLOCK_TYPE_VERIFICATION_FAIL = 'verificationFail';
const BLOCK_TYPE_VERIFICATION_SUCCESS = 'verificationSuccess';

class WalkthroughTextBlock {
  constructor(html) {
    this._html = html;
  }

  get html() {
    return this._html;
  }

  static canConvert(block) {
    return (
      !WalkthroughVerificationBlock.canConvert(block) &&
      !WalkthroughVerificationFailBlock.canConvert(block) &&
      !WalkthroughVerificationSuccessBlock.canConvert(block)
    );
  }

  static fromAdoc(adoc) {
    return new WalkthroughTextBlock(adoc.convert());
  }
}

class WalkthroughVerificationBlock {
  constructor(html, successBlock, failBlock) {
    this._html = html;
    this._successBlock = successBlock;
    this._failBlock = failBlock;
  }

  get html() {
    return this._html;
  }

  get hasSuccessBlock() {
    return !!this._successBlock;
  }

  get hasFailBlock() {
    return !!this._failBlock;
  }

  get successBlock() {
    return this._successBlock;
  }

  get failBlock() {
    return this._failBlock;
  }

  static canConvert(block) {
    return block.getAttribute(BLOCK_ATTR_TYPE) === BLOCK_TYPE_VERIFICATION;
  }

  static fromAdoc(adoc) {
    return new WalkthroughVerificationBlock(adoc.convert());
  }
}

class WalkthroughVerificationSuccessBlock {
  constructor(html) {
    this._html = html;
  }

  get html() {
    return this._html;
  }

  static canConvert(block) {
    return block.getAttribute(BLOCK_ATTR_TYPE) === BLOCK_TYPE_VERIFICATION_SUCCESS;
  }

  static fromAdoc(adoc) {
    return new WalkthroughVerificationSuccessBlock(adoc.convert());
  }

  static findNextForVerification(blocks) {
    for (const block of blocks) {
      if (WalkthroughVerificationBlock.canConvert(block)) {
        return null;
      }
      if (WalkthroughVerificationSuccessBlock.canConvert(block)) {
        return WalkthroughVerificationSuccessBlock.fromAdoc(block);
      }
    }
    return null;
  }
}

class WalkthroughVerificationFailBlock {
  constructor(html) {
    this._html = html;
  }

  get html() {
    return this._html;
  }

  static canConvert(block) {
    return block.getAttribute(BLOCK_ATTR_TYPE) === BLOCK_TYPE_VERIFICATION_FAIL;
  }

  static fromAdoc(adoc) {
    return new WalkthroughVerificationFailBlock(adoc.convert());
  }

  static findNextForVerification(blocks) {
    for (const block of blocks) {
      if (WalkthroughVerificationBlock.canConvert(block)) {
        return null;
      }
      if (WalkthroughVerificationFailBlock.canConvert(block)) {
        return WalkthroughVerificationFailBlock.fromAdoc(block);
      }
    }
    return null;
  }
}

class WalkthroughStep {
  constructor(title, blocks) {
    this._title = title;
    this._blocks = blocks;
  }

  get title() {
    return this._title;
  }

  get blocks() {
    return this._blocks;
  }

  static fromAdoc(adoc) {
    const blocks = adoc.blocks.map((b, i, blockList) => {
      if (WalkthroughVerificationBlock.canConvert(b)) {
        const remainingBlocks = blockList.slice(i + 1, blockList.length);
        const successBlock = WalkthroughVerificationSuccessBlock.findNextForVerification(remainingBlocks);
        const failBlock = WalkthroughVerificationFailBlock.findNextForVerification(remainingBlocks);
        return new WalkthroughVerificationBlock(b.convert(), successBlock, failBlock);
      }
      if (WalkthroughTextBlock.canConvert(b)) {
        return new WalkthroughTextBlock(b.convert());
      }
      return undefined;
    });
    return new WalkthroughStep(adoc.title, blocks);
  }
}

class WalkthroughTask {
  constructor(title, time, shortDescriptionHTML, html, steps) {
    this._title = title;
    this._time = time;
    this._shortDescriptionHTML = shortDescriptionHTML;
    this._html = html;
    this._steps = steps;
  }

  get title() {
    return this._title;
  }

  get time() {
    return this._time;
  }

  get html() {
    return this._html;
  }

  get steps() {
    return this._steps;
  }

  static canConvert(adoc) {
    return adoc.context === CONTEXT_SECTION;
  }

  static getShortDescription(adoc) {
    if (adoc.blocks[0].context === CONTEXT_PARAGRAPH && adoc.blocks[0].lines.length !== 0) {
      const {
        blocks: [
          {
            lines: [shortDescription]
          }
        ]
      } = adoc;
      return shortDescription;
    }
    return '';
  }

  static fromAdoc(adoc) {
    const time = parseInt(adoc.getAttribute(BLOCK_ATTR_TIME), 10) || 0;

    const steps = adoc.blocks.reduce((acc, b) => {
      if (b.context === CONTEXT_PARAGRAPH || b.context === CONTEXT_PREAMBLE) {
        return acc;
      }
      acc.push(WalkthroughStep.fromAdoc(b));
      return acc;
    }, []);

    return new WalkthroughTask(adoc.title, time, this.getShortDescription(adoc), adoc.convert(), steps);
  }
}

class Walkthrough {
  constructor(title, descriptionHTML, time, tasks) {
    this._title = title;
    this._descriptionHTML = descriptionHTML;
    this._time = time;
    this._tasks = tasks;
  }

  get title() {
    return this._title;
  }

  get descriptionHTML() {
    return this._descriptionHTML;
  }

  get time() {
    return this._time;
  }

  get tasks() {
    return this._tasks;
  }

  static fromAdoc(adoc) {
    const title = adoc.getDocumentTitle();
    const descriptionHTML = adoc.blocks[0].convert();
    const tasks = adoc.blocks.filter(b => WalkthroughTask.canConvert(b)).map(b => WalkthroughTask.fromAdoc(b));
    const time = tasks.reduce((acc, t) => acc + t._time || 0, 0);
    return new Walkthrough(title, descriptionHTML, time, tasks);
  }
}

const parseWalkthroughAdoc = rawAdoc => {
  const parsedAdoc = parseAdoc(rawAdoc);
  return Walkthrough.fromAdoc(parsedAdoc);
};

const parseAdoc = rawAdoc => asciidoctor().load(rawAdoc);

export {
  WalkthroughTextBlock,
  WalkthroughVerificationBlock,
  WalkthroughVerificationFailBlock,
  WalkthroughVerificationSuccessBlock,
  WalkthroughStep,
  WalkthroughTask,
  Walkthrough,
  parseWalkthroughAdoc
};
