#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const srcDir = '../sprites-docs-next/content/docs';
const destDir = './src/content/docs';

function transformContent(content, _filePath) {
  let transformed = content;

  // Transform {#snippet name()} to <Snippet name="name">
  transformed = transformed.replace(
    /\{#snippet\s+(\w+)\(\)\}/g,
    '<Snippet name="$1">',
  );

  // Transform {/snippet} to </Snippet>
  transformed = transformed.replace(/\{\/snippet\}/g, '</Snippet>');

  // Check which components are used
  const usedComponents = [];
  if (transformed.includes('<Callout')) usedComponents.push('Callout');
  if (transformed.includes('<CodeTabs'))
    usedComponents.push('CodeTabs', 'Snippet');
  if (transformed.includes('<LifecycleDiagram'))
    usedComponents.push('LifecycleDiagram');
  if (transformed.includes('<BillingCalculator'))
    usedComponents.push('BillingCalculator');
  if (transformed.includes('<ParamTable') || transformed.includes('<Param '))
    usedComponents.push('ParamTable', 'Param');
  if (transformed.includes('<ParamInline')) usedComponents.push('ParamInline');
  if (
    transformed.includes('<StatusCodes') ||
    transformed.includes('<StatusBadge')
  )
    usedComponents.push('StatusCodes', 'StatusBadge');
  if (transformed.includes('<APIEndpoint') || transformed.includes('<APIBody'))
    usedComponents.push('APIEndpoint', 'APIBody');

  // Add imports after frontmatter if components are used
  if (usedComponents.length > 0) {
    const uniqueComponents = [...new Set(usedComponents)];
    const importStatement = `import { ${uniqueComponents.join(', ')} } from '../../components/react';\n\n`;

    // Find end of frontmatter
    const frontmatterEnd = transformed.indexOf('---', 3);
    if (frontmatterEnd !== -1) {
      const afterFrontmatter = frontmatterEnd + 3;
      transformed =
        transformed.substring(0, afterFrontmatter) +
        '\n\n' +
        importStatement +
        transformed.substring(afterFrontmatter).trimStart();
    }
  }

  return transformed;
}

function copyAndTransform(srcPath, destPath) {
  const stats = fs.statSync(srcPath);

  if (stats.isDirectory()) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    const entries = fs.readdirSync(srcPath);
    for (const entry of entries) {
      // Skip backup files
      if (entry.includes('.backup')) continue;
      copyAndTransform(path.join(srcPath, entry), path.join(destPath, entry));
    }
  } else if (srcPath.endsWith('.mdx')) {
    const content = fs.readFileSync(srcPath, 'utf8');
    const transformed = transformContent(content, srcPath);
    fs.writeFileSync(destPath, transformed);
    console.log(`Transformed: ${srcPath} -> ${destPath}`);
  }
}

// Run transformation
const absoluteSrc = path.resolve(__dirname, '..', srcDir);
const absoluteDest = path.resolve(__dirname, '..', destDir);

copyAndTransform(absoluteSrc, absoluteDest);
console.log('\nDone! MDX files have been transformed.');
