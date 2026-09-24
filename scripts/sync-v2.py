"""Import the canonical recovery data without executing any checkpoint code.

Usage: python scripts/sync-v2.py /path/to/package_data.json /path/to/baseline.json
Raw source documents and archive files are intentionally not copied to the app.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
baseline = json.loads(Path(sys.argv[2]).read_text())
d = json.loads(source.read_text())
assert d['version'] == 'Recovery and Resource Expansion 2.0 — 2026-09-20'
assert len(d['units']) == 75 and len(d['resources']) == 1550
assert set(r['id'] for r in baseline['resources']) <= set(r['id'] for r in d['resources'])
out = ROOT / 'data'
out.mkdir(exist_ok=True)

def write(name, obj):
    (out / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

# Retain original values and all fields. Separate keys from the learner payload.
curriculum_keys = [
    'date', 'version', 'units', 'dependencies', 'module_gates', 'unit_routes',
    'active_unit_view', 'active', 'maps', 'first14', 'tracks', 'track_routes',
    'profiles', 'math', 'languages', 'advanced', 'corrections', 'gaps', 'literature_map'
]
write('curriculum.json', {k: d[k] for k in curriculum_keys})
write('resources.json', d['resources'])
write('practice.json', {k: d[k] for k in ['labs', 'projects']})
write('diagnostics.json', [{k: v for k, v in row.items() if k != 'answer'} for row in d['diagnostics']])
write('diagnostic-keys.json', {row['id']: row['answer'] for row in d['diagnostics']})
provenance_keys = [
    'provenance', 'aliases', 'id_collisions', 'verification', 'verification_evidence',
    'repository_audit', 'course_asset_audit', 'foundation_audit', 'physical_book_audit'
]
write('provenance.json', {k: d[k] for k in provenance_keys})
# Keep the supplementary planning tables and original grouped source views too.
# They remain separate from the canonical catalogue and the active learning path.
core_keys = set(curriculum_keys + provenance_keys + ['resources', 'labs', 'projects', 'diagnostics', 'qa'])
write('source-views.json', {k: value for k, value in d.items() if k not in core_keys})
write('source-manifest.json', {
    'source': 'CSE Engineer Master Package V2.0',
    'sourceVersion': d['version'],
    'sourceFile': 'RECOVERY_BUILD_CHECKPOINT.zip / work/package_data.json',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'baselineSha256': hashlib.sha256(Path(sys.argv[2]).read_bytes()).hexdigest(),
    'originalResourceIds': [r['id'] for r in baseline['resources']],
    'unitPreservation': [{k: row[k] for k in ['id', 'year', 'semester', 'hours']} for row in baseline['units']],
    'sourceCounts': d['qa'],
    'fieldHashes': {k: hashlib.sha256(json.dumps(d[k], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
                    for k in d if k != 'qa'},
    'notes': [
        'The 69-unit branch is archived and is not the canonical curriculum.',
        'All resource status strings and inherited verification fields remain as supplied.',
        'Repeated unit/resource/role map rows are preserved verbatim; the UI groups repeated links.',
        'No learner progress, source ZIPs, PDFs, spreadsheets, or private workspace files are included.'
    ]
})
print(json.dumps({'units': len(d['units']), 'resources': len(d['resources']), 'hours': sum(u['hours'] for u in d['units']), 'labs': len(d['labs']), 'projects': len(d['projects']), 'diagnostics': len(d['diagnostics']), 'provenance': len(d['provenance']), 'aliases': len(d['aliases'])}))
