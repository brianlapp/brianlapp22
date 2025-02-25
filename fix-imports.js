import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find all files in a directory recursively
function findFiles(dir, ext, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, ext, files);
    } else if (path.extname(file) === ext) {
      files.push(filePath);
    }
  }
  return files;
}

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Get the relative path from the file to src
  const fileDir = path.dirname(filePath);
  const srcDir = path.join(__dirname, 'src');
  
  // Calculate relative path properly
  const relativeDepth = path.relative(fileDir, srcDir);
  
  // Determine if we're already in the src directory
  const inSrcDir = !relativeDepth.startsWith('..') && relativeDepth !== '';
  
  // Create the correct relative paths
  let componentsPath;
  let hooksPath;
  let libPath;
  
  if (inSrcDir) {
    // If we're in src directory, use ./components
    componentsPath = './components';
    hooksPath = './hooks';
    libPath = './lib';
  } else {
    // Calculate proper relative path by counting the directory levels
    const levels = relativeDepth.split(path.sep).length;
    const prefix = '../'.repeat(levels);
    
    componentsPath = `${prefix}components`;
    hooksPath = `${prefix}hooks`;
    libPath = `${prefix}lib`;
  }
  
  // Fix the imports
  content = content.replace(/@\/components\//g, `${componentsPath}/`);
  content = content.replace(/@\/hooks\//g, `${hooksPath}/`);
  content = content.replace(/@\/lib\//g, `${libPath}/`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in ${filePath}`);
}

// Find all TypeScript and TSX files
const tsFiles = findFiles(path.join(__dirname, 'src'), '.ts');
const tsxFiles = findFiles(path.join(__dirname, 'src'), '.tsx');
const allFiles = [...tsFiles, ...tsxFiles];

// Fix imports in all files
allFiles.forEach(fixImports);

console.log('All imports fixed!');