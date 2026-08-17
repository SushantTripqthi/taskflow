import re
from typing import Optional


class QuickAddParser:
    """
    Deterministic rule-based parser for TaskFlow Quick-Add.

    This parser intentionally does not use any external
    LLM, API, network call, or API key.

    It follows the parsing rules defined for the
    TaskFlow AI Quick-Add feature.
    """

    # ==================================================
    # PRIORITY KEYWORDS
    # ==================================================

    HIGH_PRIORITY_KEYWORDS = (
        "urgent",
        "asap",
        "high priority",
        "high-priority",
    )

    LOW_PRIORITY_KEYWORDS = (
        "whenever",
        "low priority",
        "low-priority",
    )

    # ==================================================
    # DATE KEYWORDS
    # ==================================================

    DATE_PHRASES = (
        "today",
        "tomorrow",
        "next week",

        # Two-word weekday phrases first
        "next monday",
        "next tuesday",
        "next wednesday",
        "next thursday",
        "next friday",
        "next saturday",
        "next sunday",

        # Single weekday names
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    )

    # ==================================================
    # PARSE
    # ==================================================

    @classmethod
    def parse(
        cls,
        description: str
    ) -> dict:
        """
        Parse a free-text task description.

        Returns:
            {
                "title": str,
                "priority": str,
                "due_date_hint": str | None
            }
        """

        if description is None:
            description = ""

        # Keep original case for title
        original_description = description

        # Lowercase copy for keyword matching
        working_description = original_description.lower()

        # --------------------------------------------------
        # 1. PRIORITY
        # --------------------------------------------------

        priority = cls._parse_priority(
            working_description
        )

        # --------------------------------------------------
        # 2. DATE
        # --------------------------------------------------

        due_date_hint = cls._parse_due_date(
            working_description
        )

        # --------------------------------------------------
        # 3. TITLE
        # --------------------------------------------------

        title = cls._build_title(
            original_description,
            priority_keywords=(
                cls.HIGH_PRIORITY_KEYWORDS
                + cls.LOW_PRIORITY_KEYWORDS
            ),
            due_date_hint=due_date_hint
        )

        # --------------------------------------------------
        # 4. EMPTY TITLE
        # --------------------------------------------------

        if not title.strip():
            title = "Untitled task"

        return {
            "title": title.strip(),
            "priority": priority,
            "due_date_hint": due_date_hint,
        }

    # ==================================================
    # PRIORITY PARSER
    # ==================================================

    @classmethod
    def _parse_priority(
        cls,
        text: str
    ) -> str:
        """
        Priority rules:

        High:
            urgent
            asap
            high priority
            high-priority

        Low:
            whenever
            low priority
            low-priority

        Otherwise:
            medium

        High priority always wins if both
        high and low keywords are present.
        """

        # High priority first
        for keyword in cls.HIGH_PRIORITY_KEYWORDS:

            if keyword in text:
                return "high"

        # Low priority
        for keyword in cls.LOW_PRIORITY_KEYWORDS:

            if keyword in text:
                return "low"

        # Default
        return "medium"

    # ==================================================
    # DATE PARSER
    # ==================================================

    @classmethod
    def _parse_due_date(
        cls,
        text: str
    ) -> Optional[str]:
        """
        Find the first matching date phrase.

        The order in DATE_PHRASES is important.
        """

        for phrase in cls.DATE_PHRASES:

            if phrase in text:
                return phrase

        return None

    # ==================================================
    # TITLE BUILDER
    # ==================================================

    @classmethod
    def _build_title(
        cls,
        original_description: str,
        priority_keywords: tuple[str, ...],
        due_date_hint: Optional[str]
    ) -> str:
        """
        Build a clean title from the original description.

        Removes:
            1. Priority keywords
            2. Matched date phrase

        Matching is case-insensitive.
        Original title casing is preserved.
        """

        title = original_description

        # --------------------------------------------------
        # Remove priority keywords
        # --------------------------------------------------

        for keyword in priority_keywords:

            title = re.sub(
                r"\b" + re.escape(keyword) + r"\b",
                "",
                title,
                flags=re.IGNORECASE
            )

        # --------------------------------------------------
        # Remove date phrase
        # --------------------------------------------------

        if due_date_hint is not None:

            title = re.sub(
                r"\b" + re.escape(due_date_hint) + r"\b",
                "",
                title,
                flags=re.IGNORECASE
            )

        # --------------------------------------------------
        # Clean extra spaces
        # --------------------------------------------------

        title = re.sub(
            r"\s+",
            " ",
            title
        )

        # Remove spaces before punctuation
        title = re.sub(
            r"\s+([,.!?])",
            r"\1",
            title
        )

        # --------------------------------------------------
        # Remove dangling connector words
        # --------------------------------------------------

        title = re.sub(
            r"\b(with|and|for|on|by)\b\s*$",
            "",
            title,
            flags=re.IGNORECASE
        )

        # --------------------------------------------------
        # Final cleanup
        # --------------------------------------------------

        title = re.sub(
            r"\s+",
            " ",
            title
        ).strip()

        return title


# ======================================================
# FUNCTION WRAPPER
# ======================================================

def parse_quick_add(
    description: str
) -> dict:
    """
    Simple function interface for Quick-Add.

    Example:

        result = parse_quick_add(
            "Finish report next Friday, it's urgent"
        )

    Returns:

        {
            "title": "Finish report, it's",
            "priority": "high",
            "due_date_hint": "next friday"
        }
    """

    return QuickAddParser.parse(
        description
    )