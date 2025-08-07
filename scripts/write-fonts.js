#!/usr/bin/env node

// This script is used to write the font data to a JSON file.
// It's used by awell-next to generate the font options.

const fs = require("fs/promises");
const path = require("path");

(async () => {
  const { familyMetadataList } = await fetch(
    "https://fonts.google.com/metadata/fonts"
  ).then((r) => r.json());

  const fontData = {};
  const ignoredSubsets = [
    "menu",
    "japanese",
    "korean",
    "chinese-simplified",
    "chinese-hongkong",
    "chinese-traditional",
  ];
  for (let { family, fonts, axes, subsets } of familyMetadataList) {
    subsets = subsets.filter((subset) => !ignoredSubsets.includes(subset));
    const weights = new Set();
    const styles = new Set();

    for (const variant of Object.keys(fonts)) {
      if (variant.endsWith("i")) {
        styles.add("italic");
        weights.add(variant.slice(0, -1));
        continue;
      } else {
        styles.add("normal");
        weights.add(variant);
      }
    }

    const hasVariableFont = axes.length > 0;

    let optionalAxes;
    if (hasVariableFont) {
      weights.add("variable");

      const nonWeightAxes = axes.filter(({ tag }) => tag !== "wght");
      if (nonWeightAxes.length > 0) {
        optionalAxes = nonWeightAxes;
      }
    }

    fontData[family] = {
      weights: [...weights],
      styles: [...styles],
      axes: hasVariableFont ? axes : undefined,
      subsets,
    };
  }

  await Promise.all([
    fs.writeFile(
      path.join(__dirname, "../navi-font-data.json"),
      JSON.stringify(fontData, null, 2)
    ),
  ]);
})();
