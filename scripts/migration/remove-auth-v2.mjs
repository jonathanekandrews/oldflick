import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, '..');

console.log('Starting auth removal...\n');

// Fix Watch.jsx
const watchPath = path.join(basePath, 'src/pages/Watch.jsx');
let watch = fs.readFileSync(watchPath, 'utf8');

// Do these line-by-line to be thorough
const watchLines = watch.split('\n');
const filteredWatch = [];

for (let i = 0; i < watchLines.length; i++) {
  const line = watchLines[i];
  
  // Skip import lines we don't want
  if (line.includes('import { hasTimeExpired') ||
      line.includes('import SignUpModal from') ||
      line.includes('import { Skeleton }') ||
      line.includes(', Play, Pause, Volume2, VolumeX, Maximize,') ||
      line.includes(', X, Crown')) {
    if (line.includes('import')) {
      continue;
    }
  }
  
  // Skip state variables we don't want
  if (line.includes('[showSignUpModal') ||
      line.includes('[canWatch')) {
    continue;
  }
  
  // Skip checkWatchPermission function
  if (line.includes('const checkWatchPermission')) {
    // Skip until we find the closing }
    while (i < watchLines.length && !watchLines[i].includes('};')) {
      i++;
    }
    i++; // Skip the };
    continue;
  }
  
  // Skip specific function calls
  if (line.includes('checkWatchPermission()') &&
      (line.includes('// Check if anonymous') ||
       watchLines[i-1]?.includes('setShowAd(false)'))) {
    continue;
  }
  
  // Skip permission check in loadData  
  if (line.includes('if (hasTimeExpired())')) {
    // Skip until closing brace
    while (i < watchLines.length && !watchLines[i].includes('}')) {
      i++;
    }
    i++; // Skip closing brace
    continue;
  }
  
  // Skip subscription redirect
  if (line.includes('// If user is logged in but no subscription')) {
    // Skip 3 more lines
    i += 4;
    continue;
  }
  
  // Fix handleAutoPlayAndFullscreen condition
  if (line.includes('if (videoRef.current && canWatch)')) {
    filteredWatch.push('      if (videoRef.current) {');
    continue;
  }
  
  // Fix togglePlay permission check
  if (line.includes('if (!canWatch)') && watchLines[i+1]?.includes('setShowSignUpModal')) {
    // Skip the next 3 lines
    i += 3;
    continue;
  }
  
  // Fix toggleFavorite
  if (line.includes('if (!user)') && watchLines[i+1]?.includes('setShowSignUpModal')) {
    filteredWatch.push('    if (!user) {');
    filteredWatch.push('      return;');
    filteredWatch.push('    }');
    i += 3;
    continue;
  }
  
  // Fix video controls
  if (line.includes('controls={canWatch}')) {
    filteredWatch.push(line.replace('controls={canWatch}', 'controls'));
    continue;
  }
  
  // Skip Sign Up Modal component
  if (line.includes('{/* Sign Up Modal */}')) {
    // Skip until closing />
    while (i < watchLines.length && !watchLines[i].includes('/>')) {
      i++;
    }
    i++; // Skip closing />
    i++; // Skip blank line
    continue;
  }
  
  // Skip overlay  
  if (line.includes('{/* Overlay if can\'t watch */}') || 
      line.includes('{!canWatch &&')) {
    // Skip until we find the closing )}
    let braceCount = 0;
    while (i < watchLines.length) {
      if (watchLines[i].includes('{')) braceCount++;
      if (watchLines[i].includes('}')) braceCount--;
      i++;
      if (braceCount === 0 && watchLines[i]?.includes(')}')) {
        i++;
        break;
      }
    }
    continue;
  }
  
  // Fix onPlay handler
  if (line.includes('onPlay={() => {') && watchLines[i+1]?.includes('checkWatchPermission')) {
    filteredWatch.push('              onPlay={() => {');
    filteredWatch.push('                setIsPlaying(true);');
    filteredWatch.push('              }}');
    // Skip old handler
    while (i < watchLines.length && !watchLines[i].includes('}}')) {
      i++;
    }
    continue;
  }
  
  // Add disabled attribute to favorite button
  if (line.includes('onClick={toggleFavorite}') && !line.includes('disabled')) {
    filteredWatch.push(line);
    filteredWatch.push('            disabled={!user}');
    filteredWatch.push('            title={user ? "Add to favorites" : "Sign in to save favorites"}');
    continue;
  }
  
  filteredWatch.push(line);
}

const newWatch = filteredWatch.join('\n');
fs.writeFileSync(watchPath, newWatch, 'utf8');
console.log('✅ Watch.jsx cleaned');

// Fix HeroSection.jsx
const heroPath = path.join(basePath, 'src/components/browse/HeroSection.jsx');
let hero = fs.readFileSync(heroPath, 'utf8');

const heroLines = hero.split('\n');
const filteredHero = [];

let inHandlePlay = false;
for (let i = 0; i < heroLines.length; i++) {
  const line = heroLines[i];
  
  if (line.includes('const handlePlay = () => {')) {
    filteredHero.push('  const handlePlay = () => {');
    filteredHero.push('    navigate(createPageUrl(`Watch?id=${content.id}`));');
    filteredHero.push('  };');
    
    // Skip old implementation
    i++;
    while (i < heroLines.length && !heroLines[i].includes('};')) {
      i++;
    }
    continue;
  }
  
  filteredHero.push(line);
}

fs.writeFileSync(heroPath, filteredHero.join('\n'), 'utf8');
console.log('✅ HeroSection.jsx cleaned');

// Fix Browse.jsx
const browsePath = path.join(basePath, 'src/pages/Browse.jsx');
let browse = fs.readFileSync(browsePath, 'utf8');

const browseLines = browse.split('\n');
const filteredBrowse = [];

for (let i = 0; i < browseLines.length; i++) {
  const line = browseLines[i];
  
  // Skip unwanted imports
  if (line.includes('import AnonymousTimer') ||
      line.includes('import SubscriptionPrompt') ||
      line.includes('import SignUpModal')) {
    continue;
  }
  
  // Skip showSignUpModal state
  if (line.includes('[showSignUpModal')) {
    continue;
  }
  
  // Skip handleTimeExpired function
  if (line.includes('const handleTimeExpired')) {
    while (i < browseLines.length && !browseLines[i].includes('};')) {
      i++;
    }
    i++;
    continue;
  }
  
  // Skip AnonymousTimer component
  if (line.includes('{/* Anonymous Timer')) {
    while (i < browseLines.length && !browseLines[i].includes('/>')) {
      i++;
    }
    i += 2; // Skip the closing and blank line
    continue;
  }
  
  // Skip Sign Up Modal in Browse
  if (line.includes('<SignUpModal') && line.includes('Browse')) {
    while (i < browseLines.length && !broweLines[i].includes('/>')) {
      i++;
    }
    i += 2;
    continue;
  }
  
  // Skip SubscriptionPrompt  
  if (line.includes('{/* Subscription Prompt')) {
    while (i < browseLines.length && !browseLines[i].includes('}}')) {
      i++;
    }
    i += 2;
    continue;
  }
  
  filteredBrowse.push(line);
}

fs.writeFileSync(browsePath, filteredBrowse.join('\n'), 'utf8');
console.log('✅ Browse.jsx cleaned');

console.log('\n✅✅✅ All authentication removed! ✅✅✅');
