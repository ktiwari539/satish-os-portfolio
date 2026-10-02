import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from matcher import score_job


class MatcherTests(unittest.TestCase):
    def test_strong_match_applies(self):
        result = score_job(
            ["customer success", "sla", "incident management", "stakeholder management"],
            ["customer success", "sla", "incident management", "stakeholder management"],
            threshold=75,
        )
        self.assertEqual(result.score, 100)
        self.assertEqual(result.decision, "APPLY")

    def test_partial_match_skips(self):
        result = score_job(
            ["customer success", "sla"],
            ["customer success", "sla", "salesforce", "sql"],
            threshold=75,
        )
        self.assertEqual(result.score, 50)
        self.assertEqual(result.decision, "SKIP")

    def test_empty_requirements_are_safe(self):
        result = score_job(["customer success"], [], threshold=75)
        self.assertEqual(result.score, 0)
        self.assertEqual(result.decision, "SKIP")


if __name__ == "__main__":
    unittest.main()
