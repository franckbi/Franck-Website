const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'data', 'projects.json');
let raw;
try {
  raw = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  console.error('ERROR: cannot read projects.json', err.message);
  process.exit(2);
}

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('ERROR: invalid JSON', err.message);
  process.exit(2);
}

const urlRegex = /^(https?:)?\/\/[\w\-]+(\.[\w\-]+)+[:\d]*([\/?#].*)?$/i;
const slugRegex = /^[a-z0-9-]+$/;
const nowYear = new Date().getFullYear();
let ok = true;

data.forEach((p, idx) => {
  const prefix = `project[${idx}] (${p.slug || 'no-slug'})`;
  if (!p.slug || typeof p.slug !== 'string' || !slugRegex.test(p.slug)) {
    console.error(prefix, 'INVALID SLUG');
    ok = false;
  }
  if (!p.title || typeof p.title !== 'string') {
    console.error(prefix, 'missing title');
    ok = false;
  }
  if (!p.tagline) {
    console.error(prefix, 'missing tagline');
    ok = false;
  }
  if (!p.thumbnail || !p.thumbnail.src) {
    console.error(prefix, 'missing thumbnail.src');
    ok = false;
  }
  if (
    p.thumbnail &&
    p.thumbnail.src &&
    !(p.thumbnail.src.startsWith('/') || urlRegex.test(p.thumbnail.src))
  ) {
    console.error(
      prefix,
      'thumbnail.src is not an absolute URL or relative path:',
      p.thumbnail.src
    );
    ok = false;
  }
  if (!Array.isArray(p.gallery) || p.gallery.length === 0) {
    console.error(prefix, 'gallery must have at least one item');
    ok = false;
  }
  if (!Array.isArray(p.stack) || p.stack.length === 0) {
    console.error(prefix, 'stack must have at least one technology');
    ok = false;
  }
  if (typeof p.year !== 'number' || p.year < 2000 || p.year > nowYear + 1) {
    console.error(prefix, 'invalid year', p.year);
    ok = false;
  }
  if (!p.links || typeof p.links !== 'object') {
    console.error(prefix, 'links object missing');
    ok = false;
  } else {
    if (p.links.demo && !urlRegex.test(p.links.demo)) {
      console.error(prefix, 'demo URL invalid:', p.links.demo);
      ok = false;
    }
    if (p.links.github && !urlRegex.test(p.links.github)) {
      console.error(prefix, 'github URL invalid:', p.links.github);
      ok = false;
    }
    if (
      p.links.case_study &&
      !(p.links.case_study.startsWith('/') || urlRegex.test(p.links.case_study))
    ) {
      console.error(
        prefix,
        'case_study must be a relative path or URL:',
        p.links.case_study
      );
      ok = false;
    }
  }
  if (typeof p.priority !== 'number' || p.priority < 1) {
    console.error(prefix, 'invalid priority', p.priority);
    ok = false;
  }
});

if (!ok) {
  console.error('\nValidation failed');
  process.exit(1);
}

console.log('Projects validation: OK');
