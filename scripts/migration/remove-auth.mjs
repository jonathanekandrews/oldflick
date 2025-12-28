import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.join(__dirname, '..');

// Fix Watch.jsx
const watchPath = path.join(basePath, 'src/pages/Watch.jsx');
let watch = fs.readFileSync(watchPath, 'utf8');

watch = watch.replace('import { hasTimeExpired } from "../components/browse/AnonymousTimer";\nimport SignUpModal from "../components/browse/SignUpModal";\n', '');
watch = watch.replace('import { Skeleton } from "@/components/ui/skeleton";\n', '');
watch = watch.replace(', Play, Pause, Volume2, VolumeX, Maximize,', '');
watch = watch.replace(', X, Crown', '');
watch = watch.replace('  const [showSignUpModal, setShowSignUpModal] = useState(false);\n', '');
watch = watch.replace('  const [canWatch, setCanWatch] = useState(true);\n', '');

const checkWatchStart = watch.indexOf('  const checkWatchPermission = () => {');
const checkWatchEnd = watch.indexOf('  };', checkWatchStart) + 4;
if (checkWatchStart !== -1 && checkWatchEnd > checkWatchStart) {
  watch = watch.substring(0, checkWatchStart) + watch.substring(checkWatchEnd + 1);
}

watch = watch.replace('      checkWatchPermission();\n', '');
watch = watch.replace('        if (hasTimeExpired()) {\n          setShowSignUpModal(true);\n          setCanWatch(false);\n        }\n', '');
watch = watch.replace('      if (currentUser && currentUser.subscription_status !== "free_trial" && \n          currentUser.subscription_status !== "active") {\n        navigate(createPageUrl("Account"));\n        return;\n      }\n\n', '');
watch = watch.replace('      if (videoRef.current && canWatch) {', '      if (videoRef.current) {');
watch = watch.replace('  const togglePlay = () => {\n    if (!canWatch) {\n      setShowSignUpModal(true);\n      return;\n    }\n\n', '  const togglePlay = () => {\n');
watch = watch.replace('    if (!user) {\n        setShowSignUpModal(true);\n        return;\n    }', '    if (!user) {\n      return;\n    }');
watch = watch.replace('              controls={canWatch}', '              controls');

const signupStart = watch.indexOf('      {/* Sign Up Modal */}');
const signupEnd = watch.indexOf('      />', signupStart) + 8;
if (signupStart !== -1 && signupEnd > signupStart) {
  watch = watch.substring(0, signupStart) + watch.substring(signupEnd + 1);
}

watch = watch.replace(/              onPlay=\{\(\) => \{[\s\S]*?              \}\}/m, '              onPlay={() => {\n                setIsPlaying(true);\n              }}');

const overlayStart = watch.indexOf('            {/* Overlay if can\'t watch */}');
const overlayEnd = watch.indexOf('            )}', overlayStart) + 13;
if (overlayStart !== -1 && overlayEnd > overlayStart) {
  watch = watch.substring(0, overlayStart) + watch.substring(overlayEnd);
}

watch = watch.replace('            onClick={toggleFavorite}\n          >', '            onClick={toggleFavorite}\n            disabled={!user}\n            title={user ? "Add to favorites" : "Sign in to save favorites"}\n          >');

fs.writeFileSync(watchPath, watch, 'utf8');
console.log('✅ Watch.jsx updated');

// Fix HeroSection.jsx
const heroPath = path.join(basePath, 'src/components/browse/HeroSection.jsx');
let hero = fs.readFileSync(heroPath, 'utf8');

const handlePlayStart = hero.indexOf('  const handlePlay = () => {');
const handlePlayEnd = hero.indexOf('  };', handlePlayStart) + 4;
if (handlePlayStart !== -1 && handlePlayEnd > handlePlayStart) {
  hero = hero.substring(0, handlePlayStart) + '  const handlePlay = () => {\n    navigate(createPageUrl(`Watch?id=${content.id}`));\n  };' + hero.substring(handlePlayEnd);
}

fs.writeFileSync(heroPath, hero, 'utf8');
console.log('✅ HeroSection.jsx updated');

// Fix Browse.jsx
const browsePath = path.join(basePath, 'src/pages/Browse.jsx');
let browse = fs.readFileSync(browsePath, 'utf8');

browse = browse.replace('import AnonymousTimer from "../components/browse/AnonymousTimer";\n', '');
browse = browse.replace('import SubscriptionPrompt from "../components/browse/SubscriptionPrompt";\n', '');
browse = browse.replace('import SignUpModal from "../components/browse/SignUpModal";\n', '');
browse = browse.replace('  const [showSignUpModal, setShowSignUpModal] = useState(false);\n', '');

const handleTimeStart = browse.indexOf('  const handleTimeExpired = () => {');
const handleTimeEnd = browse.indexOf('  };', handleTimeStart) + 4;
if (handleTimeStart !== -1 && handleTimeEnd > handleTimeStart) {
  browse = browse.substring(0, handleTimeStart) + browse.substring(handleTimeEnd + 1);
}

const anonStart = browse.indexOf('      {/* Anonymous Timer');
const anonEnd = browse.indexOf('      />\n\n      {/* Sign Up Modal');
if (anonStart !== -1 && anonEnd > anonStart) {
  browse = browse.substring(0, anonStart) + browse.substring(anonEnd + 9);
}

const signupBrowseStart = browse.indexOf('      <SignUpModal');
const signupBrowseEnd = browse.indexOf('      />', signupBrowseStart) + 8;
if (signupBrowseStart !== -1 && signupBrowseEnd > signupBrowseStart) {
  browse = browse.substring(0, signupBrowseStart) + browse.substring(signupBrowseEnd + 1);
}

const subStart = browse.indexOf('      {/* Subscription Prompt');
const subEnd = browse.indexOf('      }}\n\n', subStart) + 7;
if (subStart !== -1 && subEnd > subStart) {
  browse = browse.substring(0, subStart) + browse.substring(subEnd);
}

fs.writeFileSync(browsePath, browse, 'utf8');
console.log('✅ Browse.jsx updated');

console.log('\n✅ All authentication checks removed!');
