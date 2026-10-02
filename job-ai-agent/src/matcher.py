from dataclasses import dataclass
from typing import Iterable, Set


@dataclass(frozen=True)
class MatchResult:
    score: int
    decision: str
    matched: tuple[str, ...]
    missing: tuple[str, ...]


def _norm(values: Iterable[str]) -> Set[str]:
    return {v.strip().lower() for v in values if v and v.strip()}


def score_job(candidate_skills: Iterable[str], required_skills: Iterable[str], threshold: int = 75) -> MatchResult:
    candidate = _norm(candidate_skills)
    required = _norm(required_skills)

    if not required:
        return MatchResult(score=0, decision="SKIP", matched=(), missing=())

    matched = tuple(sorted(candidate & required))
    missing = tuple(sorted(required - candidate))
    score = round((len(matched) / len(required)) * 100)
    decision = "APPLY" if score >= threshold else "SKIP"

    return MatchResult(
        score=score,
        decision=decision,
        matched=matched,
        missing=missing,
    )
