import { parseWalkthroughAdoc } from '../walkthroughHelpers';

const adoc = `
= Example

This is a sample description

This is a sample overview

[type=walkthroughResource]
=== A global resource

resource text

== First task

First task overview
  
=== First step

The first task description

[type=taskResource]
=== A task resource

resource text
`;

describe('Walkthrough Helpers', () => {
  it('should correctly parse a walkthrough', () => {
    const walkthrough = parseWalkthroughAdoc(adoc);
    expect(walkthrough.title).toBe('Example');
    expect(walkthrough.tasks).toHaveLength(1);
    expect(walkthrough.resources).toHaveLength(1);
    expect(walkthrough.tasks[0].resources).toHaveLength(1);
  });
});
