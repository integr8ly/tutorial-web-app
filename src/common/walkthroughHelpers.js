import asciidoctor from 'asciidoctor.js';

const CONTEXT_PREAMBLE = 'preamble';
const CONTEXT_SECTION = 'section';
const CONTEXT_PARAGRAPH = 'paragraph';

const retrieveOverviewFromAdoc = (rawAdoc) => {
  const parsedAdoc = parseAdoc(rawAdoc);
  return {
    title: parsedAdoc.getDocumentTitle(),
    descriptionHTML: parsedAdoc.blocks[0].convert(),
    time: getTotalWalkthroughTime(parsedAdoc),
    tasks: retrieveTasksFromAdoc(parsedAdoc).map(b => ({
      title: b.title,
      time: b.getAttribute('time') || 0,
      shortDescription: shortDescriptionFromBlock(b),
      steps: getStepsForTask(b)
    }))
  }
}

const getTotalWalkthroughTime = (adoc) => {
  let time = 0;
  adoc.blocks.forEach(b => {
    if (b.context === CONTEXT_PREAMBLE || b.context === CONTEXT_PARAGRAPH) {
      return;
    }
    time += parseInt(b.getAttribute('time')) || 0;
  });
  return time;
}

const getStepsForTask = (task) => {
  return task.blocks.map(b => {
    if (b.context === CONTEXT_PARAGRAPH || b.context === CONTEXT_PREAMBLE) {
      return;
    }
    return {
      title: b.title,
      isVerification: b.getAttribute('verification') === 'true',
      bodyHTML: b.convert(),
      blocks: getBlocksForStep(b)
    }
  }).filter(b => !!b);
}

const getBlocksForStep = (step) => {
  return step.blocks.map(b => {
    return {
      isVerification: !!b.getAttribute('verification'),
      verificationId: b.getAttribute('verification'),
      verificationFailText: b.getAttribute('verificationFailText'),
      bodyHTML: b.convert()
    }
  })
}

const retrieveTasksFromAdoc = (adoc) => {
  return adoc.blocks.filter(b => b.context === CONTEXT_SECTION);
}

const shortDescriptionFromBlock = (block) => {
  if (block.blocks[0].context !== CONTEXT_PARAGRAPH || block.blocks[0].lines.length === 0) {
    return;
  }
  return block.blocks[0].lines[0];
}

const parseAdoc = (rawAdoc) => asciidoctor().load(rawAdoc);

export { retrieveOverviewFromAdoc };
