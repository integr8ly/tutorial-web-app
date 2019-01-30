import asciidoctor from 'asciidoctor.js';

const CONTEXT_SECTION = 'section';
const CONTEXT_DOCUMENT = 'document';
const CONTEXT_SIDEBAR = 'sidebar';

const BLOCK_ATTR_TYPE = 'type';
const BLOCK_ATTR_TIME = 'time';

const BLOCK_TYPE_VERIFICATION = 'verification';
const BLOCK_TYPE_VERIFICATION_FAIL = 'verificationFail';
const BLOCK_TYPE_VERIFICATION_SUCCESS = 'verificationSuccess';
const BLOCK_TYPE_TASK_RESOURCE = 'taskResource';
const BLOCK_TYPE_WALKTHROUGH_RESOURCE = 'walkthroughResource';

const BLOCK_LEVEL_PREAMBLE = 0;
const BLOCK_LEVEL_TASK = 1;
const BLOCK_LEVEL_STEP = 2;

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

  static canConvert(adoc) {
    return adoc.context === CONTEXT_SECTION && adoc.level === BLOCK_LEVEL_STEP;
  }

  static fromAdoc(adoc) {
    const title = adoc.numbered ? `${getNumberedTitle(adoc)}. ${adoc.title}` : adoc.title;
    const blocks = adoc.blocks.reduce((acc, b, i, blockList) => {
      if (WalkthroughVerificationBlock.canConvert(b)) {
        const remainingBlocks = blockList.slice(i + 1, blockList.length);
        const successBlock = WalkthroughVerificationSuccessBlock.findNextForVerification(remainingBlocks);
        const failBlock = WalkthroughVerificationFailBlock.findNextForVerification(remainingBlocks);
        acc.push(new WalkthroughVerificationBlock(b.convert(), successBlock, failBlock));
      }
      if (WalkthroughTextBlock.canConvert(b)) {
        acc.push(new WalkthroughTextBlock(b.convert()));
      }
      return acc;
    }, []);
    return new WalkthroughStep(title, blocks);
  }
}

class WalkthroughResourceStep {
  constructor(html, service, title) {
    this._html = html;
    this._serviceName = service;
    this._title = title;
  }

  get title() {
    return this._title;
  }

  get html() {
    return this._html;
  }

  get serviceName() {
    return this._serviceName;
  }

  static canConvert(adoc) {
    return (
      adoc.context === CONTEXT_SIDEBAR &&
      adoc.level === BLOCK_LEVEL_TASK &&
      adoc.getAttribute(BLOCK_ATTR_TYPE) === BLOCK_TYPE_TASK_RESOURCE
    );
  }

  static fromAdoc(adoc) {
    const service = adoc.getAttribute('serviceName');
    const html = adoc.blocks[0] ? adoc.blocks[0].convert() : '';
    return new WalkthroughResourceStep(html, service, adoc.title);
  }
}

class WalkthroughResource {
  constructor(html, service, title) {
    this._html = html;
    this._serviceName = service;
    this._title = title;
  }

  get title() {
    return this._title;
  }

  get html() {
    return this._html;
  }

  get serviceName() {
    return this._serviceName;
  }

  static canConvert(adoc) {
    return (
      adoc.context === CONTEXT_SIDEBAR &&
      adoc.level === BLOCK_LEVEL_PREAMBLE &&
      adoc.getAttribute(BLOCK_ATTR_TYPE) === BLOCK_TYPE_WALKTHROUGH_RESOURCE
    );
  }

  static fromAdoc(adoc) {
    const service = adoc.getAttribute('serviceName');
    const html = adoc.blocks[0] ? adoc.blocks[0].convert() : '';
    return new WalkthroughResource(html, service, adoc.title);
  }
}

class WalkthroughTask {
  constructor(title, time, html, steps) {
    this._title = title;
    this._time = time;
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
    return this._steps.filter(s => !(s instanceof WalkthroughResourceStep));
  }

  get resources() {
    return this._steps.filter(s => s instanceof WalkthroughResourceStep);
  }

  static canConvert(adoc) {
    return adoc.context === CONTEXT_SECTION && adoc.level === BLOCK_LEVEL_TASK;
  }

  static fromAdoc(adoc) {
    const title = adoc.numbered ? `${getNumberedTitle(adoc)}. ${adoc.title}` : adoc.title;
    const time = parseInt(adoc.getAttribute(BLOCK_ATTR_TIME), 10) || 0;
    const steps = adoc.blocks.reduce((acc, b) => {
      if (WalkthroughResourceStep.canConvert(b)) {
        acc.push(WalkthroughResourceStep.fromAdoc(b));
      } else if (WalkthroughStep.canConvert(b)) {
        acc.push(WalkthroughStep.fromAdoc(b));
      } else if (WalkthroughTextBlock.canConvert(b)) {
        acc.push(WalkthroughTextBlock.fromAdoc(b));
      }
      return acc;
    }, []);

    return new WalkthroughTask(title, time, adoc.convert(), steps);
  }
}

class Walkthrough {
  constructor(title, preamble, time, tasks, resources) {
    this._title = title;
    this._preamble = preamble;
    this._time = time;
    this._tasks = tasks;
    this._resources = resources;
  }

  get title() {
    return this._title;
  }

  get preamble() {
    return this._preamble;
  }

  get time() {
    return this._time;
  }

  get tasks() {
    return this._tasks;
  }

  get resources() {
    return this._resources;
  }

  static extractWalkthroughResources(preamble) {
    const resources = [];
    preamble.blocks = preamble.blocks.reduce((acc, block) => {
      if (WalkthroughResource.canConvert(block)) {
        resources.push(WalkthroughResource.fromAdoc(block));
      } else {
        acc.push(block);
      }
      return acc;
    }, []);
    return resources;
  }

  static fromAdoc(adoc) {
    const title = adoc.getDocumentTitle();
    if (adoc.blocks.length < 1) {
      throw new Error(`Invalid Walkthrough ${title}`);
    }

    const resources = this.extractWalkthroughResources(adoc.blocks[0]);
    const preamble = adoc.blocks[0].convert();
    const tasks = adoc.blocks.filter(b => WalkthroughTask.canConvert(b)).map(b => WalkthroughTask.fromAdoc(b));
    const time = tasks.reduce((acc, t) => acc + t._time || 0, 0);
    return new Walkthrough(title, preamble, time, tasks, resources);
  }
}

const getNumberedTitle = block => {
  if (block.context === CONTEXT_DOCUMENT || block.parent.context === CONTEXT_DOCUMENT) {
    return `${block.numbered ? block.number : null}`;
  }
  return `${getNumberedTitle(block.parent)}.${block.numbered ? block.number : null}`;
};

const parseWalkthroughAdoc = (rawAdoc, attrs) => {
  const parsedAdoc = parseAdoc(rawAdoc, attrs);
  return Walkthrough.fromAdoc(parsedAdoc);
};

const parseAdoc = (rawAdoc, attrs) => asciidoctor().load(rawAdoc, { attributes: attrs });

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
