"""
Generate TTS narration MP3s from narration_tts.txt using OpenAI tts-1-hd.

Usage:
    python3 scripts/generate_tts.py              # all sections
    python3 scripts/generate_tts.py 02           # single section by number
"""

import os
import re
import sys
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parent.parent
NARRATION_FILE = ROOT / "narration_tts.txt"
AUDIO_DIR = ROOT / "public" / "audio"
MODEL = "tts-1-hd"
VOICE = "nova"
FORMAT = "mp3"

SECTION_SLUGS = {
    "01": "01-intro",
    "02": "02-ig-intro",
    "03": "03-hr-agent",
    "04": "04-bridge",
    "05": "05-optic-view",
    "06": "06-pan-hr",
    "07": "07-closing",
}


def load_api_key() -> str:
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith("OPENAI_API_KEY="):
                return line.split("=", 1)[1].strip()
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY not found in .env or environment")
    return key


def parse_sections(text: str) -> dict[str, str]:
    """Split narration_tts.txt into {section_number: clean_text}."""
    pattern = re.compile(
        r"={20,}\s*\n(\d{2})\.\s*[^\n]+\n={20,}\s*\n(.*?)(?=\n={20,}|\Z)",
        re.DOTALL,
    )
    sections: dict[str, str] = {}
    for match in pattern.finditer(text):
        num = match.group(1)
        body = match.group(2)
        # Strip [N초 쉼] markers
        body = re.sub(r"\[\d+초 쉼\]", "", body)
        # Collapse blank lines, trim
        lines = [ln.strip() for ln in body.splitlines()]
        lines = [ln for ln in lines if ln]
        sections[num] = "\n\n".join(lines)
    return sections


def synthesize(client: OpenAI, text: str, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with client.audio.speech.with_streaming_response.create(
        model=MODEL,
        voice=VOICE,
        input=text,
        response_format=FORMAT,
    ) as response:
        response.stream_to_file(out_path)


def main() -> None:
    text = NARRATION_FILE.read_text(encoding="utf-8")
    sections = parse_sections(text)
    if not sections:
        raise RuntimeError(f"No sections parsed from {NARRATION_FILE}")

    target = sys.argv[1] if len(sys.argv) > 1 else None
    if target and target not in sections:
        raise RuntimeError(f"Section {target} not found. Available: {sorted(sections)}")

    targets = {target: sections[target]} if target else sections

    client = OpenAI(api_key=load_api_key())

    for num, body in targets.items():
        slug = SECTION_SLUGS[num]
        out = AUDIO_DIR / f"{slug}.mp3"
        char_count = len(body)
        print(f"[{num}] {slug}.mp3 ({char_count} chars) → generating...")
        synthesize(client, body, out)
        size_kb = out.stat().st_size / 1024
        print(f"     done. {size_kb:.1f} KB → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
