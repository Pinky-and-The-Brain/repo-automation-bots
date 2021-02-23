// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {RegionTagLocation} from './region-tag-parser';
import {Violation} from './violations';

/**
 * Formats the full scan report with the comment mark, so that it can
 * preserve original contents.
 */
export const formatBody = (
  originalBody: string,
  commentMark: string,
  addition: string
): string => {
  // First cut off if we already have the commentMark.
  const markIndex = originalBody.indexOf(commentMark);
  if (markIndex >= 0) {
    originalBody = originalBody.substr(0, markIndex);
  }
  return `${originalBody}${commentMark}

${addition}

---
Report generated by [snippet-bot](https://github.com/apps/snippet-bot).
If you find problems with this result, please file an issue at:
https://github.com/googleapis/repo-automation-bots/issues.
`;
};

/**
 * Formats the summary and detail as an expandable UI in the markdown.
 */
export const formatExpandable = (summary: string, detail: string): string => {
  return `<details>
  <summary>${summary}</summary>

  ${detail}
</details>

`;
};

/**
 * Formats a region tag location as a markdown with a permalink to the code.
 */
export const formatRegionTag = (loc: RegionTagLocation): string => {
  const url = `https://github.com/${loc.owner}/${loc.repo}/blob/${loc.sha}/${loc.file}#L${loc.line}`;
  return `[${loc.file}:${loc.line}](${url}), tag \`${loc.regionTag}\``;
};

/**
 * Formats an array of Violations for commenting.
 */
export const formatViolations = (
  violations: Violation[],
  summary: string
): string => {
  let detail = '';
  for (const violation of violations) {
    detail += `- ${formatRegionTag(violation.location)}`;
    if (violation.devsite_urls.length > 0) {
      // Also add links to devsite urls.
      detail += '(usage:';
      violation.devsite_urls.forEach((value, index) => {
        detail += ` [page ${index + 1}](${value})`;
      });
      detail += ').\n';
    } else {
      detail += '\n';
    }
  }
  return formatExpandable(summary, detail);
};

/**
 * Formats a violation for unmatched region tag.
 */
export const formatMatchingViolation = (violation: Violation): string => {
  let detail = '';
  if (violation.violationType === 'NO_MATCHING_START_TAG') {
    detail = "doesn't have a matching start tag.";
  } else if (violation.violationType === 'NO_MATCHING_END_TAG') {
    detail = "doesn't have a matching end tag.";
  } else if (violation.violationType === 'TAG_ALREADY_STARTED') {
    detail = 'already started.';
  }
  return `${formatRegionTag(violation.location)} ${detail}`;
};