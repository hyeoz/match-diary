#!/usr/bin/env python3
"""Check the actual release AAB for R8 output and 16 KB native compatibility."""
import argparse
import json
import re
import struct
import zipfile
from pathlib import Path

PAGE = 16384


def inspect_bundle(path):
    failures = []
    libraries = []
    with zipfile.ZipFile(path) as bundle:
        names = bundle.namelist()
        js_bundle = 'base/assets/index.android.bundle'
        if js_bundle not in names or b'MATCHDIARY_NATIVE_QA:' in bundle.read(js_bundle):
            failures.append('Production JavaScript bundle is missing or uses the QA entry')
        dex_bytes = sum(i.file_size for i in bundle.infolist() if i.filename.endswith('.dex'))
        mapping_path = 'BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map'
        mapping = bundle.read(mapping_path).decode() if mapping_path in names else ''
        classes = re.findall(r'^(\S+) -> (\S+):$', mapping, re.MULTILINE)
        renamed = sum(before != after for before, after in classes)
        if not classes or not renamed:
            failures.append('R8 class renaming metadata is missing or empty')
        if not dex_bytes:
            failures.append('No compiled DEX code found')
        for name in names:
            if name.endswith('/libconceal.so'):
                failures.append(f'Obsolete Conceal binary is still packaged: {name}')
            if '/lib/arm64-v8a/' not in name or not name.endswith('.so'):
                continue
            elf = bundle.read(name)
            if elf[:6] != b'\x7fELF\x02\x01':
                failures.append(f'Expected little-endian ELF64: {name}')
                continue
            offset = struct.unpack_from('<Q', elf, 32)[0]
            entry_size, count = struct.unpack_from('<HH', elf, 54)
            loads = []
            relros = []
            errors = []
            for index in range(count):
                kind, flags, file_offset, address, _, _, memory_size, alignment = struct.unpack_from(
                    '<IIQQQQQQ', elf, offset + index * entry_size
                )
                if kind == 1:  # PT_LOAD
                    loads.append((address, address + memory_size, flags))
                    if alignment < PAGE or (address - file_offset) % PAGE:
                        errors.append('LOAD alignment is below 16 KB')
                if kind == 0x6474E552:  # PT_GNU_RELRO
                    relros.append((address, address + memory_size))
            # Android mprotects whole pages touched by RELRO. A partial last
            # page is safe when RELRO ends at the end of its LOAD and the next
            # writable LOAD starts on another page (normal modern lld output).
            # Reject actual writable-data overlap, not harmless segment padding.
            for start, end in relros:
                padding = ((start // PAGE * PAGE, start), (end, (end + PAGE - 1) // PAGE * PAGE))
                for low, high in padding:
                    if any(flags & 2 and max(low, begin) < min(high, finish)
                           for begin, finish, flags in loads):
                        errors.append('16 KB RELRO protection overlaps writable LOAD data')
            if not loads:
                errors.append('No LOAD segment')
            failures.extend(f'{name}: {error}' for error in errors)
            libraries.append({'name': name, 'passed': not errors})
        if not libraries:
            failures.append('No arm64 libraries found')
    return {
        'artifact': str(path),
        'dex_bytes': dex_bytes,
        'mapping_classes': len(classes),
        'renamed_mapping_classes': renamed,
        'arm64_libraries': libraries,
        'failures': failures,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('bundle', type=Path)
    parser.add_argument('--baseline', type=Path)
    args = parser.parse_args()
    result = inspect_bundle(args.bundle)
    if args.baseline:
        baseline = inspect_bundle(args.baseline)
        result['baseline_dex_bytes'] = baseline['dex_bytes']
        result['dex_reduction_percent'] = round(
            100 * (1 - result['dex_bytes'] / baseline['dex_bytes']), 2
        )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result['failures']))
