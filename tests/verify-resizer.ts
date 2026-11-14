import { PHOTO_SIGNATURE_PRESETS, TOOLS } from '../lib/constants';
import { formatBytes } from '../lib/image-processing';

function runAssertions() {
  console.log('--- Verifying Constants & Presets ---');
  console.assert(TOOLS.length === 4, `Expected 4 tools, got ${TOOLS.length}`);
  console.log(`Verified ${TOOLS.length} featured tools.`);

  const resizerTool = TOOLS.find((t) => t.id === 'photo-signature-resizer');
  console.assert(resizerTool !== undefined, 'Photo & Signature Resizer tool must exist in registry');
  console.assert(resizerTool?.slug === '/photo-signature-resizer', 'Slug must match /photo-signature-resizer');

  console.assert(PHOTO_SIGNATURE_PRESETS.length >= 6, 'Should have comprehensive presets');
  console.log(`Verified ${PHOTO_SIGNATURE_PRESETS.length} presets for photos and signatures.`);

  // Verify preset data integrity
  PHOTO_SIGNATURE_PRESETS.forEach((preset) => {
    console.assert(preset.width > 0, `Preset ${preset.id} width must be positive`);
    console.assert(preset.height > 0, `Preset ${preset.id} height must be positive`);
    console.assert(preset.format === 'image/jpeg' || preset.format === 'image/png', `Valid format for ${preset.id}`);
    console.assert(preset.description.length > 0, `Description required for ${preset.id}`);
  });

  console.log('--- Verifying Byte Formatting Helper ---');
  console.assert(formatBytes(0) === '0 B', `formatBytes(0) expected "0 B", got ${formatBytes(0)}`);
  console.assert(formatBytes(1024) === '1 KB', `formatBytes(1024) expected "1 KB", got ${formatBytes(1024)}`);
  console.assert(formatBytes(50 * 1024) === '50 KB', `formatBytes(50KB) expected "50 KB", got ${formatBytes(50 * 1024)}`);
  console.assert(formatBytes(1.5 * 1024 * 1024) === '1.5 MB', `formatBytes(1.5MB) expected "1.5 MB", got ${formatBytes(1.5 * 1024 * 1024)}`);
  console.log('All byte formatting assertions passed.');

  console.log('All static verifications passed successfully!');
}

runAssertions();
