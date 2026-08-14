import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const STRING_ATTRIBUTES = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'data-tooltip',
  'placeholder',
  'title'
]);

function hasReadableCharacters(value) {
  return /[\p{L}\p{N}]/u.test(value.trim());
}

function locationOf(sourceFile, node) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `${sourceFile.fileName}:${position.line + 1}:${position.character + 1}`;
}

function addFinding(findings, sourceFile, node, value, kind) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!hasReadableCharacters(normalized)) return;
  findings.push({
    key: `${sourceFile.fileName}:${kind}:${normalized}`,
    file: sourceFile.fileName,
    line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
    kind,
    value: normalized,
    location: locationOf(sourceFile, node)
  });
}

export function scanUiCopyFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const findings = [];

  function visit(node) {
    if (ts.isJsxText(node)) {
      addFinding(findings, sourceFile, node, node.getText(sourceFile), 'jsx-text');
    }

    if (ts.isJsxAttribute(node) && STRING_ATTRIBUTES.has(node.name.getText(sourceFile))) {
      if (node.initializer && ts.isStringLiteral(node.initializer)) {
        addFinding(findings, sourceFile, node, node.initializer.text, `attribute:${node.name.getText(sourceFile)}`);
      }
      if (
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        ts.isStringLiteralLike(node.initializer.expression)
      ) {
        addFinding(
          findings,
          sourceFile,
          node,
          node.initializer.expression.text,
          `attribute:${node.name.getText(sourceFile)}`
        );
      }
    }

    if (
      ts.isJsxExpression(node) &&
      node.parent &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent)) &&
      node.expression &&
      ts.isStringLiteralLike(node.expression)
    ) {
      addFinding(findings, sourceFile, node, node.expression.text, 'jsx-expression');
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

export function collectTsxFiles(root, relativeRoots = ['src']) {
  const files = [];

  function collect(relativePath) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) return;
    const stat = fs.statSync(absolutePath);
    if (stat.isFile()) {
      if (relativePath.endsWith('.tsx') && !/\.(test|e2e|stories)\.tsx$/.test(relativePath)) {
        files.push(relativePath);
      }
      return;
    }

    for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      collect(path.join(relativePath, entry.name));
    }
  }

  relativeRoots.forEach(collect);
  return files.sort();
}

export function scanUiCopy(root, relativeFiles) {
  return relativeFiles.flatMap((relativePath) => (
    scanUiCopyFile(path.join(root, relativePath)).map((finding) => ({
      ...finding,
      key: finding.key.replace(`${root}${path.sep}`, ''),
      file: finding.file.replace(`${root}${path.sep}`, ''),
      location: finding.location.replace(`${root}${path.sep}`, '')
    }))
  ));
}
