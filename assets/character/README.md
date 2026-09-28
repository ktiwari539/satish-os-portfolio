# Satish OS 3D avatar asset

The polished portfolio now has a real GLB runtime, but the visitor-facing character is intentionally not enabled until a proper rigged Satish avatar is supplied.

## Required file

Place the final model here:

`assets/character/satish-avatar.glb`

Do not commit raw reference photos.

## Preferred rig

The runtime searches common bone names automatically. The model should ideally include:

- head
- neck
- left eye
- right eye
- right upper arm
- right forearm
- blink morph targets

Common Mixamo / MetaHuman / Character Creator naming variants are supported heuristically.

## Behaviour already implemented

With `?character=3d`:

- the GLB is loaded into the existing hero
- eyes react faster than the head to pointer movement
- head and neck follow more slowly
- blink morphs run automatically when available
- click/tap on the character triggers a wave when right-arm bones are available
- subtle idle motion is applied
- the existing cinematic video remains underneath as an automatic fallback
- the video is hidden only after the 3D model renders successfully

Use `?character=3d&debug=1` to show a small development status badge.

The public polished portfolio should not enable the 3D query parameter until the real avatar has passed visual QA.
